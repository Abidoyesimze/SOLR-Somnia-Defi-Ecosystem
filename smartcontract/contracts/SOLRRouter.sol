pragma solidity ^0.8.19;

interface ILiquidityIndexer {
    struct Pool {
        address poolAddress;
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 fee;
        uint256 lastUpdated;
        bool isActive;
        string protocolName;
    }

    function getPool(uint256 poolId) external view returns (Pool memory);
    function getPoolsForPair(address tokenA, address tokenB) external view returns (uint256[] memory);
    function getAllActivePools() external view returns (uint256[] memory);
    function refreshPoolReserves(uint256 poolId) external;
}

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

interface IUniswapV2Pool {
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
    function token0() external view returns (address);
    function token1() external view returns (address);
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

contract SOLRRouter {
    ILiquidityIndexer public immutable indexer;
    address public owner;
    bool private locked;

    uint256 public constant MAX_HOPS = 3;
    uint256 public constant BASIS_POINTS = 10000;

    struct SwapStep {
        uint256 poolId;
        address poolAddress;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 expectedAmountOut;
    }

    struct Route {
        SwapStep[] steps;
        uint256 totalAmountOut;
        uint256 priceImpact;
    }

    event SwapExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier nonReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }

    constructor(address _indexer) {
        require(_indexer != address(0), "Invalid indexer");
        indexer = ILiquidityIndexer(_indexer);
        owner = msg.sender;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }

    // ========================================================================
    // ROUTING FUNCTIONS
    // ========================================================================

    function findBestRoute(address tokenIn, address tokenOut, uint256 amountIn) 
        public view returns (Route memory bestRoute) {
        require(tokenIn != tokenOut, "Identical tokens");
        require(amountIn > 0, "Invalid amount");

        // Try direct route
        bestRoute = findDirectRoute(tokenIn, tokenOut, amountIn);

        // Try 2-hop routes through common intermediate tokens
        address[] memory intermediateTokens = getCommonTokens();
        
        for (uint256 i = 0; i < intermediateTokens.length; i++) {
            address intermediate = intermediateTokens[i];
            if (intermediate == tokenIn || intermediate == tokenOut) continue;

            Route memory twoHopRoute = findTwoHopRoute(tokenIn, tokenOut, amountIn, intermediate);
            if (twoHopRoute.totalAmountOut > bestRoute.totalAmountOut) {
                bestRoute = twoHopRoute;
            }
        }

        require(bestRoute.steps.length > 0, "No route found");
    }

    function findDirectRoute(address tokenIn, address tokenOut, uint256 amountIn) 
        public view returns (Route memory route) {
        uint256[] memory poolIds = indexer.getPoolsForPair(tokenIn, tokenOut);
        
        uint256 bestAmountOut = 0;
        SwapStep memory bestStep;

        for (uint256 i = 0; i < poolIds.length; i++) {
            ILiquidityIndexer.Pool memory pool = indexer.getPool(poolIds[i]);
            
            if (!pool.isActive) continue;

            uint256 amountOut = calculateAmountOut(amountIn, pool, tokenIn);
            
            if (amountOut > bestAmountOut) {
                bestAmountOut = amountOut;
                bestStep = SwapStep({
                    poolId: poolIds[i],
                    poolAddress: pool.poolAddress,
                    tokenIn: tokenIn,
                    tokenOut: tokenOut,
                    amountIn: amountIn,
                    expectedAmountOut: amountOut
                });
            }
        }

        if (bestAmountOut > 0) {
            SwapStep[] memory steps = new SwapStep[](1);
            steps[0] = bestStep;
            
            route = Route({
                steps: steps,
                totalAmountOut: bestAmountOut,
                priceImpact: calculatePriceImpact(amountIn, bestAmountOut)
            });
        }
    }

    function findTwoHopRoute(address tokenIn, address tokenOut, uint256 amountIn, address intermediate) 
        internal view returns (Route memory route) {
        
        Route memory firstHop = findDirectRoute(tokenIn, intermediate, amountIn);
        if (firstHop.steps.length == 0) return route;

        Route memory secondHop = findDirectRoute(intermediate, tokenOut, firstHop.totalAmountOut);
        if (secondHop.steps.length == 0) return route;

        SwapStep[] memory combinedSteps = new SwapStep[](2);
        combinedSteps[0] = firstHop.steps[0];
        combinedSteps[1] = secondHop.steps[0];
        combinedSteps[1].amountIn = firstHop.totalAmountOut;

        route = Route({
            steps: combinedSteps,
            totalAmountOut: secondHop.totalAmountOut,
            priceImpact: calculatePriceImpact(amountIn, secondHop.totalAmountOut)
        });
    }

    function previewSwap(address tokenIn, address tokenOut, uint256 amountIn) 
        external view returns (uint256 amountOut, uint256 priceImpact, SwapStep[] memory steps) {
        Route memory route = findBestRoute(tokenIn, tokenOut, amountIn);
        return (route.totalAmountOut, route.priceImpact, route.steps);
    }

    // ========================================================================
    // SWAP EXECUTION
    // ========================================================================

    function executeSwap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address recipient,
        uint256 deadline
    ) external nonReentrant returns (uint256 amountOut) {
        require(block.timestamp <= deadline, "Expired");
        require(recipient != address(0), "Invalid recipient");

        // Find best route
        Route memory route = findBestRoute(tokenIn, tokenOut, amountIn);
        require(route.totalAmountOut >= minAmountOut, "Insufficient output");

        // Transfer input tokens to this contract
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);

        // Execute route
        amountOut = executeRoute(route, recipient);
        require(amountOut >= minAmountOut, "Slippage exceeded");

        emit SwapExecuted(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    function executeRoute(Route memory route, address recipient) internal returns (uint256 finalAmountOut) {
        uint256 currentAmount = route.steps[0].amountIn;
        
        for (uint256 i = 0; i < route.steps.length; i++) {
            address currentRecipient = (i == route.steps.length - 1) ? recipient : address(this);
            currentAmount = executeSwapStep(route.steps[i], currentAmount, currentRecipient);
        }
        
        finalAmountOut = currentAmount;
    }

    function executeSwapStep(SwapStep memory step, uint256 actualAmountIn, address recipient) 
        internal returns (uint256 amountOut) {
        
        // Transfer tokens to pool
        IERC20(step.tokenIn).transfer(step.poolAddress, actualAmountIn);

        // Calculate expected output
        ILiquidityIndexer.Pool memory pool = indexer.getPool(step.poolId);
        amountOut = calculateAmountOut(actualAmountIn, pool, step.tokenIn);

        // Execute swap
        address token0 = IUniswapV2Pool(step.poolAddress).token0();
        uint256 amount0Out = (token0 == step.tokenOut) ? amountOut : 0;
        uint256 amount1Out = (token0 == step.tokenOut) ? 0 : amountOut;

        IUniswapV2Pool(step.poolAddress).swap(amount0Out, amount1Out, recipient, "");
    }

    // ========================================================================
    // CALCULATION FUNCTIONS
    // ========================================================================

    function calculateAmountOut(uint256 amountIn, ILiquidityIndexer.Pool memory pool, address tokenIn) 
        internal pure returns (uint256 amountOut) {
        if (amountIn == 0) return 0;

        uint256 reserveIn;
        uint256 reserveOut;
        
        if (pool.tokenA == tokenIn) {
            reserveIn = pool.reserveA;
            reserveOut = pool.reserveB;
        } else {
            reserveIn = pool.reserveB;
            reserveOut = pool.reserveA;
        }

        if (reserveIn == 0 || reserveOut == 0) return 0;

        // UniswapV2 formula: amountOut = (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997)
        uint256 feeMultiplier = BASIS_POINTS - pool.fee;
        uint256 amountInWithFee = amountIn * feeMultiplier;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * BASIS_POINTS) + amountInWithFee;
        
        amountOut = numerator / denominator;
    }

    function calculatePriceImpact(uint256 amountIn, uint256 amountOut) 
        internal pure returns (uint256) {
        if (amountIn == 0 || amountOut == 0) return 0;
        
        // Simplified price impact calculation (in basis points)
        // Real implementation would compare against ideal 1:1 price
        if (amountOut >= amountIn) return 0;
        
        return ((amountIn - amountOut) * BASIS_POINTS) / amountIn;
    }

    function getCommonTokens() internal pure returns (address[] memory) {
        // Return common intermediate tokens for multi-hop routing
        // For hackathon: These will be updated with actual Somnia token addresses
        address[] memory tokens = new address[](0); // Empty array for now
        
        // Uncomment and update with real Somnia token addresses:
        // tokens = new address[](3);
        // tokens[0] = 0x...; // WETH equivalent on Somnia
        // tokens[1] = 0x...; // USDC equivalent on Somnia  
        // tokens[2] = 0x...; // USDT equivalent on Somnia
        
        return tokens;
    }

    // ========================================================================
    // UTILITY FUNCTIONS
    // ========================================================================

    function refreshAndGetRoute(address tokenIn, address tokenOut, uint256 amountIn) 
        external returns (Route memory) {
        // Refresh pool reserves before routing
        uint256[] memory poolIds = indexer.getAllActivePools();
        for (uint256 i = 0; i < poolIds.length && i < 10; i++) { // Limit to prevent gas issues
            indexer.refreshPoolReserves(poolIds[i]);
        }
        
        return findBestRoute(tokenIn, tokenOut, amountIn);
    }

    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner, amount);
    }
}