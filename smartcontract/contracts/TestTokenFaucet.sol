// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./SomniaToken.sol";
import "./USDCToken.sol";
import "./SomniaGovernanceToken.sol";

contract TestTokenFaucet is Ownable, ReentrancyGuard, Pausable {
    // Token contracts
    SomniaToken public somToken;
    USDCToken public usdcToken;
    SomniaGovernanceToken public somgToken;
    
    // Faucet limits
    uint256 public constant SOM_FAUCET_AMOUNT = 1000 * 10**18; // 1000 SOM
    uint256 public constant USDC_FAUCET_AMOUNT = 1000 * 10**6; // 1000 USDC
    uint256 public constant SOMG_FAUCET_AMOUNT = 100 * 10**18; // 100 SOMG
    
    // Cooldown period (24 hours)
    uint256 public constant COOLDOWN_PERIOD = 24 hours;
    
    // User cooldown tracking
    mapping(address => uint256) public lastClaimTime;
    
    // Events
    event TokensClaimed(address indexed user, uint256 somAmount, uint256 usdcAmount, uint256 somgAmount);
    event FaucetPaused(address indexed by);
    event FaucetUnpaused(address indexed by);
    
    constructor(
        address _somToken,
        address _usdcToken,
        address _somgToken,
        address initialOwner
    ) Ownable(initialOwner) {
        somToken = SomniaToken(_somToken);
        usdcToken = USDCToken(_usdcToken);
        somgToken = SomniaGovernanceToken(_somgToken);
    }
    
    // Main faucet function - claim all tokens
    function claimTokens() public whenNotPaused nonReentrant {
        require(canClaim(msg.sender), "Cooldown period not finished");
        
        // Update last claim time
        lastClaimTime[msg.sender] = block.timestamp;
        
        // Mint tokens to user
        somToken.mint(msg.sender, SOM_FAUCET_AMOUNT, "Faucet Claim");
        usdcToken.mint(msg.sender, USDC_FAUCET_AMOUNT, "Faucet Claim");
        somgToken.mint(msg.sender, SOMG_FAUCET_AMOUNT, "Faucet Claim");
        
        emit TokensClaimed(msg.sender, SOM_FAUCET_AMOUNT, USDC_FAUCET_AMOUNT, SOMG_FAUCET_AMOUNT);
    }
    
    // Claim specific token
    function claimSOM() public whenNotPaused nonReentrant {
        require(canClaim(msg.sender), "Cooldown period not finished");
        lastClaimTime[msg.sender] = block.timestamp;
        somToken.mint(msg.sender, SOM_FAUCET_AMOUNT, "Faucet Claim");
    }
    
    function claimUSDC() public whenNotPaused nonReentrant {
        require(canClaim(msg.sender), "Cooldown period not finished");
        lastClaimTime[msg.sender] = block.timestamp;
        usdcToken.mint(msg.sender, USDC_FAUCET_AMOUNT, "Faucet Claim");
    }
    
    function claimSOMG() public whenNotPaused nonReentrant {
        require(canClaim(msg.sender), "Cooldown period not finished");
        lastClaimTime[msg.sender] = block.timestamp;
        somgToken.mint(msg.sender, SOMG_FAUCET_AMOUNT, "Faucet Claim");
    }
    
    // Check if user can claim
    function canClaim(address user) public view returns (bool) {
        if (lastClaimTime[user] == 0) return true;
        return block.timestamp >= lastClaimTime[user] + COOLDOWN_PERIOD;
    }
    
    // Get time until next claim
    function getTimeUntilNextClaim(address user) public view returns (uint256) {
        if (lastClaimTime[user] == 0) return 0;
        if (canClaim(user)) return 0;
        return lastClaimTime[user] + COOLDOWN_PERIOD - block.timestamp;
    }
    
    // Get user's claim status
    function getUserClaimStatus(address user) public view returns (
        bool canClaimNow,
        uint256 timeUntilNextClaim,
        uint256 lastClaim
    ) {
        canClaimNow = canClaim(user);
        timeUntilNextClaim = getTimeUntilNextClaim(user);
        lastClaim = lastClaimTime[user];
    }
    
    // Admin functions
    function pause() public onlyOwner {
        _pause();
        emit FaucetPaused(msg.sender);
    }
    
    function unpause() public onlyOwner {
        _unpause();
        emit FaucetUnpaused(msg.sender);
    }
    
    // Emergency function to recover stuck tokens
    function emergencyWithdraw() public onlyOwner {
        // This would be used in emergencies to recover tokens
        // For now, just a placeholder
    }
} 