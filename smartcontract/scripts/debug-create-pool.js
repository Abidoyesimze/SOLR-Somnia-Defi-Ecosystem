const { ethers } = require("hardhat");

async function main() {
    const AMM_ADDRESS = "0x50e640A4DeEcc4CC98EFb6fB59B655cc65565E77";
    const SOMG_ADDRESS = "0xc8F6fF01fd1D981e627a8102fc334D360Af7384b";
    const USDC_ADDRESS = "0xB2614c8E833ef0Caafccc4978D366378ae383169";
    const MOCK_TOKEN_ADDRESS = "0x8a016376332fA74639ddF9CC19fa9D09cE323624";

    console.log("Debugging createPool function...");

    try {
        const amm = await ethers.getContractAt("SomniaAMM", AMM_ADDRESS);

        // Validate tokens are ERC20 contracts
        console.log("Validating tokens...");
        const erc20Abi = ["function name() view returns (string)", "function symbol() view returns (string)", "function decimals() view returns (uint8)"];

        try {
            const somgToken = new ethers.Contract(SOMG_ADDRESS, erc20Abi, ethers.provider);
            const somgName = await somgToken.name();
            const somgSymbol = await somgToken.symbol();
            const somgDecimals = await somgToken.decimals();
            console.log("✅ SOMG Token valid:", somgName, somgSymbol, somgDecimals);
        } catch (error) {
            console.log("❌ SOMG Token validation failed:", error.message);
        }

        try {
            const usdcToken = new ethers.Contract(USDC_ADDRESS, erc20Abi, ethers.provider);
            const usdcName = await usdcToken.name();
            const usdcSymbol = await usdcToken.symbol();
            const usdcDecimals = await usdcToken.decimals();
            console.log("✅ USDC Token valid:", usdcName, usdcSymbol, usdcDecimals);
        } catch (error) {
            console.log("❌ USDC Token validation failed:", error.message);
        }

        // Check if pool already exists
        console.log("Checking if pool already exists...");
        const poolExists = await amm.pools(SOMG_ADDRESS, USDC_ADDRESS);
        const poolExistsReverse = await amm.pools(USDC_ADDRESS, SOMG_ADDRESS);

        console.log("Pool exists (SOMG, USDC):", poolExists.exists);
        console.log("Pool exists (USDC, SOMG):", poolExistsReverse.exists);

        if (poolExists.exists || poolExistsReverse.exists) {
            console.log("❌ Pool already exists!");
            return;
        }

        // Check whitelist status
        console.log("Checking whitelist status...");
        const somgWhitelisted = await amm.whitelistedTokens(SOMG_ADDRESS);
        const usdcWhitelisted = await amm.whitelistedTokens(USDC_ADDRESS);

        console.log("SOMG whitelisted:", somgWhitelisted);
        console.log("USDC whitelisted:", usdcWhitelisted);

        if (!somgWhitelisted || !usdcWhitelisted) {
            console.log("❌ One or both tokens are not whitelisted!");
            return;
        }

        // Check if we can call the function with a try-catch to get specific error
        console.log("Attempting to create pool with error handling...");

        try {
            // Try to call the function directly without gas estimation
            console.log("Calling createPool directly...");
            const tx = await amm.createPool(SOMG_ADDRESS, USDC_ADDRESS, {
                gasLimit: 5000000 // Much higher gas limit
            });

            console.log("Transaction sent:", tx.hash);
            const receipt = await tx.wait();
            console.log("✅ Pool created successfully!");
            console.log("Gas used:", receipt.gasUsed.toString());

        } catch (error) {
            console.error("Specific error details:");
            console.error("Error message:", error.message);
            console.error("Error reason:", error.reason);
            console.error("Error code:", error.code);

            if (error.data) {
                console.error("Error data:", error.data);
            }

            // Try to decode the error if it's a revert
            if (error.data && error.data.length > 10) {
                try {
                    const iface = new ethers.utils.Interface([
                        "error POOL_EXISTS()",
                        "error IDENTICAL_ADDRESSES()",
                        "error ZERO_ADDRESS()",
                        "error TOKEN_NOT_WHITELISTED()"
                    ]);
                    const decoded = iface.parseError(error.data);
                    console.error("Decoded error:", decoded.name);
                } catch (decodeError) {
                    console.error("Could not decode error:", decodeError.message);
                }
            }

            // Try a different approach - check if the contract is paused or has other restrictions
            console.log("\nChecking contract state...");
            try {
                const owner = await amm.owner();
                console.log("AMM Owner:", owner);

                // Check if there are any other state variables that might affect pool creation
                const poolCount = await amm.poolCount();
                console.log("Current pool count:", poolCount.toString());

            } catch (stateError) {
                console.error("Error checking contract state:", stateError.message);
            }
        }

    } catch (error) {
        console.error("Error in debug script:", error.message);
    }
}

main().catch(console.error);
