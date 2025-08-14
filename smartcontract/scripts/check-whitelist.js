const { ethers } = require("hardhat");

async function main() {
    const AMM_ADDRESS = "0x50e640A4DeEcc4CC98EFb6fB59B655cc65565E77";
    const SOMG_ADDRESS = "0xc8F6fF01fd1D981e627a8102fc334D360Af7384b";
    const USDC_ADDRESS = "0xB2614c8E833ef0Caafccc4978D366378ae383169";
    const MOCK_TOKEN_ADDRESS = "0x8a016376332fA74639ddF9CC19fa9D09cE323624";

    console.log("Checking AMM whitelist status...");
    console.log("AMM Address:", AMM_ADDRESS);
    console.log("SOMG Address:", SOMG_ADDRESS);
    console.log("USDC Address:", USDC_ADDRESS);
    console.log("Mock Token Address:", MOCK_TOKEN_ADDRESS);

    try {
        const amm = await ethers.getContractAt("SomniaAMM", AMM_ADDRESS);

        // Check whitelist status
        const somgWhitelisted = await amm.whitelistedTokens(SOMG_ADDRESS);
        const usdcWhitelisted = await amm.whitelistedTokens(USDC_ADDRESS);
        const mockTokenWhitelisted = await amm.whitelistedTokens(MOCK_TOKEN_ADDRESS);

        console.log("Whitelist Status:");
        console.log("SOMG whitelisted:", somgWhitelisted);
        console.log("USDC whitelisted:", usdcWhitelisted);
        console.log("Mock Token whitelisted:", mockTokenWhitelisted);

        // Check if pool already exists
        const poolExists = await amm.pools(SOMG_ADDRESS, USDC_ADDRESS);
        const poolExistsReverse = await amm.pools(USDC_ADDRESS, SOMG_ADDRESS);
        const mockPoolExists = await amm.pools(SOMG_ADDRESS, MOCK_TOKEN_ADDRESS);
        const mockPoolExistsReverse = await amm.pools(MOCK_TOKEN_ADDRESS, SOMG_ADDRESS);

        console.log("Pool Status:");
        console.log("Pool exists (SOMG, USDC):", poolExists.exists);
        console.log("Pool exists (USDC, SOMG):", poolExistsReverse.exists);
        console.log("Pool exists (SOMG, Mock):", mockPoolExists.exists);
        console.log("Pool exists (Mock, SOMG):", mockPoolExistsReverse.exists);

        // Check owner
        const owner = await amm.owner();
        const [signer] = await ethers.getSigners();
        console.log("AMM Owner:", owner);
        console.log("Current signer:", signer.address);
        console.log("Is owner:", owner === signer.address);

    } catch (error) {
        console.error("Error checking AMM:", error.message);
    }
}

main().catch(console.error);
