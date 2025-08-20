const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Adding missing function to existing contract...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Using account:", deployer.address);

  // Contract addresses
  const LENDING_CONTRACT_ADDRESS = "0x412D57f6cb2dAbF7C9d694AcB78b1c52d6140f56";
  const WSOM_TOKEN_ADDRESS = "0x956Ed4d2D7caD091b1C12dEC28AaEe5332D8e1e3";
  const USDC_TOKEN_ADDRESS = "0x4b1e4aE3ba5b0e1bEaf2627299BD4c87Af99fB5e";
  const SOMG_TOKEN_ADDRESS = "0x1f8E2fA22951F4a9a387af9675880716dbEdB345";

  console.log("📋 Contract addresses:");
  console.log("  Lending Contract:", LENDING_CONTRACT_ADDRESS);
  console.log("  WSOM Token:", WSOM_TOKEN_ADDRESS);
  console.log("  USDC Token:", USDC_TOKEN_ADDRESS);
  console.log("  SOMG Token:", SOMG_TOKEN_ADDRESS);

  try {
    // Get contract instances
    const lendingContract = await ethers.getContractAt("SomniaLending", LENDING_CONTRACT_ADDRESS);
    const wsomToken = await ethers.getContractAt("TestWrappedSomnia", WSOM_TOKEN_ADDRESS);
    const usdcToken = await ethers.getContractAt("USDCToken", USDC_TOKEN_ADDRESS);
    const somgToken = await ethers.getContractAt("SomniaGovernanceToken", SOMG_TOKEN_ADDRESS);

    console.log("\n🔧 Starting setup...");

    // 1. Whitelist tokens
    console.log("\n📋 Whitelisting tokens...");
    
    try {
      await lendingContract.whitelistToken(WSOM_TOKEN_ADDRESS);
      console.log("✅ WSOM whitelisted");
    } catch (error) {
      console.log("⚠️  WSOM already whitelisted or failed:", error.message);
    }
    
    try {
      await lendingContract.whitelistToken(USDC_TOKEN_ADDRESS);
      console.log("✅ USDC whitelisted");
    } catch (error) {
      console.log("⚠️  USDC already whitelisted or failed:", error.message);
    }
    
    try {
      await lendingContract.whitelistToken(SOMG_TOKEN_ADDRESS);
      console.log("✅ SOMG whitelisted");
    } catch (error) {
      console.log("⚠️  SOMG already whitelisted or failed:", error.message);
    }

    // 2. Create markets
    console.log("\n🏪 Creating markets...");
    
    try {
      await lendingContract.createMarket(WSOM_TOKEN_ADDRESS, 8000);
      console.log("✅ WSOM market created");
    } catch (error) {
      console.log("⚠️  WSOM market creation failed (might already exist):", error.message);
    }
    
    try {
      await lendingContract.createMarket(USDC_TOKEN_ADDRESS, 8000);
      console.log("✅ USDC market created");
    } catch (error) {
      console.log("⚠️  USDC market creation failed (might already exist):", error.message);
    }
    
    try {
      await lendingContract.createMarket(SOMG_TOKEN_ADDRESS, 8000);
      console.log("✅ SOMG market created");
    } catch (error) {
      console.log("⚠️  SOMG market creation failed (might already exist):", error.message);
    }

    // 3. Check market status
    console.log("\n🔍 Checking market status...");
    
    try {
      const wsomMarket = await lendingContract.getMarket(WSOM_TOKEN_ADDRESS);
      const usdcMarket = await lendingContract.getMarket(USDC_TOKEN_ADDRESS);
      const somgMarket = await lendingContract.getMarket(SOMG_TOKEN_ADDRESS);
      
      console.log("  WSOM Market - Active:", wsomMarket.isActive, "Total Supply:", ethers.formatEther(wsomMarket.totalSupply));
      console.log("  USDC Market - Active:", usdcMarket.isActive, "Total Supply:", ethers.formatEther(usdcMarket.totalSupply));
      console.log("  SOMG Market - Active:", somgMarket.isActive, "Total Supply:", ethers.formatEther(somgMarket.totalSupply));
      
      // 4. Try to add initial liquidity manually
      console.log("\n💧 Adding initial liquidity manually...");
      
      const initialLiquidity = ethers.parseEther("100000"); // 100K tokens
      
      // Mint tokens if needed
      try {
        await wsomToken.mint(deployer.address, initialLiquidity);
        console.log("✅ Minted 100K WSOM to deployer");
      } catch (error) {
        console.log("⚠️  WSOM minting failed:", error.message);
      }
      
      try {
        await usdcToken.mint(deployer.address, initialLiquidity);
        console.log("✅ Minted 100K USDC to deployer");
      } catch (error) {
        console.log("⚠️  USDC minting failed:", error.message);
      }
      
      try {
        await somgToken.mint(deployer.address, initialLiquidity);
        console.log("✅ Minted 100K SOMG to deployer");
      } catch (error) {
        console.log("⚠️  SOMG minting failed:", error.message);
      }
      
      // Approve tokens
      try {
        await wsomToken.approve(LENDING_CONTRACT_ADDRESS, initialLiquidity);
        await usdcToken.approve(LENDING_CONTRACT_ADDRESS, initialLiquidity);
        await somgToken.approve(LENDING_CONTRACT_ADDRESS, initialLiquidity);
        console.log("✅ Approved tokens for lending contract");
      } catch (error) {
        console.log("❌ Token approval failed:", error.message);
      }
      
      // Try to supply directly to bootstrap markets
      console.log("\n🚀 Attempting to bootstrap markets with direct supply...");
      
      try {
        await lendingContract.supply(WSOM_TOKEN_ADDRESS, initialLiquidity);
        console.log("✅ Successfully supplied 100K WSOM to bootstrap market");
      } catch (error) {
        console.log("❌ WSOM supply failed:", error.message);
        console.log("💡 This confirms the division by zero issue exists");
      }
      
      try {
        await lendingContract.supply(USDC_TOKEN_ADDRESS, initialLiquidity);
        console.log("✅ Successfully supplied 100K USDC to bootstrap market");
      } catch (error) {
        console.log("❌ USDC supply failed:", error.message);
      }
      
      try {
        await lendingContract.supply(SOMG_TOKEN_ADDRESS, initialLiquidity);
        console.log("✅ Successfully supplied 100K SOMG to bootstrap market");
      } catch (error) {
        console.log("❌ SOMG supply failed:", error.message);
      }
      
    } catch (error) {
      console.log("❌ Failed to check markets:", error.message);
    }

    console.log("\n🔍 Setup attempt completed!");
    console.log("\n💡 If you see 'division by zero' errors, you need to:");
    console.log("  1. Deploy the new SomniaLendingFixed contract, OR");
    console.log("  2. Fix the existing contract by adding the addInitialLiquidity function");

  } catch (error) {
    console.error("❌ Setup failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }); 