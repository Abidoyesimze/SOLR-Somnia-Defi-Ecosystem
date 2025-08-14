/*
  One-shot AMM initializer for Somnia
  - Whitelists tokens
  - Creates SOMG/USDC pool
  - Adds initial liquidity
  - Executes a sample swap

  Required env vars:
    AMM_ADDRESS=<deployed SomniaAMM>
    SOMG_ADDRESS=<deployed governance token>
    USDC_ADDRESS=0xB2614c8E833ef0Caafccc4978D366378ae383169

  Optional env vars:
    SOMG_SEED=1000        // in whole tokens
    USDC_SEED=1000        // in whole tokens
    SWAP_USDC_IN=10       // swap 10 USDC -> SOMG
*/

const { ethers } = require("hardhat");

// Minimal ERC20 ABI
const ERC20_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address,address) view returns (uint256)",
    "function approve(address,uint256) returns (bool)",
    "function transfer(address,uint256) returns (bool)",
];

async function approveIfNeeded(token, owner, spender, amount) {
    const allowance = await token.allowance(owner, spender);
    if (allowance < amount) {
        const tx = await token.approve(spender, amount);
        await tx.wait();
    }
}

async function main() {
    const {
        AMM_ADDRESS,
        SOMG_ADDRESS,
        USDC_ADDRESS,
        SOMG_SEED = "1000",
        USDC_SEED = "1000",
        SWAP_USDC_IN = "10",
    } = process.env;

    if (!AMM_ADDRESS || !SOMG_ADDRESS || !USDC_ADDRESS) {
        throw new Error("Missing env: AMM_ADDRESS, SOMG_ADDRESS, USDC_ADDRESS");
    }

    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);

    const amm = await ethers.getContractAt("SomniaAMM", AMM_ADDRESS);
    const somg = new ethers.Contract(SOMG_ADDRESS, ERC20_ABI, deployer);
    const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, deployer);

    const [somgSym, somgDec] = await Promise.all([
        somg.symbol(),
        somg.decimals(),
    ]);
    const [usdcSym, usdcDec] = await Promise.all([
        usdc.symbol(),
        usdc.decimals(),
    ]);
    console.log(`SOMG: ${somgSym} (decimals ${somgDec})`);
    console.log(`USDC: ${usdcSym} (decimals ${usdcDec})`);

    // Whitelist tokens (owner only)
    console.log("Whitelisting tokens...");
    await (await amm.whitelistToken(SOMG_ADDRESS)).wait();
    await (await amm.whitelistToken(USDC_ADDRESS)).wait();

    // Create pool (idempotent: will revert if exists)
    console.log("Creating SOMG/USDC pool (if not exists)...");
    try {
        await (await amm.createPool(SOMG_ADDRESS, USDC_ADDRESS)).wait();
    } catch (e) {
        if (!String(e).includes("POOL_EXISTS")) throw e;
        console.log("Pool already exists.");
    }

    // Seed liquidity
    const somgSeed = ethers.parseUnits(String(SOMG_SEED), somgDec);
    const usdcSeed = ethers.parseUnits(String(USDC_SEED), usdcDec);
    console.log(`Adding liquidity: ${SOMG_SEED} ${somgSym} + ${USDC_SEED} ${usdcSym}`);

    // Approvals
    await approveIfNeeded(somg, deployer.address, AMM_ADDRESS, somgSeed);
    await approveIfNeeded(usdc, deployer.address, AMM_ADDRESS, usdcSeed);

    // amount0Min/amount1Min set to 0 (demo). Consider slippage protection in prod.
    await (
        await amm.addLiquidity(
            SOMG_ADDRESS,
            USDC_ADDRESS,
            somgSeed,
            usdcSeed,
            0n,
            0n
        )
    ).wait();
    console.log("Liquidity added.");

    // Sample swap: USDC -> SOMG
    const swapIn = ethers.parseUnits(String(SWAP_USDC_IN), usdcDec);
    console.log(`Swapping ${SWAP_USDC_IN} ${usdcSym} -> ${somgSym}`);
    await approveIfNeeded(usdc, deployer.address, AMM_ADDRESS, swapIn);
    await (await amm.swap(USDC_ADDRESS, SOMG_ADDRESS, swapIn, 0n)).wait();
    console.log("Swap executed.");

    console.log("Done.");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
