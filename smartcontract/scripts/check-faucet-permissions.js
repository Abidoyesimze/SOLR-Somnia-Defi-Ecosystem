const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking faucet permissions and ownership...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Current account:", deployer.address);
  
  // Contract addresses from our deployment
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
    // Get contract instances using the signer directly
    const wsomContract = new ethers.Contract(
      WSOM_TOKEN_ADDRESS,
      ["function owner() view returns (address)", "function addAuthorizedMinter(address minter)", "function authorizedMinters(address) view returns (bool)"],
      deployer
    );
    
    const usdcContract = new ethers.Contract(
      USDC_TOKEN_ADDRESS,
      ["function owner() view returns (address)", "function addAuthorizedMinter(address minter)", "function authorizedMinters(address) view returns (bool)"],
      deployer
    );
    
    const somgContract = new ethers.Contract(
      SOMG_TOKEN_ADDRESS,
      ["function owner() view returns (address)", "function addAuthorizedMinter(address minter)", "function authorizedMinters(address) view returns (bool)"],
      deployer
    );
    
    console.log("\n✅ Contract instances created");
    
    // Check current ownership
    console.log("\n🔍 Checking ownership...");
    const wsomOwner = await wsomContract.owner();
    const usdcOwner = await usdcContract.owner();
    const somgOwner = await somgContract.owner();
    
    console.log("Current owners:");
    console.log("WSOM Owner:", wsomOwner);
    console.log("USDC Owner:", usdcOwner);
    console.log("SOMG Owner:", somgOwner);
    console.log("Current Account:", deployer.address);
    
    // Check if current account is owner of any tokens
    let canGrantWSOM = false;
    let canGrantUSDC = false;
    let canGrantSOMG = false;
    
    if (deployer.address.toLowerCase() === wsomOwner.toLowerCase()) {
      canGrantWSOM = true;
      console.log("✅ Can grant WSOM permissions");
    }
    
    if (deployer.address.toLowerCase() === usdcOwner.toLowerCase()) {
      canGrantUSDC = true;
      console.log("✅ Can grant USDC permissions");
    }
    
    if (deployer.address.toLowerCase() === somgOwner.toLowerCase()) {
      canGrantSOMG = true;
      console.log("✅ Can grant SOMG permissions");
    }
    
    // Check current faucet permissions
    console.log("\n🔍 Checking current faucet permissions...");
    const wsomAuthorized = await wsomContract.authorizedMinters(FAUCET_CONTRACT_ADDRESS);
    const usdcAuthorized = await usdcContract.authorizedMinters(FAUCET_CONTRACT_ADDRESS);
    const somgAuthorized = await somgContract.authorizedMinters(FAUCET_CONTRACT_ADDRESS);
    
    console.log("Current faucet permissions:");
    console.log("WSOM: ", wsomAuthorized ? "✅ Authorized" : "❌ Not Authorized");
    console.log("USDC: ", usdcAuthorized ? "✅ Authorized" : "❌ Not Authorized");
    console.log("SOMG: ", somgAuthorized ? "✅ Authorized" : "❌ Not Authorized");
    
    // If we can grant permissions, do it
    if (canGrantWSOM || canGrantUSDC || canGrantSOMG) {
      console.log("\n🔑 Granting permissions where possible...");
      
      if (canGrantWSOM && !wsomAuthorized) {
        console.log("🔑 Granting WSOM minting permission to faucet...");
        const wsomTx = await wsomContract.addAuthorizedMinter(FAUCET_CONTRACT_ADDRESS);
        console.log("WSOM transaction hash:", wsomTx.hash);
        await wsomTx.wait();
        console.log("✅ WSOM minting permission granted");
      }
      
      if (canGrantUSDC && !usdcAuthorized) {
        console.log("🔑 Granting USDC minting permission to faucet...");
        const usdcTx = await usdcContract.addAuthorizedMinter(FAUCET_CONTRACT_ADDRESS);
        console.log("USDC transaction hash:", usdcTx.hash);
        await usdcTx.wait();
        console.log("✅ USDC minting permission granted");
      }
      
      if (canGrantSOMG && !somgAuthorized) {
        console.log("🔑 Granting SOMG minting permission to faucet...");
        const somgTx = await somgContract.addAuthorizedMinter(FAUCET_CONTRACT_ADDRESS);
        console.log("SOMG transaction hash:", somgTx.hash);
        await somgTx.wait();
        console.log("✅ SOMG minting permission granted");
      }
      
      console.log("\n🎉 Permissions setup completed!");
      
    } else {
      // We're not the owner, provide deployer instructions
      console.log("\n❌ Current account is not the owner of any token contracts");
      console.log("📧 Please send the following information to the deployer:");
      
      console.log("\n" + "=".repeat(80));
      console.log("📋 DEPLOYER INSTRUCTIONS - GRANT FAUCET PERMISSIONS");
      console.log("=".repeat(80));
      console.log("The faucet contract needs minting permissions on the token contracts.");
      console.log("Please run the following commands from your deployer account:");
      console.log("\n1. Connect to Somnia Testnet with your deployer wallet");
      console.log("2. Run these transactions:");
      
      if (!wsomAuthorized) {
        console.log(`\n🔑 Grant WSOM permissions:`);
        console.log(`   Contract: ${WSOM_TOKEN_ADDRESS}`);
        console.log(`   Function: addAuthorizedMinter(${FAUCET_CONTRACT_ADDRESS})`);
        console.log(`   Owner: ${wsomOwner}`);
      }
      
      if (!usdcAuthorized) {
        console.log(`\n🔑 Grant USDC permissions:`);
        console.log(`   Contract: ${USDC_TOKEN_ADDRESS}`);
        console.log(`   Function: addAuthorizedMinter(${FAUCET_CONTRACT_ADDRESS})`);
        console.log(`   Owner: ${usdcOwner}`);
      }
      
      if (!somgAuthorized) {
        console.log(`\n🔑 Grant SOMG permissions:`);
        console.log(`   Contract: ${SOMG_TOKEN_ADDRESS}`);
        console.log(`   Function: addAuthorizedMinter(${FAUCET_CONTRACT_ADDRESS})`);
        console.log(`   Owner: ${somgOwner}`);
      }
      
      console.log("\n3. After granting permissions, the faucet will work properly");
      console.log("=".repeat(80));
      
      // Also provide a simple script for the deployer
      console.log("\n📜 Alternative: Deployer can use this simple script:");
      console.log("```javascript");
      console.log("// Deployer script to grant faucet permissions");
      console.log("const FAUCET_ADDRESS = '" + FAUCET_CONTRACT_ADDRESS + "';");
      console.log("const WSOM_ADDRESS = '" + WSOM_TOKEN_ADDRESS + "';");
      console.log("const USDC_ADDRESS = '" + USDC_TOKEN_ADDRESS + "';");
      console.log("const SOMG_ADDRESS = '" + SOMG_TOKEN_ADDRESS + "';");
      console.log("");
      console.log("// Grant permissions (run from deployer account)");
      console.log("await wsomContract.addAuthorizedMinter(FAUCET_ADDRESS);");
      console.log("await usdcContract.addAuthorizedMinter(FAUCET_ADDRESS);");
      console.log("await somgContract.addAuthorizedMinter(FAUCET_ADDRESS);");
      console.log("```");
    }
    
    // Final status check
    console.log("\n🔍 Final permission status:");
    const finalWsomAuth = await wsomContract.authorizedMinters(FAUCET_CONTRACT_ADDRESS);
    const finalUsdcAuth = await usdcContract.authorizedMinters(FAUCET_CONTRACT_ADDRESS);
    const finalSomgAuth = await somgContract.authorizedMinters(FAUCET_CONTRACT_ADDRESS);
    
    console.log("WSOM: ", finalWsomAuth ? "✅ Authorized" : "❌ Not Authorized");
    console.log("USDC: ", finalUsdcAuth ? "✅ Authorized" : "❌ Not Authorized");
    console.log("SOMG: ", finalSomgAuth ? "✅ Authorized" : "❌ Not Authorized");
    
    if (finalWsomAuth && finalUsdcAuth && finalSomgAuth) {
      console.log("\n🎉 All permissions granted! Faucet should work now.");
    } else {
      console.log("\n⚠️  Some permissions still missing. Contact deployer to complete setup.");
    }
    
  } catch (error) {
    console.error("❌ Error checking permissions:", error);
    
    if (error.message.includes("Not authorized to mint")) {
      console.log("\n💡 This error suggests the faucet contract needs minting permissions");
    }
    
    console.log("\n💡 Alternative: Use the 'Grant Minting Permissions' button in the faucet UI");
    console.log("This button will attempt to grant permissions directly from your connected wallet");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 