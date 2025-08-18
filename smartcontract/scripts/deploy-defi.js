const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Somnia DeFi Ecosystem...");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "SOM");

  // Deploy Governance Token First
  console.log("\n🏛️  Deploying SomniaGovernance...");
  const SomniaGovernance = await ethers.getContractFactory("SomniaGovernance");
  const governanceToken = await SomniaGovernance.deploy();
  await governanceToken.waitForDeployment();
  const governanceAddress = await governanceToken.getAddress();
  console.log("✅ SomniaGovernance deployed to:", governanceAddress);

  // Deploy AMM DEX
  console.log("\n🔄 Deploying SomniaAMM...");
  const SomniaAMM = await ethers.getContractFactory("SomniaAMM");
  const amm = await SomniaAMM.deploy(deployer.address);
  await amm.waitForDeployment();
  const ammAddress = await amm.getAddress();
  console.log("✅ SomniaAMM deployed to:", ammAddress);

  // Deploy Lending Protocol
  console.log("\n🏦 Deploying SomniaLending...");
  const SomniaLending = await ethers.getContractFactory("SomniaLending");
  const lending = await SomniaLending.deploy();
  await lending.waitForDeployment();
  const lendingAddress = await lending.getAddress();
  console.log("✅ SomniaLending deployed to:", lendingAddress);

  // Deploy Staking Protocol
  console.log("\n💰 Deploying SomniaStaking...");
  const SomniaStaking = await ethers.getContractFactory("SomniaStaking");
  const staking = await SomniaStaking.deploy();
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("✅ SomniaStaking deployed to:", stakingAddress);

  // Initialize contracts
  console.log("\n🔧 Initializing contracts...");

  // Whitelist governance token in all protocols
  console.log("📋 Whitelisting governance token...");
  await amm.whitelistToken(governanceAddress);
  await lending.whitelistToken(governanceAddress);
  await staking.whitelistStakingToken(governanceAddress);
  await staking.whitelistRewardToken(governanceAddress);

  // Create initial staking pool for governance token
  console.log("🏊 Creating initial staking pool...");
  await staking.createPool(
    governanceAddress, // staking token
    governanceAddress, // reward token
    1500, // 15% annual reward rate
    0, // min stake duration
    365 * 24 * 60 * 60 // max stake duration
  );

  // Add staking tiers
  console.log("🏆 Adding staking tiers...");
  await staking.addStakingTier(
    governanceAddress,
    "Bronze",
    BigInt("1000000000000000000000"), // 1000 tokens min
    BigInt("10000000000000000000000"), // 10000 tokens max
    10000, // 1x multiplier
    30 * 24 * 60 * 60, // 30 day lock
    500 // 5% penalty
  );

  await staking.addStakingTier(
    governanceAddress,
    "Silver",
    BigInt("10000000000000000000000"), // 10000 tokens min
    BigInt("100000000000000000000000"), // 100000 tokens max
    12000, // 1.2x multiplier
    90 * 24 * 60 * 60, // 90 day lock
    300 // 3% penalty
  );

  await staking.addStakingTier(
    governanceAddress,
    "Gold",
    BigInt("100000000000000000000000"), // 100000 tokens min
    BigInt("1000000000000000000000000"), // 1M tokens max
    15000, // 1.5x multiplier
    180 * 24 * 60 * 60, // 180 day lock
    200 // 2% penalty
  );

  // Create initial lending market for governance token
  console.log("🏦 Creating initial lending market...");
  await lending.createMarket(
    governanceAddress,
    8000 // 80% collateral factor
  );

  // Transfer some governance tokens to protocols for initial liquidity
  console.log("💸 Funding protocols with initial governance tokens...");
  const initialFunding = BigInt("1000000000000000000000000"); // 1M tokens

  await governanceToken.transfer(ammAddress, initialFunding);
  await governanceToken.transfer(lendingAddress, initialFunding);
  await governanceToken.transfer(stakingAddress, initialFunding);

  console.log("\n🎉 Deployment Complete!");
  console.log("=".repeat(50));
  console.log("📋 Contract Addresses:");
  console.log("🏛️  SomniaGovernance:", governanceAddress);
  console.log("🔄 SomniaAMM:", ammAddress);
  console.log("🏦 SomniaLending:", lendingAddress);
  console.log("💰 SomniaStaking:", stakingAddress);
  console.log("=".repeat(50));

  console.log("\n🔗 Next Steps:");
  console.log("1. Verify contracts on Somnia Explorer");
  console.log("2. Test basic functionality");
  console.log("3. Deploy frontend integration");
  console.log("4. Launch governance proposals");

  // Save deployment info
  const deploymentInfo = {
    network: "Somnia Testnet",
    deployer: deployer.address,
    contracts: {
      SomniaGovernance: governanceAddress,
      SomniaAMM: ammAddress,
      SomniaLending: lendingAddress,
      SomniaStaking: stakingAddress
    },
    deploymentTime: new Date().toISOString(),
    initialization: {
      governanceTokenWhitelisted: true,
      stakingPoolCreated: true,
      stakingTiersAdded: 3,
      lendingMarketCreated: true,
      initialFunding: "1000000 SOMG"
    }
  };

  console.log("\n💾 Deployment info saved to deployment-info.json");
  require('fs').writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 