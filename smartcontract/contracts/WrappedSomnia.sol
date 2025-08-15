// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract WrappedSomnia is ERC20, ReentrancyGuard {
    uint8 private constant DECIMALS = 18;
    
    event Wrapped(address indexed user, uint256 amount);
    event Unwrapped(address indexed user, uint256 amount);
    
    constructor() ERC20("Wrapped Somnia", "WSOM") {
        // WSOM has no max supply - it's minted/burned 1:1 with native SOM
    }
    
    function decimals() public view virtual override returns (uint8) {
        return DECIMALS;
    }
    
    // Wrap native SOM to get WSOM
    function wrap() public payable nonReentrant {
        require(msg.value > 0, "Must send SOM to wrap");
        
        _mint(msg.sender, msg.value);
        emit Wrapped(msg.sender, msg.value);
    }
    
    // Unwrap WSOM to get native SOM
    function unwrap(uint256 amount) public nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient WSOM balance");
        
        _burn(msg.sender, amount);
        
        // Transfer native SOM back to user
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Failed to transfer native SOM");
        
        emit Unwrapped(msg.sender, amount);
    }
    
    // Emergency function to recover stuck native SOM (only in emergencies)
    function emergencyWithdraw() public {
        // This would typically be restricted to owner/admin
        // For now, allowing anyone to call it for testing
        uint256 balance = address(this).balance;
        require(balance > 0, "No native SOM to withdraw");
        
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Failed to withdraw native SOM");
    }
    
    // Receive function to accept native SOM
    receive() external payable {
        // This allows the contract to receive native SOM
        // Users should use wrap() function instead
    }
} 