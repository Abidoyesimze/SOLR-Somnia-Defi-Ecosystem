// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

import "./SomniaLPToken.sol";

contract SomniaAMM is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ===== Constants =====
    uint256 public constant MINIMUM_LIQUIDITY = 1000;
    uint256 public constant FEE_DENOMINATOR   = 10000;
    uint256 public constant TRADING_FEE       = 30;   // 0.30%
    uint256 public constant LIQUIDITY_FEE     = 20;   // 0.20%

    // ===== Data structures =====
    struct Pool {
        address token0;
        address token1;
        uint256 reserve0;
        uint256 reserve1;
        uint256 fee0;            // accumulated trading fee (token0)
        uint256 fee1;            // accumulated trading fee (token1)
        bool    exists;
        address lpToken;         // ERC20 LP token address for this pool
    }

    struct PoolInfo {
        address token0;
        address token1;
        uint256 reserve0;
        uint256 reserve1;
        uint256 totalSupply;       // LP total supply (reads from lpToken)
        uint256 fee0;
        uint256 fee1;
        address lpToken;
    }

    // ===== Storage =====
    mapping(address => mapping(address => Pool)) public pools;  // sorted key [tokenA][tokenB]
    mapping(address => address[]) public poolTokens;            // adjacency: tokenA => [tokenB...]
    mapping(address => bool) public whitelistedTokens;

    uint256 public poolCount;
    uint256 public totalVolume; // sum of amountIn across swaps
    uint256 public totalFees;   // sum of trading fees (in tokenIn units)

    // ===== Events =====
    event PoolCreated(address indexed token0, address indexed token1, address lpToken);
    event LiquidityAdded(address indexed provider, address indexed token0, address indexed token1,
                         uint256 amount0, uint256 amount1, uint256 liquidity);
    event LiquidityRemoved(address indexed provider, address indexed token0, address indexed token1,
                           uint256 amount0, uint256 amount1, uint256 liquidity);
    event Swap(address indexed sender, address indexed tokenIn, address indexed tokenOut,
               uint256 amountIn, uint256 amountOut);
    event FeeCollected(address indexed token, uint256 amount);

    // ===== Constructor =====
    constructor(address initialOwner) Ownable(initialOwner) {}

    // ===== Modifiers / Helpers =====
    modifier validTokens(address _token0, address _token1) {
        require(_token0 != _token1, "AMM: IDENTICAL_ADDRESSES");
        require(_token0 != address(0) && _token1 != address(0), "AMM: ZERO_ADDRESS");
        require(whitelistedTokens[_token0] && whitelistedTokens[_token1], "AMM: TOKEN_NOT_WHITELISTED");
        _;
    }

    modifier poolExists(address _token0, address _token1) {
        (address a, address b) = _sort(_token0, _token1);
        require(pools[a][b].exists, "AMM: POOL_NOT_EXISTS");
        _;
    }

    function _sort(address tokenA, address tokenB) internal pure returns (address a, address b) {
        (a, b) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
    }

    function _pool(address t0, address t1) internal view returns (Pool storage p) {
        (address a, address b) = _sort(t0, t1);
        p = pools[a][b];
    }

    function _lp(address t0, address t1) internal view returns (SomniaLPToken lpToken) {
        (address a, address b) = _sort(t0, t1);
        lpToken = SomniaLPToken(pools[a][b].lpToken);
    }

    // ===== Admin: token whitelist =====
    function whitelistToken(address token) external onlyOwner {
        require(token != address(0), "AMM: ZERO_ADDRESS");
        whitelistedTokens[token] = true;
    }

    function removeFromWhitelist(address token) external onlyOwner {
        whitelistedTokens[token] = false;
    }

    // ===== Pool lifecycle =====
    function createPool(address token0, address token1)
        external
        validTokens(token0, token1)
        nonReentrant
        returns (address lpTokenAddr)
    {
        (address a, address b) = _sort(token0, token1);
        require(!pools[a][b].exists, "AMM: POOL_EXISTS");

        // Deploy a dedicated LP token for this pool, owned by this AMM
        SomniaLPToken lp = new SomniaLPToken(address(this));
        lp.addAuthorizedMinter(address(this)); // AMM can mint/burn

        pools[a][b] = Pool({
            token0: a,
            token1: b,
            reserve0: 0,
            reserve1: 0,
            fee0: 0,
            fee1: 0,
            exists: true,
            lpToken: address(lp)
        });

        poolTokens[a].push(b);
        poolCount++;

        emit PoolCreated(a, b, address(lp));
        return address(lp);
    }

    // ===== Liquidity: add =====
    function addLiquidity(
        address token0,
        address token1,
        uint256 amount0Desired,
        uint256 amount1Desired,
        uint256 amount0Min,
        uint256 amount1Min
    )
        external
        validTokens(token0, token1)
        poolExists(token0, token1)
        nonReentrant
        returns (uint256 liquidity, uint256 amount0, uint256 amount1)
    {
        Pool storage p = _pool(token0, token1);
        SomniaLPToken lp = _lp(token0, token1);

        uint256 _totalSupply = lp.totalSupply();

        if (_totalSupply == 0) {
            // first LP sets price; take desired amounts
            amount0 = amount0Desired;
            amount1 = amount1Desired;

            // mint = sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY
            liquidity = Math.sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            require(liquidity > 0, "AMM: INSUFFICIENT_LIQUIDITY_MINTED");

            // Transfer exact amounts in
            IERC20(p.token0).safeTransferFrom(msg.sender, address(this), amount0);
            IERC20(p.token1).safeTransferFrom(msg.sender, address(this), amount1);

            // Lock minimum liquidity forever (to address(0))
            lp.mint(address(0), MINIMUM_LIQUIDITY, "LOCK");
            lp.mint(msg.sender, liquidity, "POOL");
        } else {
            // choose optimal counterpart to maintain price
            uint256 amount1Optimal = (amount0Desired * p.reserve1) / p.reserve0;
            if (amount1Optimal <= amount1Desired) {
                require(amount1Optimal >= amount1Min, "AMM: INSUFF_AMOUNT1");
                amount0 = amount0Desired;
                amount1 = amount1Optimal;
            } else {
                uint256 amount0Optimal = (amount1Desired * p.reserve0) / p.reserve1;
                require(amount0Optimal >= amount0Min, "AMM: INSUFF_AMOUNT0");
                amount0 = amount0Optimal;
                amount1 = amount1Desired;
            }

            // mint = min(amount0 * totalSupply / reserve0, amount1 * totalSupply / reserve1)
            liquidity = Math.min(
                (amount0 * _totalSupply) / p.reserve0,
                (amount1 * _totalSupply) / p.reserve1
            );
            require(liquidity > 0, "AMM: INSUFFICIENT_LIQUIDITY_MINTED");

            // Transfer exact amounts in
            IERC20(p.token0).safeTransferFrom(msg.sender, address(this), amount0);
            IERC20(p.token1).safeTransferFrom(msg.sender, address(this), amount1);

            lp.mint(msg.sender, liquidity, "POOL");
        }

        // Update reserves
        p.reserve0 += amount0;
        p.reserve1 += amount1;

        emit LiquidityAdded(msg.sender, p.token0, p.token1, amount0, amount1, liquidity);
    }

    // ===== Liquidity: remove =====
    function removeLiquidity(
        address token0,
        address token1,
        uint256 liquidity,
        uint256 amount0Min,
        uint256 amount1Min
    )
        external
        validTokens(token0, token1)
        poolExists(token0, token1)
        nonReentrant
        returns (uint256 amount0, uint256 amount1)
    {
        Pool storage p = _pool(token0, token1);
        SomniaLPToken lp = _lp(token0, token1);

        require(liquidity > 0, "AMM: ZERO_LIQUIDITY");

        uint256 _totalSupply = lp.totalSupply(); // includes locked MINIMUM_LIQUIDITY

        // amounts owed proportional to share
        amount0 = (liquidity * p.reserve0) / _totalSupply;
        amount1 = (liquidity * p.reserve1) / _totalSupply;

        require(amount0 >= amount0Min, "AMM: INSUFF_AMOUNT0");
        require(amount1 >= amount1Min, "AMM: INSUFF_AMOUNT1");

        // burn LP from caller
        lp.burn(msg.sender, liquidity, "POOL");

        // update reserves
        p.reserve0 -= amount0;
        p.reserve1 -= amount1;

        // send tokens out
        IERC20(p.token0).safeTransfer(msg.sender, amount0);
        IERC20(p.token1).safeTransfer(msg.sender, amount1);

        emit LiquidityRemoved(msg.sender, p.token0, p.token1, amount0, amount1, liquidity);
    }

    // ===== Swap =====
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin
    )
        external
        validTokens(tokenIn, tokenOut)
        poolExists(tokenIn, tokenOut)
        nonReentrant
        returns (uint256 amountOut)
    {
        Pool storage p = _pool(tokenIn, tokenOut);
        require(amountIn > 0, "AMM: INSUFF_INPUT");

        bool inIs0 = (tokenIn == p.token0);

        // Pull tokenIn
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Apply fees on input
        uint256 tradingFeeAmt   = (amountIn * TRADING_FEE) / FEE_DENOMINATOR;
        uint256 liquidityFeeAmt = (amountIn * LIQUIDITY_FEE) / FEE_DENOMINATOR;
        uint256 amountInAfterFee = amountIn - tradingFeeAmt - liquidityFeeAmt;

        // Get reserves snapshot
        uint256 reserveIn  = inIs0 ? p.reserve0 : p.reserve1;
        uint256 reserveOut = inIs0 ? p.reserve1 : p.reserve0;

        // Constant product with fee on input:
        // amountOut = (amountInAfterFee * reserveOut) / (reserveIn + amountInAfterFee)
        amountOut = (amountInAfterFee * reserveOut) / (reserveIn + amountInAfterFee);
        require(amountOut >= amountOutMin, "AMM: INSUFF_OUTPUT");

        // Update reserves and fee buckets
        if (inIs0) {
            p.reserve0 = reserveIn + amountIn;
            p.reserve1 = reserveOut - amountOut;
            p.fee0 += tradingFeeAmt;
        } else {
            p.reserve1 = reserveIn + amountIn;
            p.reserve0 = reserveOut - amountOut;
            p.fee1 += tradingFeeAmt;
        }

        // Send tokenOut
        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);

        totalVolume += amountIn;
        totalFees   += tradingFeeAmt;

        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
        emit FeeCollected(tokenIn, tradingFeeAmt);
    }

    // ===== Views =====
    function getAmountOut(
        uint256 amountIn,
        address tokenIn,
        address tokenOut
    ) external view returns (uint256 amountOut) {
        Pool storage p = _pool(tokenIn, tokenOut);
        bool inIs0 = (tokenIn == p.token0);

        uint256 reserveIn  = inIs0 ? p.reserve0 : p.reserve1;
        uint256 reserveOut = inIs0 ? p.reserve1 : p.reserve0;

        uint256 amountInAfterFee =
            amountIn * (FEE_DENOMINATOR - TRADING_FEE - LIQUIDITY_FEE) / FEE_DENOMINATOR;

        amountOut = (amountInAfterFee * reserveOut) / (reserveIn + amountInAfterFee);
    }

    function getPoolInfo(address token0, address token1)
        external
        view
        returns (PoolInfo memory info)
    {
        Pool storage p = _pool(token0, token1);
        uint256 lpSupply = SomniaLPToken(p.lpToken).totalSupply();
        info = PoolInfo({
            token0: p.token0,
            token1: p.token1,
            reserve0: p.reserve0,
            reserve1: p.reserve1,
            totalSupply: lpSupply,
            fee0: p.fee0,
            fee1: p.fee1,
            lpToken: p.lpToken
        });
    }

    function getLPToken(address token0, address token1) external view returns (address) {
        return _pool(token0, token1).lpToken;
    }

    function getPoolsForToken(address token) external view returns (address[] memory) {
        return poolTokens[token];
    }

    function getPoolCount() external view returns (uint256) {
        return poolCount;
    }

    function getStats() external view returns (uint256 _totalVolume, uint256 _totalFees) {
        return (totalVolume, totalFees);
    }

    // ===== Owner fee sweep (per token) =====
    function collectFees(address feeToken) external onlyOwner nonReentrant {
        uint256 bal = IERC20(feeToken).balanceOf(address(this));
        if (bal > 0) {
            IERC20(feeToken).safeTransfer(owner(), bal);
        }
    }
}
