const { ethers } = require("hardhat");

async function main() {
    const AMM_ADDRESS = "0xFd5CEb64614A35A851808A527b58FFb4dA3075a1";
    const SOMG_ADDRESS = "0xc8F6fF01fd1D981e627a8102fc334D360Af7384b";
    const USDC_ADDRESS = "0xB2614c8E833ef0Caafccc4978D366378ae383169";

    console.log("Testing basic AMM functionality...");

    try {
        const amm = await ethers.getContractAt("SomniaAMM", AMM_ADDRESS);

        // Test basic view functions
        console.log("Testing view functions...");

        const owner = await amm.owner();
        console.log("Owner:", owner);

        const poolCount = await amm.poolCount();
        console.log("Pool count:", poolCount.toString());

        const [totalVolume, totalFees] = await amm.getStats();
        console.log("Total volume:", totalVolume.toString());
        console.log("Total fees:", totalFees.toString());

        // Test whitelist status
        const somgWhitelisted = await amm.whitelistedTokens(SOMG_ADDRESS);
        const usdcWhitelisted = await amm.whitelistedTokens(USDC_ADDRESS);
        console.log("SOMG whitelisted:", somgWhitelisted);
        console.log("USDC whitelisted:", usdcWhitelisted);

        // Test pool existence
        const pool1 = await amm.pools(SOMG_ADDRESS, USDC_ADDRESS);
        const pool2 = await amm.pools(USDC_ADDRESS, SOMG_ADDRESS);
        console.log("Pool (SOMG, USDC) exists:", pool1.exists);
        console.log("Pool (USDC, SOMG) exists:", pool2.exists);

        console.log("✅ Basic AMM functionality test passed");

    } catch (error) {
        console.error("Error testing AMM:", error.message);
    }
}

main().catch(console.error);
