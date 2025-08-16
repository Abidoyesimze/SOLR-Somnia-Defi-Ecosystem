const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying new token contracts...");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString());

  try {
    // Deploy WrappedSomnia
    console.log("\n🌐 Deploying WrappedSomnia...");
    const WrappedSomnia = await ethers.getContractFactory("WrappedSomnia");
    const wrappedSomnia = await WrappedSomnia.deploy();
    await wrappedSomnia.deployed();
    console.log("✅ WrappedSomnia deployed to:", wrappedSomnia.address);

    // Deploy USDCToken
    console.log("\n💵 Deploying USDCToken...");
    const USDCToken = await ethers.getContractFactory("USDCToken");
    const usdcToken = await USDCToken.deploy(deployer.address);
    await usdcToken.deployed();
    console.log("✅ USDCToken deployed to:", usdcToken.address);

    // Deploy SomniaLPToken
    console.log("\n🏊 Deploying SomniaLPToken...");
    const SomniaLPToken = await ethers.getContractFactory("SomniaLPToken");
    const somniaLPToken = await SomniaLPToken.deploy(deployer.address);
    await somniaLPToken.deployed();
    console.log("✅ SomniaLPToken deployed to:", somniaLPToken.address);

    // Deploy TestTokenFaucet
    console.log("\n🚰 Deploying TestTokenFaucet...");
    const TestTokenFaucet = await ethers.getContractFactory("TestTokenFaucet");
    const testTokenFaucet = await TestTokenFaucet.deploy(
      wrappedSomnia.address, // Use WrappedSomnia as SOM token for testing
      usdcToken.address,
      somniaLPToken.address, // Use SomniaLPToken as SOMG for testing
      deployer.address
    );
    await testTokenFaucet.deployed();
    console.log("✅ TestTokenFaucet deployed to:", testTokenFaucet.address);

    // Initialize contracts
    console.log("\n🔧 Initializing contracts...");

    // Add TestTokenFaucet as authorized minter for SomniaLPToken
    console.log("📋 Adding TestTokenFaucet as authorized minter for SomniaLPToken...");
    await somniaLPToken.addAuthorizedMinter(testTokenFaucet.address);
    console.log("✅ TestTokenFaucet authorized to mint SomniaLPToken");

    // Add TestTokenFaucet as authorized minter for USDCToken
    console.log("📋 Adding TestTokenFaucet as authorized minter for USDCToken...");
    await usdcToken.addAuthorizedMinter(testTokenFaucet.address);
    console.log("✅ TestTokenFaucet authorized to mint USDCToken");

    // Note: WrappedSomnia doesn't have ownership, so we skip it
    console.log("📋 Transferring token ownership to TestTokenFaucet...");
    await somniaLPToken.transferOwnership(testTokenFaucet.address);
    console.log("✅ SomniaLPToken ownership transferred to TestTokenFaucet");

    // Basic verification (no expensive operations)
    console.log("\n🔍 Basic contract verification...");
    
    // Check contract names and symbols
    const wsomName = await wrappedSomnia.name();
    const wsomSymbol = await wrappedSomnia.symbol();
    console.log("✅ WrappedSomnia:", wsomName, "(", wsomSymbol, ")");
    
    const usdcName = await usdcToken.name();
    const usdcSymbol = await usdcToken.symbol();
    console.log("✅ USDCToken:", usdcName, "(", usdcSymbol, ")");
    
    const lpName = await somniaLPToken.name();
    const lpSymbol = await somniaLPToken.symbol();
    console.log("✅ SomniaLPToken:", lpName, "(", lpSymbol, ")");
    
    console.log("✅ All contracts deployed and initialized successfully!");

    console.log("\n🎉 Deployment Complete!");
    console.log("=".repeat(50));
    console.log("📋 Contract Addresses:");
    console.log("🌐 WrappedSomnia:", wrappedSomnia.address);
    console.log("💵 USDCToken:", usdcToken.address);
    console.log("🏊 SomniaLPToken:", somniaLPToken.address);
    console.log("🚰 TestTokenFaucet:", testTokenFaucet.address);
    console.log("=".repeat(50));

    // Save deployment info
    const deploymentInfo = {
      network: "Somnia Testnet",
      deployer: deployer.address,
      contracts: {
        WrappedSomnia: wrappedSomnia.address,
        USDCToken: usdcToken.address,
        SomniaLPToken: somniaLPToken.address,
        TestTokenFaucet: testTokenFaucet.address
      },
      deploymentTime: new Date().toISOString(),
      initialization: {
        faucetAuthorized: true,
        tokenOwnershipTransferred: true,
        basicFunctionalityTested: true
      }
    };

    console.log("\n💾 Deployment info saved to new-tokens-deployment-info.json");
    require('fs').writeFileSync(
      'new-tokens-deployment-info.json',
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n🔗 Next Steps:");
    console.log("1. Verify contracts on Somnia Explorer");
    console.log("2. Run tests to ensure functionality");
    console.log("3. Integrate with existing DeFi ecosystem");
    console.log("4. Test faucet functionality with multiple users");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
