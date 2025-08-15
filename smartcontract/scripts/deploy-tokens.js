const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying tokens with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "SOM");

  // Deploy SOM Token (Native ecosystem token)
  console.log("\n=== Deploying SOM Token ===");
  const SomniaToken = await ethers.getContractFactory("SomniaToken");
  const somToken = await SomniaToken.deploy(
    "Somnia Token",
    "SOM",
    18, // decimals
    1000000, // 1 million tokens initial supply
    10000000, // 10 million max supply
    deployer.address
  );
  await somToken.waitForDeployment();
  console.log("SOM Token deployed to:", await somToken.getAddress());

  // Deploy USDC Token (Stablecoin)
  console.log("\n=== Deploying USDC Token ===");
  const USDCToken = await ethers.getContractFactory("USDCToken");
  const usdcToken = await USDCToken.deploy(deployer.address);
  await usdcToken.waitForDeployment();
  console.log("USDC Token deployed to:", await usdcToken.getAddress());

  // Deploy SOMG Token (Governance token)
  console.log("\n=== Deploying SOMG Token ===");
  const SomniaGovernanceToken = await ethers.getContractFactory("SomniaGovernanceToken");
  const somgToken = await SomniaGovernanceToken.deploy(deployer.address);
  await somgToken.waitForDeployment();
  console.log("SOMG Token deployed to:", await somgToken.getAddress());

  // Deploy LP Token (Liquidity Provider token)
  console.log("\n=== Deploying LP Token ===");
  const SomniaLPToken = await ethers.getContractFactory("SomniaLPToken");
  const lpToken = await SomniaLPToken.deploy(deployer.address);
  await lpToken.waitForDeployment();
  console.log("LP Token deployed to:", await lpToken.getAddress());

  // Deploy Wrapped SOM Token
  console.log("\n=== Deploying Wrapped SOM Token ===");
  const WrappedSomnia = await ethers.getContractFactory("WrappedSomnia");
  const wrappedSomToken = await WrappedSomnia.deploy();
  await wrappedSomToken.waitForDeployment();
  console.log("Wrapped SOM Token deployed to:", await wrappedSomToken.getAddress());

  // Deploy Test Token Faucet
  console.log("\n=== Deploying Test Token Faucet ===");
  const TestTokenFaucet = await ethers.getContractFactory("TestTokenFaucet");
  const faucet = await TestTokenFaucet.deploy(
    await somToken.getAddress(),
    await usdcToken.getAddress(),
    await somgToken.getAddress(),
    deployer.address
  );
  await faucet.waitForDeployment();
  console.log("Test Token Faucet deployed to:", await faucet.getAddress());

  console.log("\n=== Token Deployment Summary ===");
  console.log("SOM Token:", await somToken.getAddress());
  console.log("USDC Token:", await usdcToken.getAddress());
  console.log("SOMG Token:", await somgToken.getAddress());
  console.log("LP Token:", await lpToken.getAddress());
  console.log("Wrapped SOM Token:", await wrappedSomToken.getAddress());
  console.log("Test Token Faucet:", await faucet.getAddress());

  // Get contract addresses
  const somAddress = await somToken.getAddress();
  const usdcAddress = await usdcToken.getAddress();
  const somgAddress = await somgToken.getAddress();
  const lpAddress = await lpToken.getAddress();
  const wrappedSomAddress = await wrappedSomToken.getAddress();
  const faucetAddress = await faucet.getAddress();

  // Set up faucet permissions
  console.log("\n=== Setting up faucet permissions ===");
  await somToken.addAuthorizedMinter(faucetAddress);
  console.log("Added faucet as authorized minter for SOM");
  
  await usdcToken.addAuthorizedMinter(faucetAddress);
  console.log("Added faucet as authorized minter for USDC");
  
  await somgToken.addAuthorizedMinter(faucetAddress);
  console.log("Added faucet as authorized minter for SOMG");

  // Transfer some tokens to the deployed contracts for initial liquidity
  console.log("\n=== Setting up initial liquidity ===");
  
  // Transfer tokens to AMM contract for initial pools
  const ammAddress = "0x50e640A4DeEcc4CC98EFb6fB59B655cc65565E77";
  
  // Transfer SOM tokens
  await somToken.transfer(ammAddress, ethers.parseEther("10000")); // 10k SOM
  console.log("Transferred 10,000 SOM to AMM contract");
  
  // Transfer USDC tokens
  await usdcToken.transfer(ammAddress, ethers.parseUnits("10000", 6)); // 10k USDC
  console.log("Transferred 10,000 USDC to AMM contract");
  
  // Transfer SOMG tokens
  await somgToken.transfer(ammAddress, ethers.parseEther("1000")); // 1k SOMG
  console.log("Transferred 1,000 SOMG to AMM contract");

  // Set up LP token permissions
  console.log("\n=== Setting up LP token permissions ===");
  await lpToken.addAuthorizedMinter(ammAddress);
  console.log("Added AMM contract as authorized minter for LP tokens");

  // Create config file content
  console.log("\n=== Configuration for frontend ===");
  console.log("Update your frontend/src/app/lib/config.ts with these addresses:");
  console.log(`
export const TOKEN_ADDRESSES = {
  SOM: '${somAddress}',
  USDC: '${usdcAddress}',
  SOMG: '${somgAddress}',
  'SOM-LP': '${lpAddress}',
  WSOM: '${wrappedSomAddress}',
} as const

export const FAUCET_ADDRESS = '${faucetAddress}' as const
  `);

  console.log("\n=== Deployment Complete! ===");
  console.log("All tokens deployed and configured successfully!");
  console.log("Next steps:");
  console.log("1. Update frontend config with new token addresses");
  console.log("2. Test faucet functionality");
  console.log("3. Test token transfers and approvals");
  console.log("4. Test AMM integration with real tokens");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 