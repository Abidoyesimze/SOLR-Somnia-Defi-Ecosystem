 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract SomniaLendingFixed is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Math for uint256;

    // Constants
    uint256 public constant LIQUIDATION_THRESHOLD = 8500; // 85% (8500 basis points)
    uint256 public constant LIQUIDATION_BONUS = 500; // 5% (500 basis points)
    uint256 public constant MAX_LIQUIDATION_CLOSE = 5000; // 50% (5000 basis points)
    uint256 public constant INTEREST_RATE_MODEL = 1000; // 10% annual rate (1000 basis points)
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    uint256 public constant INITIAL_EXCHANGE_RATE = 1e18; // 1:1 initially

    // Structs
    struct Market {
        address token;
        uint256 totalSupply;
        uint256 totalBorrow;
        uint256 supplyRate;
        uint256 borrowRate;
        uint256 exchangeRate;
        uint256 lastUpdateTime;
        bool isActive;
        uint256 collateralFactor;
    }

    struct UserPosition {
        uint256 supplied;
        uint256 borrowed;
        uint256 lastUpdateTime;
        bool isActive;
    }

    struct LiquidationInfo {
        address user;
        address collateralToken;
        address debtToken;
        uint256 collateralAmount;
        uint256 debtAmount;
        uint256 bonus;
    }

    // State variables
    mapping(address => Market) public markets;
    mapping(address => mapping(address => UserPosition)) public userPositions;
    mapping(address => bool) public whitelistedTokens;
    mapping(address => uint256) public userTotalCollateral;
    mapping(address => uint256) public userTotalBorrow;

    address[] public marketList;
    uint256 public marketCount;
    uint256 public totalCollateral;
    uint256 public totalBorrowed;

    // Events
    event MarketCreated(address indexed token, uint256 collateralFactor);
    event InitialLiquidityAdded(address indexed token, uint256 amount, address indexed provider);
    event Supply(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 exchangeRate
    );
    event Withdraw(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 exchangeRate
    );
    event Borrow(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 borrowRate
    );
    event Repay(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 borrowRate
    );
    event Liquidate(
        address indexed liquidator,
        address indexed user,
        address indexed collateralToken,
        uint256 collateralAmount,
        uint256 debtAmount
    );
    event InterestAccrued(
        address indexed token,
        uint256 supplyRate,
        uint256 borrowRate
    );

    // Modifiers
    modifier marketExists(address token) {
        require(markets[token].isActive, "SomniaLending: MARKET_NOT_EXISTS");
        _;
    }

    modifier validAmount(uint256 amount) {
        require(amount > 0, "SomniaLending: INVALID_AMOUNT");
        _;
    }

    modifier validToken(address token) {
        require(
            whitelistedTokens[token],
            "SomniaLending: TOKEN_NOT_WHITELISTED"
        );
        _;
    }

    constructor() Ownable(msg.sender) {
        // Whitelist SOM token (assuming it's the native token)
        whitelistedTokens[address(0)] = true;
    }

    // Core functions

    /**
     * @dev Create a new lending market
     */
    function createMarket(
        address token,
        uint256 collateralFactor
    ) external onlyOwner validToken(token) {
        require(!markets[token].isActive, "SomniaLending: MARKET_EXISTS");
        require(
            collateralFactor <= 9000,
            "SomniaLending: INVALID_COLLATERAL_FACTOR"
        ); // Max 90%

        markets[token] = Market({
            token: token,
            totalSupply: 0,
            totalBorrow: 0,
            supplyRate: INTEREST_RATE_MODEL,
            borrowRate: INTEREST_RATE_MODEL + 200, // 2% spread
            exchangeRate: INITIAL_EXCHANGE_RATE,
            lastUpdateTime: block.timestamp,
            isActive: true,
            collateralFactor: collateralFactor
        });

        marketList.push(token);
        marketCount++;

        emit MarketCreated(token, collateralFactor);
    }

    /**
     * @dev Add initial liquidity to bootstrap a market (admin only)
     */
    function addInitialLiquidity(
        address token,
        uint256 amount
    ) external onlyOwner marketExists(token) validAmount(amount) {
        Market storage market = markets[token];
        
        // Transfer tokens from admin
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Set initial supply and exchange rate
        market.totalSupply = amount;
        market.exchangeRate = INITIAL_EXCHANGE_RATE;
        market.lastUpdateTime = block.timestamp;
        
        // Update global state
        totalCollateral += amount;
        
        emit InitialLiquidityAdded(token, amount, msg.sender);
    }

    /**
     * @dev Supply tokens to earn interest
     */
    function supply(
        address token,
        uint256 amount
    ) external marketExists(token) validAmount(amount) nonReentrant {
        Market storage market = markets[token];
        UserPosition storage position = userPositions[msg.sender][token];

        // Accrue interest
        _accrueInterest(token);

        // Transfer tokens from user
        if (token != address(0)) {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        // Calculate shares based on current exchange rate
        uint256 shares;
        if (market.totalSupply == 0) {
            // First supply after initial liquidity
            shares = amount;
            market.exchangeRate = INITIAL_EXCHANGE_RATE;
        } else {
            shares = (amount * 1e18) / market.exchangeRate;
        }

        // Update market state
        market.totalSupply += amount;
        
        // Update exchange rate only if there are borrows
        if (market.totalBorrow > 0) {
            market.exchangeRate = (market.totalSupply * 1e18) / (market.totalSupply - market.totalBorrow);
        }

        // Update user position
        position.supplied += shares;
        position.lastUpdateTime = block.timestamp;
        position.isActive = true;

        // Update global state
        userTotalCollateral[msg.sender] += amount;
        totalCollateral += amount;

        emit Supply(msg.sender, token, amount, market.exchangeRate);
    }

    /**
     * @dev Withdraw supplied tokens
     */
    function withdraw(
        address token,
        uint256 amount
    ) external marketExists(token) validAmount(amount) nonReentrant {
        Market storage market = markets[token];
        UserPosition storage position = userPositions[msg.sender][token];

        require(position.supplied > 0, "SomniaLending: NO_SUPPLY");

        // Accrue interest
        _accrueInterest(token);

        // Calculate shares to burn
        uint256 shares = (amount * 1e18) / market.exchangeRate;
        require(
            shares <= position.supplied,
            "SomniaLending: INSUFFICIENT_BALANCE"
        );

        // Check collateral requirements
        require(
            _isCollateralSufficient(msg.sender),
            "SomniaLending: INSUFFICIENT_COLLATERAL"
        );

        // Update market state
        market.totalSupply -= amount;
        
        // Update exchange rate only if there are borrows
        if (market.totalBorrow > 0) {
            market.exchangeRate = (market.totalSupply * 1e18) / (market.totalSupply - market.totalBorrow);
        }

        // Update user position
        position.supplied -= shares;
        if (position.supplied == 0) {
            position.isActive = false;
        }

        // Update global state
        userTotalCollateral[msg.sender] -= amount;
        totalCollateral -= amount;

        // Transfer tokens to user
        if (token != address(0)) {
            IERC20(token).safeTransfer(msg.sender, amount);
        }

        emit Withdraw(msg.sender, token, amount, market.exchangeRate);
    }

    /**
     * @dev Borrow tokens against collateral
     */
    function borrow(
        address token,
        uint256 amount
    ) external marketExists(token) validAmount(amount) nonReentrant {
        Market storage market = markets[token];
        UserPosition storage position = userPositions[msg.sender][token];

        require(
            market.totalSupply >= amount,
            "SomniaLending: INSUFFICIENT_LIQUIDITY"
        );
        require(
            _isCollateralSufficient(msg.sender),
            "SomniaLending: INSUFFICIENT_COLLATERAL"
        );

        // Accrue interest
        _accrueInterest(token);

        // Update market state
        market.totalBorrow += amount;
        
        // Update exchange rate
        if (market.totalSupply > market.totalBorrow) {
            market.exchangeRate = (market.totalSupply * 1e18) / (market.totalSupply - market.totalBorrow);
        }

        // Update user position
        position.borrowed += amount;
        position.lastUpdateTime = block.timestamp;
        position.isActive = true;

        // Update global state
        userTotalBorrow[msg.sender] += amount;
        totalBorrowed += amount;

        // Transfer tokens to user
        if (token != address(0)) {
            IERC20(token).safeTransfer(msg.sender, amount);
        }

        emit Borrow(msg.sender, token, amount, market.borrowRate);
    }

    /**
     * @dev Repay borrowed tokens
     */
    function repay(
        address token,
        uint256 amount
    ) external marketExists(token) validAmount(amount) nonReentrant {
        Market storage market = markets[token];
        UserPosition storage position = userPositions[msg.sender][token];

        require(position.borrowed > 0, "SomniaLending: NO_BORROW");
        require(amount <= position.borrowed, "SomniaLending: EXCESS_REPAYMENT");

        // Accrue interest
        _accrueInterest(token);

        // Transfer tokens from user
        if (token != address(0)) {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        // Update market state
        market.totalBorrow -= amount;
        
        // Update exchange rate
        if (market.totalSupply > market.totalBorrow) {
            market.exchangeRate = (market.totalSupply * 1e18) / (market.totalSupply - market.totalBorrow);
        }

        // Update user position
        position.borrowed -= amount;
        if (position.borrowed == 0) {
            position.isActive = false;
        }

        // Update global state
        userTotalBorrow[msg.sender] -= amount;
        totalBorrowed -= amount;

        emit Repay(msg.sender, token, amount, market.borrowRate);
    }

    /**
     * @dev Liquidate undercollateralized positions
     */
    function liquidate(
        address user,
        address collateralToken,
        address debtToken,
        uint256 debtAmount
    )
        external
        marketExists(collateralToken)
        marketExists(debtToken)
        nonReentrant
    {
        require(user != msg.sender, "SomniaLending: CANNOT_LIQUIDATE_SELF");
        require(
            !_isCollateralSufficient(user),
            "SomniaLending: POSITION_HEALTHY"
        );

        UserPosition storage collateralPosition = userPositions[user][
            collateralToken
        ];
        UserPosition storage debtPosition = userPositions[user][debtToken];

        require(
            collateralPosition.supplied > 0,
            "SomniaLending: NO_COLLATERAL"
        );
        require(debtPosition.borrowed > 0, "SomniaLending: NO_DEBT");

        // Calculate liquidation amounts
        uint256 collateralAmount = _calculateLiquidationAmount(
            user,
            collateralToken,
            debtToken,
            debtAmount
        );
        uint256 bonus = (collateralAmount * LIQUIDATION_BONUS) / 10000;
        uint256 totalCollateralToTransfer = collateralAmount + bonus;

        // Transfer debt tokens from liquidator
        if (debtToken != address(0)) {
            IERC20(debtToken).safeTransferFrom(
                msg.sender,
                address(this),
                debtAmount
            );
        }

        // Update positions
        collateralPosition.supplied -= totalCollateralToTransfer;
        debtPosition.borrowed -= debtAmount;

        // Update market states
        markets[collateralToken].totalSupply -= totalCollateralToTransfer;
        markets[debtToken].totalBorrow -= debtAmount;

        // Update global state
        userTotalCollateral[user] -= totalCollateralToTransfer;
        userTotalBorrow[user] -= debtAmount;
        totalCollateral -= totalCollateralToTransfer;
        totalBorrowed -= debtAmount;

        // Transfer collateral to liquidator
        if (collateralToken != address(0)) {
            IERC20(collateralToken).safeTransfer(
                msg.sender,
                totalCollateralToTransfer
            );
        }

        emit Liquidate(
            msg.sender,
            user,
            collateralToken,
            collateralAmount,
            debtAmount
        );
    }

    /**
     * @dev Accrue interest for a market
     */
    function _accrueInterest(address token) internal {
        Market storage market = markets[token];
        uint256 timeElapsed = block.timestamp - market.lastUpdateTime;

        if (timeElapsed > 0) {
            // Calculate interest
            uint256 supplyInterest = (market.totalSupply *
                market.supplyRate *
                timeElapsed) / (SECONDS_PER_YEAR * 10000);
            uint256 borrowInterest = (market.totalBorrow *
                market.borrowRate *
                timeElapsed) / (SECONDS_PER_YEAR * 10000);

            // Update market state
            market.totalSupply += supplyInterest;
            market.totalBorrow += borrowInterest;
            market.lastUpdateTime = block.timestamp;

            emit InterestAccrued(token, market.supplyRate, market.borrowRate);
        }
    }

    /**
     * @dev Check if user has sufficient collateral
     */
    function _isCollateralSufficient(
        address user
    ) internal view returns (bool) {
        uint256 totalCollateralValue = userTotalCollateral[user];
        uint256 totalBorrowValue = userTotalBorrow[user];

        if (totalBorrowValue == 0) return true;

        // Calculate collateral ratio (simplified)
        uint256 collateralRatio = (totalCollateralValue * 10000) /
            totalBorrowValue;
        return collateralRatio >= LIQUIDATION_THRESHOLD;
    }

    /**
     * @dev Calculate liquidation amount
     */
    function _calculateLiquidationAmount(
        address user,
        address collateralToken,
        address debtToken,
        uint256 debtAmount
    ) internal view returns (uint256) {
        // Simplified calculation - in real implementation, use price oracles
        Market storage collateralMarket = markets[collateralToken];
        uint256 collateralValue = userPositions[user][collateralToken].supplied;

        return Math.min(collateralValue, debtAmount);
    }

    /**
     * @dev Get user position information
     */
    function getUserPosition(
        address user,
        address token
    ) external view returns (UserPosition memory) {
        return userPositions[user][token];
    }

    /**
     * @dev Get market information
     */
    function getMarket(address token) external view returns (Market memory) {
        return markets[token];
    }

    /**
     * @dev Get all markets
     */
    function getAllMarkets() external view returns (address[] memory) {
        return marketList;
    }

    /**
     * @dev Get user's total collateral and borrow
     */
    function getUserTotals(
        address user
    ) external view returns (uint256 collateral, uint256 borrow) {
        return (userTotalCollateral[user], userTotalBorrow[user]);
    }

    /**
     * @dev Get protocol totals
     */
    function getProtocolTotals()
        external
        view
        returns (uint256 _totalCollateral, uint256 _totalBorrowed)
    {
        return (totalCollateral, totalBorrowed);
    }

    /**
     * @dev Whitelist a token for lending
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
     * @dev Update market parameters
     */
    function updateMarket(
        address token,
        uint256 collateralFactor
    ) external onlyOwner marketExists(token) {
        require(
            collateralFactor <= 9000,
            "SomniaLending: INVALID_COLLATERAL_FACTOR"
        );
        markets[token].collateralFactor = collateralFactor;
    }

    /**
     * @dev Emergency pause market
     */
    function pauseMarket(address token) external onlyOwner marketExists(token) {
        markets[token].isActive = false;
    }

    /**
     * @dev Emergency resume market
     */
    function resumeMarket(address token) external onlyOwner {
        require(
            markets[token].token != address(0),
            "SomniaLending: MARKET_NOT_EXISTS"
        );
        markets[token].isActive = true;
    }
}