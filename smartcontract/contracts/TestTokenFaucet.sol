// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./USDCToken.sol";
import "./SomniaGovernanceToken.sol";
import "./TestWrappedSomnia.sol";

contract TestTokenFaucet is Ownable, ReentrancyGuard, Pausable {
    TestWrappedSomnia public wsomToken;
    USDCToken public usdcToken;
    SomniaGovernanceToken public somgToken;
    
    // Faucet amounts (in token decimals)
    uint256 public constant WSOM_FAUCET_AMOUNT = 1000 * 10**18;  // 1000 WSOM
    uint256 public constant USDC_FAUCET_AMOUNT = 1000 * 10**6;   // 1000 USDC (6 decimals)
    uint256 public constant SOMG_FAUCET_AMOUNT = 100 * 10**18;   // 100 SOMG
    
    // Cooldown period: 24 hours
    uint256 public constant COOLDOWN_PERIOD = 24 hours;
    
    // Track last claim time for each user
    mapping(address => uint256) public lastClaimTime;
    
    // Events
    event TokensClaimed(address indexed user, uint256 wsomAmount, uint256 usdcAmount, uint256 somgAmount);
    event FaucetPaused(address indexed by);
    event FaucetUnpaused(address indexed by);
    
    constructor(
        address payable _wsomToken,
        address _usdcToken,
        address _somgToken
    ) Ownable(msg.sender) {
        wsomToken = TestWrappedSomnia(_wsomToken);
        usdcToken = USDCToken(_usdcToken);
        somgToken = SomniaGovernanceToken(_somgToken);
    }
    
    // Check if user can claim tokens
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
    
    // Claim all tokens at once
    function claimTokens() public whenNotPaused nonReentrant {
        require(canClaim(msg.sender), "Cooldown period not finished");
        
        lastClaimTime[msg.sender] = block.timestamp;
        
        wsomToken.mint(msg.sender, WSOM_FAUCET_AMOUNT, "Faucet Claim");
        usdcToken.mint(msg.sender, USDC_FAUCET_AMOUNT, "Faucet Claim");
        somgToken.mint(msg.sender, SOMG_FAUCET_AMOUNT, "Faucet Claim");
        
        emit TokensClaimed(msg.sender, WSOM_FAUCET_AMOUNT, USDC_FAUCET_AMOUNT, SOMG_FAUCET_AMOUNT);
    }
    
    // Claim specific tokens
    function claimWSOM() public whenNotPaused nonReentrant {
        require(canClaim(msg.sender), "Cooldown period not finished");
        
        lastClaimTime[msg.sender] = block.timestamp;
        wsomToken.mint(msg.sender, WSOM_FAUCET_AMOUNT, "Faucet Claim");
        
        emit TokensClaimed(msg.sender, WSOM_FAUCET_AMOUNT, 0, 0);
    }
    
    function claimUSDC() public whenNotPaused nonReentrant {
        require(canClaim(msg.sender), "Cooldown period not finished");
        
        lastClaimTime[msg.sender] = block.timestamp;
        usdcToken.mint(msg.sender, USDC_FAUCET_AMOUNT, "Faucet Claim");
        
        emit TokensClaimed(msg.sender, 0, USDC_FAUCET_AMOUNT, 0);
    }
    
    function claimSOMG() public whenNotPaused nonReentrant {
        require(canClaim(msg.sender), "Cooldown period not finished");
        
        lastClaimTime[msg.sender] = block.timestamp;
        somgToken.mint(msg.sender, SOMG_FAUCET_AMOUNT, "Faucet Claim");
        
        emit TokensClaimed(msg.sender, 0, 0, SOMG_FAUCET_AMOUNT);
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
    
    // Emergency function to withdraw tokens (only owner)
    function emergencyWithdraw(address token, uint256 amount) public onlyOwner {
        if (token == address(wsomToken)) {
            wsomToken.transfer(owner(), amount);
        } else if (token == address(usdcToken)) {
            usdcToken.transfer(owner(), amount);
        } else if (token == address(somgToken)) {
            somgToken.transfer(owner(), amount);
        }
    }
} 