const { ethers } = require("hardhat");

async function main() {
    console.log("🔧 Deploying Completely Fixed SomniaLending Contract...");

    const [deployer] = await ethers.getSigners();
    console.log("📝 Using account:", deployer.address);
    console.log("💰 Account balance:", (await deployer.getBalance()).toString());

    // Deploy the completely fixed lending contract
    console.log("\n🏗️  Deploying completely fixed SomniaLending...");
    const SomniaLending = await ethers.getContractFactory("SomniaLending");
    const lending = await SomniaLending.deploy();
    await lending.deployed();
    console.log("✅ Completely Fixed SomniaLending deployed to:", lending.address);

    // Save deployment info
    const deploymentInfo = {
        network: "Somnia Testnet",
        deployer: deployer.address,
        contracts: {
            SomniaLendingCompletelyFixed: lending.address
        },
        deploymentTime: new Date().toISOString(),
        fixes: [
            "Fixed division by zero error in exchange rate calculations",
            "Fixed _accrueInterest function to handle newly created markets",
            "Added safety checks for market initialization"
        ]
    };

    console.log("\n💾 Deployment info saved to lending-completely-fixed-deployment.json");
    require('fs').writeFileSync(
        'lending-completely-fixed-deployment.json',
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n🎉 Completely fixed contract deployed successfully!");
    console.log("=".repeat(50));
    console.log("📋 What Was Fixed:");
    console.log("✅ Division by zero in exchange rate calculations");
    console.log("✅ _accrueInterest function safety");
    console.log("✅ Market creation initialization");
    console.log("=".repeat(50));
    console.log("📋 Next Steps:");
    console.log("1. Update ALL your scripts with the new address:", lending.address);
    console.log("2. Run the market setup script");
    console.log("3. Test the lending functionality");
    console.log("=".repeat(50));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
