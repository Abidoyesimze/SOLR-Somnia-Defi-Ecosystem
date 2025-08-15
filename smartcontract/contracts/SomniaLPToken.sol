// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SomniaLPToken is ERC20, Ownable, Pausable, ReentrancyGuard {
    uint8 private constant DECIMALS = 18;
    mapping(address => bool) public authorizedMinters;
    
    event AuthorizedMinterUpdated(address indexed minter, bool authorized);
    event LPTokenMinted(address indexed to, uint256 amount, string pool);
    event LPTokenBurned(address indexed from, uint256 amount, string pool);
    
    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized to mint/burn");
        _;
    }
    
    constructor(
        address initialOwner
    ) ERC20("Somnia LP Token", "SOM-LP") Ownable(initialOwner) {
        // LP tokens have no max supply - they're minted/burned based on liquidity
    }
    
    function decimals() public view virtual override returns (uint8) {
        return DECIMALS;
    }
    
    function mint(address to, uint256 amount, string memory pool) public onlyAuthorizedMinter whenNotPaused nonReentrant {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        
        _mint(to, amount);
        emit LPTokenMinted(to, amount, pool);
    }
    
    function burn(address from, uint256 amount, string memory pool) public onlyAuthorizedMinter whenNotPaused nonReentrant {
        require(from != address(0), "Cannot burn from zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(from) >= amount, "Insufficient balance");
        
        _burn(from, amount);
        emit LPTokenBurned(from, amount, pool);
    }
    
    function addAuthorizedMinter(address minter) public onlyOwner {
        authorizedMinters[minter] = true;
        emit AuthorizedMinterUpdated(minter, true);
    }
    
    function removeAuthorizedMinter(address minter) public onlyOwner {
        authorizedMinters[minter] = false;
        emit AuthorizedMinterUpdated(minter, false);
    }
    
    function pause() public onlyOwner {
        _pause();
    }
    
    function unpause() public onlyOwner {
        _unpause();
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "Token transfer paused");
    }
} 