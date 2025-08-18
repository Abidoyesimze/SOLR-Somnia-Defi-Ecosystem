const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Testing Market Creation with High Gas Limit...");
    console.log("==================================================");

    const [deployer] = await ethers.getSigners();
    console.log("📝 Using account:", deployer.address);
    console.log("💰 Account balance:", (await deployer.getBalance()).toString());

    // Contract addresses
    const LENDING_CONTRACT = "0x5082b379965746DC3Cd93402Ff82e7525796576a";
    const WSOM_TOKEN = "0x37FcBDc9Ff829279Ad49dFFdDeDAa7B224B1b0B2";

    // Get contract instances
    const lendingContract = await ethers.getContractAt("SomniaLending", LENDING_CONTRACT);

    console.log("\n🔍 Testing with different gas limits...");

    const gasLimits = [1000000, 2000000, 5000000];

    for (const gasLimit of gasLimits) {
        console.log(`\n📝 Testing with gas limit: ${gasLimit.toLocaleString()}`);

        try {
            const tx = await lendingContract.createMarket(WSOM_TOKEN, 8000, {
                gasLimit: gasLimit
            });

            console.log("📝 Transaction sent, hash:", tx.hash);
            console.log("📝 Waiting for confirmation...");

            const receipt = await tx.wait();
            console.log("✅ Transaction confirmed!");
            console.log("📝 Gas used:", receipt.gasUsed.toString());
            console.log("📝 Status:", receipt.status);

            // If we get here, it worked!
            console.log("🎉 Market created successfully!");

            // Check the market
            const market = await lendingContract.markets(WSOM_TOKEN);
            console.log("✅ Market details:");
            console.log("   - Token:", market.token);
            console.log("   - Is Active:", market.isActive);
            console.log("   - Collateral Factor:", market.collateralFactor.toString());

            return; // Exit on success

        } catch (error) {
            console.log(`❌ Failed with gas limit ${gasLimit.toLocaleString()}:`, error.message);

            if (error.receipt) {
                console.log("📝 Gas used:", error.receipt.gasUsed.toString());
                console.log("📝 Status:", error.receipt.status);
            }

            // If it's an out of gas error, try higher limit
            if (error.message.includes("out of gas") || error.message.includes("gas limit")) {
                console.log("📝 This looks like a gas issue, trying higher limit...");
                continue;
            }

            // If it's a different error, show details
            if (error.data) {
                console.log("📝 Error data:", error.data);
            }
        }
    }

    console.log("\n❌ All gas limit attempts failed!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
