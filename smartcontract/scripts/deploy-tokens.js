const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Get balance using ethers v6 syntax
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "SOM");

  console.log("\n=== Deploying Token Contracts ===");
  
  // Deploy TestWrappedSomnia (WSOM) - wrapper for native SOM with minting
  const TestWrappedSomnia = await ethers.getContractFactory("TestWrappedSomnia");
  const wsomToken = await TestWrappedSomnia.deploy();
  await wsomToken.waitForDeployment();
  const wsomAddress = await wsomToken.getAddress();
  console.log("TestWrappedSomnia (WSOM) deployed to:", wsomAddress);

  // Deploy USDCToken
  const USDCToken = await ethers.getContractFactory("USDCToken");
  const usdcToken = await USDCToken.deploy(deployer.address);
  await usdcToken.waitForDeployment();
  const usdcAddress = await usdcToken.getAddress();
  console.log("USDCToken deployed to:", usdcAddress);

  // Deploy SomniaGovernanceToken (SOMG)
  const SomniaGovernanceToken = await ethers.getContractFactory("SomniaGovernanceToken");
  const somgToken = await SomniaGovernanceToken.deploy(deployer.address);
  await somgToken.waitForDeployment();
  const somgAddress = await somgToken.getAddress();
  console.log("SomniaGovernanceToken (SOMG) deployed to:", somgAddress);

  // Deploy SomniaLPToken
  const SomniaLPToken = await ethers.getContractFactory("SomniaLPToken");
  const lpToken = await SomniaLPToken.deploy(deployer.address);
  await lpToken.waitForDeployment();
  const lpAddress = await lpToken.getAddress();
  console.log("SomniaLPToken deployed to:", lpAddress);

  console.log("\n=== Deploying Test Token Faucet ===");
  
  // Deploy TestTokenFaucet with TestWrappedSomnia
  const TestTokenFaucet = await ethers.getContractFactory("TestTokenFaucet");
  const faucet = await TestTokenFaucet.deploy(
    wsomAddress,      // TestWrappedSomnia address
    usdcAddress,      // USDC token address
    somgAddress       // SOMG token address
  );
  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();
  console.log("Test Token Faucet deployed to:", faucetAddress);

  console.log("\n=== Setting up faucet permissions ===");
  
  // Grant faucet permission to mint WSOM
  await wsomToken.addAuthorizedMinter(faucetAddress);
  console.log("Added faucet as authorized minter for WSOM");
  
  // Grant faucet permission to mint USDC
  await usdcToken.addAuthorizedMinter(faucetAddress);
  console.log("Added faucet as authorized minter for USDC");
  
  // Grant faucet permission to mint SOMG
  await somgToken.addAuthorizedMinter(faucetAddress);
  console.log("Added faucet as authorized minter for SOMG");

  console.log("\n=== Deployed Contract Addresses ===");
  console.log("TestWrappedSomnia (WSOM):", wsomAddress);
  console.log("USDCToken (USDC):", usdcAddress);
  console.log("SomniaGovernanceToken (SOMG):", somgAddress);
  console.log("SomniaLPToken (LP):", lpAddress);
  console.log("TestTokenFaucet:", faucetAddress);

  console.log("\n=== Copy these addresses to your frontend config ===");
  console.log("Update frontend/src/app/lib/config.ts:");
  console.log(`TOKEN_ADDRESSES.WSOM = '${wsomAddress}'`);
  console.log(`TOKEN_ADDRESSES.USDC = '${usdcAddress}'`);
  console.log(`TOKEN_ADDRESSES.SOMG = '${somgAddress}'`);
  console.log(`TOKEN_ADDRESSES['SOM-LP'] = '${lpAddress}'`);
  console.log(`FAUCET_ADDRESS = '${faucetAddress}'`);

  console.log("\n=== Deployment Complete! ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 