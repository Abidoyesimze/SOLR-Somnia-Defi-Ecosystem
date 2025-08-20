const { ethers } = require("hardhat");

async function main() {
  console.log("🔑 Granting minting permissions to faucet contract...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Contract addresses from our deployment
  const FAUCET_CONTRACT_ADDRESS = "0x72631F951C3ea4795D938859F4476104087106B7";
  const WSOM_TOKEN_ADDRESS = "0x7E3EeD3f3B09Df10A06adA95Bc9887D5385935DB";
  const USDC_TOKEN_ADDRESS = "0xe2dB8A87E83b1A3fE7db7128d186079A9F958bEA";
  const SOMG_TOKEN_ADDRESS = "0x58f5C4d7C08C6D9B45624ffE1C9fA31119e98991a";
  
  console.log("Faucet Contract:", FAUCET_CONTRACT_ADDRESS);
  console.log("WSOM Token:", WSOM_TOKEN_ADDRESS);
  console.log("USDC Token:", USDC_TOKEN_ADDRESS);
  console.log("SOMG Token:", SOMG_TOKEN_ADDRESS);
  
  try {
    // Get contract instances using the signer directly
    const wsomContract = new ethers.Contract(
      WSOM_TOKEN_ADDRESS,
      ["function owner() view returns (address)", "function addAuthorizedMinter(address minter)"],
      deployer
    );
    
    const usdcContract = new ethers.Contract(
      USDC_TOKEN_ADDRESS,
      ["function owner() view returns (address)", "function addAuthorizedMinter(address minter)"],
      deployer
    );
    
    const somgContract = new ethers.Contract(
      SOMG_TOKEN_ADDRESS,
      ["function owner() view returns (address)", "function addAuthorizedMinter(address minter)"],
      deployer
    );
    
    console.log("✅ Contract instances created");
    
    // Check current ownership
    console.log("Checking ownership...");
    const wsomOwner = await wsomContract.owner();
    const usdcOwner = await usdcContract.owner();
    const somgOwner = await somgContract.owner();
    
    console.log("Current owners:");
    console.log("WSOM Owner:", wsomOwner);
    console.log("USDC Owner:", usdcOwner);
    console.log("SOMG Owner:", somgOwner);
    console.log("Deployer:", deployer.address);
    
    // Check if deployer is owner of any tokens
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
    
    if (!canGrantWSOM && !canGrantUSDC && !canGrantSOMG) {
      console.log("❌ Deployer is not owner of any token contracts");
      console.log("You need to be the owner to grant minting permissions");
      console.log("\n💡 Alternative: Use the 'Grant Minting Permissions' button in the faucet UI");
      return;
    }
    
    // Grant permissions where possible
    if (canGrantWSOM) {
      console.log("🔑 Granting WSOM minting permission to faucet...");
      const wsomTx = await wsomContract.addAuthorizedMinter(FAUCET_CONTRACT_ADDRESS);
      console.log("WSOM transaction hash:", wsomTx.hash);
      await wsomTx.wait();
      console.log("✅ WSOM minting permission granted");
    }
    
    if (canGrantUSDC) {
      console.log("🔑 Granting USDC minting permission to faucet...");
      const usdcTx = await usdcContract.addAuthorizedMinter(FAUCET_CONTRACT_ADDRESS);
      console.log("USDC transaction hash:", usdcTx.hash);
      await usdcTx.wait();
      console.log("✅ USDC minting permission granted");
    }
    
    if (canGrantSOMG) {
      console.log("🔑 Granting SOMG minting permission to faucet...");
      const somgTx = await somgContract.addAuthorizedMinter(FAUCET_CONTRACT_ADDRESS);
      console.log("SOMG transaction hash:", somgTx.hash);
      await somgTx.wait();
      console.log("✅ SOMG minting permission granted");
    }
    
    console.log("\n🎉 Faucet permissions setup completed!");
    console.log("The faucet should now be able to mint tokens successfully.");
    
  } catch (error) {
    console.error("❌ Error granting permissions:", error);
    
    if (error.message.includes("Not authorized to mint")) {
      console.log("\n💡 This error suggests the faucet contract needs minting permissions");
      console.log("Make sure you're running this script with the account that owns the token contracts");
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