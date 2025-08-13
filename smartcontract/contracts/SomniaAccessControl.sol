// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SomniaAccessControl is AccessControl, Pausable, ReentrancyGuard {
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant ATTESTER_ROLE = keccak256("ATTESTER_ROLE");
    bytes32 public constant EXPERIENCE_CREATOR_ROLE = keccak256("EXPERIENCE_CREATOR_ROLE");
    bytes32 public constant COMPONENT_CREATOR_ROLE = keccak256("COMPONENT_CREATOR_ROLE");
    bytes32 public constant BRIDGE_OPERATOR_ROLE = keccak256("BRIDGE_OPERATOR_ROLE");
    bytes32 public constant MARKETPLACE_OPERATOR_ROLE = keccak256("MARKETPLACE_OPERATOR_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    
    struct RoleInfo {
        string name;
        string description;
        uint256 memberCount;
        bool isActive;
        uint256 createdAt;
        uint256 lastUpdated;
    }
    
    struct Permission {
        bytes32 role;
        string resource;
        string action;
        bool isGranted;
        uint256 grantedAt;
        address grantedBy;
    }
    
    mapping(bytes32 => RoleInfo) public roleInfo;
    mapping(address => mapping(bytes32 => uint256)) public roleGrantedAt;
    mapping(address => mapping(bytes32 => uint256)) public roleExpiresAt;
    mapping(string => mapping(string => mapping(bytes32 => bool))) public resourcePermissions;
    mapping(address => Permission[]) public userPermissions;
    
    uint256 public totalRoles;
    uint256 public totalPermissions;
    uint256 public roleExpirationTime = 365 days;
    
    event RoleCreated(bytes32 indexed role, string name, string description);
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleExpired(bytes32 indexed role, address indexed account);
    event PermissionGranted(bytes32 indexed role, string resource, string action);
    event PermissionRevoked(bytes32 indexed role, string resource, string action);
    event EmergencyAction(string action, address indexed executor, uint256 timestamp);
    
    modifier onlyRole(bytes32 role) {
        require(hasRole(role, msg.sender), "AccessControl: missing role");
        _;
    }
    
    modifier onlyActiveRole(bytes32 role) {
        require(hasRole(role, msg.sender), "AccessControl: missing role");
        require(roleInfo[role].isActive, "Role not active");
        require(roleExpiresAt[msg.sender][role] == 0 || roleExpiresAt[msg.sender][role] > block.timestamp, "Role expired");
        _;
    }
    
    modifier onlyResourcePermission(string memory resource, string memory action) {
        require(hasResourcePermission(msg.sender, resource, action), "Missing resource permission");
        _;
    }
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
        
        // Initialize default roles
        _createRole(ADMIN_ROLE, "Administrator", "Full system access and control");
        _createRole(MODERATOR_ROLE, "Moderator", "Content moderation and user management");
        _createRole(ATTESTER_ROLE, "Attester", "Create and manage attestations");
        _createRole(EXPERIENCE_CREATOR_ROLE, "Experience Creator", "Create and manage virtual experiences");
        _createRole(COMPONENT_CREATOR_ROLE, "Component Creator", "Create and manage components");
        _createRole(BRIDGE_OPERATOR_ROLE, "Bridge Operator", "Manage cross-chain bridges");
        _createRole(MARKETPLACE_OPERATOR_ROLE, "Marketplace Operator", "Manage marketplace operations");
        _createRole(EMERGENCY_ROLE, "Emergency Operator", "Emergency system control");
        
        // Grant admin role to deployer
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MODERATOR_ROLE, msg.sender);
        _grantRole(ATTESTER_ROLE, msg.sender);
        _grantRole(EXPERIENCE_CREATOR_ROLE, msg.sender);
        _grantRole(COMPONENT_CREATOR_ROLE, msg.sender);
        _grantRole(BRIDGE_OPERATOR_ROLE, msg.sender);
        _grantRole(MARKETPLACE_OPERATOR_ROLE, msg.sender);
    }
    
    function createRole(
        bytes32 role,
        string memory name,
        string memory description
    ) external onlyRole(ADMIN_ROLE) returns (bool) {
        require(roleInfo[role].createdAt == 0, "Role already exists");
        
        return _createRole(role, name, description);
    }
    
    function _createRole(
        bytes32 role,
        string memory name,
        string memory description
    ) internal returns (bool) {
        roleInfo[role] = RoleInfo({
            name: name,
            description: description,
            memberCount: 0,
            isActive: true,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp
        });
        
        totalRoles++;
        
        emit RoleCreated(role, name, description);
        return true;
    }
    
    function grantRole(bytes32 role, address account) public override onlyRole(ADMIN_ROLE) {
        require(roleInfo[role].isActive, "Role not active");
        require(account != address(0), "Invalid account");
        
        super.grantRole(role, account);
        
        roleGrantedAt[account][role] = block.timestamp;
        roleExpiresAt[account][role] = block.timestamp + roleExpirationTime;
        roleInfo[role].memberCount++;
        roleInfo[role].lastUpdated = block.timestamp;
        
        emit RoleGranted(role, account, msg.sender);
    }
    
    function revokeRole(bytes32 role, address account) public override onlyRole(ADMIN_ROLE) {
        super.revokeRole(role, account);
        
        if (roleExpiresAt[account][role] > 0) {
            roleExpiresAt[account][role] = 0;
        }
        
        roleInfo[role].memberCount--;
        roleInfo[role].lastUpdated = block.timestamp;
        
        emit RoleRevoked(role, account, msg.sender);
    }
    
    function grantRoleWithExpiration(
        bytes32 role,
        address account,
        uint256 expirationTime
    ) external onlyRole(ADMIN_ROLE) returns (bool) {
        require(roleInfo[role].isActive, "Role not active");
        require(expirationTime > block.timestamp, "Invalid expiration time");
        
        super.grantRole(role, account);
        
        roleGrantedAt[account][role] = block.timestamp;
        roleExpiresAt[account][role] = expirationTime;
        roleInfo[role].memberCount++;
        roleInfo[role].lastUpdated = block.timestamp;
        
        emit RoleGranted(role, account, msg.sender);
        return true;
    }
    
    function extendRoleExpiration(
        bytes32 role,
        address account,
        uint256 additionalTime
    ) external onlyRole(ADMIN_ROLE) returns (bool) {
        require(hasRole(role, account), "Account does not have role");
        require(additionalTime > 0, "Invalid additional time");
        
        if (roleExpiresAt[account][role] == 0) {
            roleExpiresAt[account][role] = block.timestamp + additionalTime;
        } else {
            roleExpiresAt[account][role] += additionalTime;
        }
        
        roleInfo[role].lastUpdated = block.timestamp;
        return true;
    }
    
    function grantResourcePermission(
        bytes32 role,
        string memory resource,
        string memory action
    ) external onlyRole(ADMIN_ROLE) returns (bool) {
        require(roleInfo[role].isActive, "Role not active");
        
        resourcePermissions[resource][action][role] = true;
        totalPermissions++;
        
        emit PermissionGranted(role, resource, action);
        return true;
    }
    
    function revokeResourcePermission(
        bytes32 role,
        string memory resource,
        string memory action
    ) external onlyRole(ADMIN_ROLE) returns (bool) {
        require(resourcePermissions[resource][action][role], "Permission not granted");
        
        resourcePermissions[resource][action][role] = false;
        totalPermissions--;
        
        emit PermissionRevoked(role, resource, action);
        return true;
    }
    
    function hasResourcePermission(
        address account,
        string memory resource,
        string memory action
    ) public view returns (bool) {
        // Check if user has any role with this permission
        for (uint256 i = 0; i < totalRoles; i++) {
            bytes32 role = bytes32(i);
            if (hasRole(role, account) && 
                roleInfo[role].isActive && 
                resourcePermissions[resource][action][role]) {
                return true;
            }
        }
        return false;
    }
    
    function checkRoleExpiration(address account, bytes32 role) external view returns (uint256) {
        return roleExpiresAt[account][role];
    }
    
    function isRoleExpired(address account, bytes32 role) external view returns (bool) {
        if (roleExpiresAt[account][role] == 0) return false;
        return roleExpiresAt[account][role] <= block.timestamp;
    }
    
    function getRoleInfo(bytes32 role) external view returns (RoleInfo memory) {
        return roleInfo[role];
    }
    
    function getUserRoles(address account) external view returns (bytes32[] memory) {
        bytes32[] memory roles = new bytes32[](totalRoles);
        uint256 roleCount = 0;
        
        for (uint256 i = 0; i < totalRoles; i++) {
            bytes32 role = bytes32(i);
            if (hasRole(role, account)) {
                roles[roleCount] = role;
                roleCount++;
            }
        }
        
        // Resize array to actual count
        bytes32[] memory result = new bytes32[](roleCount);
        for (uint256 i = 0; i < roleCount; i++) {
            result[i] = roleCount;
        }
        
        return result;
    }
    
    function getRoleMembers(bytes32 role) external view returns (address[] memory) {
        // This is a simplified implementation
        // In production, you'd want to maintain a list of role members
        address[] memory members = new address[](10); // Placeholder
        return members;
    }
    
    function updateRoleInfo(
        bytes32 role,
        string memory name,
        string memory description,
        bool isActive
    ) external onlyRole(ADMIN_ROLE) returns (bool) {
        require(roleInfo[role].createdAt > 0, "Role does not exist");
        
        roleInfo[role].name = name;
        roleInfo[role].description = description;
        roleInfo[role].isActive = isActive;
        roleInfo[role].lastUpdated = block.timestamp;
        
        return true;
    }
    
    function updateRoleExpirationTime(uint256 newExpirationTime) external onlyRole(ADMIN_ROLE) returns (bool) {
        require(newExpirationTime > 0, "Invalid expiration time");
        roleExpirationTime = newExpirationTime;
        return true;
    }
    
    function pause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
        emit EmergencyAction("System Paused", msg.sender, block.timestamp);
    }
    
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
        emit EmergencyAction("System Unpaused", msg.sender, block.timestamp);
    }
    
    function emergencyRevokeAllRoles(address account) external onlyRole(EMERGENCY_ROLE) returns (bool) {
        require(account != address(0), "Invalid account");
        
        // Revoke all roles from account
        for (uint256 i = 0; i < totalRoles; i++) {
            bytes32 role = bytes32(i);
            if (hasRole(role, account)) {
                super.revokeRole(role, account);
                roleExpiresAt[account][role] = 0;
                roleInfo[role].memberCount--;
                roleInfo[role].lastUpdated = block.timestamp;
                
                emit RoleRevoked(role, account, msg.sender);
            }
        }
        
        emit EmergencyAction("All Roles Revoked", msg.sender, block.timestamp);
        return true;
    }
    
    function emergencyPauseRole(bytes32 role) external onlyRole(EMERGENCY_ROLE) returns (bool) {
        require(roleInfo[role].createdAt > 0, "Role does not exist");
        
        roleInfo[role].isActive = false;
        roleInfo[role].lastUpdated = block.timestamp;
        
        emit EmergencyAction("Role Paused", msg.sender, block.timestamp);
        return true;
    }
    
    function emergencyUnpauseRole(bytes32 role) external onlyRole(ADMIN_ROLE) returns (bool) {
        require(roleInfo[role].createdAt > 0, "Role does not exist");
        
        roleInfo[role].isActive = true;
        roleInfo[role].lastUpdated = block.timestamp;
        
        return true;
    }
    
    function getTotalRoles() external view returns (uint256) {
        return totalRoles;
    }
    
    function getTotalPermissions() external view returns (uint256) {
        return totalPermissions;
    }
    
    function getRoleExpirationTime() external view returns (uint256) {
        return roleExpirationTime;
    }
} 