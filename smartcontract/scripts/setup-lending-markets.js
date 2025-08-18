const { ethers } = require("hardhat");

async function main() {
    console.log("🏦 Setting up SomniaLending Markets on Somnia Testnet...");

    const [deployer] = await ethers.getSigners();
    console.log("📝 Using account:", deployer.address);
    console.log("💰 Account balance:", (await deployer.getBalance()).toString());


    // Contract addresses from deployment-info.json and new-tokens-deployment-info.json
    const LENDING_CONTRACT = "0x5082b379965746DC3Cd93402Ff82e7525796576a";
    const WSOM_TOKEN = "0x37FcBDc9Ff829279Ad49dFFdDeDAa7B224B1b0B2"; // WrappedSomnia
    const SOMG_TOKEN = "0xc8F6fF01fd1D981e627a8102fc334D360Af7384b"; // SomniaGovernance
    const USDC_TOKEN = "0xA20E9Db778125527a53069f502292B2b02e3D7CF"; // USDCToken
    const SOMLP_TOKEN = "0xE018246306b3e3AE88b618aD2c2E0Bc10A86AD65"; // SomniaLPToken

    // Get the lending contract
    const SomniaLending = await ethers.getContractFactory("SomniaLending");
    const lending = SomniaLending.attach(LENDING_CONTRACT);

    console.log("\n🔍 Current market count:", (await lending.marketCount()).toString());

    // Market configuration with correct addresses
    const markets = [
        {
            name: "WSOM",
            token: WSOM_TOKEN,
            collateralFactor: 8000, // 80%
            description: "Wrapped Somnia token"
        },
        {
            name: "SOMG",
            token: SOMG_TOKEN,
            collateralFactor: 7500, // 75%
            description: "Somnia Governance Token"
        },
        {
            name: "USDC",
            token: USDC_TOKEN,
            collateralFactor: 7500, // 75%
            description: "USD Coin stablecoin"
        },
        {
            name: "SOMLP",
            token: SOMLP_TOKEN,
            collateralFactor: 7500, // 75%
            description: "Somnia LP Token"
        }
    ];

    console.log("\n📋 Market Configuration:");
    markets.forEach((market, index) => {
        console.log(`${index + 1}. ${market.name}: ${market.collateralFactor / 100}% collateral factor`);
        console.log(`   Token Address: ${market.token}`);
    });

    // Check if markets already exist
    console.log("\n🔍 Checking existing markets...");
    const existingMarkets = await lending.getAllMarkets();
    console.log("Existing markets:", existingMarkets);

    // Create markets
    console.log("\n🏗️  Creating markets...");
    for (let i = 0; i < markets.length; i++) {
        const market = markets[i];

        // Skip if market already exists
        if (existingMarkets.includes(market.token)) {
            console.log(`⏭️  Market ${market.name} already exists, skipping...`);
            continue;
        }

        try {
            console.log(`\n📝 Creating market for ${market.name}...`);

            // Whitelist token first
            console.log(`🔒 Whitelisting ${market.name} token...`);
            const whitelistTx = await lending.whitelistToken(market.token);
            await whitelistTx.wait();
            console.log(`✅ ${market.name} token whitelisted`);

            // Wait a bit between transactions
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create market
            console.log(`🏦 Creating market with ${market.collateralFactor / 100}% collateral factor...`);
            try {
                const createMarketTx = await lending.createMarket(market.token, market.collateralFactor, {
                    gasLimit: 5000000  // Use 5M gas limit as discovered in testing
                });
                await createMarketTx.wait();
                console.log("✅ Market created successfully!");
            } catch (error) {
                console.log("❌ Failed to create market for", market.name, ":", error.message);
                continue;
            }

            // Wait a bit between transactions
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Get market info
            const marketInfo = await lending.getMarket(market.token);
            console.log(`   - Total Supply: ${ethers.utils.formatEther(marketInfo.totalSupply)}`);
            console.log(`   - Supply Rate: ${marketInfo.supplyRate / 100}%`);
            console.log(`   - Borrow Rate: ${marketInfo.borrowRate / 100}%`);
            console.log(`   - Collateral Factor: ${marketInfo.collateralFactor / 100}%`);

        } catch (error) {
            console.error(`❌ Failed to create market for ${market.name}:`, error.message);

            // If it's a token whitelist issue, try to continue
            if (error.message.includes("TOKEN_NOT_WHITELISTED")) {
                console.log(`⚠️  Token ${market.name} needs to be whitelisted first`);
            }
        }
    }

    // Final market status
    console.log("\n📊 Final Market Status:");
    const finalMarketCount = await lending.marketCount();
    console.log("Total markets:", finalMarketCount.toString());

    const allMarkets = await lending.getAllMarkets();
    console.log("Market addresses:", allMarkets);

    // Display market details
    for (const marketAddr of allMarkets) {
        try {
            const marketInfo = await lending.getMarket(marketAddr);
            const tokenName = marketAddr === WSOM_TOKEN ? "WSOM" :
                marketAddr === SOMG_TOKEN ? "SOMG" :
                    marketAddr === USDC_TOKEN ? "USDC" :
                        marketAddr === SOMLP_TOKEN ? "SOMLP" : "Unknown";

            console.log(`\n🏦 ${tokenName} Market:`);
            console.log(`   - Token: ${marketInfo.token}`);
            console.log(`   - Active: ${marketInfo.isActive}`);
            console.log(`   - Total Supply: ${ethers.utils.formatEther(marketInfo.totalSupply)}`);
            console.log(`   - Total Borrow: ${ethers.utils.formatEther(marketInfo.totalBorrow)}`);
            console.log(`   - Supply Rate: ${marketInfo.supplyRate / 100}%`);
            console.log(`   - Borrow Rate: ${marketInfo.borrowRate / 100}%`);
            console.log(`   - Collateral Factor: ${marketInfo.collateralFactor / 100}%`);
            console.log(`   - Exchange Rate: ${ethers.utils.formatEther(marketInfo.exchangeRate)}`);
        } catch (error) {
            console.error(`❌ Error getting market info for ${marketAddr}:`, error.message);
        }
    }

    console.log("\n🎉 Market setup complete!");
    console.log("=".repeat(50));
    console.log("📋 Next Steps:");
    console.log("1. Test supply/borrow functionality");
    console.log("2. Test liquidation mechanisms");
    console.log("3. Monitor interest accrual");
    console.log("4. Deploy frontend integration");
    console.log("=".repeat(50));

    // Save market setup info
    const marketSetupInfo = {
        network: "Somnia Testnet",
        deployer: deployer.address,
        lendingContract: LENDING_CONTRACT,
        markets: markets.map(market => ({
            name: market.name,
            token: market.token,
            collateralFactor: market.collateralFactor,
            collateralFactorPercent: market.collateralFactor / 100
        })),
        setupTime: new Date().toISOString(),
        totalMarkets: finalMarketCount.toString()
    };

    console.log("\n💾 Market setup info saved to lending-markets-setup.json");
    require('fs').writeFileSync(
        'lending-markets-setup.json',
        JSON.stringify(marketSetupInfo, null, 2)
    );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Market setup failed:", error);
        process.exit(1);
    });
