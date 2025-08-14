const { ethers } = require("hardhat");

async function main() {
    const USDC_ADDRESS = "0xB2614c8E833ef0Caafccc4978D366378ae383169";

    console.log("Testing USDC token on Somnia testnet...");
    console.log("USDC Address:", USDC_ADDRESS);

    try {
        // Try to get basic info from the USDC contract
        const usdc = new ethers.Contract(USDC_ADDRESS, [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)",
            "function totalSupply() view returns (uint256)",
            "function balanceOf(address) view returns (uint256)"
        ], ethers.provider);

        console.log("Attempting to read USDC contract...");

        const [name, symbol, decimals, totalSupply] = await Promise.all([
            usdc.name().catch(e => `Error: ${e.message}`),
            usdc.symbol().catch(e => `Error: ${e.message}`),
            usdc.decimals().catch(e => `Error: ${e.message}`),
            usdc.totalSupply().catch(e => `Error: ${e.message}`)
        ]);

        console.log("USDC Contract Info:");
        console.log("Name:", name);
        console.log("Symbol:", symbol);
        console.log("Decimals:", decimals);
        console.log("Total Supply:", totalSupply);

        // Check if contract exists by trying to get code
        const code = await ethers.provider.getCode(USDC_ADDRESS);
        console.log("Contract code exists:", code !== "0x");
        console.log("Code length:", code.length);

    } catch (error) {
        console.error("Error testing USDC:", error.message);
    }
}

main().catch(console.error);
