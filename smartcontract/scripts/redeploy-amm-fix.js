const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Redeploying SomniaAMM with fixed LP token...");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Deploy new AMM with fixed LP token
  console.log("\n🔄 Deploying SomniaAMM...");
  const SomniaAMM = await ethers.getContractFactory("SomniaAMM");
  const amm = await SomniaAMM.deploy(deployer.address);
  await amm.waitForDeployment();
  const ammAddress = await amm.getAddress();
  console.log("✅ SomniaAMM deployed to:", ammAddress);

  // Whitelist existing tokens
  const tokens = {
    WSOM: "0x7E3EeD3f3B09Df10A06adA95Bc9887D5385935DB",
    USDC: "0xe2dB8A87E83b1A3fE7db7128d186079A9F958bEA",
    SOMG: "0x58f5C4d7C08C6D9B45624ffE1C9fA3119e98991a"
  };

  console.log("\n📋 Whitelisting tokens...");
  for (const [symbol, address] of Object.entries(tokens)) {
    await amm.whitelistToken(address);
    console.log(`✅ ${symbol} whitelisted: ${address}`);
  }

  console.log("\n🎉 Redeployment Complete!");
  console.log("=".repeat(50));
  console.log("🔄 New SomniaAMM Address:", ammAddress);
  console.log("=".repeat(50));

  console.log("\n⚠️  IMPORTANT: Update frontend constants with new AMM address!");
  
  return ammAddress;
}

main()
  .then((ammAddress) => {
    console.log(`\n📋 Update this address in frontend/src/abi/index.tsx:`);
    console.log(`export const SomniaAmmContract = {`);
    console.log(`    address: "${ammAddress}",`);
    console.log(`    abi: SomniaAMM`);
    console.log(`}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
