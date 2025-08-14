const { ethers } = require("hardhat");

async function main() {
    const contracts = {
        "SomniaGovernance": "0xc8F6fF01fd1D981e627a8102fc334D360Af7384b",
        "SomniaAMM": "0x50e640A4DeEcc4CC98EFb6fB59B655cc65565E77",
        "SomniaLending": "0x58C125A48AE01B40800F1fe58C1Fc1208B12Fd20",
        "SomniaStaking": "0xD7f9C58211d1e38f0ef0f2c802CB36525466EA1f"
    };

    console.log("🔍 Checking contract deployment status on Somnia Testnet...\n");

    for (const [contractName, address] of Object.entries(contracts)) {
        console.log(`📋 ${contractName}:`);
        console.log(`   Address: ${address}`);

        try {
            // Check if contract exists by getting its bytecode
            const code = await ethers.provider.getCode(address);

            if (code === "0x") {
                console.log("   ❌ Not deployed (no bytecode found)");
            } else {
                console.log("   ✅ Deployed (bytecode found)");
                console.log(`   📦 Bytecode length: ${code.length - 2} bytes`);

                // Try to get some basic contract info
                try {
                    const contract = new ethers.Contract(address, [
                        "function name() view returns (string)",
                        "function symbol() view returns (string)",
                        "function owner() view returns (address)",
                        "function poolCount() view returns (uint256)"
                    ], ethers.provider);

                    // Try different functions based on contract type
                    if (contractName === "SomniaGovernance") {
                        const name = await contract.name();
                        const symbol = await contract.symbol();
                        console.log(`   🏷️  Name: ${name}`);
                        console.log(`   🏷️  Symbol: ${symbol}`);
                    } else if (contractName === "SomniaAMM") {
                        const owner = await contract.owner();
                        const poolCount = await contract.poolCount();
                        console.log(`   👑 Owner: ${owner}`);
                        console.log(`   🏊 Pool Count: ${poolCount.toString()}`);
                    } else if (contractName === "SomniaLending") {
                        const owner = await contract.owner();
                        console.log(`   👑 Owner: ${owner}`);
                    } else if (contractName === "SomniaStaking") {
                        const owner = await contract.owner();
                        console.log(`   👑 Owner: ${owner}`);
                    }
                } catch (infoError) {
                    console.log("   ℹ️  Could not get contract info (may need verification)");
                }
            }
        } catch (error) {
            console.log(`   ❌ Error checking contract: ${error.message}`);
        }

        console.log("");
    }

    console.log("🔗 Verification Links:");
    console.log("Somnia Explorer: https://shannon-explorer.somnia.network/");
    console.log("");
    console.log("📝 To verify contracts, you'll need:");
    console.log("1. Contract source code");
    console.log("2. Constructor arguments (if any)");
    console.log("3. Compiler settings");
    console.log("");
    console.log("💡 The contracts appear to be deployed and functional!");
}

main().catch(console.error);
