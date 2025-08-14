const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SomniaStaking", function () {
  let staking;
  let stakingToken, rewardToken;
  let owner, user1, user2;
  let initialSupply, userAmount;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Initialize amounts after ethers is loaded
    initialSupply = ethers.utils.parseEther("1000000"); // 1M tokens
    userAmount = ethers.utils.parseEther("10000"); // 10K tokens

    // Deploy mock tokens
    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    stakingToken = await ERC20Mock.deploy("Staking Token", "STK", owner.address, initialSupply);
    rewardToken = await ERC20Mock.deploy("Reward Token", "RWD", owner.address, initialSupply);

    // Deploy staking contract
    const SomniaStaking = await ethers.getContractFactory("SomniaStaking");
    staking = await SomniaStaking.deploy();

    // Transfer tokens to users
    await stakingToken.transfer(user1.address, userAmount);
    await stakingToken.transfer(user2.address, userAmount);
    await rewardToken.transfer(user1.address, userAmount);
    await rewardToken.transfer(user2.address, userAmount);

    // Transfer reward tokens to staking contract so it can pay rewards
    await rewardToken.transfer(staking.address, userAmount.mul(2));

    // Whitelist tokens
    await staking.whitelistStakingToken(stakingToken.address);
    await staking.whitelistRewardToken(rewardToken.address);
  });

  describe("Deployment", function () {
    it("should set the correct owner", async function () {
      expect(await staking.owner()).to.equal(owner.address);
    });

    it("should whitelist native tokens (address(0))", async function () {
      expect(await staking.whitelistedStakingTokens(ethers.constants.AddressZero)).to.be.true;
      expect(await staking.whitelistedRewardTokens(ethers.constants.AddressZero)).to.be.true;
    });

    it("should have correct initial state", async function () {
      expect(await staking.poolCount()).to.equal(0);
      expect(await staking.totalStaked()).to.equal(0);
      expect(await staking.totalRewardsDistributed()).to.equal(0);
    });

    it("should have correct constants", async function () {
      expect(await staking.REWARD_PRECISION()).to.equal(ethers.utils.parseEther("1"));
      expect(await staking.MINIMUM_STAKE()).to.equal(ethers.utils.parseEther("1"));
      expect(await staking.MAX_REWARD_RATE()).to.equal(5000); // 50%
      expect(await staking.SECONDS_PER_YEAR()).to.equal(365 * 24 * 60 * 60);
    });
  });

  describe("Token Whitelisting", function () {
    it("should allow owner to whitelist staking tokens", async function () {
      const newToken = await (await ethers.getContractFactory("ERC20Mock")).deploy(
        "New Token", "NEW", owner.address, initialSupply
      );

      await staking.whitelistStakingToken(newToken.address);
      expect(await staking.whitelistedStakingTokens(newToken.address)).to.be.true;
    });

    it("should allow owner to whitelist reward tokens", async function () {
      const newToken = await (await ethers.getContractFactory("ERC20Mock")).deploy(
        "New Token", "NEW", owner.address, initialSupply
      );

      await staking.whitelistRewardToken(newToken.address);
      expect(await staking.whitelistedRewardTokens(newToken.address)).to.be.true;
    });

    it("should allow owner to remove tokens from whitelist", async function () {
      await staking.removeFromWhitelist(stakingToken.address, true);
      expect(await staking.whitelistedStakingTokens(stakingToken.address)).to.be.false;
    });

    it("should not allow non-owner to whitelist tokens", async function () {
      const newToken = await (await ethers.getContractFactory("ERC20Mock")).deploy(
        "New Token", "NEW", owner.address, initialSupply
      );

      await expect(
        staking.connect(user1).whitelistStakingToken(newToken.address)
      ).to.be.reverted;
    });
  });

  describe("Pool Creation", function () {
    it("should create a pool successfully", async function () {
      const rewardRate = 1000; // 10% annual rate
      const minStakeDuration = 30 * 24 * 60 * 60; // 30 days
      const maxStakeDuration = 365 * 24 * 60 * 60; // 1 year

      await staking.createPool(
        stakingToken.address,
        rewardToken.address,
        rewardRate,
        minStakeDuration,
        maxStakeDuration
      );

      const pool = await staking.getPool(stakingToken.address);
      expect(pool.isActive).to.be.true;
      expect(pool.rewardRate).to.equal(rewardRate);
      expect(pool.minStakeDuration).to.equal(minStakeDuration);
      expect(pool.maxStakeDuration).to.equal(maxStakeDuration);
    });

    it("should not allow non-owner to create pools", async function () {
      const rewardRate = 1000;
      const minStakeDuration = 30 * 24 * 60 * 60;
      const maxStakeDuration = 365 * 24 * 60 * 60;

      await expect(
        staking.connect(user1).createPool(
          stakingToken.address,
          rewardToken.address,
          rewardRate,
          minStakeDuration,
          maxStakeDuration
        )
      ).to.be.reverted;
    });

    it("should not allow creating pool for non-whitelisted tokens", async function () {
      const newToken = await (await ethers.getContractFactory("ERC20Mock")).deploy(
        "New Token", "NEW", owner.address, initialSupply
      );

      const rewardRate = 1000;
      const minStakeDuration = 30 * 24 * 60 * 60;
      const maxStakeDuration = 365 * 24 * 60 * 60;

      await expect(
        staking.createPool(
          newToken.address,
          rewardToken.address,
          rewardRate,
          minStakeDuration,
          maxStakeDuration
        )
      ).to.be.revertedWith("SomniaStaking: STAKING_TOKEN_NOT_WHITELISTED");
    });

    it("should not allow creating duplicate pools", async function () {
      const rewardRate = 1000;
      const minStakeDuration = 30 * 24 * 60 * 60;
      const maxStakeDuration = 365 * 24 * 60 * 60;

      await staking.createPool(
        stakingToken.address,
        rewardToken.address,
        rewardRate,
        minStakeDuration,
        maxStakeDuration
      );

      await expect(
        staking.createPool(
          stakingToken.address,
          rewardToken.address,
          rewardRate,
          minStakeDuration,
          maxStakeDuration
        )
      ).to.be.revertedWith("SomniaStaking: POOL_EXISTS");
    });

    it("should not allow reward rate above maximum", async function () {
      const rewardRate = 6000; // 60% (above 50% max)
      const minStakeDuration = 30 * 24 * 60 * 60;
      const maxStakeDuration = 365 * 24 * 60 * 60;

      await expect(
        staking.createPool(
          stakingToken.address,
          rewardToken.address,
          rewardRate,
          minStakeDuration,
          maxStakeDuration
        )
      ).to.be.revertedWith("SomniaStaking: REWARD_RATE_TOO_HIGH");
    });
  });

  describe("Staking Tiers", function () {
    beforeEach(async function () {
      const rewardRate = 1000;
      const minStakeDuration = 30 * 24 * 60 * 60;
      const maxStakeDuration = 365 * 24 * 60 * 60;

      await staking.createPool(
        stakingToken.address,
        rewardToken.address,
        rewardRate,
        minStakeDuration,
        maxStakeDuration
      );
    });

    it("should allow owner to add staking tiers", async function () {
      const tierName = "Bronze";
      const minStake = ethers.utils.parseEther("100");
      const maxStake = ethers.utils.parseEther("1000");
      const rewardMultiplier = 12000; // 1.2x
      const lockDuration = 30 * 24 * 60 * 60; // 30 days
      const earlyWithdrawalPenalty = 1000; // 10%

      await staking.addStakingTier(
        stakingToken.address,
        tierName,
        minStake,
        maxStake,
        rewardMultiplier,
        lockDuration,
        earlyWithdrawalPenalty
      );

      const tiers = await staking.getStakingTiers(stakingToken.address);
      expect(tiers.length).to.equal(1);
      expect(tiers[0].name).to.equal(tierName);
      expect(tiers[0].rewardMultiplier).to.equal(rewardMultiplier);
    });

    it("should not allow non-owner to add tiers", async function () {
      const tierName = "Bronze";
      const minStake = ethers.utils.parseEther("100");
      const maxStake = ethers.utils.parseEther("1000");
      const rewardMultiplier = 12000;
      const lockDuration = 30 * 24 * 60 * 60;
      const earlyWithdrawalPenalty = 1000;

      await expect(
        staking.connect(user1).addStakingTier(
          stakingToken.address,
          tierName,
          minStake,
          maxStake,
          rewardMultiplier,
          lockDuration,
          earlyWithdrawalPenalty
        )
      ).to.be.reverted;
    });

    it("should not allow reward multiplier above maximum", async function () {
      const tierName = "Bronze";
      const minStake = ethers.utils.parseEther("100");
      const maxStake = ethers.utils.parseEther("1000");
      const rewardMultiplier = 25000; // 2.5x (above 2x max)
      const lockDuration = 30 * 24 * 60 * 60;
      const earlyWithdrawalPenalty = 1000;

      await expect(
        staking.addStakingTier(
          stakingToken.address,
          tierName,
          minStake,
          maxStake,
          rewardMultiplier,
          lockDuration,
          earlyWithdrawalPenalty
        )
      ).to.be.revertedWith("SomniaStaking: MULTIPLIER_TOO_HIGH");
    });

    it("should not allow early withdrawal penalty above maximum", async function () {
      const tierName = "Bronze";
      const minStake = ethers.utils.parseEther("100");
      const maxStake = ethers.utils.parseEther("1000");
      const rewardMultiplier = 12000;
      const lockDuration = 30 * 24 * 60 * 60;
      const earlyWithdrawalPenalty = 6000; // 60% (above 50% max)

      await expect(
        staking.addStakingTier(
          stakingToken.address,
          tierName,
          minStake,
          maxStake,
          rewardMultiplier,
          lockDuration,
          earlyWithdrawalPenalty
        )
      ).to.be.revertedWith("SomniaStaking: PENALTY_TOO_HIGH");
    });
  });

  describe("Staking", function () {
    beforeEach(async function () {
      const rewardRate = 1000;
      const minStakeDuration = 30 * 24 * 60 * 60;
      const maxStakeDuration = 365 * 24 * 60 * 60;

      await staking.createPool(
        stakingToken.address,
        rewardToken.address,
        rewardRate,
        minStakeDuration,
        maxStakeDuration
      );

      // Add a staking tier
      const tierName = "Bronze";
      const minStake = ethers.utils.parseEther("100");
      const maxStake = ethers.utils.parseEther("10000");
      const rewardMultiplier = 12000;
      const lockDuration = 30 * 24 * 60 * 60;
      const earlyWithdrawalPenalty = 1000;

      await staking.addStakingTier(
        stakingToken.address,
        tierName,
        minStake,
        maxStake,
        rewardMultiplier,
        lockDuration,
        earlyWithdrawalPenalty
      );
    });

    it("should allow users to stake tokens", async function () {
      const stakeAmount = ethers.utils.parseEther("1000");
      const tierIndex = 0;

      await stakingToken.connect(user1).approve(staking.address, stakeAmount);
      await staking.connect(user1).stake(stakingToken.address, stakeAmount, tierIndex);

      const userStake = await staking.getUserStake(user1.address, stakingToken.address);
      expect(userStake.amount).to.equal(stakeAmount);
      expect(userStake.isActive).to.be.true;

      const pool = await staking.getPool(stakingToken.address);
      expect(pool.totalStaked).to.equal(stakeAmount);
    });

    it("should not allow staking below minimum amount", async function () {
      const stakeAmount = ethers.utils.parseEther("0.5"); // Below 1 token minimum
      const tierIndex = 0;

      await stakingToken.connect(user1).approve(staking.address, stakeAmount);

      await expect(
        staking.connect(user1).stake(stakingToken.address, stakeAmount, tierIndex)
      ).to.be.revertedWith("SomniaStaking: BELOW_MINIMUM_STAKE");
    });

    it("should not allow staking with invalid tier index", async function () {
      const stakeAmount = ethers.utils.parseEther("1000");
      const tierIndex = 1; // Non-existent tier

      await stakingToken.connect(user1).approve(staking.address, stakeAmount);

      await expect(
        staking.connect(user1).stake(stakingToken.address, stakeAmount, tierIndex)
      ).to.be.revertedWith("SomniaStaking: INVALID_TIER");
    });

    it("should not allow staking amount outside tier range", async function () {
      const stakeAmount = ethers.utils.parseEther("15000"); // Above tier max of 10000
      const tierIndex = 0;

      await stakingToken.connect(user1).approve(staking.address, stakeAmount);

      await expect(
        staking.connect(user1).stake(stakingToken.address, stakeAmount, tierIndex)
      ).to.be.revertedWith("SomniaStaking: AMOUNT_OUT_OF_TIER_RANGE");
    });
  });

  describe("Unstaking", function () {
    beforeEach(async function () {
      const rewardRate = 1000;
      const minStakeDuration = 30 * 24 * 60 * 60;
      const maxStakeDuration = 365 * 24 * 60 * 60;

      await staking.createPool(
        stakingToken.address,
        rewardToken.address,
        rewardRate,
        minStakeDuration,
        maxStakeDuration
      );

      // Add a staking tier
      const tierName = "Bronze";
      const minStake = ethers.utils.parseEther("100");
      const maxStake = ethers.utils.parseEther("10000");
      const rewardMultiplier = 12000;
      const lockDuration = 30 * 24 * 60 * 60;
      const earlyWithdrawalPenalty = 1000;

      await staking.addStakingTier(
        stakingToken.address,
        tierName,
        minStake,
        maxStake,
        rewardMultiplier,
        lockDuration,
        earlyWithdrawalPenalty
      );

      // Stake tokens
      const stakeAmount = ethers.utils.parseEther("1000");
      const tierIndex = 0;

      await stakingToken.connect(user1).approve(staking.address, stakeAmount);
      await staking.connect(user1).stake(stakingToken.address, stakeAmount, tierIndex);
    });

    it("should allow users to unstake tokens", async function () {
      const unstakeAmount = ethers.utils.parseEther("500");

      const balanceBefore = await stakingToken.balanceOf(user1.address);
      await staking.connect(user1).unstake(stakingToken.address, unstakeAmount);
      const balanceAfter = await stakingToken.balanceOf(user1.address);

      // User should receive tokens back (minus penalty if applicable)
      expect(balanceAfter.gt(balanceBefore)).to.be.true;

      const userStake = await staking.getUserStake(user1.address, stakingToken.address);
      expect(userStake.amount).to.equal(ethers.utils.parseEther("500"));
    });

    it("should not allow unstaking more than staked", async function () {
      const unstakeAmount = ethers.utils.parseEther("1500"); // More than staked

      await expect(
        staking.connect(user1).unstake(stakingToken.address, unstakeAmount)
      ).to.be.revertedWith("SomniaStaking: INSUFFICIENT_STAKE");
    });

    it("should not allow unstaking zero amount", async function () {
      await expect(
        staking.connect(user1).unstake(stakingToken.address, 0)
      ).to.be.revertedWith("SomniaStaking: INVALID_AMOUNT");
    });
  });

  describe("Rewards", function () {
    beforeEach(async function () {
      const rewardRate = 1000;
      const minStakeDuration = 30 * 24 * 60 * 60;
      const maxStakeDuration = 365 * 24 * 60 * 60;

      await staking.createPool(
        stakingToken.address,
        rewardToken.address,
        rewardRate,
        minStakeDuration,
        maxStakeDuration
      );

      // Add a staking tier
      const tierName = "Bronze";
      const minStake = ethers.utils.parseEther("100");
      const maxStake = ethers.utils.parseEther("10000");
      const rewardMultiplier = 12000;
      const lockDuration = 30 * 24 * 60 * 60;
      const earlyWithdrawalPenalty = 1000;

      await staking.addStakingTier(
        stakingToken.address,
        tierName,
        minStake,
        maxStake,
        rewardMultiplier,
        lockDuration,
        earlyWithdrawalPenalty
      );

      // Stake tokens
      const stakeAmount = ethers.utils.parseEther("1000");
      const tierIndex = 0;

      await stakingToken.connect(user1).approve(staking.address, stakeAmount);
      await staking.connect(user1).stake(stakingToken.address, stakeAmount, tierIndex);
    });

    it("should calculate pending rewards correctly", async function () {
      // Fast forward time to accrue rewards
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]); // 1 day
      await ethers.provider.send("evm_mine");

      const pendingRewards = await staking.getPendingRewards(user1.address, stakingToken.address);
      expect(pendingRewards).to.be.gt(0);
    });

    it("should allow users to claim rewards", async function () {
      // Fast forward time to accrue rewards
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]); // 1 day
      await ethers.provider.send("evm_mine");

      const balanceBefore = await rewardToken.balanceOf(user1.address);
      await staking.connect(user1).claimRewards(stakingToken.address);
      const balanceAfter = await rewardToken.balanceOf(user1.address);

      expect(balanceAfter.gt(balanceBefore)).to.be.true;
    });
  });

  describe("Pool Management", function () {
    beforeEach(async function () {
      const rewardRate = 1000;
      const minStakeDuration = 30 * 24 * 60 * 60;
      const maxStakeDuration = 365 * 24 * 60 * 60;

      await staking.createPool(
        stakingToken.address,
        rewardToken.address,
        rewardRate,
        minStakeDuration,
        maxStakeDuration
      );
    });

    it("should allow owner to update pool reward rate", async function () {
      const newRewardRate = 1500; // 15%

      await staking.updatePoolRewardRate(stakingToken.address, newRewardRate);

      const pool = await staking.getPool(stakingToken.address);
      expect(pool.rewardRate).to.equal(newRewardRate);
    });

    it("should not allow non-owner to update pool reward rate", async function () {
      const newRewardRate = 1500;

      await expect(
        staking.connect(user1).updatePoolRewardRate(stakingToken.address, newRewardRate)
      ).to.be.reverted;
    });

    it("should not allow reward rate above maximum", async function () {
      const newRewardRate = 6000; // 60% (above 50% max)

      await expect(
        staking.updatePoolRewardRate(stakingToken.address, newRewardRate)
      ).to.be.revertedWith("SomniaStaking: REWARD_RATE_TOO_HIGH");
    });

    it("should allow owner to pause pools", async function () {
      await staking.pausePool(stakingToken.address);

      const pool = await staking.getPool(stakingToken.address);
      expect(pool.isActive).to.be.false;
    });

    it("should allow owner to resume pools", async function () {
      await staking.pausePool(stakingToken.address);
      await staking.resumePool(stakingToken.address);

      const pool = await staking.getPool(stakingToken.address);
      expect(pool.isActive).to.be.true;
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      const rewardRate = 1000;
      const minStakeDuration = 30 * 24 * 60 * 60;
      const maxStakeDuration = 365 * 24 * 60 * 60;

      await staking.createPool(
        stakingToken.address,
        rewardToken.address,
        rewardRate,
        minStakeDuration,
        maxStakeDuration
      );
    });

    it("should return correct pool information", async function () {
      const pool = await staking.getPool(stakingToken.address);
      expect(pool.stakingToken).to.equal(stakingToken.address);
      expect(pool.rewardToken).to.equal(rewardToken.address);
      expect(pool.isActive).to.be.true;
    });

    it("should return all pools", async function () {
      const pools = await staking.getAllPools();
      expect(pools.length).to.equal(1);
      expect(pools).to.include(stakingToken.address);
    });

    it("should return protocol statistics", async function () {
      const [totalStaked, totalRewardsDistributed] = await staking.getProtocolStats();
      expect(totalStaked).to.equal(0);
      expect(totalRewardsDistributed).to.equal(0);
    });
  });

  describe("Emergency Functions", function () {
    it("should allow owner to withdraw stuck tokens", async function () {
      const stuckAmount = ethers.utils.parseEther("100");
      await stakingToken.transfer(staking.address, stuckAmount);

      const balanceBefore = await stakingToken.balanceOf(owner.address);
      await staking.emergencyWithdraw(stakingToken.address);
      const balanceAfter = await stakingToken.balanceOf(owner.address);

      expect(balanceAfter.sub(balanceBefore)).to.equal(stuckAmount);
    });
  });
});
