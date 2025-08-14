const { ethers } = require("hardhat");
const { formatEther } = require("ethers");
const fs = require("fs");
require("dotenv").config();

async function main() {
    console.log("🚀 Deploying Somnia DeFi Ecosystem to Somnia Testnet...");

    // Validate environment variables
    if (!process.env.PRIVATE_KEY || !process.env.SOMNIA_TESTNET_RPC) {
        console.error("❌ Please set PRIVATE_KEY and SOMNIA_TESTNET_RPC in your .env file");
        process.exit(1);
    }

    const [deployer] = await ethers.getSigners();
    console.log("🆔 Deploying with account:", deployer.address);

    // Check account balance safely
    const balanceWei = await deployer.getBalance();
    const balanceEth = balanceWei ? formatEther(balanceWei.toString()) : "0";
    console.log("💰 Account balance:", balanceEth, "ETH");

    if (BigInt(balanceWei) <= 0n) {
        console.error("❌ Insufficient funds for deployment. Fund your account with Somnia testnet tokens.");
        process.exit(1);
    }

    // Deploy SomniaGovernance
    console.log("\n📄 Deploying SomniaGovernance...");
    const SomniaGovernance = await ethers.getContractFactory("SomniaGovernance");
    const governance = await SomniaGovernance.deploy();
    await governance.waitForDeployment();
    console.log("✅ SomniaGovernance deployed at:", governance.target);

    // Deploy SomniaAMM
    console.log("\n📄 Deploying SomniaAMM...");
    const SomniaAMM = await ethers.getContractFactory("SomniaAMM");
    const amm = await SomniaAMM.deploy();
    await amm.waitForDeployment();
    console.log("✅ SomniaAMM deployed at:", amm.target);

    // Deploy SomniaLending
    console.log("\n📄 Deploying SomniaLending...");
    const SomniaLending = await ethers.getContractFactory("SomniaLending");
    const lending = await SomniaLending.deploy();
    await lending.waitForDeployment();
    console.log("✅ SomniaLending deployed at:", lending.target);

    // Deploy SomniaStaking
    console.log("\n📄 Deploying SomniaStaking...");
    const SomniaStaking = await ethers.getContractFactory("SomniaStaking");
    const staking = await SomniaStaking.deploy();
    await staking.waitForDeployment();
    console.log("✅ SomniaStaking deployed at:", staking.target);

    // Save deployment info
    const deploymentInfo = {
        contracts: {
            SomniaGovernance: governance.target,
            SomniaAMM: amm.target,
            SomniaLending: lending.target,
            SomniaStaking: staking.target,
        },
    };

    fs.writeFileSync("deployment-info.json", JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to deployment-info.json");

    console.log("\n🎉 All contracts deployed successfully!");
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("❌ Deployment failed:", err);
        process.exit(1);
    });
