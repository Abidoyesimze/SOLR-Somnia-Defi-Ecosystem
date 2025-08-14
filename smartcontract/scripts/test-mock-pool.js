const { ethers } = require("hardhat");

async function main() {
    const AMM_ADDRESS = "0xFd5CEb64614A35A851808A527b58FFb4dA3075a1";
    const SOMG_ADDRESS = "0xc8F6fF01fd1D981e627a8102fc334D360Af7384b";
    const MOCK_TOKEN_ADDRESS = "0x8a016376332fA74639ddF9CC19fa9D09cE323624";

    console.log("Testing pool creation with mock token...");

    try {
        const amm = await ethers.getContractAt("SomniaAMM", AMM_ADDRESS);

        // First, whitelist the mock token
        console.log("Whitelisting mock token...");
        const whitelistTx = await amm.whitelistToken(MOCK_TOKEN_ADDRESS);
        await whitelistTx.wait();
        console.log("✅ Mock token whitelisted");

        // Try creating the pool
        console.log("Creating SOMG/MOCK pool...");
        const tx = await amm.createPool(SOMG_ADDRESS, MOCK_TOKEN_ADDRESS);
        console.log("Transaction sent:", tx.hash);

        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);
        console.log("Gas used:", receipt.gasUsed.toString());

        // Check if pool was created
        const pool = await amm.pools(SOMG_ADDRESS, MOCK_TOKEN_ADDRESS);
        console.log("Pool created successfully:", pool.exists);

        if (pool.exists) {
            console.log("✅ Pool creation successful!");
            console.log("Pool token0:", pool.token0);
            console.log("Pool token1:", pool.token1);
        }

    } catch (error) {
        console.error("Error creating pool:", error.message);

        if (error.reason) {
            console.error("Reason:", error.reason);
        }
        if (error.data) {
            console.error("Error data:", error.data);
        }
    }
}

main().catch(console.error);
