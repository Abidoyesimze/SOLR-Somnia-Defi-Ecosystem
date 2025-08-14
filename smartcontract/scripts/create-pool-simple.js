const { ethers } = require("hardhat");

async function main() {
    const AMM_ADDRESS = "0xFd5CEb64614A35A851808A527b58FFb4dA3075a1";
    const SOMG_ADDRESS = "0xc8F6fF01fd1D981e627a8102fc334D360Af7384b";
    const USDC_ADDRESS = "0xB2614c8E833ef0Caafccc4978D366378ae383169";

    console.log("Creating SOMG/USDC pool...");

    try {
        const amm = await ethers.getContractAt("SomniaAMM", AMM_ADDRESS);
        const [signer] = await ethers.getSigners();

        console.log("Calling createPool...");
        console.log("Token0:", SOMG_ADDRESS);
        console.log("Token1:", USDC_ADDRESS);

        // Try creating the pool
        const tx = await amm.createPool(SOMG_ADDRESS, USDC_ADDRESS);
        console.log("Transaction sent:", tx.hash);

        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);
        console.log("Gas used:", receipt.gasUsed.toString());

        // Check if pool was created
        const pool = await amm.pools(SOMG_ADDRESS, USDC_ADDRESS);
        console.log("Pool created successfully:", pool.exists);

    } catch (error) {
        console.error("Error creating pool:", error.message);

        // Try to get more details about the error
        if (error.reason) {
            console.error("Reason:", error.reason);
        }
        if (error.data) {
            console.error("Error data:", error.data);
        }
    }
}

main().catch(console.error);
