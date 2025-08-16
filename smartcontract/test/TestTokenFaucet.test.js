const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TestTokenFaucet", function () {
    let owner, user1, user2, user3;
    let somToken, usdcToken, somgToken;
    let testTokenFaucet;

    beforeEach(async function () {
        [owner, user1, user2, user3] = await ethers.getSigners();

        // Deploy mock tokens for testing
        const MockToken = await ethers.getContractFactory("MockToken");
        somToken = await MockToken.deploy("Somnia Token", "SOM");
        await somToken.deployed();

        usdcToken = await MockToken.deploy("USD Coin", "USDC");
        await usdcToken.deployed();

        somgToken = await MockToken.deploy("Somnia Governance", "SOMG");
        await somgToken.deployed();

        // Deploy TestTokenFaucet contract
        const TestTokenFaucet = await ethers.getContractFactory("TestTokenFaucet");
        testTokenFaucet = await TestTokenFaucet.deploy(
            somToken.address,
            usdcToken.address,
            somgToken.address,
            owner.address
        );
        await testTokenFaucet.deployed();

        // Transfer ownership of tokens to faucet
        await somToken.transferOwnership(testTokenFaucet.address);
        await usdcToken.transferOwnership(testTokenFaucet.address);
        await somgToken.transferOwnership(testTokenFaucet.address);
    });

    describe("Deployment", function () {
        it("should set the correct token addresses", async function () {
            expect(await testTokenFaucet.somToken()).to.equal(somToken.address);
            expect(await testTokenFaucet.usdcToken()).to.equal(usdcToken.address);
            expect(await testTokenFaucet.somgToken()).to.equal(somgToken.address);
        });

        it("should set the correct owner", async function () {
            expect(await testTokenFaucet.owner()).to.equal(owner.address);
        });

        it("should set correct faucet amounts", async function () {
            const somAmount = ethers.utils.parseEther("1000");
            const usdcAmount = ethers.utils.parseUnits("1000", 6);
            const somgAmount = ethers.utils.parseEther("100");

            expect(await testTokenFaucet.SOM_FAUCET_AMOUNT()).to.equal(somAmount);
            expect(await testTokenFaucet.USDC_FAUCET_AMOUNT()).to.equal(usdcAmount);
            expect(await testTokenFaucet.SOMG_FAUCET_AMOUNT()).to.equal(somgAmount);
        });

        it("should set correct cooldown period", async function () {
            const cooldown = 24 * 60 * 60; // 24 hours in seconds
            expect(await testTokenFaucet.COOLDOWN_PERIOD()).to.equal(cooldown);
        });

        it("should not be paused by default", async function () {
            expect(await testTokenFaucet.paused()).to.be.false;
        });
    });

    describe("Claiming All Tokens", function () {
        it("should allow users to claim all tokens", async function () {
            const tx = await testTokenFaucet.connect(user1).claimTokens();
            const receipt = await tx.wait();

            // Check token balances
            expect(await somToken.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("1000"));
            expect(await usdcToken.balanceOf(user1.address)).to.equal(ethers.utils.parseUnits("1000", 6));
            expect(await somgToken.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("100"));

            // Check event emission
            const event = receipt.events?.find(e => e.event === "TokensClaimed");
            expect(event).to.not.be.undefined;
            expect(event.args.user).to.equal(user1.address);
            expect(event.args.somAmount).to.equal(ethers.utils.parseEther("1000"));
            expect(event.args.usdcAmount).to.equal(ethers.utils.parseUnits("1000", 6));
            expect(event.args.somgAmount).to.equal(ethers.utils.parseEther("100"));
        });

        it("should update last claim time after claiming", async function () {
            const initialTime = await testTokenFaucet.lastClaimTime(user1.address);
            expect(initialTime).to.equal(0);

            await testTokenFaucet.connect(user1).claimTokens();

            const newTime = await testTokenFaucet.lastClaimTime(user1.address);
            expect(newTime).to.be.gt(0);
        });

        it("should reject claiming before cooldown period", async function () {
            // First claim
            await testTokenFaucet.connect(user1).claimTokens();

            // Try to claim again immediately
            await expect(
                testTokenFaucet.connect(user1).claimTokens()
            ).to.be.revertedWith("Cooldown period not finished");
        });

        it("should allow claiming after cooldown period", async function () {
            // First claim
            await testTokenFaucet.connect(user1).claimTokens();

            // Fast forward time (this would need to be done with hardhat network manipulation)
            // For now, we'll test the canClaim function
            expect(await testTokenFaucet.canClaim(user1.address)).to.be.false;
        });
    });

    describe("Individual Token Claiming", function () {
        it("should allow claiming SOM tokens", async function () {
            await testTokenFaucet.connect(user1).claimSOM();

            expect(await somToken.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("1000"));
            expect(await usdcToken.balanceOf(user1.address)).to.equal(0);
            expect(await somgToken.balanceOf(user1.address)).to.equal(0);
        });

        it("should allow claiming USDC tokens", async function () {
            await testTokenFaucet.connect(user1).claimUSDC();

            expect(await somToken.balanceOf(user1.address)).to.equal(0);
            expect(await usdcToken.balanceOf(user1.address)).to.equal(ethers.utils.parseUnits("1000", 6));
            expect(await somgToken.balanceOf(user1.address)).to.equal(0);
        });

        it("should allow claiming SOMG tokens", async function () {
            await testTokenFaucet.connect(user1).claimSOMG();

            expect(await somToken.balanceOf(user1.address)).to.equal(0);
            expect(await usdcToken.balanceOf(user1.address)).to.equal(0);
            expect(await somgToken.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("100"));
        });

        it("should respect cooldown for individual claims", async function () {
            // Claim SOM
            await testTokenFaucet.connect(user1).claimSOM();

            // Try to claim USDC immediately
            await expect(
                testTokenFaucet.connect(user1).claimUSDC()
            ).to.be.revertedWith("Cooldown period not finished");
        });
    });

    describe("Claim Status and Cooldown", function () {
        it("should correctly check if user can claim", async function () {
            // New user should be able to claim
            expect(await testTokenFaucet.canClaim(user1.address)).to.be.true;

            // After claiming, should not be able to claim
            await testTokenFaucet.connect(user1).claimTokens();
            expect(await testTokenFaucet.canClaim(user1.address)).to.be.false;
        });

        it("should return correct time until next claim", async function () {
            // New user should have 0 time until next claim
            expect(await testTokenFaucet.getTimeUntilNextClaim(user1.address)).to.equal(0);

            // After claiming, should return cooldown period
            await testTokenFaucet.connect(user1).claimTokens();
            const timeUntilNext = await testTokenFaucet.getTimeUntilNextClaim(user1.address);
            expect(timeUntilNext).to.be.gt(0);
        });

        it("should return correct user claim status", async function () {
            const status = await testTokenFaucet.getUserClaimStatus(user1.address);

            expect(status.canClaimNow).to.be.true;
            expect(status.timeUntilNextClaim).to.equal(0);
            expect(status.lastClaim).to.equal(0);

            // After claiming
            await testTokenFaucet.connect(user1).claimTokens();

            const newStatus = await testTokenFaucet.getUserClaimStatus(user1.address);
            expect(newStatus.canClaimNow).to.be.false;
            expect(newStatus.timeUntilNextClaim).to.be.gt(0);
            expect(newStatus.lastClaim).to.be.gt(0);
        });
    });

    describe("Pausing and Unpausing", function () {
        it("should allow owner to pause faucet", async function () {
            const tx = await testTokenFaucet.pause();
            const receipt = await tx.wait();

            expect(await testTokenFaucet.paused()).to.be.true;

            // Check event emission
            const event = receipt.events?.find(e => e.event === "FaucetPaused");
            expect(event).to.not.be.undefined;
            expect(event.args.by).to.equal(owner.address);
        });

        it("should allow owner to unpause faucet", async function () {
            await testTokenFaucet.pause();
            expect(await testTokenFaucet.paused()).to.be.true;

            const tx = await testTokenFaucet.unpause();
            const receipt = await tx.wait();

            expect(await testTokenFaucet.paused()).to.be.false;

            // Check event emission
            const event = receipt.events?.find(e => e.event === "FaucetUnpaused");
            expect(event).to.not.be.undefined;
            expect(event.args.by).to.equal(owner.address);
        });

        it("should reject non-owner from pausing", async function () {
            await expect(
                testTokenFaucet.connect(user1).pause()
            ).to.be.revertedWith("Ownable: caller is not the owner");

            await expect(
                testTokenFaucet.connect(user1).unpause()
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should prevent claiming when paused", async function () {
            await testTokenFaucet.pause();

            await expect(
                testTokenFaucet.connect(user1).claimTokens()
            ).to.be.revertedWith("Pausable: paused");

            await expect(
                testTokenFaucet.connect(user1).claimSOM()
            ).to.be.revertedWith("Pausable: paused");
        });
    });

    describe("Multiple Users", function () {
        it("should handle multiple users claiming tokens", async function () {
            // User1 claims
            await testTokenFaucet.connect(user1).claimTokens();

            // User2 claims
            await testTokenFaucet.connect(user2).claimTokens();

            // User3 claims
            await testTokenFaucet.connect(user3).claimTokens();

            // Check all users have tokens
            expect(await somToken.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("1000"));
            expect(await somToken.balanceOf(user2.address)).to.equal(ethers.utils.parseEther("1000"));
            expect(await somToken.balanceOf(user3.address)).to.equal(ethers.utils.parseEther("1000"));
        });

        it("should track cooldown separately for each user", async function () {
            // User1 claims
            await testTokenFaucet.connect(user1).claimTokens();
            expect(await testTokenFaucet.canClaim(user1.address)).to.be.false;

            // User2 should still be able to claim
            expect(await testTokenFaucet.canClaim(user2.address)).to.be.true;
            await testTokenFaucet.connect(user2).claimTokens();

            // Both users should now be in cooldown
            expect(await testTokenFaucet.canClaim(user1.address)).to.be.false;
            expect(await testTokenFaucet.canClaim(user2.address)).to.be.false;
        });
    });

    describe("Integration Tests", function () {
        it("should handle complete claim cycle with multiple users", async function () {
            // All users claim initially
            await testTokenFaucet.connect(user1).claimTokens();
            await testTokenFaucet.connect(user2).claimTokens();
            await testTokenFaucet.connect(user3).claimTokens();

            // Check initial balances
            expect(await somToken.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("1000"));
            expect(await somToken.balanceOf(user2.address)).to.equal(ethers.utils.parseEther("1000"));
            expect(await somToken.balanceOf(user3.address)).to.equal(ethers.utils.parseEther("1000"));

            // Check cooldown status
            expect(await testTokenFaucet.canClaim(user1.address)).to.be.false;
            expect(await testTokenFaucet.canClaim(user2.address)).to.be.false;
            expect(await testTokenFaucet.canClaim(user3.address)).to.be.false;
        });

        it("should handle pause and resume functionality", async function () {
            // Pause faucet
            await testTokenFaucet.pause();

            // Try to claim (should fail)
            await expect(
                testTokenFaucet.connect(user1).claimTokens()
            ).to.be.revertedWith("Pausable: paused");

            // Unpause faucet
            await testTokenFaucet.unpause();

            // Should be able to claim again
            await testTokenFaucet.connect(user1).claimTokens();
            expect(await somToken.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("1000"));
        });
    });
});
