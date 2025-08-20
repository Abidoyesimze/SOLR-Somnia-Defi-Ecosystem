console.log("🔍 FAUCET PERMISSIONS SETUP INFORMATION");
console.log("=".repeat(80));

console.log("\n📋 CONTRACT ADDRESSES:");
console.log("Faucet Contract:", "0x72631F951C3ea4795D938859F4476104087106B7");
console.log("WSOM Token:", "0x7E3EeD3f3B09Df10A06adA95Bc9887D5385935DB");
console.log("USDC Token:", "0xe2dB8A87E83b1A3fE7db7128d186079A9F958bEA");
console.log("SOMG Token:", "0x58f5C4d7C08C6D9B45624ffE1C9fA31119e98991a");

console.log("\n🔑 REQUIRED ACTIONS:");
console.log("The faucet contract needs minting permissions on all token contracts.");
console.log("Only the owner of each token contract can grant these permissions.");

console.log("\n📜 DEPLOYER INSTRUCTIONS:");
console.log("1. Connect to Somnia Testnet with your deployer wallet");
console.log("2. Run these transactions from your deployer account:");

console.log("\n🔑 Grant WSOM permissions:");
console.log("   Contract: 0x7E3EeD3f3B09Df10A06adA95Bc9887D5385935DB");
console.log("   Function: addAuthorizedMinter(0x72631F951C3ea4795D938859F4476104087106B7)");

console.log("\n🔑 Grant USDC permissions:");
console.log("   Contract: 0xe2dB8A87E83b1A3fE7db7128d186079A9F958bEA");
console.log("   Function: addAuthorizedMinter(0x72631F951C3ea4795D938859F4476104087106B7)");

console.log("\n🔑 Grant SOMG permissions:");
console.log("   Contract: 0x58f5C4d7C08C6D9B45624ffE1C9fA31119e98991a");
console.log("   Function: addAuthorizedMinter(0x72631F951C3ea4795D938859F4476104087106B7)");

console.log("\n📱 ALTERNATIVE METHODS:");
console.log("1. Use the 'Grant Minting Permissions' button in the faucet UI");
console.log("2. Use a blockchain explorer (like Somnia Explorer) to call the functions");
console.log("3. Use ethers.js directly in the browser console");

console.log("\n💻 BROWSER CONSOLE SCRIPT FOR DEPLOYER:");
console.log("```javascript");
console.log("// Connect your wallet first, then run this in browser console");
console.log("const FAUCET_ADDRESS = '0x72631F951C3ea4795D938859F4476104087106B7';");
console.log("const WSOM_ADDRESS = '0x7E3EeD3f3B09Df10A06adA95Bc9887D5385935DB';");
console.log("const USDC_ADDRESS = '0xe2dB8A87E83b1A3fE7db7128d186079A9F958bEA';");
console.log("const SOMG_ADDRESS = '0x58f5C4d7C08C6D9B45624ffE1C9fA31119e98991a';");
console.log("");
console.log("// Get contract instances");
console.log("const wsomContract = new ethers.Contract(WSOM_ADDRESS, ['function addAuthorizedMinter(address)'], signer);");
console.log("const usdcContract = new ethers.Contract(USDC_ADDRESS, ['function addAuthorizedMinter(address)'], signer);");
console.log("const somgContract = new ethers.Contract(SOMG_ADDRESS, ['function addAuthorizedMinter(address)'], signer);");
console.log("");
console.log("// Grant permissions");
console.log("await wsomContract.addAuthorizedMinter(FAUCET_ADDRESS);");
console.log("await usdcContract.addAuthorizedMinter(FAUCET_ADDRESS);");
console.log("await somgContract.addAuthorizedMinter(FAUCET_ADDRESS);");
console.log("```");

console.log("\n🔍 VERIFICATION:");
console.log("After granting permissions, check if faucet can mint by:");
console.log("1. Going to the faucet page");
console.log("2. Clicking 'Claim All Tokens'");
console.log("3. If successful, permissions are working");

console.log("\n⚠️  IMPORTANT NOTES:");
console.log("- Only the token contract owner can grant minting permissions");
console.log("- The faucet contract address must be exactly correct");
console.log("- All three permissions must be granted for full functionality");
console.log("- Check transaction success and gas fees");

console.log("=".repeat(80));
console.log("📧 Send this information to the deployer of the token contracts");
console.log("=".repeat(80)); 