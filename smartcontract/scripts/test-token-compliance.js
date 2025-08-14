const { ethers } = require("hardhat");

async function main() {
    const SOMG_ADDRESS = "0xc8F6fF01fd1D981e627a8102fc334D360Af7384b";
    const USDC_ADDRESS = "0xB2614c8E833ef0Caafccc4978D366378ae383169";

    console.log("Testing token ERC20 compliance...");

    try {
        // Test SOMG
        console.log("\nTesting SOMG token...");
        const somg = new ethers.Contract(SOMG_ADDRESS, [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)",
            "function totalSupply() view returns (uint256)",
            "function balanceOf(address) view returns (uint256)",
            "function allowance(address,address) view returns (uint256)",
            "function approve(address,uint256) returns (bool)",
            "function transfer(address,uint256) returns (bool)",
            "function transferFrom(address,address,uint256) returns (bool)"
        ], ethers.provider);

        const [somgName, somgSymbol, somgDecimals, somgTotalSupply] = await Promise.all([
            somg.name(),
            somg.symbol(),
            somg.decimals(),
            somg.totalSupply()
        ]);

        console.log("SOMG Info:");
        console.log("Name:", somgName);
        console.log("Symbol:", somgSymbol);
        console.log("Decimals:", somgDecimals);
        console.log("Total Supply:", somgTotalSupply.toString());

        // Test USDC
        console.log("\nTesting USDC token...");
        const usdc = new ethers.Contract(USDC_ADDRESS, [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)",
            "function totalSupply() view returns (uint256)",
            "function balanceOf(address) view returns (uint256)",
            "function allowance(address,address) view returns (uint256)",
            "function approve(address,uint256) returns (bool)",
            "function transfer(address,uint256) returns (bool)",
            "function transferFrom(address,address,uint256) returns (bool)"
        ], ethers.provider);

        const [usdcName, usdcSymbol, usdcDecimals, usdcTotalSupply] = await Promise.all([
            usdc.name(),
            usdc.symbol(),
            usdc.decimals(),
            usdc.totalSupply()
        ]);

        console.log("USDC Info:");
        console.log("Name:", usdcName);
        console.log("Symbol:", usdcSymbol);
        console.log("Decimals:", usdcDecimals);
        console.log("Total Supply:", usdcTotalSupply.toString());

        // Check if tokens are identical
        console.log("\nToken comparison:");
        console.log("SOMG == USDC:", SOMG_ADDRESS.toLowerCase() === USDC_ADDRESS.toLowerCase());
        console.log("SOMG address:", SOMG_ADDRESS);
        console.log("USDC address:", USDC_ADDRESS);

    } catch (error) {
        console.error("Error testing tokens:", error.message);
    }
}

main().catch(console.error);
