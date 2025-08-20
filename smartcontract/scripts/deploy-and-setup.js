const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment and setup...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  // Deploy the fixed lending contract
  console.log("\n📦 Deploying SomniaLendingFixed...");
  const SomniaLendingFixed = await ethers.getContractFactory("SomniaLendingFixed");
  const lendingContract = await SomniaLendingFixed.deploy();
  await lendingContract.waitForDeployment();
  
  const lendingAddress = await lendingContract.getAddress();
  console.log("✅ SomniaLendingFixed deployed to:", lendingAddress);

  // Deploy test tokens if they don't exist
  console.log("\n🪙 Deploying test tokens...");
  
  // Deploy TestWrappedSomnia (WSOM)
  const TestWrappedSomnia = await ethers.getContractFactory("TestWrappedSomnia");
  const wsomToken = await TestWrappedSomnia.deploy();
  await wsomToken.waitForDeployment();
  const wsomAddress = await wsomToken.getAddress();
  console.log("✅ TestWrappedSomnia deployed to:", wsomAddress);

  // Deploy USDCToken
  const USDCToken = await ethers.getContractFactory("USDCToken");
  const usdcToken = await USDCToken.deploy(deployer.address);
  await usdcToken.waitForDeployment();
  const usdcAddress = await usdcToken.getAddress();
  console.log("✅ USDCToken deployed to:", usdcAddress);

  // Deploy SomniaGovernanceToken
  const SomniaGovernanceToken = await ethers.getContractFactory("SomniaGovernanceToken");
  const somgToken = await SomniaGovernanceToken.deploy(deployer.address);
  await somgToken.waitForDeployment();
  const somgAddress = await somgToken.getAddress();
  console.log("✅ SomniaGovernanceToken deployed to:", somgAddress);

  // Deploy TestTokenFaucet
  const TestTokenFaucet = await ethers.getContractFactory("TestTokenFaucet");
  const faucetContract = await TestTokenFaucet.deploy(wsomAddress, usdcAddress, somgAddress);
  await faucetContract.waitForDeployment();
  const faucetAddress = await faucetContract.getAddress();
  console.log("✅ TestTokenFaucet deployed to:", faucetAddress);

  // Setup admin functions
  console.log("\n🔧 Setting up admin functions...");

  // 1. Whitelist tokens
  console.log("📋 Whitelisting tokens...");
  await lendingContract.whitelistToken(wsomAddress);
  console.log("✅ WSOM whitelisted");
  
  await lendingContract.whitelistToken(usdcAddress);
  console.log("✅ USDC whitelisted");
  
  await lendingContract.whitelistToken(somgAddress);
  console.log("✅ SOMG whitelisted");

  // 2. Create markets
  console.log("\n🏪 Creating lending markets...");
  
  // Create WSOM market
  await lendingContract.createMarket(wsomAddress, 8000); // 80% collateral factor
  console.log("✅ WSOM market created");
  
  // Create USDC market
  await lendingContract.createMarket(usdcAddress, 8000); // 80% collateral factor
  console.log("✅ USDC market created");
  
  // Create SOMG market
  await lendingContract.createMarket(somgAddress, 8000); // 80% collateral factor
  console.log("✅ SOMG market created");

  // 3. Add initial liquidity to bootstrap markets
  console.log("\n💧 Adding initial liquidity...");
  
  // Mint tokens to deployer for initial liquidity
  const mintAmount = ethers.parseEther("1000000"); // 1M tokens for WSOM and SOMG (18 decimals)
  const usdcMintAmount = ethers.parseUnits("1000000", 6); // 1M USDC (6 decimals)
  
  await wsomToken.mint(deployer.address, mintAmount, "Initial Liquidity");
  console.log("✅ Minted 1M WSOM to deployer");
  
  await usdcToken.mint(deployer.address, usdcMintAmount, "Initial Liquidity");
  console.log("✅ Minted 1M USDC to deployer");
  
  await somgToken.mint(deployer.address, mintAmount, "Initial Liquidity");
  console.log("✅ Minted 1M SOMG to deployer");

  // Approve tokens for lending contract
  await wsomToken.approve(lendingAddress, mintAmount);
  await usdcToken.approve(lendingAddress, usdcMintAmount);
  await somgToken.approve(lendingAddress, mintAmount);
  console.log("✅ Approved tokens for lending contract");

  // Add initial liquidity to each market
  const initialLiquidity = ethers.parseEther("100000"); // 100K tokens for WSOM and SOMG (18 decimals)
  const usdcInitialLiquidity = ethers.parseUnits("100000", 6); // 100K USDC (6 decimals)
  
  await lendingContract.addInitialLiquidity(wsomAddress, initialLiquidity);
  console.log("✅ Added 100K WSOM initial liquidity");
  
  await lendingContract.addInitialLiquidity(usdcAddress, usdcInitialLiquidity);
  console.log("✅ Added 100K USDC initial liquidity");
  
  await lendingContract.addInitialLiquidity(somgAddress, initialLiquidity);
  console.log("✅ Added 100K SOMG initial liquidity");

  // 4. Setup faucet
  console.log("\n🚰 Setting up token faucet...");
  
  // Transfer tokens to faucet
  const faucetAmount = ethers.parseEther("100000"); // 100K tokens for WSOM and SOMG
  const usdcFaucetAmount = ethers.parseUnits("100000", 6); // 100K USDC
  
  await wsomToken.transfer(faucetAddress, faucetAmount);
  await usdcToken.transfer(faucetAddress, usdcFaucetAmount);
  await somgToken.transfer(faucetAddress, faucetAmount);
  console.log("✅ Transferred 100K tokens to faucet for each token");

  // 5. Verify setup
  console.log("\n🔍 Verifying setup...");
  
  // Check whitelist status
  const wsomWhitelisted = await lendingContract.whitelistedTokens(wsomAddress);
  const usdcWhitelisted = await lendingContract.whitelistedTokens(usdcAddress);
  const somgWhitelisted = await lendingContract.whitelistedTokens(somgAddress);
  
  console.log("📋 Whitelist status:");
  console.log("  WSOM:", wsomWhitelisted ? "✅ Whitelisted" : "❌ Not whitelisted");
  console.log("  USDC:", usdcWhitelisted ? "✅ Whitelisted" : "❌ Not whitelisted");
  console.log("  SOMG:", somgWhitelisted ? "✅ Whitelisted" : "❌ Not whitelisted");

  // Check market status
  const wsomMarket = await lendingContract.getMarket(wsomAddress);
  const usdcMarket = await lendingContract.getMarket(usdcAddress);
  const somgMarket = await lendingContract.getMarket(somgAddress);
  
  console.log("\n🏪 Market status:");
  console.log("  WSOM Market - Active:", wsomMarket.isActive, "Total Supply:", ethers.formatEther(wsomMarket.totalSupply));
  console.log("  USDC Market - Active:", usdcMarket.isActive, "Total Supply:", ethers.formatEther(usdcMarket.totalSupply));
  console.log("  SOMG Market - Active:", somgMarket.isActive, "Total Supply:", ethers.formatEther(somgMarket.totalSupply));

  // Check faucet balances
  const wsomFaucetBalance = await wsomToken.balanceOf(faucetAddress);
  const usdcFaucetBalance = await usdcToken.balanceOf(faucetAddress);
  const somgFaucetBalance = await somgToken.balanceOf(faucetAddress);
  
  console.log("\n🚰 Faucet balances:");
  console.log("  WSOM:", ethers.formatEther(wsomFaucetBalance));
  console.log("  USDC:", ethers.formatEther(usdcFaucetBalance));
  console.log("  SOMG:", ethers.formatEther(somgFaucetBalance));

  // 6. Output deployment summary
  console.log("\n🎉 Deployment and setup completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("  SomniaLendingFixed:", lendingAddress);
  console.log("  TestWrappedSomnia (WSOM):", wsomAddress);
  console.log("  USDCToken (USDC):", usdcAddress);
  console.log("  SomniaGovernanceToken (SOMG):", somgAddress);
  console.log("  TestTokenFaucet:", faucetAddress);
  
  console.log("\n🔧 Admin Setup Completed:");
  console.log("  ✅ All tokens whitelisted");
  console.log("  ✅ All markets created");
  console.log("  ✅ Initial liquidity added (100K each)");
  console.log("  ✅ Faucet funded (100K each)");
  
  console.log("\n💡 Next Steps:");
  console.log("  1. Update frontend ABI files with new addresses");
  console.log("  2. Test supply/borrow functionality");
  console.log("  3. Test faucet functionality");
  
  // Save addresses to a file for easy reference
  const deploymentInfo = {
    network: "Somnia Testnet",
    deployer: deployer.address,
    contracts: {
      SomniaLendingFixed: lendingAddress,
      TestWrappedSomnia: wsomAddress,
      USDCToken: usdcAddress,
      SomniaGovernanceToken: somgAddress,
      TestTokenFaucet: faucetAddress
    },
    setup: {
      whitelistedTokens: [wsomAddress, usdcAddress, somgAddress],
      marketsCreated: [wsomAddress, usdcAddress, somgAddress],
      initialLiquidity: ethers.formatEther(initialLiquidity),
      faucetFunding: ethers.formatEther(faucetAmount)
    },
    timestamp: new Date().toISOString()
  };

  const fs = require('fs');
  fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 