// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SomniaLPToken is ERC20, Ownable, Pausable, ReentrancyGuard {
    uint8 private constant DECIMALS = 18;
    mapping(address => bool) public authorizedMinters;

    event AuthorizedMinterUpdated(address indexed minter, bool authorized);
    event LPTokenMinted(address indexed to, uint256 amount, string pool);
    event LPTokenBurned(address indexed from, uint256 amount, string pool);

    modifier onlyAuthorizedMinter() {
        require(
            authorizedMinters[msg.sender] || msg.sender == owner(),
            "Not authorized to mint/burn"
        );
        _;
    }

    constructor(
        address initialOwner
    ) ERC20("Somnia LP Token", "SOM-LP") Ownable(initialOwner) {
        // Per-pool tokens will be deployed by the AMM; name/symbol kept generic.
    }

    function decimals() public view virtual override returns (uint8) {
        return DECIMALS;
    }

    function mint(
        address to,
        uint256 amount,
        string memory pool
    ) external onlyAuthorizedMinter whenNotPaused nonReentrant {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        _mint(to, amount);
        emit LPTokenMinted(to, amount, pool);
    }

    function burn(
        address from,
        uint256 amount,
        string memory pool
    ) external onlyAuthorizedMinter whenNotPaused nonReentrant {
        require(from != address(0), "Cannot burn from zero address");
        require(amount > 0, "Amount must be greater than 0");
        _burn(from, amount);
        emit LPTokenBurned(from, amount, pool);
    }

    function addAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
        emit AuthorizedMinterUpdated(minter, true);
    }

    function removeAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit AuthorizedMinterUpdated(minter, false);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override {
        require(!paused(), "Token transfer paused");
        super._update(from, to, amount);
    }
}
