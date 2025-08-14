const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying mock token for testing...");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // Deploy mock token
    const MockToken = await ethers.getContractFactory("MockToken");
    const mockToken = await MockToken.deploy("Mock Token", "MOCK");
    await mockToken.deployed();

    console.log("✅ MockToken deployed to:", mockToken.address);

    // Get token info
    const name = await mockToken.name();
    const symbol = await mockToken.symbol();
    const decimals = await mockToken.decimals();
    const totalSupply = await mockToken.totalSupply();

    console.log("Token Info:");
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Decimals:", decimals);
    console.log("Total Supply:", totalSupply.toString());

    console.log("\n💾 Use this address for testing:");
    console.log(`MOCK_TOKEN_ADDRESS=${mockToken.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
