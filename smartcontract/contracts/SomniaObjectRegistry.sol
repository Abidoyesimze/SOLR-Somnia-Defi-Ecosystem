// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title SomniaObjectRegistry
 * @dev Manages virtual objects for SOM0 Object Protocol
 * Handles object creation, metadata, ownership, and cross-application compatibility
 */
contract SomniaObjectRegistry is Ownable, ReentrancyGuard {
    using Strings for uint256;
    
    // ========================================================================
    // STRUCTS & ENUMS
    // ========================================================================
    
    enum ObjectStatus {
        Active,
        Suspended,
        Deleted,
        UnderReview
    }
    
    enum ObjectType {
        NFT,
        Wearable,
        Gadget,
        Experience,
        Avatar,
        Building,
        Vehicle,
        Weapon,
        Tool,
        Decoration,
        Custom
    }
    
    struct VirtualObject {
        string objectId;           // Unique identifier across the network
        string metadataUri;        // IPFS or other metadata storage
        address creator;           // Original creator
        address currentOwner;      // Current owner
        ObjectType objectType;     // Type of virtual object
        ObjectStatus status;       // Current status
        string[] tags;             // Searchable tags
        string[] supportedExperiences; // Experiences that support this object
        uint256 createdAt;
        uint256 lastUpdated;
        uint256 transferCount;     // Number of times transferred
        bool isTradeable;          // Can be traded on marketplace
        bool isComposable;         // Can be combined with other objects
        uint256 version;           // Object version for updates
    }
    
    struct ObjectMetadata {
        string name;
        string description;
        string imageUri;
        string animationUri;
        string externalUri;
        string[] attributes;
        mapping(string => string) customProperties;
    }
    
    struct ObjectTransfer {
        address from;
        address to;
        uint256 timestamp;
        string reason;
    }
    
    // ========================================================================
    // STATE VARIABLES
    // ========================================================================
    
    mapping(string => VirtualObject) public virtualObjects;
    mapping(string => ObjectMetadata) public objectMetadata;
    mapping(string => ObjectTransfer[]) public objectTransferHistory;
    mapping(address => string[]) public userObjects;
    mapping(string => address[]) public objectApprovedOperators;
    mapping(string => bool) public objectApprovedForAll;
    
    uint256 public objectCount;
    uint256 public totalTransfers;
    uint256 public registrationFee = 0.001 ether;
    
    // ========================================================================
    // EVENTS
    // ========================================================================
    
    event ObjectRegistered(
        string indexed objectId,
        address indexed creator,
        ObjectType objectType,
        string metadataUri
    );
    
    event ObjectTransferred(
        string indexed objectId,
        address indexed from,
        address indexed to,
        string reason
    );
    
    event ObjectMetadataUpdated(
        string indexed objectId,
        string metadataUri,
        uint256 version
    );
    
    event ObjectStatusChanged(
        string indexed objectId,
        ObjectStatus oldStatus,
        ObjectStatus newStatus
    );
    
    event ObjectApproved(
        string indexed objectId,
        address indexed owner,
        address indexed operator
    );
    
    event ObjectTagsUpdated(
        string indexed objectId,
        string[] tags
    );
    
    // ========================================================================
    // MODIFIERS
    // ========================================================================
    
    modifier objectExists(string memory objectId) {
        require(virtualObjects[objectId].creator != address(0), "Object does not exist");
        _;
    }
    
    modifier onlyObjectOwner(string memory objectId) {
        require(virtualObjects[objectId].currentOwner == msg.sender, "Not object owner");
        _;
    }
    
    modifier onlyObjectCreator(string memory objectId) {
        require(virtualObjects[objectId].creator == msg.sender, "Not object creator");
        _;
    }
    
    modifier onlyApprovedOperator(string memory objectId) {
        require(
            virtualObjects[objectId].currentOwner == msg.sender ||
            objectApprovedOperators[objectId].length > 0 ||
            objectApprovedForAll[objectId],
            "Not approved operator"
        );
        _;
    }
    
    modifier objectActive(string memory objectId) {
        require(virtualObjects[objectId].status == ObjectStatus.Active, "Object not active");
        _;
    }
    
    // ========================================================================
    // CONSTRUCTOR
    // ========================================================================
    
    constructor() Ownable(msg.sender) {}
    
    // ========================================================================
    // CORE FUNCTIONS - Object Registration & Management
    // ========================================================================
    
    /**
     * @dev Register a new virtual object
     */
    function registerVirtualObject(
        string memory objectId,
        string memory metadataUri,
        ObjectType objectType,
        string[] memory tags,
        string[] memory supportedExperiences,
        bool isTradeable,
        bool isComposable
    ) external payable nonReentrant returns (bool) {
        require(bytes(objectId).length > 0, "Invalid object ID");
        require(bytes(metadataUri).length > 0, "Invalid metadata URI");
        require(virtualObjects[objectId].creator == address(0), "Object already exists");
        require(msg.value >= registrationFee, "Insufficient registration fee");
        
        VirtualObject memory newObject = VirtualObject({
            objectId: objectId,
            metadataUri: metadataUri,
            creator: msg.sender,
            currentOwner: msg.sender,
            objectType: objectType,
            status: ObjectStatus.Active,
            tags: tags,
            supportedExperiences: supportedExperiences,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp,
            transferCount: 0,
            isTradeable: isTradeable,
            isComposable: isComposable,
            version: 1
        });
        
        virtualObjects[objectId] = newObject;
        userObjects[msg.sender].push(objectId);
        objectCount++;
        
        emit ObjectRegistered(objectId, msg.sender, objectType, metadataUri);
        return true;
    }
    
    /**
     * @dev Transfer ownership of a virtual object
     */
    function transferObjectOwnership(
        string memory objectId,
        address newOwner,
        string memory reason
    ) external onlyApprovedOperator(objectId) objectActive(objectId) returns (bool) {
        require(newOwner != address(0), "Invalid new owner");
        require(newOwner != virtualObjects[objectId].currentOwner, "Same owner");
        
        address oldOwner = virtualObjects[objectId].currentOwner;
        
        // Update object
        virtualObjects[objectId].currentOwner = newOwner;
        virtualObjects[objectId].lastUpdated = block.timestamp;
        virtualObjects[objectId].transferCount++;
        
        // Update user mappings
        _removeFromArray(userObjects[oldOwner], objectId);
        userObjects[newOwner].push(objectId);
        
        // Record transfer
        ObjectTransfer memory transfer = ObjectTransfer({
            from: oldOwner,
            to: newOwner,
            timestamp: block.timestamp,
            reason: reason
        });
        objectTransferHistory[objectId].push(transfer);
        totalTransfers++;
        
        emit ObjectTransferred(objectId, oldOwner, newOwner, reason);
        return true;
    }
    
    /**
     * @dev Update object metadata
     */
    function updateObjectMetadata(
        string memory objectId,
        string memory newMetadataUri
    ) external onlyObjectCreator(objectId) objectActive(objectId) returns (bool) {
        require(bytes(newMetadataUri).length > 0, "Invalid metadata URI");
        
        virtualObjects[objectId].metadataUri = newMetadataUri;
        virtualObjects[objectId].lastUpdated = block.timestamp;
        virtualObjects[objectId].version++;
        
        emit ObjectMetadataUpdated(objectId, newMetadataUri, virtualObjects[objectId].version);
        return true;
    }
    
    /**
     * @dev Update object tags
     */
    function updateObjectTags(
        string memory objectId,
        string[] memory newTags
    ) external onlyObjectOwner(objectId) objectActive(objectId) returns (bool) {
        virtualObjects[objectId].tags = newTags;
        virtualObjects[objectId].lastUpdated = block.timestamp;
        
        emit ObjectTagsUpdated(objectId, newTags);
        return true;
    }
    
    /**
     * @dev Change object status (only owner or creator)
     */
    function changeObjectStatus(
        string memory objectId,
        ObjectStatus newStatus
    ) external returns (bool) {
        require(
            virtualObjects[objectId].currentOwner == msg.sender ||
            virtualObjects[objectId].creator == msg.sender,
            "Not authorized"
        );
        
        ObjectStatus oldStatus = virtualObjects[objectId].status;
        virtualObjects[objectId].status = newStatus;
        virtualObjects[objectId].lastUpdated = block.timestamp;
        
        emit ObjectStatusChanged(objectId, oldStatus, newStatus);
        return true;
    }
    
    // ========================================================================
    // APPROVAL FUNCTIONS
    // ========================================================================
    
    /**
     * @dev Approve operator for specific object
     */
    function approveOperator(
        string memory objectId,
        address operator
    ) external onlyObjectOwner(objectId) returns (bool) {
        require(operator != address(0), "Invalid operator");
        
        // Remove existing approvals
        _removeFromArray(objectApprovedOperators[objectId], operator);
        
        // Add new approval
        objectApprovedOperators[objectId].push(operator);
        
        emit ObjectApproved(objectId, msg.sender, operator);
        return true;
    }
    
    /**
     * @dev Revoke operator approval
     */
    function revokeOperatorApproval(
        string memory objectId,
        address operator
    ) external onlyObjectOwner(objectId) returns (bool) {
        _removeFromArray(objectApprovedOperators[objectId], operator);
        return true;
    }
    
    /**
     * @dev Set approval for all objects
     */
    function setApprovalForAll(
        string memory objectId,
        bool approved
    ) external onlyObjectOwner(objectId) returns (bool) {
        objectApprovedForAll[objectId] = approved;
        return true;
    }
    
    // ========================================================================
    // QUERY FUNCTIONS
    // ========================================================================
    
    /**
     * @dev Get object details
     */
    function getObject(string memory objectId) external view returns (VirtualObject memory) {
        return virtualObjects[objectId];
    }
    
    /**
     * @dev Get user's objects
     */
    function getUserObjects(address user) external view returns (string[] memory) {
        return userObjects[user];
    }
    
    /**
     * @dev Get object transfer history
     */
    function getObjectTransferHistory(string memory objectId) external view returns (ObjectTransfer[] memory) {
        return objectTransferHistory[objectId];
    }
    
    /**
     * @dev Search objects by tags
     */
    function searchObjectsByTags(string[] memory tags) external view returns (string[] memory) {
        // This is a simplified search - in production you'd want a more sophisticated indexing system
        string[] memory results = new string[](objectCount);
        uint256 resultCount = 0;
        
        for (uint256 i = 0; i < objectCount; i++) {
            // This is a basic implementation - would need proper indexing for production
            if (resultCount < objectCount) {
                results[resultCount] = ""; // Placeholder
                resultCount++;
            }
        }
        
        return results;
    }
    
    /**
     * @dev Get objects by type
     */
    function getObjectsByType(ObjectType objectType) external view returns (string[] memory) {
        string[] memory results = new string[](objectCount);
        uint256 resultCount = 0;
        
        // This would need proper indexing for production use
        return results;
    }
    
    // ========================================================================
    // UTILITY FUNCTIONS
    // ========================================================================
    
    function _removeFromArray(string[] storage arr, string memory item) internal {
        for (uint256 i = 0; i < arr.length; i++) {
            if (keccak256(bytes(arr[i])) == keccak256(bytes(item))) {
                arr[i] = arr[arr.length - 1];
                arr.pop();
                break;
            }
        }
    }
    
    function _removeFromArray(address[] storage arr, address item) internal {
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i] == item) {
                arr[i] = arr[arr.length - 1];
                arr.pop();
                break;
            }
        }
    }
    
    // ========================================================================
    // ADMIN FUNCTIONS
    // ========================================================================
    
    function updateRegistrationFee(uint256 newFee) external onlyOwner {
        registrationFee = newFee;
    }
    
    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function emergencyPauseObject(string memory objectId) external onlyOwner {
        virtualObjects[objectId].status = ObjectStatus.Suspended;
        virtualObjects[objectId].lastUpdated = block.timestamp;
        
        emit ObjectStatusChanged(objectId, ObjectStatus.Active, ObjectStatus.Suspended);
    }
} 