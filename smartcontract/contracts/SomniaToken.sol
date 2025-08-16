// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SomniaToken is ERC20, Ownable, Pausable, ReentrancyGuard {
    uint8 private _decimals;
    uint256 public maxSupply;
    bool public mintingEnabled;
    mapping(address => bool) public authorizedMinters;

    event MintingToggled(bool enabled);
    event MaxSupplyUpdated(uint256 newMaxSupply);
    event AuthorizedMinterUpdated(address indexed minter, bool authorized);

    modifier onlyAuthorizedMinter() {
        require(
            authorizedMinters[msg.sender] || msg.sender == owner(),
            "Not authorized to mint"
        );
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 initialSupply,
        uint256 maxSupply_,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {
        _decimals = decimals_;
        maxSupply = maxSupply_;
        mintingEnabled = true;
        authorizedMinters[initialOwner] = true; // Owner is authorized by default
        _mint(initialOwner, initialSupply * 10 ** decimals_);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(
        address to,
        uint256 amount,
        string memory reason
    ) public onlyAuthorizedMinter whenNotPaused nonReentrant {
        require(mintingEnabled, "Minting is disabled");
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
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

    function burn(uint256 amount) public whenNotPaused nonReentrant {
        _burn(msg.sender, amount);
    }

    function burnFrom(
        address account,
        uint256 amount
    ) public whenNotPaused nonReentrant {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
    }

    function toggleMinting() public onlyOwner {
        mintingEnabled = !mintingEnabled;
        emit MintingToggled(mintingEnabled);
    }

    function updateMaxSupply(uint256 newMaxSupply) public onlyOwner {
        require(newMaxSupply >= totalSupply(), "New max supply too low");
        maxSupply = newMaxSupply;
        emit MaxSupplyUpdated(newMaxSupply);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _update(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._update(from, to, amount);
        require(!paused(), "Token transfer paused");
    }
}
