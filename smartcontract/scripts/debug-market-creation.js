const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Debugging Market Creation Step by Step...");

    const [deployer] = await ethers.getSigners();
    console.log("📝 Using account:", deployer.address);
    console.log("💰 Account balance:", (await deployer.getBalance()).toString());

    // Contract addresses
    const LENDING_CONTRACT = "0x05eF202BA6347DdC9736F49724103D0CA39a9f04";
    const WSOM_TOKEN = "0x37FcBDc9Ff829279Ad49dFFdDeDAa7B224B1b0B2";

    // Get contract instances
    const lendingContract = await ethers.getContractAt("SomniaLending", LENDING_CONTRACT);

    console.log("\n🔍 Step 1: Check contract state...");
    try {
        const marketCount = await lendingContract.marketCount();
        console.log("✅ Market count:", marketCount.toString());

        const owner = await lendingContract.owner();
        console.log("✅ Contract owner:", owner);
        console.log("✅ Deployer is owner:", owner === deployer.address);

        const isWhitelisted = await lendingContract.whitelistedTokens(WSOM_TOKEN);
        console.log("✅ WSOM is whitelisted:", isWhitelisted);

    } catch (error) {
        console.log("❌ Error checking contract state:", error.message);
        return;
    }

    console.log("\n🔍 Step 2: Test whitelisting...");
    try {
        const tx = await lendingContract.whitelistToken(WSOM_TOKEN);
        console.log("📝 Whitelisting WSOM...");
        await tx.wait();
        console.log("✅ WSOM whitelisted successfully");

        const isWhitelisted = await lendingContract.whitelistedTokens(WSOM_TOKEN);
        console.log("✅ WSOM is now whitelisted:", isWhitelisted);

    } catch (error) {
        console.log("❌ Error whitelisting:", error.message);
        return;
    }

    console.log("\n🔍 Step 3: Test market creation...");
    try {
        console.log("📝 Creating market for WSOM with 80% collateral factor...");

        // Try to create market with explicit gas limit
        const tx = await lendingContract.createMarket(WSOM_TOKEN, 8000, {
            gasLimit: 500000
        });

        console.log("📝 Transaction sent, waiting for confirmation...");
        const receipt = await tx.wait();
        console.log("✅ Market created successfully!");
        console.log("📝 Transaction hash:", receipt.transactionHash);
        console.log("📝 Gas used:", receipt.gasUsed.toString());

        // Verify market was created
        const market = await lendingContract.markets(WSOM_TOKEN);
        console.log("✅ Market details:");
        console.log("   - Token:", market.token);
        console.log("   - Is Active:", market.isActive);
        console.log("   - Collateral Factor:", market.collateralFactor.toString());
        console.log("   - Exchange Rate:", market.exchangeRate.toString());
        console.log("   - Last Update Time:", market.lastUpdateTime.toString());

    } catch (error) {
        console.log("❌ Error creating market:", error.message);

        // Try to get more details about the error
        if (error.data) {
            console.log("📝 Error data:", error.data);
        }

        // Check if it's a revert with reason
        if (error.reason) {
            console.log("📝 Revert reason:", error.reason);
        }

        return;
    }

    console.log("\n🔍 Step 4: Check final state...");
    try {
        const marketCount = await lendingContract.marketCount();
        console.log("✅ Final market count:", marketCount.toString());

        const allMarkets = await lendingContract.getAllMarkets();
        console.log("✅ All markets:", allMarkets);

    } catch (error) {
        console.log("❌ Error checking final state:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
