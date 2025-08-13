const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Somnia Asset Router...");

  // Get the contract factory
  const SomniaAssetRouter = await ethers.getContractFactory("SomniaAssetRouter");
  
  // Deploy the contract
  const somniaRouter = await SomniaAssetRouter.deploy();
  
  // Wait for deployment to finish
  await somniaRouter.waitForDeployment();
  
  const address = await somniaRouter.getAddress();
  
  console.log("✅ Somnia Asset Router deployed to:", address);
  console.log("📋 Contract Details:");
  console.log("   - Owner:", await somniaRouter.owner());
  console.log("   - Routing Fee:", ethers.formatEther(await somniaRouter.routingFee()), "ETH");
  console.log("   - Object Count:", await somniaRouter.objectCount());
  console.log("   - Experience Count:", await somniaRouter.experienceCount());
  
  console.log("\n🔗 Next Steps:");
  console.log("1. Verify contract on Somnia Explorer");
  console.log("2. Update frontend constants with contract address");
  console.log("3. Test object registration and routing");
  
  return address;
}

// Execute deployment
main()
  .then((address) => {
    console.log("\n🎉 Deployment successful!");
    console.log("Contract address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 