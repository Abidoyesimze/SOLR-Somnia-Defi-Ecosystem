const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("USDCToken", function () {
  let owner, user1, user2, authorizedMinter;
  let usdcToken;
  let initialSupply;

  beforeEach(async function () {
    [owner, user1, user2, authorizedMinter] = await ethers.getSigners();
    
    // Deploy USDCToken contract
    const USDCToken = await ethers.getContractFactory("USDCToken");
    usdcToken = await USDCToken.deploy(owner.address);
    await usdcToken.deployed();
    
    initialSupply = ethers.utils.parseUnits("1000000", 6); // 1M USDC
  });

  describe("Deployment", function () {
    it("should set the correct name, symbol, and decimals", async function () {
      expect(await usdcToken.name()).to.equal("USD Coin");
      expect(await usdcToken.symbol()).to.equal("USDC");
      expect(await usdcToken.decimals()).to.equal(6);
    });

    it("should set the correct initial supply", async function () {
      expect(await usdcToken.totalSupply()).to.equal(initialSupply);
      expect(await usdcToken.balanceOf(owner.address)).to.equal(initialSupply);
    });

    it("should set the correct max supply", async function () {
      const maxSupply = ethers.utils.parseUnits("1000000000", 6); // 1B USDC
      expect(await usdcToken.maxSupply()).to.equal(maxSupply);
    });

    it("should enable minting by default", async function () {
      expect(await usdcToken.mintingEnabled()).to.be.true;
    });

    it("should authorize owner as minter", async function () {
      expect(await usdcToken.authorizedMinters(owner.address)).to.be.true;
    });
  });

  describe("Minting", function () {
    it("should allow owner to mint tokens", async function () {
      const mintAmount = ethers.utils.parseUnits("1000", 6);
      const initialBalance = await usdcToken.balanceOf(user1.address);
      
      const tx = await usdcToken.mint(user1.address, mintAmount, "Test mint");
      const receipt = await tx.wait();
      
      // Check balance increased
      expect(await usdcToken.balanceOf(user1.address)).to.equal(initialBalance.add(mintAmount));
      
      // Check event emission
      const event = receipt.events?.find(e => e.event === "StablecoinMinted");
      expect(event).to.not.be.undefined;
      expect(event.args.to).to.equal(user1.address);
      expect(event.args.amount).to.equal(mintAmount);
      expect(event.args.reason).to.equal("Test mint");
    });

    it("should allow authorized minter to mint tokens", async function () {
      // Add authorized minter
      await usdcToken.addAuthorizedMinter(authorizedMinter.address);
      
      const mintAmount = ethers.utils.parseUnits("500", 6);
      const tx = await usdcToken.connect(authorizedMinter).mint(user1.address, mintAmount, "Authorized mint");
      
      expect(await usdcToken.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("should reject minting from unauthorized address", async function () {
      const mintAmount = ethers.utils.parseUnits("1000", 6);
      
      await expect(
        usdcToken.connect(user1).mint(user2.address, mintAmount, "Unauthorized mint")
      ).to.be.revertedWith("Not authorized to mint");
    });

    it("should reject minting when minting is disabled", async function () {
      // Disable minting
      await usdcToken.toggleMinting();
      
      const mintAmount = ethers.utils.parseUnits("1000", 6);
      await expect(
        usdcToken.mint(user1.address, mintAmount, "Disabled mint")
      ).to.be.revertedWith("Minting is disabled");
    });

    it("should reject minting to zero address", async function () {
      const mintAmount = ethers.utils.parseUnits("1000", 6);
      
      await expect(
        usdcToken.mint(ethers.constants.AddressZero, mintAmount, "Zero address mint")
      ).to.be.revertedWith("Cannot mint to zero address");
    });

    it("should reject minting that exceeds max supply", async function () {
      const maxSupply = await usdcToken.maxSupply();
      const currentSupply = await usdcToken.totalSupply();
      const tooMuch = maxSupply.sub(currentSupply).add(1);
      
      await expect(
        usdcToken.mint(user1.address, tooMuch, "Exceeds max supply")
      ).to.be.revertedWith("Exceeds max supply");
    });
  });

  describe("Mint for Swap", function () {
    it("should allow authorized minter to mint for swap", async function () {
      await usdcToken.addAuthorizedMinter(authorizedMinter.address);
      
      const mintAmount = ethers.utils.parseUnits("1000", 6);
      const tx = await usdcToken.connect(authorizedMinter).mintForSwap(user1.address, mintAmount);
      
      expect(await usdcToken.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("should reject mint for swap from unauthorized address", async function () {
      const mintAmount = ethers.utils.parseUnits("1000", 6);
      
      await expect(
        usdcToken.connect(user1).mintForSwap(user2.address, mintAmount)
      ).to.be.revertedWith("Not authorized to mint");
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      // Mint some tokens to user1
      const mintAmount = ethers.utils.parseUnits("1000", 6);
      await usdcToken.mint(user1.address, mintAmount, "Test mint");
    });

    it("should allow users to burn their own tokens", async function () {
      const burnAmount = ethers.utils.parseUnits("500", 6);
      const initialBalance = await usdcToken.balanceOf(user1.address);
      
      await usdcToken.connect(user1).burn(burnAmount);
      
      expect(await usdcToken.balanceOf(user1.address)).to.equal(initialBalance.sub(burnAmount));
    });

    it("should allow burning from other address with allowance", async function () {
      const burnAmount = ethers.utils.parseUnits("500", 6);
      
      // Approve user2 to burn user1's tokens
      await usdcToken.connect(user1).approve(user2.address, burnAmount);
      
      await usdcToken.connect(user2).burnFrom(user1.address, burnAmount);
      
      expect(await usdcToken.balanceOf(user1.address)).to.equal(ethers.utils.parseUnits("500", 6));
    });

    it("should reject burning more than balance", async function () {
      const tooMuch = ethers.utils.parseUnits("2000", 6);
      
      await expect(
        usdcToken.connect(user1).burn(tooMuch)
      ).to.be.revertedWith("ERC20: burn amount exceeds balance");
    });
  });

  describe("Authorized Minters Management", function () {
    it("should allow owner to add authorized minter", async function () {
      const tx = await usdcToken.addAuthorizedMinter(authorizedMinter.address);
      const receipt = await tx.wait();
      
      expect(await usdcToken.authorizedMinters(authorizedMinter.address)).to.be.true;
      
      // Check event emission
      const event = receipt.events?.find(e => e.event === "AuthorizedMinterUpdated");
      expect(event).to.not.be.undefined;
      expect(event.args.minter).to.equal(authorizedMinter.address);
      expect(event.args.authorized).to.be.true;
    });

    it("should allow owner to remove authorized minter", async function () {
      // Add first
      await usdcToken.addAuthorizedMinter(authorizedMinter.address);
      expect(await usdcToken.authorizedMinters(authorizedMinter.address)).to.be.true;
      
      // Remove
      const tx = await usdcToken.removeAuthorizedMinter(authorizedMinter.address);
      const receipt = await tx.wait();
      
      expect(await usdcToken.authorizedMinters(authorizedMinter.address)).to.be.false;
      
      // Check event emission
      const event = receipt.events?.find(e => e.event === "AuthorizedMinterUpdated");
      expect(event).to.not.be.undefined;
      expect(event.args.minter).to.equal(authorizedMinter.address);
      expect(event.args.authorized).to.be.false;
    });

    it("should reject non-owner from managing authorized minters", async function () {
      await expect(
        usdcToken.connect(user1).addAuthorizedMinter(authorizedMinter.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      
      await expect(
        usdcToken.connect(user1).removeAuthorizedMinter(authorizedMinter.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Minting Control", function () {
    it("should allow owner to toggle minting", async function () {
      expect(await usdcToken.mintingEnabled()).to.be.true;
      
      await usdcToken.toggleMinting();
      expect(await usdcToken.mintingEnabled()).to.be.false;
      
      await usdcToken.toggleMinting();
      expect(await usdcToken.mintingEnabled()).to.be.true;
    });

    it("should reject non-owner from toggling minting", async function () {
      await expect(
        usdcToken.connect(user1).toggleMinting()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Max Supply Management", function () {
    it("should allow owner to update max supply", async function () {
      const newMaxSupply = ethers.utils.parseUnits("2000000000", 6); // 2B USDC
      
      const tx = await usdcToken.updateMaxSupply(newMaxSupply);
      const receipt = await tx.wait();
      
      expect(await usdcToken.maxSupply()).to.equal(newMaxSupply);
      
      // Check event emission
      const event = receipt.events?.find(e => e.event === "MaxSupplyUpdated");
      expect(event).to.not.be.undefined;
      expect(event.args.newMaxSupply).to.equal(newMaxSupply);
    });

    it("should reject setting max supply below current supply", async function () {
      const currentSupply = await usdcToken.totalSupply();
      const tooLow = currentSupply.sub(1);
      
      await expect(
        usdcToken.updateMaxSupply(tooLow)
      ).to.be.revertedWith("New max supply too low");
    });

    it("should reject non-owner from updating max supply", async function () {
      const newMaxSupply = ethers.utils.parseUnits("2000000000", 6);
      
      await expect(
        usdcToken.connect(user1).updateMaxSupply(newMaxSupply)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Pausing", function () {
    it("should allow owner to pause and unpause", async function () {
      expect(await usdcToken.paused()).to.be.false;
      
      await usdcToken.pause();
      expect(await usdcToken.paused()).to.be.true;
      
      await usdcToken.unpause();
      expect(await usdcToken.paused()).to.be.false;
    });

    it("should reject non-owner from pausing", async function () {
      await expect(
        usdcToken.connect(user1).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
      
      await expect(
        usdcToken.connect(user1).unpause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should prevent transfers when paused", async function () {
      // Mint tokens to user1
      const mintAmount = ethers.utils.parseUnits("1000", 6);
      await usdcToken.mint(user1.address, mintAmount, "Test mint");
      
      // Pause contract
      await usdcToken.pause();
      
      // Try to transfer
      await expect(
        usdcToken.connect(user1).transfer(user2.address, ethers.utils.parseUnits("100", 6))
      ).to.be.revertedWith("Token transfer paused");
    });
  });

  describe("Integration Tests", function () {
    it("should handle complete mint-burn cycle", async function () {
      const mintAmount = ethers.utils.parseUnits("1000", 6);
      
      // Mint
      await usdcToken.mint(user1.address, mintAmount, "Test mint");
      expect(await usdcToken.balanceOf(user1.address)).to.equal(mintAmount);
      
      // Burn half
      const burnAmount = ethers.utils.parseUnits("500", 6);
      await usdcToken.connect(user1).burn(burnAmount);
      
      // Check final balance
      expect(await usdcToken.balanceOf(user1.address)).to.equal(ethers.utils.parseUnits("500", 6));
    });

    it("should handle multiple authorized minters", async function () {
      // Add multiple authorized minters
      await usdcToken.addAuthorizedMinter(user1.address);
      await usdcToken.addAuthorizedMinter(user2.address);
      
      // Each can mint
      const mintAmount = ethers.utils.parseUnits("100", 6);
      await usdcToken.connect(user1).mint(user1.address, mintAmount, "User1 mint");
      await usdcToken.connect(user2).mint(user2.address, mintAmount, "User2 mint");
      
      expect(await usdcToken.balanceOf(user1.address)).to.equal(mintAmount);
      expect(await usdcToken.balanceOf(user2.address)).to.equal(mintAmount);
    });
  });
});
