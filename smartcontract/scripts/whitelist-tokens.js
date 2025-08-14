const { ethers } = require("hardhat");

async function main() {
    const AMM_ADDRESS = "0x50e640A4DeEcc4CC98EFb6fB59B655cc65565E77";
    const SOMG_ADDRESS = "0xc8F6fF01fd1D981e627a8102fc334D360Af7384b";
    const USDC_ADDRESS = "0xB2614c8E833ef0Caafccc4978D366378ae383169";
    const MOCK_TOKEN_ADDRESS = "0x8a016376332fA74639ddF9CC19fa9D09cE323624";

    console.log("Whitelisting tokens in AMM...");
    console.log("AMM Address:", AMM_ADDRESS);
    console.log("SOMG Address:", SOMG_ADDRESS);
    console.log("USDC Address:", USDC_ADDRESS);
    console.log("Mock Token Address:", MOCK_TOKEN_ADDRESS);

    try {
        const amm = await ethers.getContractAt("SomniaAMM", AMM_ADDRESS);

        console.log("Whitelisting SOMG...");
        const tx1 = await amm.whitelistToken(SOMG_ADDRESS);
        await tx1.wait();
        console.log("✅ SOMG whitelisted");

        console.log("Whitelisting USDC...");
        const tx2 = await amm.whitelistToken(USDC_ADDRESS);
        await tx2.wait();
        console.log("✅ USDC whitelisted");

        console.log("Whitelisting Mock Token...");
        const tx3 = await amm.whitelistToken(MOCK_TOKEN_ADDRESS);
        await tx3.wait();
        console.log("✅ Mock Token whitelisted");

        // Verify whitelist status
        const somgWhitelisted = await amm.whitelistedTokens(SOMG_ADDRESS);
        const usdcWhitelisted = await amm.whitelistedTokens(USDC_ADDRESS);
        const mockTokenWhitelisted = await amm.whitelistedTokens(MOCK_TOKEN_ADDRESS);

        console.log("\nWhitelist verification:");
        console.log("SOMG whitelisted:", somgWhitelisted);
        console.log("USDC whitelisted:", usdcWhitelisted);
        console.log("Mock Token whitelisted:", mockTokenWhitelisted);

    } catch (error) {
        console.error("Error whitelisting tokens:", error.message);
    }
}

main().catch(console.error);
