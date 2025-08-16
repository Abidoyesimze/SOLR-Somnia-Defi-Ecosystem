// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract SomniaGovernanceToken is
    ERC20,
    Ownable,
    Pausable,
    ReentrancyGuard,
    ERC20Permit,
    ERC20Votes
{
    uint8 private constant DECIMALS = 18;
    uint256 public maxSupply;
    bool public mintingEnabled;
    mapping(address => bool) public authorizedMinters;

    event MintingToggled(bool enabled);
    event MaxSupplyUpdated(uint256 newMaxSupply);
    event GovernanceTokenMinted(
        address indexed to,
        uint256 amount,
        string reason
    );
    event AuthorizedMinterUpdated(address indexed minter, bool authorized);

    modifier onlyAuthorizedMinter() {
        require(
            authorizedMinters[msg.sender] || msg.sender == owner(),
            "Not authorized to mint"
        );
        _;
    }

    constructor(
        address initialOwner
    )
        ERC20("Somnia Governance", "SOMG")
        ERC20Permit("Somnia Governance")
        Ownable(initialOwner)
    {
        maxSupply = 100000 * 10 ** DECIMALS; // 100k SOMG (limited supply for governance)
        mintingEnabled = true;
        authorizedMinters[initialOwner] = true; // Owner is authorized by default
        // Mint initial supply to owner
        _mint(initialOwner, 10000 * 10 ** DECIMALS); // 10k SOMG
    }

    function decimals() public view virtual override returns (uint8) {
        return DECIMALS;
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
        emit GovernanceTokenMinted(to, amount, reason);
    }

    function mintForStaking(
        address to,
        uint256 amount
    ) public onlyAuthorizedMinter whenNotPaused nonReentrant {
        require(mintingEnabled, "Minting is disabled");
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        require(to != address(0), "Cannot mint to zero address");

        _mint(to, amount);
        emit GovernanceTokenMinted(to, amount, "Staking Rewards");
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

    // Required overrides for ERC20Votes
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
        require(!paused(), "Token transfer paused");
    }

    function nonces(
        address owner
    ) public view virtual override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}
