// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract SomniaStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Math for uint256;

    // Constants
    uint256 public constant REWARD_PRECISION = 1e18;
    uint256 public constant MINIMUM_STAKE = 1e18; // 1 token minimum
    uint256 public constant MAX_REWARD_RATE = 5000; // 50% max annual rate (5000 basis points)
    uint256 public constant SECONDS_PER_YEAR = 365 days;

    // Structs
    struct StakingPool {
        address stakingToken;
        address rewardToken;
        uint256 totalStaked;
        uint256 totalRewards;
        uint256 rewardRate; // Annual rate in basis points
        uint256 lastUpdateTime;
        uint256 rewardPerTokenStored;
        uint256 periodFinish;
        bool isActive;
        uint256 minStakeDuration;
        uint256 maxStakeDuration;
        uint256 earlyWithdrawalPenalty;
    }

    struct UserStake {
        uint256 amount;
        uint256 stakedAt;
        uint256 lastClaimTime;
        uint256 rewardDebt;
        uint256 pendingRewards;
        bool isActive;
    }

    struct StakingTier {
        string name;
        uint256 minStake;
        uint256 maxStake;
        uint256 rewardMultiplier; // Multiplier in basis points (10000 = 1x)
        uint256 lockDuration;
        uint256 earlyWithdrawalPenalty;
    }

    // State variables
    mapping(address => StakingPool) public stakingPools;
    mapping(address => mapping(address => UserStake)) public userStakes;
    mapping(address => bool) public whitelistedStakingTokens;
    mapping(address => bool) public whitelistedRewardTokens;
    mapping(address => StakingTier[]) public stakingTiers;

    address[] public poolList;
    uint256 public poolCount;
    uint256 public totalStaked;
    uint256 public totalRewardsDistributed;

    // Events
    event PoolCreated(
        address indexed stakingToken,
        address indexed rewardToken,
        uint256 rewardRate
    );
    event Staked(
        address indexed user,
        address indexed stakingToken,
        uint256 amount,
        uint256 tier
    );
    event Unstaked(
        address indexed user,
        address indexed stakingToken,
        uint256 amount,
        uint256 penalty
    );
    event RewardsClaimed(
        address indexed user,
        address indexed rewardToken,
        uint256 amount
    );
    event PoolUpdated(address indexed stakingToken, uint256 newRewardRate);
    event TierAdded(
        address indexed stakingToken,
        string tierName,
        uint256 rewardMultiplier
    );

    // Modifiers
    modifier poolExists(address stakingToken) {
        require(
            stakingPools[stakingToken].isActive,
            "SomniaStaking: POOL_NOT_EXISTS"
        );
        _;
    }

    modifier validAmount(uint256 amount) {
        require(amount > 0, "SomniaStaking: INVALID_AMOUNT");
        _;
    }

    modifier validTokens(address stakingToken, address rewardToken) {
        require(
            whitelistedStakingTokens[stakingToken],
            "SomniaStaking: STAKING_TOKEN_NOT_WHITELISTED"
        );
        require(
            whitelistedRewardTokens[rewardToken],
            "SomniaStaking: REWARD_TOKEN_NOT_WHITELISTED"
        );
        _;
    }

    modifier hasStake(address stakingToken) {
        require(
            userStakes[msg.sender][stakingToken].isActive,
            "SomniaStaking: NO_STAKE"
        );
        _;
    }

    constructor() Ownable(msg.sender) {
        // Whitelist SOM token (assuming it's the native token)
        whitelistedStakingTokens[address(0)] = true;
        whitelistedRewardTokens[address(0)] = true;
    }

    // Core functions

    /**
     * @dev Create a new staking pool
     */
    function createPool(
        address stakingToken,
        address rewardToken,
        uint256 rewardRate,
        uint256 minStakeDuration,
        uint256 maxStakeDuration
    ) external onlyOwner validTokens(stakingToken, rewardToken) {
        require(
            !stakingPools[stakingToken].isActive,
            "SomniaStaking: POOL_EXISTS"
        );
        require(
            rewardRate <= MAX_REWARD_RATE,
            "SomniaStaking: REWARD_RATE_TOO_HIGH"
        );
        require(
            minStakeDuration <= maxStakeDuration,
            "SomniaStaking: INVALID_DURATION"
        );

        stakingPools[stakingToken] = StakingPool({
            stakingToken: stakingToken,
            rewardToken: rewardToken,
            totalStaked: 0,
            totalRewards: 0,
            rewardRate: rewardRate,
            lastUpdateTime: block.timestamp,
            rewardPerTokenStored: 0,
            periodFinish: block.timestamp + SECONDS_PER_YEAR,
            isActive: true,
            minStakeDuration: minStakeDuration,
            maxStakeDuration: maxStakeDuration,
            earlyWithdrawalPenalty: 1000 // 10% penalty (1000 basis points)
        });

        poolList.push(stakingToken);
        poolCount++;

        emit PoolCreated(stakingToken, rewardToken, rewardRate);
    }

    /**
     * @dev Add a staking tier to a pool
     */
    function addStakingTier(
        address stakingToken,
        string memory tierName,
        uint256 minStake,
        uint256 maxStake,
        uint256 rewardMultiplier,
        uint256 lockDuration,
        uint256 earlyWithdrawalPenalty
    ) external onlyOwner poolExists(stakingToken) {
        require(
            rewardMultiplier <= 20000,
            "SomniaStaking: MULTIPLIER_TOO_HIGH"
        ); // Max 2x
        require(
            earlyWithdrawalPenalty <= 5000,
            "SomniaStaking: PENALTY_TOO_HIGH"
        ); // Max 50%

        StakingTier memory newTier = StakingTier({
            name: tierName,
            minStake: minStake,
            maxStake: maxStake,
            rewardMultiplier: rewardMultiplier,
            lockDuration: lockDuration,
            earlyWithdrawalPenalty: earlyWithdrawalPenalty
        });

        stakingTiers[stakingToken].push(newTier);

        emit TierAdded(stakingToken, tierName, rewardMultiplier);
    }

    /**
     * @dev Stake tokens
     */
    function stake(
        address stakingToken,
        uint256 amount,
        uint256 tierIndex
    ) external poolExists(stakingToken) validAmount(amount) nonReentrant {
        StakingPool storage pool = stakingPools[stakingToken];
        UserStake storage userStake = userStakes[msg.sender][stakingToken];

        require(amount >= MINIMUM_STAKE, "SomniaStaking: BELOW_MINIMUM_STAKE");
        require(
            tierIndex < stakingTiers[stakingToken].length,
            "SomniaStaking: INVALID_TIER"
        );

        StakingTier memory tier = stakingTiers[stakingToken][tierIndex];
        require(
            amount >= tier.minStake && amount <= tier.maxStake,
            "SomniaStaking: AMOUNT_OUT_OF_TIER_RANGE"
        );

        // Update rewards before staking
        _updateRewards(stakingToken);

        // Transfer staking tokens from user
        if (stakingToken != address(0)) {
            IERC20(stakingToken).safeTransferFrom(
                msg.sender,
                address(this),
                amount
            );
        }

        // Update pool state
        pool.totalStaked += amount;

        // Update user stake
        if (userStake.isActive) {
            // Add to existing stake
            userStake.amount += amount;
            userStake.lastClaimTime = block.timestamp;
        } else {
            // Create new stake
            userStake.amount = amount;
            userStake.stakedAt = block.timestamp;
            userStake.lastClaimTime = block.timestamp;
            userStake.rewardDebt = pool.rewardPerTokenStored;
            userStake.isActive = true;
        }

        // Update global state
        totalStaked += amount;

        emit Staked(msg.sender, stakingToken, amount, tierIndex);
    }

    /**
     * @dev Unstake tokens
     */
    function unstake(
        address stakingToken,
        uint256 amount
    ) external poolExists(stakingToken) hasStake(stakingToken) nonReentrant {
        StakingPool storage pool = stakingPools[stakingToken];
        UserStake storage userStake = userStakes[msg.sender][stakingToken];

        require(
            amount <= userStake.amount,
            "SomniaStaking: INSUFFICIENT_STAKE"
        );
        require(amount > 0, "SomniaStaking: INVALID_AMOUNT");

        // Update rewards before unstaking
        _updateRewards(stakingToken);

        // Calculate early withdrawal penalty
        uint256 penalty = 0;
        uint256 timeStaked = block.timestamp - userStake.stakedAt;

        // Find applicable tier
        for (uint256 i = 0; i < stakingTiers[stakingToken].length; i++) {
            StakingTier memory tier = stakingTiers[stakingToken][i];
            if (
                userStake.amount >= tier.minStake &&
                userStake.amount <= tier.maxStake
            ) {
                if (timeStaked < tier.lockDuration) {
                    penalty = (amount * tier.earlyWithdrawalPenalty) / 10000;
                }
                break;
            }
        }

        uint256 amountToReturn = amount - penalty;

        // Update pool state
        pool.totalStaked -= amount;

        // Update user stake
        userStake.amount -= amount;
        if (userStake.amount == 0) {
            userStake.isActive = false;
        }

        // Update global state
        totalStaked -= amount;

        // Transfer tokens back to user
        if (stakingToken != address(0)) {
            IERC20(stakingToken).safeTransfer(msg.sender, amountToReturn);
            if (penalty > 0) {
                // Transfer penalty to treasury (owner)
                IERC20(stakingToken).safeTransfer(owner(), penalty);
            }
        }

        emit Unstaked(msg.sender, stakingToken, amount, penalty);
    }

    /**
     * @dev Claim accumulated rewards
     */
    function claimRewards(
        address stakingToken
    ) external poolExists(stakingToken) hasStake(stakingToken) nonReentrant {
        StakingPool storage pool = stakingPools[stakingToken];
        UserStake storage userStake = userStakes[msg.sender][stakingToken];

        // Update rewards
        _updateRewards(stakingToken);

        uint256 pendingRewards = userStake.pendingRewards;
        require(pendingRewards > 0, "SomniaStaking: NO_REWARDS_TO_CLAIM");

        // Reset pending rewards
        userStake.pendingRewards = 0;
        userStake.rewardDebt = pool.rewardPerTokenStored;

        // Update global state
        totalRewardsDistributed += pendingRewards;
        pool.totalRewards += pendingRewards;

        // Transfer reward tokens to user
        if (pool.rewardToken != address(0)) {
            IERC20(pool.rewardToken).safeTransfer(msg.sender, pendingRewards);
        }

        emit RewardsClaimed(msg.sender, pool.rewardToken, pendingRewards);
    }

    /**
     * @dev Update rewards for a specific pool
     */
    function _updateRewards(address stakingToken) internal {
        StakingPool storage pool = stakingPools[stakingToken];

        if (pool.totalStaked == 0) return;

        uint256 timeElapsed = block.timestamp - pool.lastUpdateTime;
        if (timeElapsed == 0) return;

        // Calculate rewards per token
        uint256 rewardsPerToken = (timeElapsed *
            pool.rewardRate *
            REWARD_PRECISION) / (SECONDS_PER_YEAR * 10000);
        pool.rewardPerTokenStored += rewardsPerToken;
        pool.lastUpdateTime = block.timestamp;

        // Update user rewards
        UserStake storage userStake = userStakes[msg.sender][stakingToken];
        if (userStake.isActive) {
            uint256 rewardPerToken = pool.rewardPerTokenStored -
                userStake.rewardDebt;
            uint256 rewards = (userStake.amount * rewardPerToken) /
                REWARD_PRECISION;

            // Apply tier multiplier
            uint256 tierMultiplier = _getTierMultiplier(
                stakingToken,
                userStake.amount
            );
            rewards = (rewards * tierMultiplier) / 10000;

            userStake.pendingRewards += rewards;
        }
    }

    /**
     * @dev Get tier multiplier for a user's stake amount
     */
    function _getTierMultiplier(
        address stakingToken,
        uint256 stakeAmount
    ) internal view returns (uint256) {
        for (uint256 i = 0; i < stakingTiers[stakingToken].length; i++) {
            StakingTier memory tier = stakingTiers[stakingToken][i];
            if (stakeAmount >= tier.minStake && stakeAmount <= tier.maxStake) {
                return tier.rewardMultiplier;
            }
        }
        return 10000; // Default 1x multiplier
    }

    /**
     * @dev Get user's pending rewards
     */
    function getPendingRewards(
        address user,
        address stakingToken
    ) external view returns (uint256) {
        StakingPool storage pool = stakingPools[stakingToken];
        UserStake storage userStake = userStakes[user][stakingToken];

        if (!userStake.isActive || pool.totalStaked == 0) return 0;

        uint256 timeElapsed = block.timestamp - pool.lastUpdateTime;
        uint256 rewardPerToken = pool.rewardPerTokenStored;

        if (timeElapsed > 0) {
            uint256 rewardsPerToken = (timeElapsed *
                pool.rewardRate *
                REWARD_PRECISION) / (SECONDS_PER_YEAR * 10000);
            rewardPerToken += rewardsPerToken;
        }

        uint256 rewardPerTokenDelta = rewardPerToken - userStake.rewardDebt;
        uint256 rewards = (userStake.amount * rewardPerTokenDelta) /
            REWARD_PRECISION;

        // Apply tier multiplier
        uint256 tierMultiplier = _getTierMultiplier(
            stakingToken,
            userStake.amount
        );
        rewards = (rewards * tierMultiplier) / 10000;

        return userStake.pendingRewards + rewards;
    }

    /**
     * @dev Get user's stake information
     */
    function getUserStake(
        address user,
        address stakingToken
    ) external view returns (UserStake memory) {
        return userStakes[user][stakingToken];
    }

    /**
     * @dev Get pool information
     */
    function getPool(
        address stakingToken
    ) external view returns (StakingPool memory) {
        return stakingPools[stakingToken];
    }

    /**
     * @dev Get all pools
     */
    function getAllPools() external view returns (address[] memory) {
        return poolList;
    }

    /**
     * @dev Get staking tiers for a pool
     */
    function getStakingTiers(
        address stakingToken
    ) external view returns (StakingTier[] memory) {
        return stakingTiers[stakingToken];
    }

    /**
     * @dev Get protocol statistics
     */
    function getProtocolStats()
        external
        view
        returns (uint256 _totalStaked, uint256 _totalRewardsDistributed)
    {
        return (totalStaked, totalRewardsDistributed);
    }

    /**
     * @dev Whitelist staking token
     */
    function whitelistStakingToken(address token) external onlyOwner {
        whitelistedStakingTokens[token] = true;
    }

    /**
     * @dev Whitelist reward token
     */
    function whitelistRewardToken(address token) external onlyOwner {
        whitelistedRewardTokens[token] = true;
    }

    /**
     * @dev Remove token from whitelist
     */
    function removeFromWhitelist(
        address token,
        bool isStakingToken
    ) external onlyOwner {
        if (isStakingToken) {
            whitelistedStakingTokens[token] = false;
        } else {
            whitelistedRewardTokens[token] = false;
        }
    }

    /**
     * @dev Update pool reward rate
     */
    function updatePoolRewardRate(
        address stakingToken,
        uint256 newRewardRate
    ) external onlyOwner poolExists(stakingToken) {
        require(
            newRewardRate <= MAX_REWARD_RATE,
            "SomniaStaking: REWARD_RATE_TOO_HIGH"
        );
        stakingPools[stakingToken].rewardRate = newRewardRate;
        emit PoolUpdated(stakingToken, newRewardRate);
    }

    /**
     * @dev Emergency pause pool
     */
    function pausePool(
        address stakingToken
    ) external onlyOwner poolExists(stakingToken) {
        stakingPools[stakingToken].isActive = false;
    }

    /**
     * @dev Emergency resume pool
     */
    function resumePool(address stakingToken) external onlyOwner {
        require(
            stakingPools[stakingToken].stakingToken != address(0),
            "SomniaStaking: POOL_NOT_EXISTS"
        );
        stakingPools[stakingToken].isActive = true;
    }

    /**
     * @dev Withdraw stuck tokens (emergency only)
     */
    function emergencyWithdraw(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance > 0) {
            IERC20(token).safeTransfer(owner(), balance);
        }
    }
}
