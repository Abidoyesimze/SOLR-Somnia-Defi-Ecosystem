const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 DEEP Debugging Market Creation...");
    console.log("==================================================");

    const [deployer] = await ethers.getSigners();
    console.log("📝 Using account:", deployer.address);
    console.log("💰 Account balance:", (await deployer.getBalance()).toString());

    // Contract addresses
    const LENDING_CONTRACT = "0x5082b379965746DC3Cd93402Ff82e7525796576a";
    const WSOM_TOKEN = "0x37FcBDc9Ff829279Ad49dFFdDeDAa7B224B1b0B2";

    console.log("\n🔍 Contract Addresses:");
    console.log("Lending Contract:", LENDING_CONTRACT);
    console.log("WSOM Token:", WSOM_TOKEN);

    // Get contract instances
    const lendingContract = await ethers.getContractAt("SomniaLending", LENDING_CONTRACT);

    console.log("\n🔍 Step 1: Basic Contract Checks...");
    try {
        const marketCount = await lendingContract.marketCount();
        console.log("✅ Market count:", marketCount.toString());

        const owner = await lendingContract.owner();
        console.log("✅ Contract owner:", owner);
        console.log("✅ Deployer is owner:", owner === deployer.address);

        const isWhitelisted = await lendingContract.whitelistedTokens(WSOM_TOKEN);
        console.log("✅ WSOM is whitelisted:", isWhitelisted);

    } catch (error) {
        console.log("❌ Error in basic checks:", error.message);
        return;
    }

    console.log("\n🔍 Step 2: Check Market State Before Creation...");
    try {
        const market = await lendingContract.markets(WSOM_TOKEN);
        console.log("📝 Market struct before creation:");
        console.log("   - Token:", market.token);
        console.log("   - Is Active:", market.isActive);
        console.log("   - Total Supply:", market.totalSupply.toString());
        console.log("   - Total Borrow:", market.totalBorrow.toString());
        console.log("   - Exchange Rate:", market.exchangeRate.toString());
        console.log("   - Last Update Time:", market.lastUpdateTime.toString());
        console.log("   - Collateral Factor:", market.collateralFactor.toString());

        // Check if market exists by our new logic
        const marketExists = market.token !== ethers.constants.AddressZero;
        console.log("   - Market exists (token != address(0)):", marketExists);

    } catch (error) {
        console.log("❌ Error checking market state:", error.message);
        return;
    }

    console.log("\n🔍 Step 3: Test Market Creation with Call...");
    try {
        console.log("📝 Testing market creation with call()...");

        // Use call() to simulate the transaction without sending it
        const createMarketData = lendingContract.interface.encodeFunctionData("createMarket", [WSOM_TOKEN, 8000]);

        console.log("📝 Encoded function data:", createMarketData);

        // Try to call the function to see if it would succeed
        const result = await deployer.call({
            to: LENDING_CONTRACT,
            data: createMarketData,
            gasLimit: 500000
        });

        console.log("✅ Call succeeded! Result:", result);

    } catch (error) {
        console.log("❌ Call failed:", error.message);

        // Try to get more details
        if (error.data) {
            console.log("📝 Error data:", error.data);

            // Try to decode the error
            try {
                const decodedError = lendingContract.interface.parseError(error.data);
                console.log("📝 Decoded error:", decodedError);
            } catch (decodeError) {
                console.log("📝 Could not decode error data");
            }
        }

        if (error.reason) {
            console.log("📝 Revert reason:", error.reason);
        }

        if (error.error) {
            console.log("📝 Inner error:", error.error.message);
        }

        return;
    }

    console.log("\n🔍 Step 4: Try Actual Transaction...");
    try {
        console.log("📝 Attempting actual market creation...");

        const tx = await lendingContract.createMarket(WSOM_TOKEN, 8000, {
            gasLimit: 500000
        });

        console.log("📝 Transaction sent, hash:", tx.hash);
        console.log("📝 Waiting for confirmation...");

        const receipt = await tx.wait();
        console.log("✅ Transaction confirmed!");
        console.log("📝 Gas used:", receipt.gasUsed.toString());
        console.log("📝 Status:", receipt.status);

    } catch (error) {
        console.log("❌ Transaction failed:", error.message);

        // Get detailed error information
        if (error.transaction) {
            console.log("📝 Transaction details:");
            console.log("   - Hash:", error.transaction.hash);
            console.log("   - To:", error.transaction.to);
            console.log("   - Data:", error.transaction.data);
        }

        if (error.receipt) {
            console.log("📝 Receipt details:");
            console.log("   - Status:", error.receipt.status);
            console.log("   - Gas used:", error.receipt.gasUsed.toString());
            console.log("   - Logs:", error.receipt.logs.length);
        }

        if (error.data) {
            console.log("📝 Error data:", error.data);
        }

        return;
    }

    console.log("\n🔍 Step 5: Check Final State...");
    try {
        const marketCount = await lendingContract.marketCount();
        console.log("✅ Final market count:", marketCount.toString());

        const allMarkets = await lendingContract.getAllMarkets();
        console.log("✅ All markets:", allMarkets);

        if (marketCount > 0) {
            const market = await lendingContract.markets(WSOM_TOKEN);
            console.log("✅ WSOM market details:");
            console.log("   - Token:", market.token);
            console.log("   - Is Active:", market.isActive);
            console.log("   - Collateral Factor:", market.collateralFactor.toString());
        }

    } catch (error) {
        console.log("❌ Error checking final state:", error.message);
    }

    console.log("\n🔍 Debug complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
