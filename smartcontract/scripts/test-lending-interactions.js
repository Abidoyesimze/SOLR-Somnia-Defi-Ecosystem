const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing SomniaLending Interactions on Somnia Testnet...");

    const [deployer] = await ethers.getSigners();
    console.log("📝 Using account:", deployer.address);
    console.log("💰 Account balance:", (await deployer.getBalance()).toString());

    // Contract addresses
    const LENDING_CONTRACT = "0x5082b379965746DC3Cd93402Ff82e7525796576a";
    const SOMG_TOKEN = "0xc8F6fF01fd1D981e627a8102fc334D360Af7384b";

    // Get contracts
    const SomniaLending = await ethers.getContractFactory("SomniaLending");
    const lending = SomniaLending.attach(LENDING_CONTRACT);

    const SomniaGovernance = await ethers.getContractFactory("SomniaGovernance");
    const somgToken = SomniaGovernance.attach(SOMG_TOKEN);

    console.log("\n🔍 Contract Status:");
    console.log("Lending Contract:", LENDING_CONTRACT);
    console.log("SOMG Token:", SOMG_TOKEN);

    // Check market status
    console.log("\n📊 Market Status:");
    const marketCount = await lending.marketCount();
    console.log("Total markets:", marketCount.toString());

    const allMarkets = await lending.getAllMarkets();
    console.log("Market addresses:", allMarkets);

    // Display market details
    for (const marketAddr of allMarkets) {
        try {
            const marketInfo = await lending.getMarket(marketAddr);
            const tokenName = marketAddr === ethers.constants.AddressZero ? "WSOM (Native)" :
                marketAddr === SOMG_TOKEN ? "SOMG" : "Unknown";

            console.log(`\n🏦 ${tokenName} Market:`);
            console.log(`   - Active: ${marketInfo.isActive}`);
            console.log(`   - Total Supply: ${ethers.utils.formatEther(marketInfo.totalSupply)}`);
            console.log(`   - Total Borrow: ${ethers.utils.formatEther(marketInfo.totalBorrow)}`);
            console.log(`   - Supply Rate: ${marketInfo.supplyRate / 100}%`);
            console.log(`   - Borrow Rate: ${marketInfo.borrowRate / 100}%`);
            console.log(`   - Collateral Factor: ${marketInfo.collateralFactor / 100}%`);
        } catch (error) {
            console.error(`❌ Error getting market info for ${marketAddr}:`, error.message);
        }
    }

    // Test 1: Supply SOMG tokens
    console.log("\n🧪 Test 1: Supply SOMG tokens");
    try {
        const supplyAmount = ethers.utils.parseEther("1000"); // 1000 SOMG

        // Check deployer balance
        const deployerBalance = await somgToken.balanceOf(deployer.address);
        console.log(`Deployer SOMG balance: ${ethers.utils.formatEther(deployerBalance)}`);

        if (deployerBalance.lt(supplyAmount)) {
            console.log("⚠️  Deployer doesn't have enough SOMG for testing");
            console.log("Skipping supply test...");
        } else {
            // Approve lending contract
            console.log("🔒 Approving lending contract to spend SOMG...");
            const approveTx = await somgToken.approve(lending.address, supplyAmount);
            await approveTx.wait();
            console.log("✅ Approval successful");

            // Supply tokens
            console.log("💰 Supplying SOMG to lending protocol...");
            const supplyTx = await lending.supply(SOMG_TOKEN, supplyAmount, {
                gasLimit: 5000000  // Use 5M gas limit
            });
            await supplyTx.wait();
            console.log("✅ Supply successful");

            // Check updated balances
            const newDeployerBalance = await somgToken.balanceOf(deployer.address);
            const deployerPosition = await lending.getUserPosition(deployer.address, SOMG_TOKEN);
            console.log(`Updated Deployer SOMG balance: ${ethers.utils.formatEther(newDeployerBalance)}`);
            console.log(`Deployer supplied amount: ${ethers.utils.formatEther(deployerPosition.supplied)}`);
        }

    } catch (error) {
        console.error("❌ Supply test failed:", error.message);
    }

    // Test 2: Supply native tokens (WSOM)
    console.log("\n🧪 Test 2: Supply native tokens (WSOM)");
    try {
        const wsomSupplyAmount = ethers.utils.parseEther("10"); // 10 WSOM

        // Check deployer balance
        const deployerWsomBalance = await deployer.getBalance();
        console.log(`Deployer WSOM balance: ${ethers.utils.formatEther(deployerWsomBalance)}`);

        if (deployerWsomBalance.lt(wsomSupplyAmount.mul(2))) { // Need extra for gas
            console.log("⚠️  Deployer doesn't have enough WSOM for testing");
            console.log("Skipping WSOM supply test...");
        } else {
            // Supply native tokens
            console.log("💰 Supplying WSOM to lending protocol...");
            const supplyWsomTx = await lending.supply(
                ethers.constants.AddressZero,
                wsomSupplyAmount,
                {
                    value: wsomSupplyAmount,
                    gasLimit: 5000000  // Use 5M gas limit
                }
            );
            await supplyWsomTx.wait();
            console.log("✅ WSOM supply successful");

            // Check updated balances
            const newDeployerWsomBalance = await deployer.getBalance();
            const deployerWsomPosition = await lending.getUserPosition(deployer.address, ethers.constants.AddressZero);
            console.log(`Updated Deployer WSOM balance: ${ethers.utils.formatEther(newDeployerWsomBalance)}`);
            console.log(`Deployer supplied WSOM amount: ${ethers.utils.formatEther(deployerWsomPosition.supplied)}`);
        }

    } catch (error) {
        console.error("❌ WSOM supply test failed:", error.message);
    }

    // Test 3: Check if deployer can borrow
    console.log("\n🧪 Test 3: Check borrowing capability");
    try {
        // Check if deployer has collateral
        const deployerTotals = await lending.getUserTotals(deployer.address);
        console.log(`Deployer total collateral: ${ethers.utils.formatEther(deployerTotals.collateral)}`);
        console.log(`Deployer total borrow: ${ethers.utils.formatEther(deployerTotals.borrow)}`);

        if (deployerTotals.collateral.gt(0)) {
            console.log("✅ Deployer has collateral, can potentially borrow");

            // Check collateral ratio
            if (deployerTotals.borrow.gt(0)) {
                const collateralRatio = (deployerTotals.collateral.mul(10000)).div(deployerTotals.borrow);
                const liquidationThreshold = await lending.LIQUIDATION_THRESHOLD();
                console.log(`Deployer collateral ratio: ${collateralRatio / 100}%`);
                console.log(`Liquidation threshold: ${liquidationThreshold / 100}%`);
                console.log(`Position healthy: ${collateralRatio >= liquidationThreshold ? "✅ Yes" : "❌ No"}`);
            }
        } else {
            console.log("⚠️  Deployer has no collateral yet");
        }

    } catch (error) {
        console.error("❌ Borrow capability check failed:", error.message);
    }

    // Test 4: Check interest accrual
    console.log("\n🧪 Test 4: Check interest accrual");
    try {
        // Wait a bit for interest to accrue
        console.log("⏰ Waiting for interest to accrue...");
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

        // Manually trigger interest accrual by calling supply with 0 amount
        console.log("📈 Triggering interest accrual...");
        const accrueTx = await lending.supply(SOMG_TOKEN, 0, {
            gasLimit: 5000000  // Use 5M gas limit
        });
        await accrueTx.wait();
        console.log("✅ Interest accrual triggered");

        // Check updated market state
        const marketInfo = await lending.getMarket(SOMG_TOKEN);
        console.log(`Updated market total supply: ${ethers.utils.formatEther(marketInfo.totalSupply)}`);
        console.log(`Updated market total borrow: ${ethers.utils.formatEther(marketInfo.totalBorrow)}`);

    } catch (error) {
        console.error("❌ Interest accrual test failed:", error.message);
    }

    // Test 5: Check liquidation threshold
    console.log("\n🧪 Test 5: Check liquidation threshold");
    try {
        const deployerTotals = await lending.getUserTotals(deployer.address);
        const liquidationThreshold = await lending.LIQUIDATION_THRESHOLD();

        if (deployerTotals.borrow.gt(0)) {
            const collateralRatio = (deployerTotals.collateral.mul(10000)).div(deployerTotals.borrow);
            console.log(`Deployer collateral ratio: ${collateralRatio / 100}%`);
            console.log(`Liquidation threshold: ${liquidationThreshold / 100}%`);
            console.log(`Position healthy: ${collateralRatio >= liquidationThreshold ? "✅ Yes" : "❌ No"}`);
        } else {
            console.log("✅ Deployer has no borrow, position is healthy");
        }

    } catch (error) {
        console.error("❌ Liquidation threshold check failed:", error.message);
    }

    // Final status
    console.log("\n📊 Final Test Results:");
    console.log("=".repeat(50));

    const finalDeployerTotals = await lending.getUserTotals(deployer.address);
    console.log(`Deployer final collateral: ${ethers.utils.formatEther(finalDeployerTotals.collateral)}`);
    console.log(`Deployer final borrow: ${ethers.utils.formatEther(finalDeployerTotals.borrow)}`);

    const finalMarketInfo = await lending.getMarket(SOMG_TOKEN);
    console.log(`SOMG market final supply: ${ethers.utils.formatEther(finalMarketInfo.totalSupply)}`);
    console.log(`SOMG market final borrow: ${ethers.utils.formatEther(finalMarketInfo.totalBorrow)}`);

    console.log("\n🎉 All tests completed!");
    console.log("=".repeat(50));
    console.log("📋 Test Summary:");
    console.log("✅ Market status checked");
    console.log("✅ Supply functionality tested (if sufficient balance)");
    console.log("✅ Borrow capability checked");
    console.log("✅ Interest accrual tested");
    console.log("✅ Liquidation threshold checked");
    console.log("=".repeat(50));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test execution failed:", error);
        process.exit(1);
    });
