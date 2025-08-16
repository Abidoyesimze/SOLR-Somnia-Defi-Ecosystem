const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SomniaLPToken", function () {
    let owner, user1, user2, authorizedMinter;
    let somniaLPToken;

    beforeEach(async function () {
        [owner, user1, user2, authorizedMinter] = await ethers.getSigners();

        // Deploy SomniaLPToken contract
        const SomniaLPToken = await ethers.getContractFactory("SomniaLPToken");
        somniaLPToken = await SomniaLPToken.deploy(owner.address);
        await somniaLPToken.deployed();
    });

    describe("Deployment", function () {
        it("should set the correct name, symbol, and decimals", async function () {
            expect(await somniaLPToken.name()).to.equal("Somnia LP Token");
            expect(await somniaLPToken.symbol()).to.equal("SOM-LP");
            expect(await somniaLPToken.decimals()).to.equal(18);
        });

        it("should set the correct owner", async function () {
            expect(await somniaLPToken.owner()).to.equal(owner.address);
        });

        it("should start with zero total supply", async function () {
            expect(await somniaLPToken.totalSupply()).to.equal(0);
        });

        it("should not be paused by default", async function () {
            expect(await somniaLPToken.paused()).to.be.false;
        });
    });

    describe("Minting", function () {
        beforeEach(async function () {
            // Add authorized minter
            await somniaLPToken.addAuthorizedMinter(authorizedMinter.address);
        });

        it("should allow authorized minter to mint tokens", async function () {
            const mintAmount = ethers.utils.parseEther("1000");
            const poolName = "SOM-USDC";

            const tx = await somniaLPToken.connect(authorizedMinter).mint(user1.address, mintAmount, poolName);
            const receipt = await tx.wait();

            // Check balance increased
            expect(await somniaLPToken.balanceOf(user1.address)).to.equal(mintAmount);
            expect(await somniaLPToken.totalSupply()).to.equal(mintAmount);

            // Check event emission
            const event = receipt.events?.find(e => e.event === "LPTokenMinted");
            expect(event).to.not.be.undefined;
            expect(event.args.to).to.equal(user1.address);
            expect(event.args.amount).to.equal(mintAmount);
            expect(event.args.pool).to.equal(poolName);
        });

        it("should allow owner to mint tokens", async function () {
            const mintAmount = ethers.utils.parseEther("500");
            const poolName = "SOM-ETH";

            await somniaLPToken.mint(user1.address, mintAmount, poolName);

            expect(await somniaLPToken.balanceOf(user1.address)).to.equal(mintAmount);
        });

        it("should reject minting from unauthorized address", async function () {
            const mintAmount = ethers.utils.parseEther("1000");
            const poolName = "SOM-USDC";

            await expect(
                somniaLPToken.connect(user1).mint(user2.address, mintAmount, poolName)
            ).to.be.revertedWith("Not authorized to mint/burn");
        });

        it("should reject minting to zero address", async function () {
            const mintAmount = ethers.utils.parseEther("1000");
            const poolName = "SOM-USDC";

            await expect(
                somniaLPToken.connect(authorizedMinter).mint(ethers.constants.AddressZero, mintAmount, poolName)
            ).to.be.revertedWith("Cannot mint to zero address");
        });

        it("should reject minting with zero amount", async function () {
            const poolName = "SOM-USDC";

            await expect(
                somniaLPToken.connect(authorizedMinter).mint(user1.address, 0, poolName)
            ).to.be.revertedWith("Amount must be greater than 0");
        });

        it("should handle multiple mints to same user", async function () {
            const mintAmount1 = ethers.utils.parseEther("500");
            const mintAmount2 = ethers.utils.parseEther("300");
            const poolName = "SOM-USDC";

            await somniaLPToken.connect(authorizedMinter).mint(user1.address, mintAmount1, poolName);
            await somniaLPToken.connect(authorizedMinter).mint(user1.address, mintAmount2, poolName);

            const totalMinted = mintAmount1.add(mintAmount2);
            expect(await somniaLPToken.balanceOf(user1.address)).to.equal(totalMinted);
            expect(await somniaLPToken.totalSupply()).to.equal(totalMinted);
        });
    });

    describe("Burning", function () {
        beforeEach(async function () {
            // Add authorized minter and mint some tokens
            await somniaLPToken.addAuthorizedMinter(authorizedMinter.address);
            const mintAmount = ethers.utils.parseEther("1000");
            await somniaLPToken.connect(authorizedMinter).mint(user1.address, mintAmount, "SOM-USDC");
        });

        it("should allow authorized minter to burn tokens", async function () {
            const burnAmount = ethers.utils.parseEther("500");
            const poolName = "SOM-USDC";
            const initialBalance = await somniaLPToken.balanceOf(user1.address);

            const tx = await somniaLPToken.connect(authorizedMinter).burn(user1.address, burnAmount, poolName);
            const receipt = await tx.wait();

            // Check balance decreased
            expect(await somniaLPToken.balanceOf(user1.address)).to.equal(initialBalance.sub(burnAmount));
            expect(await somniaLPToken.totalSupply()).to.equal(initialBalance.sub(burnAmount));

            // Check event emission
            const event = receipt.events?.find(e => e.event === "LPTokenBurned");
            expect(event).to.not.be.undefined;
            expect(event.args.from).to.equal(user1.address);
            expect(event.args.amount).to.equal(burnAmount);
            expect(event.args.pool).to.equal(poolName);
        });

        it("should allow owner to burn tokens", async function () {
            const burnAmount = ethers.utils.parseEther("300");
            const poolName = "SOM-USDC";

            await somniaLPToken.burn(user1.address, burnAmount, poolName);

            expect(await somniaLPToken.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("700"));
        });

        it("should reject burning from unauthorized address", async function () {
            const burnAmount = ethers.utils.parseEther("500");
            const poolName = "SOM-USDC";

            await expect(
                somniaLPToken.connect(user1).burn(user2.address, burnAmount, poolName)
            ).to.be.revertedWith("Not authorized to mint/burn");
        });

        it("should reject burning from zero address", async function () {
            const burnAmount = ethers.utils.parseEther("500");
            const poolName = "SOM-USDC";

            await expect(
                somniaLPToken.connect(authorizedMinter).burn(ethers.constants.AddressZero, burnAmount, poolName)
            ).to.be.revertedWith("Cannot burn from zero address");
        });

        it("should reject burning with zero amount", async function () {
            const poolName = "SOM-USDC";

            await expect(
                somniaLPToken.connect(authorizedMinter).burn(user1.address, 0, poolName)
            ).to.be.revertedWith("Amount must be greater than 0");
        });

        it("should reject burning more than balance", async function () {
            const tooMuch = ethers.utils.parseEther("1500");
            const poolName = "SOM-USDC";

            await expect(
                somniaLPToken.connect(authorizedMinter).burn(user1.address, tooMuch, poolName)
            ).to.be.revertedWith("ERC20: burn amount exceeds balance");
        });
    });

    describe("Authorized Minters Management", function () {
        it("should allow owner to add authorized minter", async function () {
            const tx = await somniaLPToken.addAuthorizedMinter(authorizedMinter.address);
            const receipt = await tx.wait();

            expect(await somniaLPToken.authorizedMinters(authorizedMinter.address)).to.be.true;

            // Check event emission
            const event = receipt.events?.find(e => e.event === "AuthorizedMinterUpdated");
            expect(event).to.not.be.undefined;
            expect(event.args.minter).to.equal(authorizedMinter.address);
            expect(event.args.authorized).to.be.true;
        });

        it("should allow owner to remove authorized minter", async function () {
            // Add first
            await somniaLPToken.addAuthorizedMinter(authorizedMinter.address);
            expect(await somniaLPToken.authorizedMinters(authorizedMinter.address)).to.be.true;

            // Remove
            const tx = await somniaLPToken.removeAuthorizedMinter(authorizedMinter.address);
            const receipt = await tx.wait();

            expect(await somniaLPToken.authorizedMinters(authorizedMinter.address)).to.be.false;

            // Check event emission
            const event = receipt.events?.find(e => e.event === "AuthorizedMinterUpdated");
            expect(event).to.not.be.undefined;
            expect(event.args.minter).to.equal(authorizedMinter.address);
            expect(event.args.authorized).to.be.false;
        });

        it("should reject non-owner from managing authorized minters", async function () {
            await expect(
                somniaLPToken.connect(user1).addAuthorizedMinter(authorizedMinter.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");

            await expect(
                somniaLPToken.connect(user1).removeAuthorizedMinter(authorizedMinter.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should handle multiple authorized minters", async function () {
            // Add multiple authorized minters
            await somniaLPToken.addAuthorizedMinter(user1.address);
            await somniaLPToken.addAuthorizedMinter(user2.address);

            expect(await somniaLPToken.authorizedMinters(user1.address)).to.be.true;
            expect(await somniaLPToken.authorizedMinters(user2.address)).to.be.true;

            // Each should be able to mint
            const mintAmount = ethers.utils.parseEther("100");
            await somniaLPToken.connect(user1).mint(user1.address, mintAmount, "Pool1");
            await somniaLPToken.connect(user2).mint(user2.address, mintAmount, "Pool2");

            expect(await somniaLPToken.balanceOf(user1.address)).to.equal(mintAmount);
            expect(await somniaLPToken.balanceOf(user2.address)).to.equal(mintAmount);
        });
    });

    describe("Pausing", function () {
        it("should allow owner to pause and unpause", async function () {
            expect(await somniaLPToken.paused()).to.be.false;

            await somniaLPToken.pause();
            expect(await somniaLPToken.paused()).to.be.true;

            await somniaLPToken.unpause();
            expect(await somniaLPToken.paused()).to.be.false;
        });

        it("should reject non-owner from pausing", async function () {
            await expect(
                somniaLPToken.connect(user1).pause()
            ).to.be.revertedWith("Ownable: caller is not the owner");

            await expect(
                somniaLPToken.connect(user1).unpause()
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should prevent minting when paused", async function () {
            // Add authorized minter
            await somniaLPToken.addAuthorizedMinter(authorizedMinter.address);

            // Pause contract
            await somniaLPToken.pause();

            // Try to mint
            const mintAmount = ethers.utils.parseEther("100");
            await expect(
                somniaLPToken.connect(authorizedMinter).mint(user1.address, mintAmount, "Paused mint")
            ).to.be.revertedWith("Pausable: paused");
        });

        it("should prevent burning when paused", async function () {
            // Add authorized minter and mint some tokens
            await somniaLPToken.addAuthorizedMinter(authorizedMinter.address);
            const mintAmount = ethers.utils.parseEther("1000");
            await somniaLPToken.connect(authorizedMinter).mint(user1.address, mintAmount, "SOM-USDC");

            // Pause contract
            await somniaLPToken.pause();

            // Try to burn
            const burnAmount = ethers.utils.parseEther("500");
            await expect(
                somniaLPToken.connect(authorizedMinter).burn(user1.address, burnAmount, "Paused burn")
            ).to.be.revertedWith("Pausable: paused");
        });

        it("should prevent transfers when paused", async function () {
            // Add authorized minter and mint some tokens
            await somniaLPToken.addAuthorizedMinter(authorizedMinter.address);
            const mintAmount = ethers.utils.parseEther("1000");
            await somniaLPToken.connect(authorizedMinter).mint(user1.address, mintAmount, "SOM-USDC");

            // Pause contract
            await somniaLPToken.pause();

            // Try to transfer
            await expect(
                somniaLPToken.connect(user1).transfer(user2.address, ethers.utils.parseEther("100"))
            ).to.be.revertedWith("Token transfer paused");
        });
    });

    describe("Integration Tests", function () {
        beforeEach(async function () {
            // Add authorized minter
            await somniaLPToken.addAuthorizedMinter(authorizedMinter.address);
        });

        it("should handle complete mint-burn cycle", async function () {
            const mintAmount = ethers.utils.parseEther("1000");
            const poolName = "SOM-USDC";

            // Mint
            await somniaLPToken.connect(authorizedMinter).mint(user1.address, mintAmount, poolName);
            expect(await somniaLPToken.balanceOf(user1.address)).to.equal(mintAmount);

            // Burn half
            const burnAmount = ethers.utils.parseEther("500");
            await somniaLPToken.connect(authorizedMinter).burn(user1.address, burnAmount, poolName);

            // Check final balance
            expect(await somniaLPToken.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("500"));
            expect(await somniaLPToken.totalSupply()).to.equal(ethers.utils.parseEther("500"));
        });

        it("should handle multiple pools", async function () {
            const amount1 = ethers.utils.parseEther("500");
            const amount2 = ethers.utils.parseEther("300");

            // Mint for different pools
            await somniaLPToken.connect(authorizedMinter).mint(user1.address, amount1, "SOM-USDC");
            await somniaLPToken.connect(authorizedMinter).mint(user1.address, amount2, "SOM-ETH");

            // Check total balance
            const totalBalance = amount1.add(amount2);
            expect(await somniaLPToken.balanceOf(user1.address)).to.equal(totalBalance);
            expect(await somniaLPToken.totalSupply()).to.equal(totalBalance);
        });

        it("should handle multiple users and pools", async function () {
            const amount1 = ethers.utils.parseEther("400");
            const amount2 = ethers.utils.parseEther("600");

            // Mint for different users and pools
            await somniaLPToken.connect(authorizedMinter).mint(user1.address, amount1, "SOM-USDC");
            await somniaLPToken.connect(authorizedMinter).mint(user2.address, amount2, "SOM-ETH");

            // Check balances
            expect(await somniaLPToken.balanceOf(user1.address)).to.equal(amount1);
            expect(await somniaLPToken.balanceOf(user2.address)).to.equal(amount2);
            expect(await somniaLPToken.totalSupply()).to.equal(amount1.add(amount2));
        });
    });
});
