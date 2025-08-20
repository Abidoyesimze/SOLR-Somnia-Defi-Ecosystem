const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Setting up existing deployed contracts...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Using account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  // Use the latest deployed addresses from the previous run
  const LENDING_CONTRACT_ADDRESS = "0x086233C8613829AD73d00c63848d927dd6f2F345"; // SomniaLendingFixed
  const WSOM_TOKEN_ADDRESS = "0x7E3EeD3f3B09Df10A06adA95Bc9887D5385935DB"; // TestWrappedSomnia
  const USDC_TOKEN_ADDRESS = "0xe2dB8A87E83b1A3fE7db7128d186079A9F958bEA"; // USDCToken
  const SOMG_TOKEN_ADDRESS = "0x58f5C4d7C08C6D9B45624ffE1C9fA3119e98991a"; // SomniaGovernanceToken
  const FAUCET_CONTRACT_ADDRESS = "0x72631F951C3ea4795D938859F4476104087106B7"; // TestTokenFaucet

  console.log("\n📋 Using existing contract addresses:");
  console.log("  SomniaLendingFixed:", LENDING_CONTRACT_ADDRESS);
  console.log("  TestWrappedSomnia:", WSOM_TOKEN_ADDRESS);
  console.log("  USDCToken:", USDC_TOKEN_ADDRESS);
  console.log("  SomniaGovernanceToken:", SOMG_TOKEN_ADDRESS);
  console.log("  TestTokenFaucet:", FAUCET_CONTRACT_ADDRESS);

  try {
    // Get contract instances
    const lendingContract = await ethers.getContractAt("SomniaLendingFixed", LENDING_CONTRACT_ADDRESS);
    const wsomToken = await ethers.getContractAt("TestWrappedSomnia", WSOM_TOKEN_ADDRESS);
    const usdcToken = await ethers.getContractAt("USDCToken", USDC_TOKEN_ADDRESS);
    const somgToken = await ethers.getContractAt("SomniaGovernanceToken", SOMG_TOKEN_ADDRESS);
    const faucetContract = await ethers.getContractAt("TestTokenFaucet", FAUCET_CONTRACT_ADDRESS);

    console.log("\n🔧 Starting setup...");

    // 1. Check current status first
    console.log("\n🔍 Checking current status...");
    
    const wsomWhitelisted = await lendingContract.whitelistedTokens(WSOM_TOKEN_ADDRESS);
    const usdcWhitelisted = await lendingContract.whitelistedTokens(USDC_TOKEN_ADDRESS);
    const somgWhitelisted = await lendingContract.whitelistedTokens(SOMG_TOKEN_ADDRESS);
    
    console.log("  WSOM whitelisted:", wsomWhitelisted ? "✅" : "❌");
    console.log("  USDC whitelisted:", usdcWhitelisted ? "✅" : "❌");
    console.log("  SOMG whitelisted:", somgWhitelisted ? "✅" : "❌");

    // Check markets
    try {
      const wsomMarket = await lendingContract.getMarket(WSOM_TOKEN_ADDRESS);
      const usdcMarket = await lendingContract.getMarket(USDC_TOKEN_ADDRESS);
      const somgMarket = await lendingContract.getMarket(SOMG_TOKEN_ADDRESS);
      
      console.log("  WSOM Market - Active:", wsomMarket.isActive, "Supply:", ethers.formatEther(wsomMarket.totalSupply));
      console.log("  USDC Market - Active:", usdcMarket.isActive, "Supply:", ethers.formatUnits(usdcMarket.totalSupply, 6));
      console.log("  SOMG Market - Active:", somgMarket.isActive, "Supply:", ethers.formatEther(somgMarket.totalSupply));
    } catch (error) {
      console.log("  Markets not created yet");
    }

    // 2. Complete the setup that was interrupted
    console.log("\n💧 Completing setup...");

    // Check if we need to mint tokens for the deployer
    const deployerWsomBalance = await wsomToken.balanceOf(deployer.address);
    const deployerUsdcBalance = await usdcToken.balanceOf(deployer.address);
    const deployerSomgBalance = await somgToken.balanceOf(deployer.address);

    console.log("  Current balances:");
    console.log("    WSOM:", ethers.formatEther(deployerWsomBalance));
    console.log("    USDC:", ethers.formatUnits(deployerUsdcBalance, 6));
    console.log("    SOMG:", ethers.formatEther(deployerSomgBalance));

    // Mint more tokens if needed (reduce amounts to avoid hitting max supply)
    const wsomMintAmount = ethers.parseEther("50000"); // 50K WSOM
    const usdcMintAmount = ethers.parseUnits("50000", 6); // 50K USDC  
    const somgMintAmount = ethers.parseEther("5000"); // 5K SOMG (limited supply)

    if (deployerWsomBalance < wsomMintAmount) {
      try {
        await wsomToken.mint(deployer.address, wsomMintAmount, "Setup Completion");
        console.log("✅ Minted 50K WSOM");
      } catch (error) {
        console.log("⚠️  WSOM minting failed:", error.message);
      }
    }

    if (deployerUsdcBalance < usdcMintAmount) {
      try {
        await usdcToken.mint(deployer.address, usdcMintAmount, "Setup Completion");
        console.log("✅ Minted 50K USDC");
      } catch (error) {
        console.log("⚠️  USDC minting failed:", error.message);
      }
    }

    if (deployerSomgBalance < somgMintAmount) {
      try {
        await somgToken.mint(deployer.address, somgMintAmount, "Setup Completion");
        console.log("✅ Minted 5K SOMG");
      } catch (error) {
        console.log("⚠️  SOMG minting failed:", error.message);
      }
    }

    // 3. Add initial liquidity using the new fixed contract
    console.log("\n🏪 Adding initial liquidity...");
    
    const initialLiquidity = ethers.parseEther("10000"); // 10K tokens
    const usdcInitialLiquidity = ethers.parseUnits("10000", 6); // 10K USDC
    const somgInitialLiquidity = ethers.parseEther("1000"); // 1K SOMG

    // Approve tokens first
    try {
      await wsomToken.approve(LENDING_CONTRACT_ADDRESS, initialLiquidity);
      await usdcToken.approve(LENDING_CONTRACT_ADDRESS, usdcInitialLiquidity);
      await somgToken.approve(LENDING_CONTRACT_ADDRESS, somgInitialLiquidity);
      console.log("✅ Approved tokens for lending contract");
    } catch (error) {
      console.log("⚠️  Approval failed:", error.message);
    }

    // Add initial liquidity
    try {
      await lendingContract.addInitialLiquidity(WSOM_TOKEN_ADDRESS, initialLiquidity);
      console.log("✅ Added 10K WSOM initial liquidity");
    } catch (error) {
      console.log("⚠️  WSOM liquidity failed:", error.message);
    }

    try {
      await lendingContract.addInitialLiquidity(USDC_TOKEN_ADDRESS, usdcInitialLiquidity);
      console.log("✅ Added 10K USDC initial liquidity");
    } catch (error) {
      console.log("⚠️  USDC liquidity failed:", error.message);
    }

    try {
      await lendingContract.addInitialLiquidity(SOMG_TOKEN_ADDRESS, somgInitialLiquidity);
      console.log("✅ Added 1K SOMG initial liquidity");
    } catch (error) {
      console.log("⚠️  SOMG liquidity failed:", error.message);
    }

    // 4. Setup faucet
    console.log("\n🚰 Setting up faucet...");
    
    const faucetAmount = ethers.parseEther("10000"); // 10K tokens
    const usdcFaucetAmount = ethers.parseUnits("10000", 6); // 10K USDC
    const somgFaucetAmount = ethers.parseEther("1000"); // 1K SOMG

    try {
      await wsomToken.transfer(FAUCET_CONTRACT_ADDRESS, faucetAmount);
      await usdcToken.transfer(FAUCET_CONTRACT_ADDRESS, usdcFaucetAmount);
      await somgToken.transfer(FAUCET_CONTRACT_ADDRESS, somgFaucetAmount);
      console.log("✅ Funded faucet with tokens");
    } catch (error) {
      console.log("⚠️  Faucet funding failed:", error.message);
    }

    // 5. Final verification
    console.log("\n🔍 Final verification...");
    
    try {
      const finalWsomMarket = await lendingContract.getMarket(WSOM_TOKEN_ADDRESS);
      const finalUsdcMarket = await lendingContract.getMarket(USDC_TOKEN_ADDRESS);
      const finalSomgMarket = await lendingContract.getMarket(SOMG_TOKEN_ADDRESS);
      
      console.log("✅ Final market status:");
      console.log("  WSOM - Active:", finalWsomMarket.isActive, "Supply:", ethers.formatEther(finalWsomMarket.totalSupply));
      console.log("  USDC - Active:", finalUsdcMarket.isActive, "Supply:", ethers.formatUnits(finalUsdcMarket.totalSupply, 6));
      console.log("  SOMG - Active:", finalSomgMarket.isActive, "Supply:", ethers.formatEther(finalSomgMarket.totalSupply));
    } catch (error) {
      console.log("⚠️  Market verification failed:", error.message);
    }

    // 6. Output final summary
    console.log("\n🎉 Setup completed!");
    console.log("\n📋 Contract Addresses (Ready to use):");
    console.log("  SomniaLendingFixed:", LENDING_CONTRACT_ADDRESS);
    console.log("  TestWrappedSomnia:", WSOM_TOKEN_ADDRESS);
    console.log("  USDCToken:", USDC_TOKEN_ADDRESS);
    console.log("  SomniaGovernanceToken:", SOMG_TOKEN_ADDRESS);
    console.log("  TestTokenFaucet:", FAUCET_CONTRACT_ADDRESS);

    console.log("\n💡 Next steps:");
    console.log("  1. Update frontend ABI addresses with these contract addresses");
    console.log("  2. Test the faucet functionality");
    console.log("  3. Test supply/borrow functionality");

    // Save addresses for frontend update
    const contractAddresses = {
      SomniaLendingFixed: LENDING_CONTRACT_ADDRESS,
      TestWrappedSomnia: WSOM_TOKEN_ADDRESS,
      USDCToken: USDC_TOKEN_ADDRESS,
      SomniaGovernanceToken: SOMG_TOKEN_ADDRESS,
      TestTokenFaucet: FAUCET_CONTRACT_ADDRESS
    };

    console.log("\n💾 Contract addresses to update in frontend/src/abi/index.tsx:");
    console.log(JSON.stringify(contractAddresses, null, 2));

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