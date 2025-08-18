const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking SomniaLending Protocol Status...");

    const [deployer] = await ethers.getSigners();
    console.log("📝 Using account:", deployer.address);

    // Contract addresses
    const LENDING_CONTRACT = "0x5082b379965746DC3Cd93402Ff82e7525796576a";
    const WSOM_TOKEN = "0x37FcBDc9Ff829279Ad49dFFdDeDAa7B224B1b0B2";
    const SOMG_TOKEN = "0xc8F6fF01fd1D981e627a8102fc334D360Af7384b";
    const USDC_TOKEN = "0xA20E9Db778125527a53069f502292B2b02e3D7CF";
    const SOMLP_TOKEN = "0xE018246306b3e3AE88b618aD2c2E0Bc10A86AD65";

    // Get the lending contract
    const SomniaLending = await ethers.getContractFactory("SomniaLending");
    const lending = SomniaLending.attach(LENDING_CONTRACT);

    console.log("\n📊 Protocol Overview:");
    console.log("=".repeat(50));

    const marketCount = await lending.marketCount();
    const totalCollateral = await lending.totalCollateral();
    const totalBorrowed = await lending.totalBorrowed();

    console.log(`Total Markets: ${marketCount.toString()}`);
    console.log(`Total Protocol Collateral: ${ethers.utils.formatEther(totalCollateral)}`);
    console.log(`Total Protocol Borrowed: ${ethers.utils.formatEther(totalBorrowed)}`);

    if (totalBorrowed.gt(0)) {
        const utilizationRate = (totalBorrowed.mul(10000).div(totalCollateral));
        console.log(`Utilization Rate: ${utilizationRate / 100}%`);
    }

    // Check all markets
    console.log("\n🏦 Market Details:");
    console.log("=".repeat(50));

    const allMarkets = await lending.getAllMarkets();

    for (const marketAddr of allMarkets) {
        try {
            const marketInfo = await lending.getMarket(marketAddr);
            const tokenName = marketAddr === WSOM_TOKEN ? "WSOM" :
                marketAddr === SOMG_TOKEN ? "SOMG" :
                    marketAddr === USDC_TOKEN ? "USDC" :
                        marketAddr === SOMLP_TOKEN ? "SOMLP" : "Unknown";

            console.log(`\n🏦 ${tokenName} Market:`);
            console.log(`   - Token Address: ${marketInfo.token}`);
            console.log(`   - Active: ${marketInfo.isActive ? "✅ Yes" : "❌ No"}`);
            console.log(`   - Total Supply: ${ethers.utils.formatEther(marketInfo.totalSupply)}`);
            console.log(`   - Total Borrow: ${ethers.utils.formatEther(marketInfo.totalBorrow)}`);
            console.log(`   - Supply Rate: ${marketInfo.supplyRate / 100}%`);
            console.log(`   - Borrow Rate: ${marketInfo.borrowRate / 100}%`);
            console.log(`   - Collateral Factor: ${marketInfo.collateralFactor / 100}%`);
            console.log(`   - Exchange Rate: ${ethers.utils.formatEther(marketInfo.exchangeRate)}`);
            console.log(`   - Last Update: ${new Date(marketInfo.lastUpdateTime * 1000).toLocaleString()}`);

            if (marketInfo.totalSupply.gt(0) && marketInfo.totalBorrow.gt(0)) {
                const marketUtilization = (marketInfo.totalBorrow.mul(10000).div(marketInfo.totalSupply));
                console.log(`   - Market Utilization: ${marketUtilization / 100}%`);
            }

        } catch (error) {
            console.error(`❌ Error getting market info for ${marketAddr}:`, error.message);
        }
    }

    // Check whitelisted tokens
    console.log("\n🔒 Whitelisted Tokens:");
    console.log("=".repeat(50));

    const tokens = [WSOM_TOKEN, SOMG_TOKEN, USDC_TOKEN, SOMLP_TOKEN];
    const tokenNames = ["WSOM", "SOMG", "USDC", "SOMLP"];

    for (let i = 0; i < tokens.length; i++) {
        const isWhitelisted = await lending.whitelistedTokens(tokens[i]);
        console.log(`${tokenNames[i]}: ${isWhitelisted ? "✅ Whitelisted" : "❌ Not Whitelisted"}`);
    }

    // Check protocol constants
    console.log("\n⚙️  Protocol Constants:");
    console.log("=".repeat(50));

    const liquidationThreshold = await lending.LIQUIDATION_THRESHOLD();
    const liquidationBonus = await lending.LIQUIDATION_BONUS();
    const maxLiquidationClose = await lending.MAX_LIQUIDATION_CLOSE();
    const interestRateModel = await lending.INTEREST_RATE_MODEL();
    const secondsPerYear = await lending.SECONDS_PER_YEAR();

    console.log(`Liquidation Threshold: ${liquidationThreshold / 100}%`);
    console.log(`Liquidation Bonus: ${liquidationBonus / 100}%`);
    console.log(`Max Liquidation Close: ${maxLiquidationClose / 100}%`);
    console.log(`Interest Rate Model: ${interestRateModel / 100}%`);
    console.log(`Seconds Per Year: ${secondsPerYear.toString()}`);

    console.log("\n🎉 Status check complete!");
    console.log("=".repeat(50));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Status check failed:", error);
        process.exit(1);
    });
