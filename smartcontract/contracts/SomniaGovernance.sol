// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract SomniaGovernance is ERC20, ERC20Permit, ERC20Votes, Ownable, Pausable {
    
    // Constants
    uint256 public constant INITIAL_SUPPLY = 100000000 * 10**18; // 100M tokens
    uint256 public constant MIN_PROPOSAL_THRESHOLD = 1000 * 10**18; // 1000 tokens
    uint256 public constant VOTING_PERIOD = 3 days;
    uint256 public constant EXECUTION_DELAY = 1 days;
    
    // Structs
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        uint256 endTime;
        uint256 executionTime;
        bool executed;
        bool canceled;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) votes;
    }
    
    struct GovernanceSettings {
        uint256 proposalThreshold;
        uint256 votingPeriod;
        uint256 executionDelay;
        uint256 quorumVotes;
    }
    
    // State variables
    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256) public proposalCount;
    mapping(address => uint256) public lastProposalTime;
    
    uint256 public proposalIdCounter;
    GovernanceSettings public settings;
    
    // Events
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description);
    event ProposalVoted(uint256 indexed proposalId, address indexed voter, bool support, uint256 votes);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCanceled(uint256 indexed proposalId);
    event SettingsUpdated(uint256 proposalThreshold, uint256 votingPeriod, uint256 executionDelay, uint256 quorumVotes);
    
    // Modifiers
    modifier onlyProposer(uint256 proposalId) {
        require(proposals[proposalId].proposer == msg.sender, "SomniaGovernance: NOT_PROPOSER");
        _;
    }
    
    modifier proposalExists(uint256 proposalId) {
        require(proposals[proposalId].proposer != address(0), "SomniaGovernance: PROPOSAL_NOT_EXISTS");
        _;
    }
    
    modifier proposalActive(uint256 proposalId) {
        require(block.timestamp >= proposals[proposalId].startTime, "SomniaGovernance: PROPOSAL_NOT_ACTIVE");
        require(block.timestamp <= proposals[proposalId].endTime, "SomniaGovernance: PROPOSAL_EXPIRED");
        require(!proposals[proposalId].executed, "SomniaGovernance: PROPOSAL_ALREADY_EXECUTED");
        require(!proposals[proposalId].canceled, "SomniaGovernance: PROPOSAL_CANCELED");
        _;
    }
    
    modifier proposalExecutable(uint256 proposalId) {
        require(proposals[proposalId].executionTime <= block.timestamp, "SomniaGovernance: EXECUTION_DELAY_NOT_MET");
        require(!proposals[proposalId].executed, "SomniaGovernance: PROPOSAL_ALREADY_EXECUTED");
        require(!proposals[proposalId].canceled, "SomniaGovernance: PROPOSAL_CANCELED");
        _;
    }
    
    constructor() ERC20("Somnia Governance", "SOMG") ERC20Permit("Somnia Governance") Ownable(msg.sender) {
        // Mint initial supply to deployer
        _mint(msg.sender, INITIAL_SUPPLY);
        
        // Set initial governance settings
        settings = GovernanceSettings({
            proposalThreshold: MIN_PROPOSAL_THRESHOLD,
            votingPeriod: VOTING_PERIOD,
            executionDelay: EXECUTION_DELAY,
            quorumVotes: INITIAL_SUPPLY / 100 // 1% of total supply
        });
    }
    
    // Core functions
    
    /**
     * @dev Create a new governance proposal
     */
    function createProposal(string memory description) external returns (uint256) {
        require(balanceOf(msg.sender) >= settings.proposalThreshold, "SomniaGovernance: INSUFFICIENT_TOKENS");
        require(block.timestamp >= lastProposalTime[msg.sender] + settings.votingPeriod, "SomniaGovernance: PROPOSAL_COOLDOWN");
        
        uint256 proposalId = proposalIdCounter++;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            description: description,
            forVotes: 0,
            againstVotes: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + settings.votingPeriod,
            executionTime: block.timestamp + settings.votingPeriod + settings.executionDelay,
            executed: false,
            canceled: false
        });
        
        proposalCount[msg.sender]++;
        lastProposalTime[msg.sender] = block.timestamp;
        
        emit ProposalCreated(proposalId, msg.sender, description);
        return proposalId;
    }
    
    /**
     * @dev Vote on a proposal
     */
    function vote(uint256 proposalId, bool support) external proposalExists(proposalId) proposalActive(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.hasVoted[msg.sender], "SomniaGovernance: ALREADY_VOTED");
        
        uint256 votes = balanceOf(msg.sender);
        require(votes > 0, "SomniaGovernance: NO_VOTING_POWER");
        
        proposal.hasVoted[msg.sender] = true;
        proposal.votes[msg.sender] = votes;
        
        if (support) {
            proposal.forVotes += votes;
        } else {
            proposal.againstVotes += votes;
        }
        
        emit ProposalVoted(proposalId, msg.sender, support, votes);
    }
    
    /**
     * @dev Execute a successful proposal
     */
    function executeProposal(uint256 proposalId) external proposalExists(proposalId) proposalExecutable(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        
        require(proposal.forVotes > proposal.againstVotes, "SomniaGovernance: PROPOSAL_FAILED");
        require(proposal.forVotes + proposal.againstVotes >= settings.quorumVotes, "SomniaGovernance: INSUFFICIENT_QUORUM");
        
        proposal.executed = true;
        
        emit ProposalExecuted(proposalId);
        
        // Here you would execute the actual proposal logic
        // For now, this is just a placeholder
    }
    
    /**
     * @dev Cancel a proposal (only proposer can cancel)
     */
    function cancelProposal(uint256 proposalId) external onlyProposer(proposalId) proposalExists(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "SomniaGovernance: PROPOSAL_ALREADY_EXECUTED");
        require(!proposal.canceled, "SomniaGovernance: PROPOSAL_ALREADY_CANCELED");
        
        proposal.canceled = true;
        
        emit ProposalCanceled(proposalId);
    }
    
    /**
     * @dev Get proposal information
     */
    function getProposal(uint256 proposalId) external view returns (
        address proposer,
        string memory description,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 startTime,
        uint256 endTime,
        uint256 executionTime,
        bool executed,
        bool canceled
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.proposer,
            proposal.description,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.startTime,
            proposal.endTime,
            proposal.executionTime,
            proposal.executed,
            proposal.canceled
        );
    }
    
    /**
     * @dev Check if user has voted on a proposal
     */
    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }
    
    /**
     * @dev Get user's votes on a proposal
     */
    function getVotes(uint256 proposalId, address voter) external view returns (uint256) {
        return proposals[proposalId].votes[voter];
    }
    
    /**
     * @dev Get proposal state
     */
    function getProposalState(uint256 proposalId) external view returns (string memory) {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.canceled) return "Canceled";
        if (proposal.executed) return "Executed";
        if (block.timestamp < proposal.startTime) return "Pending";
        if (block.timestamp <= proposal.endTime) return "Active";
        if (block.timestamp < proposal.executionTime) return "Succeeded";
        return "Expired";
    }
    
    /**
     * @dev Update governance settings (only owner)
     */
    function updateSettings(
        uint256 newProposalThreshold,
        uint256 newVotingPeriod,
        uint256 newExecutionDelay,
        uint256 newQuorumVotes
    ) external onlyOwner {
        require(newProposalThreshold > 0, "SomniaGovernance: INVALID_THRESHOLD");
        require(newVotingPeriod > 0, "SomniaGovernance: INVALID_VOTING_PERIOD");
        require(newExecutionDelay >= 0, "SomniaGovernance: INVALID_EXECUTION_DELAY");
        require(newQuorumVotes > 0, "SomniaGovernance: INVALID_QUORUM");
        
        settings.proposalThreshold = newProposalThreshold;
        settings.votingPeriod = newVotingPeriod;
        settings.executionDelay = newExecutionDelay;
        settings.quorumVotes = newQuorumVotes;
        
        emit SettingsUpdated(newProposalThreshold, newVotingPeriod, newExecutionDelay, newQuorumVotes);
    }
    
    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Mint tokens (only owner, for governance rewards)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens (only owner, for governance penalties)
     */
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
    
    // Override functions for ERC20Votes compatibility
    
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }
    
    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
    
    // Pausable overrides
    
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    // View functions
    
    /**
     * @dev Get total proposals count
     */
    function getTotalProposals() external view returns (uint256) {
        return proposalIdCounter;
    }
    
    /**
     * @dev Get user's proposal count
     */
    function getUserProposalCount(address user) external view returns (uint256) {
        return proposalCount[user];
    }
    
    /**
     * @dev Get governance settings
     */
    function getGovernanceSettings() external view returns (GovernanceSettings memory) {
        return settings;
    }
    
    /**
     * @dev Check if user can create a proposal
     */
    function canCreateProposal(address user) external view returns (bool) {
        return balanceOf(user) >= settings.proposalThreshold && 
               block.timestamp >= lastProposalTime[user] + settings.votingPeriod;
    }
} 