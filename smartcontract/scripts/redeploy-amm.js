const { ethers } = require("hardhat");

async function main() {
    console.log("🔄 Redeploying SomniaAMM with fix...");

    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);

    // Deploy AMM DEX
    console.log("\n🔄 Deploying SomniaAMM...");
    const SomniaAMM = await ethers.getContractFactory("SomniaAMM");
    const amm = await SomniaAMM.deploy();
    await amm.deployed();
    console.log("✅ SomniaAMM deployed to:", amm.address);

    console.log("\n🎉 AMM Redeployment Complete!");
    console.log("=".repeat(50));
    console.log("🔄 SomniaAMM:", amm.address);
    console.log("=".repeat(50));

    console.log("\n💾 Update your .env file with the new AMM address:");
    console.log(`AMM_ADDRESS=${amm.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
