// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./WrappedSomnia.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestWrappedSomnia is WrappedSomnia, Ownable {
    mapping(address => bool) public authorizedMinters;
    
    event AuthorizedMinterUpdated(address indexed minter, bool authorized);
    
    constructor() Ownable(msg.sender) {}
    
    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }
    
    function mint(address to, uint256 amount, string memory reason) public onlyAuthorizedMinter {
        require(to != address(0), "Cannot mint to zero address");
        _mint(to, amount);
    }
    
    function addAuthorizedMinter(address minter) public onlyOwner {
        authorizedMinters[minter] = true;
        emit AuthorizedMinterUpdated(minter, true);
    }
    
    function removeAuthorizedMinter(address minter) public onlyOwner {
        authorizedMinters[minter] = false;
        emit AuthorizedMinterUpdated(minter, false);
    }
} 