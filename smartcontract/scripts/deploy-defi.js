const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Somnia DeFi Ecosystem...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString());

  // Deploy Governance Token First
  console.log("\n🏛️  Deploying SomniaGovernance...");
  const SomniaGovernance = await ethers.getContractFactory("SomniaGovernance");
  const governanceToken = await SomniaGovernance.deploy();
  await governanceToken.deployed();
  console.log("✅ SomniaGovernance deployed to:", governanceToken.address);

  // Deploy AMM DEX
  console.log("\n🔄 Deploying SomniaAMM...");
  const SomniaAMM = await ethers.getContractFactory("SomniaAMM");
  const amm = await SomniaAMM.deploy();
  await amm.deployed();
  console.log("✅ SomniaAMM deployed to:", amm.address);

  // Deploy Lending Protocol
  console.log("\n🏦 Deploying SomniaLending...");
  const SomniaLending = await ethers.getContractFactory("SomniaLending");
  const lending = await SomniaLending.deploy();
  await lending.deployed();
  console.log("✅ SomniaLending deployed to:", lending.address);

  // Deploy Staking Protocol
  console.log("\n💰 Deploying SomniaStaking...");
  const SomniaStaking = await ethers.getContractFactory("SomniaStaking");
  const staking = await SomniaStaking.deploy();
  await staking.deployed();
  console.log("✅ SomniaStaking deployed to:", staking.address);

  // Initialize contracts
  console.log("\n🔧 Initializing contracts...");

  // Whitelist governance token in all protocols
  console.log("📋 Whitelisting governance token...");
  await amm.whitelistToken(governanceToken.address);
  await lending.whitelistToken(governanceToken.address);
  await staking.whitelistStakingToken(governanceToken.address);
  await staking.whitelistRewardToken(governanceToken.address);

  // Create initial staking pool for governance token
  console.log("🏊 Creating initial staking pool...");
  await staking.createPool(
    governanceToken.address, // staking token
    governanceToken.address, // reward token
    1500, // 15% annual reward rate
    0, // min stake duration
    365 * 24 * 60 * 60 // max stake duration
  );

  // Add staking tiers
  console.log("🏆 Adding staking tiers...");
  await staking.addStakingTier(
    governanceToken.address,
    "Bronze",
    ethers.utils.parseEther("1000"), // 1000 tokens min
    ethers.utils.parseEther("10000"), // 10000 tokens max
    10000, // 1x multiplier
    30 * 24 * 60 * 60, // 30 day lock
    500 // 5% penalty
  );

  await staking.addStakingTier(
    governanceToken.address,
    "Silver",
    ethers.utils.parseEther("10000"), // 10000 tokens min
    ethers.utils.parseEther("100000"), // 100000 tokens max
    12000, // 1.2x multiplier
    90 * 24 * 60 * 60, // 90 day lock
    300 // 3% penalty
  );

  await staking.addStakingTier(
    governanceToken.address,
    "Gold",
    ethers.utils.parseEther("100000"), // 100000 tokens min
    ethers.utils.parseEther("1000000"), // 1M tokens max
    15000, // 1.5x multiplier
    180 * 24 * 60 * 60, // 180 day lock
    200 // 2% penalty
  );

  // Create initial lending market for governance token
  console.log("🏦 Creating initial lending market...");
  await lending.createMarket(
    governanceToken.address,
    8000 // 80% collateral factor
  );

  // Transfer some governance tokens to protocols for initial liquidity
  console.log("💸 Funding protocols with initial governance tokens...");
  const initialFunding = ethers.utils.parseEther("1000000"); // 1M tokens
  
  await governanceToken.transfer(amm.address, initialFunding);
  await governanceToken.transfer(lending.address, initialFunding);
  await governanceToken.transfer(staking.address, initialFunding);

  console.log("\n🎉 Deployment Complete!");
  console.log("=" .repeat(50));
  console.log("📋 Contract Addresses:");
  console.log("🏛️  SomniaGovernance:", governanceToken.address);
  console.log("🔄 SomniaAMM:", amm.address);
  console.log("🏦 SomniaLending:", lending.address);
  console.log("💰 SomniaStaking:", staking.address);
  console.log("=" .repeat(50));
  
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
      SomniaGovernance: governanceToken.address,
      SomniaAMM: amm.address,
      SomniaLending: lending.address,
      SomniaStaking: staking.address
    },
    deploymentTime: new Date().toISOString(),
    initialization: {
      governanceTokenWhitelisted: true,
      stakingPoolCreated: true,
      stakingTiersAdded: 3,
      lendingMarketCreated: true,
      initialFunding: ethers.utils.formatEther(initialFunding) + " SOMG"
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