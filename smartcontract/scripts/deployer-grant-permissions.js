const { ethers } = require("hardhat");

async function main() {
  console.log("🔑 DEPLOYER SCRIPT: Granting faucet minting permissions...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Using deployer account:", deployer.address);
  
  // Contract addresses
  const FAUCET_CONTRACT_ADDRESS = "0x72631F951C3ea4795D938859F4476104087106B7";
  const WSOM_TOKEN_ADDRESS = "0x7E3EeD3f3B09Df10A06adA95Bc9887D5385935DB";
  const USDC_TOKEN_ADDRESS = "0xe2dB8A87E83b1A3fE7db7128d186079A9F958bEA";
  const SOMG_TOKEN_ADDRESS = "0x58f5C4d7C08C6D9B45624ffE1C9fA31119e98991a";
  
  console.log("\n📋 Contract Addresses:");
  console.log("Faucet Contract:", FAUCET_CONTRACT_ADDRESS);
  console.log("WSOM Token:", WSOM_TOKEN_ADDRESS);
  console.log("USDC Token:", USDC_TOKEN_ADDRESS);
  console.log("SOMG Token:", SOMG_TOKEN_ADDRESS);
  
  try {
    // Get contract instances
    const wsomContract = await ethers.getContractAt("TestWrappedSomnia", WSOM_TOKEN_ADDRESS);
    const usdcContract = await ethers.getContractAt("USDCToken", USDC_TOKEN_ADDRESS);
    const somgContract = await ethers.getContractAt("SomniaGovernanceToken", SOMG_TOKEN_ADDRESS);
    
    console.log("\n✅ Contract instances created");
    
    // Check ownership
    console.log("\n🔍 Checking ownership...");
    const wsomOwner = await wsomContract.owner();
    const usdcOwner = await usdcContract.owner();
    const somgOwner = await somgContract.owner();
    
    console.log("Token contract owners:");
    console.log("WSOM Owner:", wsomOwner);
    console.log("USDC Owner:", usdcOwner);
    console.log("SOMG Owner:", somgOwner);
    console.log("Deployer:", deployer.address);
    
    // Verify deployer is owner
    if (deployer.address.toLowerCase() !== wsomOwner.toLowerCase() ||
        deployer.address.toLowerCase() !== usdcOwner.toLowerCase() ||
        deployer.address.toLowerCase() !== somgOwner.toLowerCase()) {
      console.log("\n❌ ERROR: Deployer is not the owner of all token contracts!");
      console.log("This script must be run by the account that owns the token contracts.");
      console.log("Current deployer:", deployer.address);
      console.log("Required owners:", wsomOwner, usdcOwner, somgOwner);
      return;
    }
    
    console.log("\n✅ Deployer is owner of all token contracts");
    
    // Check current permissions
    console.log("\n🔍 Checking current faucet permissions...");
    const wsomAuthorized = await wsomContract.authorizedMinters(FAUCET_CONTRACT_ADDRESS);
    const usdcAuthorized = await usdcContract.authorizedMinters(FAUCET_CONTRACT_ADDRESS);
    const somgAuthorized = await somgContract.authorizedMinters(FAUCET_CONTRACT_ADDRESS);
    
    console.log("Current faucet permissions:");
    console.log("WSOM: ", wsomAuthorized ? "✅ Authorized" : "❌ Not Authorized");
    console.log("USDC: ", usdcAuthorized ? "✅ Authorized" : "❌ Not Authorized");
    console.log("SOMG: ", somgAuthorized ? "✅ Authorized" : "❌ Not Authorized");
    
    // Grant permissions
    console.log("\n🔑 Granting minting permissions to faucet...");
    
    if (!wsomAuthorized) {
      console.log("🔑 Granting WSOM minting permission...");
      const wsomTx = await wsomContract.addAuthorizedMinter(FAUCET_CONTRACT_ADDRESS);
      console.log("WSOM transaction hash:", wsomTx.hash);
      await wsomTx.wait();
      console.log("✅ WSOM minting permission granted");
    } else {
      console.log("✅ WSOM already authorized");
    }
    
    if (!usdcAuthorized) {
      console.log("🔑 Granting USDC minting permission...");
      const usdcTx = await usdcContract.addAuthorizedMinter(FAUCET_CONTRACT_ADDRESS);
      console.log("USDC transaction hash:", usdcTx.hash);
      await usdcTx.wait();
      console.log("✅ USDC minting permission granted");
    } else {
      console.log("✅ USDC already authorized");
    }
    
    if (!somgAuthorized) {
      console.log("🔑 Granting SOMG minting permission...");
      const somgTx = await somgContract.addAuthorizedMinter(FAUCET_CONTRACT_ADDRESS);
      console.log("SOMG transaction hash:", somgTx.hash);
      await somgTx.wait();
      console.log("✅ SOMG minting permission granted");
    } else {
      console.log("✅ SOMG already authorized");
    }
    
    // Verify final permissions
    console.log("\n🔍 Verifying final permissions...");
    const finalWsomAuth = await wsomContract.authorizedMinters(FAUCET_CONTRACT_ADDRESS);
    const finalUsdcAuth = await usdcContract.authorizedMinters(FAUCET_CONTRACT_ADDRESS);
    const finalSomgAuth = await somgContract.authorizedMinters(FAUCET_CONTRACT_ADDRESS);
    
    console.log("Final faucet permissions:");
    console.log("WSOM: ", finalWsomAuth ? "✅ Authorized" : "❌ Not Authorized");
    console.log("USDC: ", finalUsdcAuth ? "✅ Authorized" : "❌ Not Authorized");
    console.log("SOMG: ", finalSomgAuth ? "✅ Authorized" : "❌ Not Authorized");
    
    if (finalWsomAuth && finalUsdcAuth && finalSomgAuth) {
      console.log("\n🎉 SUCCESS: All permissions granted!");
      console.log("The faucet contract can now mint tokens successfully.");
      console.log("\n📱 Next steps:");
      console.log("1. Go to the faucet page in the frontend");
      console.log("2. Try claiming tokens");
      console.log("3. The 'Not authorized to mint' error should be resolved");
    } else {
      console.log("\n⚠️  WARNING: Some permissions still missing!");
      console.log("Check the transaction status and try again if needed.");
    }
    
  } catch (error) {
    console.error("❌ Error granting permissions:", error);
    
    if (error.message.includes("Not authorized to mint")) {
      console.log("\n💡 This error suggests the deployer account doesn't have permission");
      console.log("Make sure you're running this script with the account that owns the token contracts");
    }
    
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Verify you're connected to Somnia Testnet");
    console.log("2. Verify you're using the deployer account that owns the token contracts");
    console.log("3. Check if you have sufficient gas for transactions");
    console.log("4. Try running the script again");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 