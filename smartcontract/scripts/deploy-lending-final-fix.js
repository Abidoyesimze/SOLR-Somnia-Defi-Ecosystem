const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔧 Deploying FINAL Fixed SomniaLending Contract...");
    console.log("==================================================");

    const [deployer] = await ethers.getSigners();
    console.log("📝 Using account:", deployer.address);
    console.log("💰 Account balance:", (await deployer.getBalance()).toString());

    console.log("\n🏗️  Deploying final fixed SomniaLending...");

    try {
        const SomniaLending = await ethers.getContractFactory("SomniaLending");
        const lending = await SomniaLending.deploy();

        console.log("📝 Waiting for deployment confirmation...");
        await lending.deployed();

        console.log("✅ FINAL Fixed SomniaLending deployed to:", lending.address);

        // Save deployment info
        const deploymentInfo = {
            contract: "SomniaLending",
            address: lending.address,
            deployer: deployer.address,
            network: "somniaTestnet",
            timestamp: new Date().toISOString(),
            fixes: [
                "Division by zero in exchange rate calculations",
                "_accrueInterest function safety",
                "Market creation initialization",
                "Struct access safety (checking token != address(0))"
            ]
        };

        const deploymentPath = path.join(__dirname, "lending-final-fix-deployment.json");
        fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

        console.log("\n💾 Deployment info saved to lending-final-fix-deployment.json");

        console.log("\n🎉 FINAL fixed contract deployed successfully!");
        console.log("==================================================");
        console.log("📋 What Was Fixed:");
        console.log("✅ Division by zero in exchange rate calculations");
        console.log("✅ _accrueInterest function safety");
        console.log("✅ Market creation initialization");
        console.log("✅ Struct access safety (checking token != address(0))");
        console.log("==================================================");
        console.log("📋 Next Steps:");
        console.log("1. Update ALL your scripts with the new address:", lending.address);
        console.log("2. Run the market setup script");
        console.log("3. Test the lending functionality");
        console.log("==================================================");

    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
