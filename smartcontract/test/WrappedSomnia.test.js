const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WrappedSomnia", function () {
    let owner, user1, user2;
    let wrappedSomnia;
    let initialBalance;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy WrappedSomnia contract
        const WrappedSomnia = await ethers.getContractFactory("WrappedSomnia");
        wrappedSomnia = await WrappedSomnia.deploy();
        await wrappedSomnia.deployed();

        // Get initial balance
        initialBalance = await ethers.provider.getBalance(owner.address);
    });

    describe("Deployment", function () {
        it("should set the correct name and symbol", async function () {
            expect(await wrappedSomnia.name()).to.equal("Wrapped Somnia");
            expect(await wrappedSomnia.symbol()).to.equal("WSOM");
            expect(await wrappedSomnia.decimals()).to.equal(18);
        });

        it("should start with zero total supply", async function () {
            expect(await wrappedSomnia.totalSupply()).to.equal(0);
        });
    });

    describe("Wrapping", function () {
        it("should wrap native SOM to WSOM", async function () {
            const wrapAmount = ethers.utils.parseEther("10");

            const tx = await wrappedSomnia.connect(user1).wrap({ value: wrapAmount });
            const receipt = await tx.wait();

            // Check WSOM balance
            expect(await wrappedSomnia.balanceOf(user1.address)).to.equal(wrapAmount);
            expect(await wrappedSomnia.totalSupply()).to.equal(wrapAmount);

            // Check event emission
            const event = receipt.events?.find(e => e.event === "Wrapped");
            expect(event).to.not.be.undefined;
            expect(event.args.user).to.equal(user1.address);
            expect(event.args.amount).to.equal(wrapAmount);
        });

        it("should reject wrapping with zero value", async function () {
            await expect(
                wrappedSomnia.connect(user1).wrap({ value: 0 })
            ).to.be.revertedWith("Must send SOM to wrap");
        });

        it("should handle multiple wraps from same user", async function () {
            const wrapAmount1 = ethers.utils.parseEther("5");
            const wrapAmount2 = ethers.utils.parseEther("3");

            await wrappedSomnia.connect(user1).wrap({ value: wrapAmount1 });
            await wrappedSomnia.connect(user1).wrap({ value: wrapAmount2 });

            const totalWrapped = wrapAmount1.add(wrapAmount2);
            expect(await wrappedSomnia.balanceOf(user1.address)).to.equal(totalWrapped);
            expect(await wrappedSomnia.totalSupply()).to.equal(totalWrapped);
        });
    });

    describe("Unwrapping", function () {
        beforeEach(async function () {
            // Wrap some SOM first
            const wrapAmount = ethers.utils.parseEther("10");
            await wrappedSomnia.connect(user1).wrap({ value: wrapAmount });
        });

        it("should unwrap WSOM to native SOM", async function () {
            const unwrapAmount = ethers.utils.parseEther("5");
            const initialBalance = await ethers.provider.getBalance(user1.address);

            const tx = await wrappedSomnia.connect(user1).unwrap(unwrapAmount);
            const receipt = await tx.wait();

            // Check WSOM balance decreased
            expect(await wrappedSomnia.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("5"));
            expect(await wrappedSomnia.totalSupply()).to.equal(ethers.utils.parseEther("5"));

            // Check event emission
            const event = receipt.events?.find(e => e.event === "Unwrapped");
            expect(event).to.not.be.undefined;
            expect(event.args.user).to.equal(user1.address);
            expect(event.args.amount).to.equal(unwrapAmount);
        });

        it("should reject unwrapping with zero amount", async function () {
            await expect(
                wrappedSomnia.connect(user1).unwrap(0)
            ).to.be.revertedWith("Amount must be greater than 0");
        });

        it("should reject unwrapping more than balance", async function () {
            const tooMuch = ethers.utils.parseEther("15");
            await expect(
                wrappedSomnia.connect(user1).unwrap(tooMuch)
            ).to.be.revertedWith("Insufficient WSOM balance");
        });

        it("should reject unwrapping from user with no balance", async function () {
            const unwrapAmount = ethers.utils.parseEther("1");
            await expect(
                wrappedSomnia.connect(user2).unwrap(unwrapAmount)
            ).to.be.revertedWith("Insufficient WSOM balance");
        });
    });

    describe("Receive Function", function () {
        it("should accept native SOM via receive function", async function () {
            const sendAmount = ethers.utils.parseEther("5");

            // Send SOM directly to contract
            await owner.sendTransaction({
                to: wrappedSomnia.address,
                value: sendAmount
            });

            // Contract should have the SOM but no WSOM should be minted
            expect(await ethers.provider.getBalance(wrappedSomnia.address)).to.equal(sendAmount);
            expect(await wrappedSomnia.totalSupply()).to.equal(0);
        });
    });

    describe("Emergency Withdraw", function () {
        beforeEach(async function () {
            // Send some SOM to contract
            const sendAmount = ethers.utils.parseEther("10");
            await owner.sendTransaction({
                to: wrappedSomnia.address,
                value: sendAmount
            });
        });

        it("should allow emergency withdrawal of native SOM", async function () {
            const initialBalance = await ethers.provider.getBalance(user1.address);
            const contractBalance = await ethers.provider.getBalance(wrappedSomnia.address);

            await wrappedSomnia.connect(user1).emergencyWithdraw();

            // User should receive the SOM
            const finalBalance = await ethers.provider.getBalance(user1.address);
            expect(finalBalance.gt(initialBalance)).to.be.true;

            // Contract should have no SOM
            expect(await ethers.provider.getBalance(wrappedSomnia.address)).to.equal(0);
        });

        it("should reject emergency withdrawal when no SOM available", async function () {
            // First user withdraws all
            await wrappedSomnia.connect(user1).emergencyWithdraw();

            // Second user tries to withdraw
            await expect(
                wrappedSomnia.connect(user2).emergencyWithdraw()
            ).to.be.revertedWith("No native SOM to withdraw");
        });
    });

    describe("Integration Tests", function () {
        it("should handle wrap and unwrap cycle correctly", async function () {
            const wrapAmount = ethers.utils.parseEther("10");

            // Wrap
            await wrappedSomnia.connect(user1).wrap({ value: wrapAmount });
            expect(await wrappedSomnia.balanceOf(user1.address)).to.equal(wrapAmount);

            // Unwrap half
            const unwrapAmount = ethers.utils.parseEther("5");
            await wrappedSomnia.connect(user1).unwrap(unwrapAmount);

            // Check final balances
            expect(await wrappedSomnia.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("5"));
            expect(await wrappedSomnia.totalSupply()).to.equal(ethers.utils.parseEther("5"));
        });

        it("should handle multiple users wrapping and unwrapping", async function () {
            const amount1 = ethers.utils.parseEther("5");
            const amount2 = ethers.utils.parseEther("3");

            // User1 wraps
            await wrappedSomnia.connect(user1).wrap({ value: amount1 });

            // User2 wraps
            await wrappedSomnia.connect(user2).wrap({ value: amount2 });

            // Check total supply
            expect(await wrappedSomnia.totalSupply()).to.equal(amount1.add(amount2));

            // User1 unwraps
            await wrappedSomnia.connect(user1).unwrap(amount1);

            // Check balances
            expect(await wrappedSomnia.balanceOf(user1.address)).to.equal(0);
            expect(await wrappedSomnia.balanceOf(user2.address)).to.equal(amount2);
            expect(await wrappedSomnia.totalSupply()).to.equal(amount2);
        });
    });
});
