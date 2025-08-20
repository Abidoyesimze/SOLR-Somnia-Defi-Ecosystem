const { ethers } = require("hardhat");

async function main() {
    console.log("🔧 Redeploying Fixed SomniaLending Contract...");

    const [deployer] = await ethers.getSigners();
    console.log("📝 Using account:", deployer.address);
    console.log("💰 Account balance:", (await deployer.getBalance()).toString());

    // Deploy the fixed lending contract
    console.log("\n🏗️  Deploying fixed SomniaLending...");
    const SomniaLending = await ethers.getContractFactory("SomniaLending");
    const lending = await SomniaLending.deploy();
    await lending.deployed();
    console.log("✅ Fixed SomniaLending deployed to:", lending.address);

    // Save deployment info
    const deploymentInfo = {
        network: "Somnia Testnet",
        deployer: deployer.address,
        contracts: {
            SomniaLendingFixed: lending.address
        },
        deploymentTime: new Date().toISOString(),
        fix: "Fixed division by zero error in exchange rate calculations"
    };

    console.log("\n💾 Deployment info saved to lending-fixed-deployment.json");
    require('fs').writeFileSync(
        'lending-fixed-deployment.json',
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n🎉 Fixed contract deployed successfully!");
    console.log("=".repeat(50));
    console.log("📋 Next Steps:");
    console.log("1. Update the contract address in your scripts");
    console.log("2. Run the market setup script again");
    console.log("3. Test the lending functionality");
    console.log("=".repeat(50));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
