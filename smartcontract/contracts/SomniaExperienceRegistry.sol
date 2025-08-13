// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SomniaExperienceRegistry is Ownable, ReentrancyGuard {
    
    enum ExperienceStatus { Active, UnderDevelopment, Paused, Suspended, Deleted }
    enum ExperienceType { Game, Social, Educational, Creative, Commercial, Entertainment, Utility, Custom }
    enum ComponentType { Visual, Audio, Physics, AI, Networking, Storage, Security, Custom }
    
    struct VirtualExperience {
        string experienceId;
        string name;
        string description;
        address owner;
        ExperienceType experienceType;
        ExperienceStatus status;
        string[] supportedObjectTypes;
        string[] components;
        string[] tags;
        string metadataUri;
        uint256 maxPlayers;
        uint256 currentPlayers;
        uint256 rating;
        uint256 totalRatings;
        uint256 createdAt;
        uint256 lastUpdated;
        uint256 version;
        bool isPublic;
        bool isComposable;
        uint256 accessFee;
    }
    
    struct Component {
        string componentId;
        string name;
        string description;
        address creator;
        ComponentType componentType;
        string metadataUri;
        string[] dependencies;
        uint256 version;
        bool isActive;
        uint256 usageCount;
        uint256 createdAt;
        uint256 lastUpdated;
    }
    
    mapping(string => VirtualExperience) public virtualExperiences;
    mapping(string => Component) public components;
    mapping(address => string[]) public userExperiences;
    mapping(address => string[]) public userComponents;
    
    uint256 public experienceCount;
    uint256 public componentCount;
    uint256 public experienceRegistrationFee = 0.002 ether;
    uint256 public componentRegistrationFee = 0.001 ether;
    
    event ExperienceRegistered(string indexed experienceId, address indexed owner, string name);
    event ComponentRegistered(string indexed componentId, address indexed creator, string name);
    
    constructor() Ownable(msg.sender) {}
    
    function registerVirtualExperience(
        string memory experienceId,
        string memory name,
        string memory description,
        ExperienceType experienceType,
        string[] memory supportedObjectTypes,
        string[] memory tags,
        string memory metadataUri,
        uint256 maxPlayers,
        bool isPublic,
        bool isComposable
    ) external payable returns (bool) {
        require(bytes(experienceId).length > 0, "Invalid experience ID");
        require(virtualExperiences[experienceId].owner == address(0), "Experience already exists");
        require(msg.value >= experienceRegistrationFee, "Insufficient fee");
        
        VirtualExperience memory newExperience = VirtualExperience({
            experienceId: experienceId,
            name: name,
            description: description,
            owner: msg.sender,
            experienceType: experienceType,
            status: ExperienceStatus.UnderDevelopment,
            supportedObjectTypes: supportedObjectTypes,
            components: new string[](0),
            tags: tags,
            metadataUri: metadataUri,
            maxPlayers: maxPlayers,
            currentPlayers: 0,
            rating: 0,
            totalRatings: 0,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp,
            version: 1,
            isPublic: isPublic,
            isComposable: isComposable,
            accessFee: 0
        });
        
        virtualExperiences[experienceId] = newExperience;
        userExperiences[msg.sender].push(experienceId);
        experienceCount++;
        
        emit ExperienceRegistered(experienceId, msg.sender, name);
        return true;
    }
    
    function registerComponent(
        string memory componentId,
        string memory name,
        string memory description,
        ComponentType componentType,
        string memory metadataUri
    ) external payable returns (bool) {
        require(bytes(componentId).length > 0, "Invalid component ID");
        require(components[componentId].creator == address(0), "Component already exists");
        require(msg.value >= componentRegistrationFee, "Insufficient fee");
        
        Component memory newComponent = Component({
            componentId: componentId,
            name: name,
            description: description,
            creator: msg.sender,
            componentType: componentType,
            metadataUri: metadataUri,
            dependencies: new string[](0),
            version: 1,
            isActive: true,
            usageCount: 0,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp
        });
        
        components[componentId] = newComponent;
        userComponents[msg.sender].push(componentId);
        componentCount++;
        
        emit ComponentRegistered(componentId, msg.sender, name);
        return true;
    }
    
    function getExperience(string memory experienceId) external view returns (VirtualExperience memory) {
        return virtualExperiences[experienceId];
    }
    
    function getComponent(string memory componentId) external view returns (Component memory) {
        return components[componentId];
    }
    
    function getUserExperiences(address user) external view returns (string[] memory) {
        return userExperiences[user];
    }
    
    function getUserComponents(address user) external view returns (string[] memory) {
        return userComponents[user];
    }
    
    function updateExperienceStatus(string memory experienceId, ExperienceStatus newStatus) external {
        require(virtualExperiences[experienceId].owner == msg.sender, "Not owner");
        virtualExperiences[experienceId].status = newStatus;
        virtualExperiences[experienceId].lastUpdated = block.timestamp;
    }
    
    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
} 