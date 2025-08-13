// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract SomniaAMM is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Math for uint256;

    // Constants
    uint256 public constant MINIMUM_LIQUIDITY = 1000;
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant TRADING_FEE = 30; // 0.3% (30 basis points)
    uint256 public constant LIQUIDITY_FEE = 20; // 0.2% (20 basis points)

    // Structs
    struct Pool {
        address token0;
        address token1;
        uint256 reserve0;
        uint256 reserve1;
        uint256 totalSupply;
        uint256 fee0;
        uint256 fee1;
        bool exists;
    }

    struct PoolInfo {
        address token0;
        address token1;
        uint256 reserve0;
        uint256 reserve1;
        uint256 totalSupply;
        uint256 fee0;
        uint256 fee1;
        uint256 price0CumulativeLast;
        uint256 price1CumulativeLast;
        uint256 blockTimestampLast;
    }

    // State variables
    mapping(address => mapping(address => Pool)) public pools;
    mapping(address => address[]) public poolTokens;
    mapping(address => bool) public whitelistedTokens;
    
    uint256 public poolCount;
    uint256 public totalVolume;
    uint256 public totalFees;

    // Events
    event PoolCreated(address indexed token0, address indexed token1, address indexed pool);
    event LiquidityAdded(address indexed provider, address indexed token0, address indexed token1, uint256 amount0, uint256 amount1, uint256 liquidity);
    event LiquidityRemoved(address indexed provider, address indexed token0, address indexed token1, uint256 amount0, uint256 amount1, uint256 liquidity);
    event Swap(address indexed sender, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);
    event FeeCollected(address indexed token, uint256 amount);

    // Modifiers
    modifier validTokens(address token0, address token1) {
        require(token0 != token1, "SomniaAMM: IDENTICAL_ADDRESSES");
        require(token0 != address(0) && token1 != address(0), "SomniaAMM: ZERO_ADDRESS");
        require(whitelistedTokens[token0] && whitelistedTokens[token1], "SomniaAMM: TOKEN_NOT_WHITELISTED");
        _;
    }

    modifier poolExists(address token0, address token1) {
        require(pools[token0][token1].exists || pools[token1][token0].exists, "SomniaAMM: POOL_NOT_EXISTS");
        _;
    }

    constructor() {
        // Whitelist SOM token (assuming it's the native token)
        whitelistedTokens[address(0)] = true;
    }

    // Core functions

    /**
     * @dev Create a new liquidity pool
     */
    function createPool(address token0, address token1) external validTokens(token0, token1) returns (bool) {
        require(!pools[token0][token1].exists && !pools[token1][token0].exists, "SomniaAMM: POOL_EXISTS");
        
        // Sort tokens to ensure consistent ordering
        (address tokenA, address tokenB) = token0 < token1 ? (token0, token1) : (token1, token0);
        
        pools[tokenA][tokenB] = Pool({
            token0: tokenA,
            token1: tokenB,
            reserve0: 0,
            reserve1: 0,
            totalSupply: 0,
            fee0: 0,
            fee1: 0,
            exists: true
        });

        poolTokens[tokenA].push(tokenB);
        poolCount++;
        
        emit PoolCreated(tokenA, tokenB, address(this));
        return true;
    }

    /**
     * @dev Add liquidity to a pool
     */
    function addLiquidity(
        address token0,
        address token1,
        uint256 amount0Desired,
        uint256 amount1Desired,
        uint256 amount0Min,
        uint256 amount1Min
    ) external validTokens(token0, token1) poolExists(token0, token1) nonReentrant returns (uint256 liquidity) {
        Pool storage pool = pools[token0][token1].exists ? pools[token0][token1] : pools[token1][token0];
        
        uint256 amount0;
        uint256 amount1;
        
        if (pool.totalSupply == 0) {
            // First liquidity provider
            amount0 = amount0Desired;
            amount1 = amount1Desired;
            liquidity = Math.sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            pool.totalSupply = MINIMUM_LIQUIDITY; // Lock minimum liquidity
        } else {
            // Calculate optimal amounts
            uint256 amount1Optimal = (amount0Desired * pool.reserve1) / pool.reserve0;
            if (amount1Optimal <= amount1Desired) {
                require(amount1Optimal >= amount1Min, "SomniaAMM: INSUFFICIENT_AMOUNT_1");
                amount0 = amount0Desired;
                amount1 = amount1Optimal;
            } else {
                uint256 amount0Optimal = (amount1Desired * pool.reserve0) / pool.reserve1;
                require(amount0Optimal <= amount0Desired, "SomniaAMM: INSUFFICIENT_AMOUNT_0");
                require(amount0Optimal >= amount0Min, "SomniaAMM: INSUFFICIENT_AMOUNT_0");
                amount0 = amount0Optimal;
                amount1 = amount1Desired;
            }
            
            liquidity = Math.min(
                (amount0 * pool.totalSupply) / pool.reserve0,
                (amount1 * pool.totalSupply) / pool.reserve1
            );
        }
        
        require(liquidity > 0, "SomniaAMM: INSUFFICIENT_LIQUIDITY_MINTED");
        
        // Transfer tokens from user
        if (token0 != address(0)) {
            IERC20(token0).safeTransferFrom(msg.sender, address(this), amount0);
        }
        if (token1 != address(0)) {
            IERC20(token1).safeTransferFrom(msg.sender, address(this), amount1);
        }
        
        // Update reserves
        pool.reserve0 += amount0;
        pool.reserve1 += amount1;
        pool.totalSupply += liquidity;
        
        // Mint LP tokens
        // Note: In a real implementation, you'd mint ERC20 LP tokens
        
        emit LiquidityAdded(msg.sender, token0, token1, amount0, amount1, liquidity);
        return liquidity;
    }

    /**
     * @dev Remove liquidity from a pool
     */
    function removeLiquidity(
        address token0,
        address token1,
        uint256 liquidity,
        uint256 amount0Min,
        uint256 amount1Min
    ) external validTokens(token0, token1) poolExists(token0, token1) nonReentrant returns (uint256 amount0, uint256 amount1) {
        Pool storage pool = pools[token0][token1].exists ? pools[token0][token1] : pools[token1][token0];
        
        require(liquidity > 0, "SomniaAMM: INSUFFICIENT_LIQUIDITY_BURNED");
        
        // Calculate amounts to return
        amount0 = (liquidity * pool.reserve0) / pool.totalSupply;
        amount1 = (liquidity * pool.reserve1) / pool.totalSupply;
        
        require(amount0 >= amount0Min, "SomniaAMM: INSUFFICIENT_AMOUNT_0");
        require(amount1 >= amount1Min, "SomniaAMM: INSUFFICIENT_AMOUNT_1");
        
        // Update reserves
        pool.reserve0 -= amount0;
        pool.reserve1 -= amount1;
        pool.totalSupply -= liquidity;
        
        // Transfer tokens to user
        if (token0 != address(0)) {
            IERC20(token0).safeTransfer(msg.sender, amount0);
        }
        if (token1 != address(0)) {
            IERC20(token1).safeTransfer(msg.sender, amount1);
        }
        
        emit LiquidityRemoved(msg.sender, token0, token1, amount0, amount1, liquidity);
    }

    /**
     * @dev Swap tokens
     */
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin
    ) external validTokens(tokenIn, tokenOut) poolExists(tokenIn, tokenOut) nonReentrant returns (uint256 amountOut) {
        Pool storage pool = pools[tokenIn][tokenOut].exists ? pools[tokenIn][tokenOut] : pools[tokenOut][tokenIn];
        
        require(amountIn > 0, "SomniaAMM: INSUFFICIENT_INPUT_AMOUNT");
        
        // Calculate output amount
        amountOut = getAmountOut(amountIn, tokenIn, tokenOut);
        require(amountOut >= amountOutMin, "SomniaAMM: INSUFFICIENT_OUTPUT_AMOUNT");
        
        // Transfer input tokens from user
        if (tokenIn != address(0)) {
            IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        }
        
        // Calculate fees
        uint256 tradingFee = (amountIn * TRADING_FEE) / FEE_DENOMINATOR;
        uint256 liquidityFee = (amountIn * LIQUIDITY_FEE) / FEE_DENOMINATOR;
        uint256 amountInWithFee = amountIn - tradingFee - liquidityFee;
        
        // Update reserves
        if (pool.token0 == tokenIn) {
            pool.reserve0 += amountIn;
            pool.reserve1 -= amountOut;
            pool.fee0 += tradingFee;
        } else {
            pool.reserve1 += amountIn;
            pool.reserve0 -= amountOut;
            pool.fee1 += tradingFee;
        }
        
        // Transfer output tokens to user
        if (tokenOut != address(0)) {
            IERC20(tokenOut).safeTransfer(msg.sender, amountOut);
        }
        
        totalVolume += amountIn;
        totalFees += tradingFee;
        
        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
        emit FeeCollected(tokenIn, tradingFee);
        
        return amountOut;
    }

    /**
     * @dev Calculate output amount for a given input
     */
    function getAmountOut(uint256 amountIn, address tokenIn, address tokenOut) public view returns (uint256 amountOut) {
        Pool storage pool = pools[tokenIn][tokenOut].exists ? pools[tokenIn][tokenOut] : pools[tokenOut][tokenIn];
        
        require(pool.exists, "SomniaAMM: POOL_NOT_EXISTS");
        
        uint256 reserveIn = pool.token0 == tokenIn ? pool.reserve0 : pool.reserve1;
        uint256 reserveOut = pool.token0 == tokenIn ? pool.reserve1 : pool.reserve0;
        
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - TRADING_FEE - LIQUIDITY_FEE);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * FEE_DENOMINATOR) + amountInWithFee;
        
        amountOut = numerator / denominator;
    }

    /**
     * @dev Get pool information
     */
    function getPoolInfo(address token0, address token1) external view returns (PoolInfo memory) {
        Pool storage pool = pools[token0][token1].exists ? pools[token0][token1] : pools[token1][token0];
        
        return PoolInfo({
            token0: pool.token0,
            token1: pool.token1,
            reserve0: pool.reserve0,
            reserve1: pool.reserve1,
            totalSupply: pool.totalSupply,
            fee0: pool.fee0,
            fee1: pool.fee1,
            price0CumulativeLast: 0, // Simplified for MVP
            price1CumulativeLast: 0, // Simplified for MVP
            blockTimestampLast: block.timestamp
        });
    }

    /**
     * @dev Whitelist a token for trading
     */
    function whitelistToken(address token) external onlyOwner {
        whitelistedTokens[token] = true;
    }

    /**
     * @dev Remove token from whitelist
     */
    function removeFromWhitelist(address token) external onlyOwner {
        whitelistedTokens[token] = false;
    }

    /**
     * @dev Collect accumulated fees
     */
    function collectFees(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance > 0) {
            IERC20(token).safeTransfer(owner(), balance);
        }
    }

    /**
     * @dev Get all pools for a token
     */
    function getPoolsForToken(address token) external view returns (address[] memory) {
        return poolTokens[token];
    }

    /**
     * @dev Get pool count
     */
    function getPoolCount() external view returns (uint256) {
        return poolCount;
    }

    /**
     * @dev Get total volume and fees
     */
    function getStats() external view returns (uint256 _totalVolume, uint256 _totalFees) {
        return (totalVolume, totalFees);
    }
} 