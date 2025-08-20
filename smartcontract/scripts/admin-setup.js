const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Starting admin setup for existing contracts...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Using account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  // Contract addresses (update these with your deployed addresses)
  const LENDING_CONTRACT_ADDRESS = "0x412D57f6cb2dAbF7C9d694AcB78b1c52d6140f56";
  const WSOM_TOKEN_ADDRESS = "0x956Ed4d2D7caD091b1C12dEC28AaEe5332D8e1e3";
  const USDC_TOKEN_ADDRESS = "0x4b1e4aE3ba5b0e1bEaf2627299BD4c87Af99fB5e";
  const SOMG_TOKEN_ADDRESS = "0x1f8E2fA22951F4a9a387af9675880716dbEdB345";
  const FAUCET_CONTRACT_ADDRESS = "0x96562913b9A78983cB459e7A1B36c7166F7F1734";

  console.log("\n📋 Using contract addresses:");
  console.log("  Lending Contract:", LENDING_CONTRACT_ADDRESS);
  console.log("  WSOM Token:", WSOM_TOKEN_ADDRESS);
  console.log("  USDC Token:", USDC_TOKEN_ADDRESS);
  console.log("  SOMG Token:", SOMG_TOKEN_ADDRESS);
  console.log("  Faucet:", FAUCET_CONTRACT_ADDRESS);

  // Get contract instances
  const lendingContract = await ethers.getContractAt("SomniaLending", LENDING_CONTRACT_ADDRESS);
  const wsomToken = await ethers.getContractAt("TestWrappedSomnia", WSOM_TOKEN_ADDRESS);
  const usdcToken = await ethers.getContractAt("USDCToken", USDC_TOKEN_ADDRESS);
  const somgToken = await ethers.getContractAt("SomniaGovernanceToken", SOMG_TOKEN_ADDRESS);
  const faucetContract = await ethers.getContractAt("TestTokenFaucet", FAUCET_CONTRACT_ADDRESS);

  console.log("\n🔧 Starting admin setup...");

  try {
    // 1. Check if tokens are already whitelisted
    console.log("\n📋 Checking whitelist status...");
    const wsomWhitelisted = await lendingContract.whitelistedTokens(WSOM_TOKEN_ADDRESS);
    const usdcWhitelisted = await lendingContract.whitelistedTokens(USDC_TOKEN_ADDRESS);
    const somgWhitelisted = await lendingContract.whitelistedTokens(SOMG_TOKEN_ADDRESS);

    console.log("  WSOM:", wsomWhitelisted ? "✅ Already whitelisted" : "❌ Not whitelisted");
    console.log("  USDC:", usdcWhitelisted ? "✅ Already whitelisted" : "❌ Not whitelisted");
    console.log("  SOMG:", somgWhitelisted ? "✅ Already whitelisted" : "❌ Not whitelisted");

    // 2. Whitelist tokens if needed
    if (!wsomWhitelisted) {
      console.log("📋 Whitelisting WSOM...");
      await lendingContract.whitelistToken(WSOM_TOKEN_ADDRESS);
      console.log("✅ WSOM whitelisted");
    }

    if (!usdcWhitelisted) {
      console.log("📋 Whitelisting USDC...");
      await lendingContract.whitelistToken(USDC_TOKEN_ADDRESS);
      console.log("✅ USDC whitelisted");
    }

    if (!somgWhitelisted) {
      console.log("📋 Whitelisting SOMG...");
      await lendingContract.whitelistToken(SOMG_TOKEN_ADDRESS);
      console.log("✅ SOMG whitelisted");
    }

    // 3. Check if markets exist
    console.log("\n🏪 Checking market status...");
    let marketsExist = false;
    try {
      const marketList = await lendingContract.getAllMarkets();
      marketsExist = marketList.length > 0;
      console.log("  Found", marketList.length, "existing markets");
    } catch (error) {
      console.log("  No markets found, will create new ones");
    }

    // 4. Create markets if they don't exist
    if (!marketsExist) {
      console.log("\n🏪 Creating lending markets...");
      
      try {
        await lendingContract.createMarket(WSOM_TOKEN_ADDRESS, 8000); // 80% collateral factor
        console.log("✅ WSOM market created");
      } catch (error) {
        console.log("⚠️  WSOM market creation failed (might already exist):", error.message);
      }
      
      try {
        await lendingContract.createMarket(USDC_TOKEN_ADDRESS, 8000); // 80% collateral factor
        console.log("✅ USDC market created");
      } catch (error) {
        console.log("⚠️  USDC market creation failed (might already exist):", error.message);
      }
      
      try {
        await lendingContract.createMarket(SOMG_TOKEN_ADDRESS, 8000); // 80% collateral factor
        console.log("✅ SOMG market created");
      } catch (error) {
        console.log("⚠️  SOMG market creation failed (might already exist):", error.message);
      }
    }

    // 5. Check market liquidity and add if needed
    console.log("\n💧 Checking market liquidity...");
    
    const wsomMarket = await lendingContract.getMarket(WSOM_TOKEN_ADDRESS);
    const usdcMarket = await lendingContract.getMarket(USDC_TOKEN_ADDRESS);
    const somgMarket = await lendingContract.getMarket(SOMG_TOKEN_ADDRESS);
    
    console.log("  WSOM Market - Total Supply:", ethers.formatEther(wsomMarket.totalSupply));
    console.log("  USDC Market - Total Supply:", ethers.formatEther(usdcMarket.totalSupply));
    console.log("  SOMG Market - Total Supply:", ethers.formatEther(somgMarket.totalSupply));

    // 6. Add initial liquidity if markets are empty
    const initialLiquidity = ethers.parseEther("100000"); // 100K tokens
    
    if (wsomMarket.totalSupply == 0) {
      console.log("\n💧 Adding initial liquidity to WSOM market...");
      try {
        // Mint tokens if needed
        const deployerBalance = await wsomToken.balanceOf(deployer.address);
        if (deployerBalance < initialLiquidity) {
          await wsomToken.mint(deployer.address, initialLiquidity);
          console.log("✅ Minted 100K WSOM to deployer");
        }
        
        // Approve and add liquidity
        await wsomToken.approve(LENDING_CONTRACT_ADDRESS, initialLiquidity);
        await lendingContract.addInitialLiquidity(WSOM_TOKEN_ADDRESS, initialLiquidity);
        console.log("✅ Added 100K WSOM initial liquidity");
      } catch (error) {
        console.log("❌ Failed to add WSOM liquidity:", error.message);
      }
    }

    if (usdcMarket.totalSupply == 0) {
      console.log("\n💧 Adding initial liquidity to USDC market...");
      try {
        // Mint tokens if needed
        const deployerBalance = await usdcToken.balanceOf(deployer.address);
        if (deployerBalance < initialLiquidity) {
          await usdcToken.mint(deployer.address, initialLiquidity);
          console.log("✅ Minted 100K USDC to deployer");
        }
        
        // Approve and add liquidity
        await usdcToken.approve(LENDING_CONTRACT_ADDRESS, initialLiquidity);
        await lendingContract.addInitialLiquidity(USDC_TOKEN_ADDRESS, initialLiquidity);
        console.log("✅ Added 100K USDC initial liquidity");
      } catch (error) {
        console.log("❌ Failed to add USDC liquidity:", error.message);
      }
    }

    if (somgMarket.totalSupply == 0) {
      console.log("\n💧 Adding initial liquidity to SOMG market...");
      try {
        // Mint tokens if needed
        const deployerBalance = await somgToken.balanceOf(deployer.address);
        if (deployerBalance < initialLiquidity) {
          await somgToken.mint(deployer.address, initialLiquidity);
          console.log("✅ Minted 100K SOMG to deployer");
        }
        
        // Approve and add liquidity
        await somgToken.approve(LENDING_CONTRACT_ADDRESS, initialLiquidity);
        await lendingContract.addInitialLiquidity(SOMG_TOKEN_ADDRESS, initialLiquidity);
        console.log("✅ Added 100K SOMG initial liquidity");
      } catch (error) {
        console.log("❌ Failed to add SOMG liquidity:", error.message);
      }
    }

    // 7. Setup faucet if needed
    console.log("\n🚰 Checking faucet setup...");
    
    const wsomFaucetBalance = await wsomToken.balanceOf(FAUCET_CONTRACT_ADDRESS);
    const usdcFaucetBalance = await usdcToken.balanceOf(FAUCET_CONTRACT_ADDRESS);
    const somgFaucetBalance = await somgToken.balanceOf(FAUCET_CONTRACT_ADDRESS);
    
    console.log("  Faucet balances:");
    console.log("    WSOM:", ethers.formatEther(wsomFaucetBalance));
    console.log("    USDC:", ethers.formatEther(usdcFaucetBalance));
    console.log("    SOMG:", ethers.formatEther(somgFaucetBalance));

    // Fund faucet if needed
    const faucetFunding = ethers.parseEther("100000"); // 100K tokens
    if (wsomFaucetBalance < faucetFunding) {
      console.log("🚰 Funding WSOM faucet...");
      await wsomToken.transfer(FAUCET_CONTRACT_ADDRESS, faucetFunding - wsomFaucetBalance);
      console.log("✅ WSOM faucet funded");
    }

    if (usdcFaucetBalance < faucetFunding) {
      console.log("🚰 Funding USDC faucet...");
      await usdcToken.transfer(FAUCET_CONTRACT_ADDRESS, faucetFunding - usdcFaucetBalance);
      console.log("✅ USDC faucet funded");
    }

    if (somgFaucetBalance < faucetFunding) {
      console.log("🚰 Funding SOMG faucet...");
      await somgToken.transfer(FAUCET_CONTRACT_ADDRESS, faucetFunding - somgFaucetBalance);
      console.log("✅ SOMG faucet funded");
    }

    // 8. Final verification
    console.log("\n🔍 Final verification...");
    
    const finalWsomMarket = await lendingContract.getMarket(WSOM_TOKEN_ADDRESS);
    const finalUsdcMarket = await lendingContract.getMarket(USDC_TOKEN_ADDRESS);
    const finalSomgMarket = await lendingContract.getMarket(SOMG_TOKEN_ADDRESS);
    
    console.log("✅ Final market status:");
    console.log("  WSOM - Active:", finalWsomMarket.isActive, "Total Supply:", ethers.formatEther(finalWsomMarket.totalSupply));
    console.log("  USDC - Active:", finalUsdcMarket.isActive, "Total Supply:", ethers.formatEther(finalUsdcMarket.totalSupply));
    console.log("  SOMG - Active:", finalSomgMarket.isActive, "Total Supply:", ethers.formatEther(finalSomgMarket.totalSupply));

    console.log("\n🎉 Admin setup completed successfully!");
    console.log("\n💡 The lending protocol is now ready for users to:");
    console.log("  1. Supply tokens to earn interest");
    console.log("  2. Borrow tokens against collateral");
    console.log("  3. Use the faucet to get test tokens");

  } catch (error) {
    console.error("❌ Admin setup failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }); 