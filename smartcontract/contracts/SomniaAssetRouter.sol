// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SomniaAssetRouter
 * @dev Routes virtual assets and experiences across Somnia's SOM0 and SOM1 protocols
 * 
 * SOM0: Asset interoperability & commerce
 * SOM1: Composable virtual worlds
 */
contract SomniaAssetRouter {
    
    // ========================================================================
    // STRUCTS & INTERFACES
    // ========================================================================
    
    struct VirtualObject {
        address objectAddress;
        string objectId;           // Unique identifier across the network
        string metadataUri;        // IPFS or other metadata storage
        address creator;           // Original creator
        address currentOwner;      // Current owner
        string objectType;         // "nft", "wearable", "gadget", "experience"
        bool isActive;             // Whether object can be routed
        uint256 createdAt;
        uint256 lastUpdated;
    }
    
    struct VirtualExperience {
        address experienceAddress;
        string experienceId;
        string name;
        string description;
        address owner;
        string[] supportedObjectTypes;  // What objects this experience supports
        bool isActive;
        uint256 createdAt;
    }
    
    struct Route {
        VirtualObject object;
        VirtualExperience[] path;      // Path through experiences
        uint256 estimatedCost;         // Cost to route through all experiences
        uint256 estimatedTime;         // Estimated time for routing
        bool isDirect;                 // Direct route or multi-hop
    }
    
    struct Attestation {
        address attester;              // Who made the attestation
        address subject;               // What/who is being attested
        string attestationType;        // "authenticity", "age", "moderation"
        string value;                  // The attestation value
        uint256 validUntil;            // When attestation expires
        bool isValid;
    }
    
    // ========================================================================
    // STATE VARIABLES
    // ========================================================================
    
    address public owner;
    mapping(string => VirtualObject) public virtualObjects;           // objectId => VirtualObject
    mapping(string => VirtualExperience) public virtualExperiences;   // experienceId => VirtualExperience
    mapping(address => string[]) public userObjects;                  // user => objectIds[]
    mapping(address => string[]) public userExperiences;              // user => experienceIds[]
    mapping(string => Attestation[]) public objectAttestations;       // objectId => Attestations[]
    
    uint256 public objectCount;
    uint256 public experienceCount;
    uint256 public routingFee = 0.001 ether;  // Fee for routing assets
    
    // ========================================================================
    // EVENTS
    // ========================================================================
    
    event VirtualObjectRegistered(string indexed objectId, address indexed creator, string objectType);
    event VirtualExperienceRegistered(string indexed experienceId, address indexed owner);
    event AssetRouted(string indexed objectId, string[] experiencePath, address indexed user);
    event AttestationCreated(string indexed objectId, address indexed attester, string attestationType);
    event ExperienceComposed(string indexed experienceId, string[] componentIds);
    
    // ========================================================================
    // MODIFIERS
    // ========================================================================
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyObjectOwner(string memory objectId) {
        require(virtualObjects[objectId].currentOwner == msg.sender, "Not object owner");
        _;
    }
    
    modifier onlyExperienceOwner(string memory experienceId) {
        require(virtualExperiences[experienceId].owner == msg.sender, "Not experience owner");
        _;
    }
    
    // ========================================================================
    // CONSTRUCTOR
    // ========================================================================
    
    constructor() {
        owner = msg.sender;
    }
    
    // ========================================================================
    // CORE FUNCTIONS - SOM0 Object Protocol
    // ========================================================================
    
    /**
     * @dev Register a new virtual object (SOM0 Object Protocol)
     */
    function registerVirtualObject(
        string memory objectId,
        string memory metadataUri,
        string memory objectType
    ) external returns (bool) {
        require(bytes(objectId).length > 0, "Invalid object ID");
        require(bytes(metadataUri).length > 0, "Invalid metadata URI");
        require(virtualObjects[objectId].objectAddress == address(0), "Object already exists");
        
        VirtualObject memory newObject = VirtualObject({
            objectAddress: msg.sender,
            objectId: objectId,
            metadataUri: metadataUri,
            creator: msg.sender,
            currentOwner: msg.sender,
            objectType: objectType,
            isActive: true,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp
        });
        
        virtualObjects[objectId] = newObject;
        userObjects[msg.sender].push(objectId);
        objectCount++;
        
        emit VirtualObjectRegistered(objectId, msg.sender, objectType);
        return true;
    }
    
    /**
     * @dev Transfer ownership of a virtual object
     */
    function transferObjectOwnership(string memory objectId, address newOwner) 
        external onlyObjectOwner(objectId) returns (bool) {
        require(newOwner != address(0), "Invalid new owner");
        
        virtualObjects[objectId].currentOwner = newOwner;
        virtualObjects[objectId].lastUpdated = block.timestamp;
        
        // Update user mappings
        _removeFromArray(userObjects[msg.sender], objectId);
        userObjects[newOwner].push(objectId);
        
        return true;
    }
    
    // ========================================================================
    // CORE FUNCTIONS - SOM0 Attestation Protocol
    // ========================================================================
    
    /**
     * @dev Create an attestation for a virtual object
     */
    function createAttestation(
        string memory objectId,
        string memory attestationType,
        string memory value,
        uint256 validUntil
    ) external returns (bool) {
        require(virtualObjects[objectId].objectAddress != address(0), "Object not found");
        require(validUntil > block.timestamp, "Invalid expiration time");
        
        Attestation memory newAttestation = Attestation({
            attester: msg.sender,
            subject: virtualObjects[objectId].objectAddress,
            attestationType: attestationType,
            value: value,
            validUntil: validUntil,
            isValid: true
        });
        
        objectAttestations[objectId].push(newAttestation);
        
        emit AttestationCreated(objectId, msg.sender, attestationType);
        return true;
    }
    
    // ========================================================================
    // CORE FUNCTIONS - SOM1 Virtual Experience Protocol
    // ========================================================================
    
    /**
     * @dev Register a new virtual experience (SOM1)
     */
    function registerVirtualExperience(
        string memory experienceId,
        string memory name,
        string memory description,
        string[] memory supportedObjectTypes
    ) external returns (bool) {
        require(bytes(experienceId).length > 0, "Invalid experience ID");
        require(virtualExperiences[experienceId].experienceAddress == address(0), "Experience already exists");
        
        VirtualExperience memory newExperience = VirtualExperience({
            experienceAddress: msg.sender,
            experienceId: experienceId,
            name: name,
            description: description,
            owner: msg.sender,
            supportedObjectTypes: supportedObjectTypes,
            isActive: true,
            createdAt: block.timestamp
        });
        
        virtualExperiences[experienceId] = newExperience;
        userExperiences[msg.sender].push(experienceId);
        experienceCount++;
        
        emit VirtualExperienceRegistered(experienceId, msg.sender);
        return true;
    }
    
    // ========================================================================
    // ROUTING FUNCTIONS - Core SOLR Functionality
    // ========================================================================
    
    /**
     * @dev Find the best route for an asset through virtual experiences
     */
    function findBestRoute(
        string memory objectId,
        string[] memory targetExperiences
    ) external view returns (Route memory bestRoute) {
        require(virtualObjects[objectId].objectAddress != address(0), "Object not found");
        require(virtualObjects[objectId].isActive, "Object not active");
        
        VirtualObject memory object = virtualObjects[objectId];
        VirtualExperience[] memory path = new VirtualExperience[](targetExperiences.length);
        uint256 totalCost = 0;
        
        // Build route through target experiences
        for (uint256 i = 0; i < targetExperiences.length; i++) {
            string memory expId = targetExperiences[i];
            require(virtualExperiences[expId].experienceAddress != address(0), "Experience not found");
            require(virtualExperiences[expId].isActive, "Experience not active");
            
            // Check if experience supports this object type
            bool isSupported = false;
            for (uint256 j = 0; j < virtualExperiences[expId].supportedObjectTypes.length; j++) {
                if (keccak256(bytes(virtualExperiences[expId].supportedObjectTypes[j])) == 
                    keccak256(bytes(object.objectType))) {
                    isSupported = true;
                    break;
                }
            }
            require(isSupported, "Object type not supported by experience");
            
            path[i] = virtualExperiences[expId];
            totalCost += routingFee;
        }
        
        bestRoute = Route({
            object: object,
            path: path,
            estimatedCost: totalCost,
            estimatedTime: targetExperiences.length * 1 hours, // Rough estimate
            isDirect: targetExperiences.length == 1
        });
    }
    
    /**
     * @dev Execute asset routing through virtual experiences
     */
    function executeAssetRouting(
        string memory objectId,
        string[] memory targetExperiences
    ) external payable returns (bool) {
        require(msg.value >= routingFee * targetExperiences.length, "Insufficient routing fee");
        
        Route memory route = findBestRoute(objectId, targetExperiences);
        require(route.object.currentOwner == msg.sender, "Not object owner");
        
        // Execute routing logic here
        // This would involve calling the actual experience contracts
        
        emit AssetRouted(objectId, targetExperiences, msg.sender);
        return true;
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
    
    function updateRoutingFee(uint256 newFee) external onlyOwner {
        routingFee = newFee;
    }
    
    function withdrawFees() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    // ========================================================================
    // VIEW FUNCTIONS
    // ========================================================================
    
    function getObject(string memory objectId) external view returns (VirtualObject memory) {
        return virtualObjects[objectId];
    }
    
    function getExperience(string memory experienceId) external view returns (VirtualExperience memory) {
        return virtualExperiences[experienceId];
    }
    
    function getUserObjects(address user) external view returns (string[] memory) {
        return userObjects[user];
    }
    
    function getUserExperiences(address user) external view returns (string[] memory) {
        return userExperiences[user];
    }
    
    function getObjectAttestations(string memory objectId) external view returns (Attestation[] memory) {
        return objectAttestations[objectId];
    }
} 