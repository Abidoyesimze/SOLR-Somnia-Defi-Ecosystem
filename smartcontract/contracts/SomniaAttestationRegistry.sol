// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title SomniaAttestationRegistry
 * @dev Manages attestations for SOM0 Attestation Protocol
 * Handles proof of authenticity, verification, and trust systems
 */
contract SomniaAttestationRegistry is Ownable, ReentrancyGuard {
    using Strings for uint256;
    
    // ========================================================================
    // STRUCTS & ENUMS
    // ========================================================================
    
    enum AttestationStatus {
        Active,
        Expired,
        Revoked,
        UnderReview,
        Suspended
    }
    
    enum AttestationType {
        Authenticity,      // Proof of genuine item
        AgeVerification,   // Age verification
        Moderation,        // Content moderation
        Quality,           // Quality assessment
        Rarity,            // Rarity verification
        Compatibility,     // Cross-platform compatibility
        Ownership,         // Ownership proof
        Licensing,         // License verification
        Custom             // Custom attestation type
    }
    
    enum AttesterTier {
        Basic,             // Basic attester
        Verified,          // Verified attester
        Premium,           // Premium attester
        Expert,            // Expert attester
        Official           // Official/Institutional attester
    }
    
    struct Attestation {
        string attestationId;      // Unique identifier
        address attester;          // Who made the attestation
        address subject;           // What/who is being attested
        AttestationType attestationType;
        string value;              // The attestation value
        string metadataUri;        // Additional metadata
        uint256 validFrom;         // When attestation becomes valid
        uint256 validUntil;        // When attestation expires
        AttestationStatus status;
        uint256 confidence;        // Confidence level (1-100)
        uint256 createdAt;
        uint256 lastUpdated;
        string[] evidence;         // Evidence supporting attestation
        bool isRevocable;          // Can be revoked
        uint256 version;           // Attestation version
    }
    
    struct AttesterProfile {
        address attesterAddress;
        string name;
        string description;
        AttesterTier tier;
        uint256 totalAttestations;
        uint256 successfulAttestations;
        uint256 revokedAttestations;
        uint256 reputationScore;
        bool isActive;
        uint256 createdAt;
        string[] specializations;
        mapping(AttestationType => uint256) attestationCounts;
    }
    
    struct AttestationRequest {
        string requestId;
        address requester;
        address subject;
        AttestationType attestationType;
        string description;
        uint256 bounty;            // Reward for successful attestation
        uint256 deadline;
        bool isFulfilled;
        address[] interestedAttesters;
        uint256 createdAt;
    }
    
    // ========================================================================
    // STATE VARIABLES
    // ========================================================================
    
    mapping(string => Attestation) public attestations;
    mapping(address => AttesterProfile) public attesterProfiles;
    mapping(string => AttestationRequest) public attestationRequests;
    mapping(address => string[]) public userAttestations;
    mapping(address => string[]) public userAttestationRequests;
    mapping(string => string[]) public subjectAttestations;
    
    uint256 public attestationCount;
    uint256 public attesterCount;
    uint256 public requestCount;
    uint256 public attestationFee = 0.0005 ether;
    uint256 public requestBounty = 0.001 ether;
    
    // ========================================================================
    // EVENTS
    // ========================================================================
    
    event AttestationCreated(
        string indexed attestationId,
        address indexed attester,
        address indexed subject,
        AttestationType attestationType,
        string value
    );
    
    event AttestationUpdated(
        string indexed attestationId,
        string newValue,
        uint256 version
    );
    
    event AttestationRevoked(
        string indexed attestationId,
        address indexed revoker,
        string reason
    );
    
    event AttestationExpired(
        string indexed attestationId
    );
    
    event AttesterRegistered(
        address indexed attester,
        string name,
        AttesterTier tier
    );
    
    event AttestationRequestCreated(
        string indexed requestId,
        address indexed requester,
        AttestationType attestationType
    );
    
    event AttestationRequestFulfilled(
        string indexed requestId,
        string indexed attestationId,
        address indexed attester
    );
    
    // ========================================================================
    // MODIFIERS
    // ========================================================================
    
    modifier attestationExists(string memory attestationId) {
        require(attestations[attestationId].attester != address(0), "Attestation does not exist");
        _;
    }
    
    modifier onlyAttestationOwner(string memory attestationId) {
        require(attestations[attestationId].attester == msg.sender, "Not attestation owner");
        _;
    }
    
    modifier onlyActiveAttestation(string memory attestationId) {
        require(attestations[attestationId].status == AttestationStatus.Active, "Attestation not active");
        _;
    }
    
    modifier onlyValidAttestation(string memory attestationId) {
        Attestation storage attestation = attestations[attestationId];
        require(attestation.status == AttestationStatus.Active, "Attestation not active");
        require(block.timestamp >= attestation.validFrom, "Attestation not yet valid");
        require(block.timestamp <= attestation.validUntil, "Attestation expired");
        _;
    }
    
    modifier onlyRegisteredAttester() {
        require(attesterProfiles[msg.sender].isActive, "Not a registered attester");
        _;
    }
    
    // ========================================================================
    // CONSTRUCTOR
    // ========================================================================
    
    constructor() Ownable(msg.sender) {}
    
    // ========================================================================
    // CORE FUNCTIONS - Attestation Management
    // ========================================================================
    
    /**
     * @dev Register as an attester
     */
    function registerAttester(
        string memory name,
        string memory description,
        AttesterTier tier,
        string[] memory specializations
    ) external returns (bool) {
        require(bytes(name).length > 0, "Name required");
        require(attesterProfiles[msg.sender].attesterAddress == address(0), "Already registered");
        
        AttesterProfile storage profile = attesterProfiles[msg.sender];
        profile.attesterAddress = msg.sender;
        profile.name = name;
        profile.description = description;
        profile.tier = tier;
        profile.specializations = specializations;
        profile.totalAttestations = 0;
        profile.successfulAttestations = 0;
        profile.revokedAttestations = 0;
        profile.reputationScore = _calculateInitialReputation(tier);
        profile.isActive = true;
        profile.createdAt = block.timestamp;
        
        attesterCount++;
        
        emit AttesterRegistered(msg.sender, name, tier);
        return true;
    }
    
    /**
     * @dev Create a new attestation
     */
    function createAttestation(
        string memory attestationId,
        address subject,
        AttestationType attestationType,
        string memory value,
        string memory metadataUri,
        uint256 validFrom,
        uint256 validUntil,
        uint256 confidence,
        string[] memory evidence,
        bool isRevocable
    ) external payable onlyRegisteredAttester returns (bool) {
        require(bytes(attestationId).length > 0, "Invalid attestation ID");
        require(attestations[attestationId].attester == address(0), "Attestation already exists");
        require(subject != address(0), "Invalid subject");
        require(validFrom < validUntil, "Invalid validity period");
        require(confidence > 0 && confidence <= 100, "Invalid confidence level");
        require(msg.value >= attestationFee, "Insufficient fee");
        
        Attestation memory newAttestation = Attestation({
            attestationId: attestationId,
            attester: msg.sender,
            subject: subject,
            attestationType: attestationType,
            value: value,
            metadataUri: metadataUri,
            validFrom: validFrom,
            validUntil: validUntil,
            status: AttestationStatus.Active,
            confidence: confidence,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp,
            evidence: evidence,
            isRevocable: isRevocable,
            version: 1
        });
        
        attestations[attestationId] = newAttestation;
        userAttestations[msg.sender].push(attestationId);
        subjectAttestations[subject].push(attestationId);
        attestationCount++;
        
        // Update attester profile
        AttesterProfile storage profile = attesterProfiles[msg.sender];
        profile.totalAttestations++;
        profile.attestationCounts[attestationType]++;
        
        emit AttestationCreated(attestationId, msg.sender, subject, attestationType, value);
        return true;
    }
    
    /**
     * @dev Update an existing attestation
     */
    function updateAttestation(
        string memory attestationId,
        string memory newValue,
        string memory newMetadataUri,
        uint256 newValidUntil
    ) external onlyAttestationOwner(attestationId) onlyActiveAttestation(attestationId) returns (bool) {
        require(bytes(newValue).length > 0, "Invalid value");
        require(newValidUntil > block.timestamp, "Invalid expiration time");
        
        Attestation storage attestation = attestations[attestationId];
        attestation.value = newValue;
        attestation.metadataUri = newMetadataUri;
        attestation.validUntil = newValidUntil;
        attestation.lastUpdated = block.timestamp;
        attestation.version++;
        
        emit AttestationUpdated(attestationId, newValue, attestation.version);
        return true;
    }
    
    /**
     * @dev Revoke an attestation
     */
    function revokeAttestation(
        string memory attestationId,
        string memory reason
    ) external returns (bool) {
        Attestation storage attestation = attestations[attestationId];
        require(
            attestation.attester == msg.sender || msg.sender == owner(),
            "Not authorized to revoke"
        );
        require(attestation.isRevocable, "Attestation not revocable");
        require(attestation.status == AttestationStatus.Active, "Attestation not active");
        
        attestation.status = AttestationStatus.Revoked;
        attestation.lastUpdated = block.timestamp;
        
        // Update attester profile
        AttesterProfile storage profile = attesterProfiles[attestation.attester];
        profile.revokedAttestations++;
        profile.reputationScore = _calculateReputation(profile);
        
        emit AttestationRevoked(attestationId, msg.sender, reason);
        return true;
    }
    
    // ========================================================================
    // ATTESTATION REQUEST SYSTEM
    // ========================================================================
    
    /**
     * @dev Create an attestation request
     */
    function createAttestationRequest(
        string memory requestId,
        address subject,
        AttestationType attestationType,
        string memory description,
        uint256 deadline
    ) external payable returns (bool) {
        require(bytes(requestId).length > 0, "Invalid request ID");
        require(attestationRequests[requestId].requester == address(0), "Request already exists");
        require(subject != address(0), "Invalid subject");
        require(deadline > block.timestamp, "Invalid deadline");
        require(msg.value >= requestBounty, "Insufficient bounty");
        
        AttestationRequest memory newRequest = AttestationRequest({
            requestId: requestId,
            requester: msg.sender,
            subject: subject,
            attestationType: attestationType,
            description: description,
            bounty: msg.value,
            deadline: deadline,
            isFulfilled: false,
            interestedAttesters: new address[](0),
            createdAt: block.timestamp
        });
        
        attestationRequests[requestId] = newRequest;
        userAttestationRequests[msg.sender].push(requestId);
        requestCount++;
        
        emit AttestationRequestCreated(requestId, msg.sender, attestationType);
        return true;
    }
    
    /**
     * @dev Express interest in fulfilling a request
     */
    function expressInterest(string memory requestId) external onlyRegisteredAttester returns (bool) {
        AttestationRequest storage request = attestationRequests[requestId];
        require(request.requester != address(0), "Request not found");
        require(!request.isFulfilled, "Request already fulfilled");
        require(block.timestamp <= request.deadline, "Request expired");
        
        // Check if already interested
        bool alreadyInterested = false;
        for (uint256 i = 0; i < request.interestedAttesters.length; i++) {
            if (request.interestedAttesters[i] == msg.sender) {
                alreadyInterested = true;
                break;
            }
        }
        
        if (!alreadyInterested) {
            request.interestedAttesters.push(msg.sender);
        }
        
        return true;
    }
    
    /**
     * @dev Fulfill an attestation request
     */
    function fulfillAttestationRequest(
        string memory requestId,
        string memory attestationId,
        string memory value,
        string memory metadataUri,
        uint256 confidence,
        string[] memory evidence
    ) external onlyRegisteredAttester returns (bool) {
        AttestationRequest storage request = attestationRequests[requestId];
        require(request.requester != address(0), "Request not found");
        require(!request.isFulfilled, "Request already fulfilled");
        require(block.timestamp <= request.deadline, "Request expired");
        
        // Create the attestation
        bool success = createAttestation(
            attestationId,
            request.subject,
            request.attestationType,
            value,
            metadataUri,
            block.timestamp,
            block.timestamp + 365 days, // Default 1 year validity
            confidence,
            evidence,
            true
        );
        
        if (success) {
            request.isFulfilled = true;
            
            // Transfer bounty to attester
            payable(msg.sender).transfer(request.bounty);
            
            // Update attester profile
            AttesterProfile storage profile = attesterProfiles[msg.sender];
            profile.successfulAttestations++;
            profile.reputationScore = _calculateReputation(profile);
            
            emit AttestationRequestFulfilled(requestId, attestationId, msg.sender);
        }
        
        return success;
    }
    
    // ========================================================================
    // QUERY FUNCTIONS
    // ========================================================================
    
    /**
     * @dev Get attestation details
     */
    function getAttestation(string memory attestationId) external view returns (Attestation memory) {
        return attestations[attestationId];
    }
    
    /**
     * @dev Get attester profile
     */
    function getAttesterProfile(address attester) external view returns (
        address attesterAddress,
        string memory name,
        string memory description,
        AttesterTier tier,
        uint256 totalAttestations,
        uint256 successfulAttestations,
        uint256 revokedAttestations,
        uint256 reputationScore,
        bool isActive,
        uint256 createdAt,
        string[] memory specializations
    ) {
        AttesterProfile storage profile = attesterProfiles[attester];
        return (
            profile.attesterAddress,
            profile.name,
            profile.description,
            profile.tier,
            profile.totalAttestations,
            profile.successfulAttestations,
            profile.revokedAttestations,
            profile.reputationScore,
            profile.isActive,
            profile.createdAt,
            profile.specializations
        );
    }
    
    /**
     * @dev Get user's attestations
     */
    function getUserAttestations(address user) external view returns (string[] memory) {
        return userAttestations[user];
    }
    
    /**
     * @dev Get subject's attestations
     */
    function getSubjectAttestations(address subject) external view returns (string[] memory) {
        return subjectAttestations[subject];
    }
    
    /**
     * @dev Get attestation request details
     */
    function getAttestationRequest(string memory requestId) external view returns (AttestationRequest memory) {
        return attestationRequests[requestId];
    }
    
    // ========================================================================
    // UTILITY FUNCTIONS
    // ========================================================================
    
    function _calculateInitialReputation(AttesterTier tier) internal pure returns (uint256) {
        if (tier == AttesterTier.Official) return 1000;
        if (tier == AttesterTier.Expert) return 800;
        if (tier == AttesterTier.Premium) return 600;
        if (tier == AttesterTier.Verified) return 400;
        return 200; // Basic
    }
    
    function _calculateReputation(AttesterProfile storage profile) internal view returns (uint256) {
        uint256 baseScore = _calculateInitialReputation(profile.tier);
        uint256 successBonus = profile.successfulAttestations * 10;
        uint256 revocationPenalty = profile.revokedAttestations * 50;
        
        uint256 finalScore = baseScore + successBonus;
        if (revocationPenalty > finalScore) {
            finalScore = 0;
        } else {
            finalScore -= revocationPenalty;
        }
        
        return finalScore;
    }
    
    // ========================================================================
    // ADMIN FUNCTIONS
    // ========================================================================
    
    function updateAttestationFee(uint256 newFee) external onlyOwner {
        attestationFee = newFee;
    }
    
    function updateRequestBounty(uint256 newBounty) external onlyOwner {
        requestBounty = newBounty;
    }
    
    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function emergencyPauseAttestation(string memory attestationId) external onlyOwner {
        attestations[attestationId].status = AttestationStatus.Suspended;
        attestations[attestationId].lastUpdated = block.timestamp;
    }
    
    function emergencyPauseAttester(address attester) external onlyOwner {
        attesterProfiles[attester].isActive = false;
    }
} 