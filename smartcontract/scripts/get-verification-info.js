const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔧 Generating verification information and ABI...\n");

    const contracts = {
        "SomniaGovernance": {
            address: "0xc8F6fF01fd1D981e627a8102fc334D360Af7384b",
            constructorArgs: []
        },
        "SomniaAMM": {
            address: "0x50e640A4DeEcc4CC98EFb6fB59B655cc65565E77",
            constructorArgs: []
        },
        "SomniaLending": {
            address: "0x58C125A48AE01B40800F1fe58C1Fc1208B12Fd20",
            constructorArgs: []
        },
        "SomniaStaking": {
            address: "0xD7f9C58211d1e38f0ef0f2c802CB36525466EA1f",
            constructorArgs: []
        }
    };

    const verificationInfo = {
        network: "Somnia Testnet",
        chainId: 50312,
        explorer: "https://shannon-explorer.somnia.network/",
        contracts: {}
    };

    for (const [contractName, contractInfo] of Object.entries(contracts)) {
        console.log(`📋 Processing ${contractName}...`);

        try {
            // Get the contract factory to access ABI and bytecode
            const ContractFactory = await ethers.getContractFactory(contractName);

            // Get the ABI
            const abi = ContractFactory.interface.format();

            // Get constructor arguments (encoded)
            const constructorArgs = contractInfo.constructorArgs;
            const encodedArgs = ethers.utils.defaultAbiCoder.encode(
                ContractFactory.interface.deploy.inputs,
                constructorArgs
            );

            // Get compiler info
            const compilerInfo = {
                version: "0.8.19",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    },
                    viaIR: true
                }
            };

            verificationInfo.contracts[contractName] = {
                address: contractInfo.address,
                abi: abi,
                constructorArgs: constructorArgs,
                encodedConstructorArgs: encodedArgs.slice(2), // Remove '0x' prefix
                compilerInfo: compilerInfo
            };

            // Save ABI to separate file
            const abiPath = path.join(__dirname, `../abi/${contractName}.json`);
            const abiDir = path.dirname(abiPath);

            if (!fs.existsSync(abiDir)) {
                fs.mkdirSync(abiDir, { recursive: true });
            }

            fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
            console.log(`   ✅ ABI saved to: ${abiPath}`);

        } catch (error) {
            console.log(`   ❌ Error processing ${contractName}: ${error.message}`);
        }
    }

    // Save verification info
    const verificationPath = path.join(__dirname, "../verification-info.json");
    fs.writeFileSync(verificationPath, JSON.stringify(verificationInfo, null, 2));
    console.log(`\n✅ Verification info saved to: ${verificationPath}`);

    // Generate verification commands
    console.log("\n🔗 Verification Commands:");
    console.log("=".repeat(50));

    for (const [contractName, contractInfo] of Object.entries(verificationInfo.contracts)) {
        console.log(`\n📋 ${contractName}:`);
        console.log(`   Address: ${contractInfo.address}`);
        console.log(`   Constructor Args: ${contractInfo.constructorArgs.length > 0 ? contractInfo.encodedConstructorArgs : 'None'}`);
        console.log(`   Verification URL: ${verificationInfo.explorer}address/${contractInfo.address}#code`);
    }

    console.log("\n📝 Manual Verification Steps:");
    console.log("1. Go to the Somnia Explorer");
    console.log("2. Search for each contract address");
    console.log("3. Click 'Contract' tab");
    console.log("4. Click 'Verify and Publish'");
    console.log("5. Upload the contract source code");
    console.log("6. Enter constructor arguments (if any)");
    console.log("7. Set compiler settings (0.8.19, optimizer enabled, 200 runs)");
    console.log("8. Submit for verification");

    console.log("\n🎉 All contracts are deployed and ready for verification!");
}

main().catch(console.error);
