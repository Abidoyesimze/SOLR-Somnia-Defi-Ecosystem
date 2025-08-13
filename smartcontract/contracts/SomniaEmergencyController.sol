// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SomniaEmergencyController is Ownable, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    enum EmergencyLevel { None, Low, Medium, High, Critical }
    enum EmergencyType { 
        Security, 
        Economic, 
        Technical, 
        Regulatory, 
        Network, 
        Governance, 
        Custom 
    }
    
    enum ActionType { 
        Pause, 
        Unpause, 
        Freeze, 
        Unfreeze, 
        Revert, 
        Update, 
        EmergencyWithdraw, 
        Custom 
    }
    
    struct Emergency {
        uint256 emergencyId;
        EmergencyLevel level;
        EmergencyType emergencyType;
        string description;
        address reporter;
        uint256 reportedAt;
        bool isResolved;
        uint256 resolvedAt;
        address resolvedBy;
        string resolutionNotes;
        ActionType[] actionsTaken;
        uint256 totalActions;
    }
    
    struct EmergencyAction {
        uint256 actionId;
        uint256 emergencyId;
        ActionType actionType;
        address executor;
        string target;
        string parameters;
        uint256 executedAt;
        bool wasSuccessful;
        string result;
        uint256 gasUsed;
    }
    
    struct RecoveryPlan {
        uint256 planId;
        string name;
        string description;
        EmergencyType[] applicableTypes;
        ActionType[] requiredActions;
        uint256 estimatedTime;
        bool isActive;
        uint256 createdAt;
        uint256 lastUpdated;
    }
    
    struct EmergencyContact {
        address contactAddress;
        string name;
        string role;
        EmergencyLevel maxAuthority;
        bool isActive;
        uint256 lastContact;
        uint256 totalEmergencies;
    }
    
    mapping(uint256 => Emergency) public emergencies;
    mapping(uint256 => EmergencyAction) public emergencyActions;
    mapping(uint256 => RecoveryPlan) public recoveryPlans;
    mapping(address => EmergencyContact) public emergencyContacts;
    mapping(EmergencyType => uint256[]) public emergencyTypeHistory;
    mapping(address => uint256[]) public contactEmergencyHistory;
    
    Counters.Counter private _emergencyIds;
    Counters.Counter private _actionIds;
    Counters.Counter private _planIds;
    
    uint256 public totalEmergencies;
    uint256 public totalActions;
    uint256 public totalRecoveryPlans;
    uint256 public emergencyThreshold = 3; // Minimum emergencies before auto-escalation
    uint256 public autoEscalationTime = 1 hours; // Time before auto-escalation
    uint256 public lastEmergencyTime;
    
    EmergencyLevel public currentEmergencyLevel = EmergencyLevel.None;
    bool public emergencyMode = false;
    bool public autoRecoveryEnabled = true;
    
    event EmergencyDeclared(uint256 indexed emergencyId, EmergencyLevel level, EmergencyType emergencyType, string description);
    event EmergencyResolved(uint256 indexed emergencyId, address indexed resolver, string resolutionNotes);
    event EmergencyActionExecuted(uint256 indexed actionId, uint256 indexed emergencyId, ActionType actionType, string target);
    event RecoveryPlanCreated(uint256 indexed planId, string name, EmergencyType[] applicableTypes);
    event EmergencyContactAdded(address indexed contact, string name, string role, EmergencyLevel maxAuthority);
    event EmergencyModeActivated(EmergencyLevel level, uint256 timestamp);
    event EmergencyModeDeactivated(uint256 timestamp);
    
    modifier onlyEmergencyContact() {
        require(emergencyContacts[msg.sender].isActive, "Not an emergency contact");
        _;
    }
    
    modifier onlyAuthorizedContact(EmergencyLevel requiredLevel) {
        require(emergencyContacts[msg.sender].isActive, "Not an emergency contact");
        require(emergencyContacts[msg.sender].maxAuthority >= requiredLevel, "Insufficient authority level");
        _;
    }
    
    modifier emergencyModeActive() {
        require(emergencyMode, "Emergency mode not active");
        _;
    }
    
    modifier emergencyModeInactive() {
        require(!emergencyMode, "Emergency mode is active");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        _initializeDefaultContacts();
        _initializeDefaultRecoveryPlans();
    }
    
    function _initializeDefaultContacts() internal {
        // Add deployer as primary emergency contact
        _addEmergencyContact(msg.sender, "Primary Contact", "System Owner", EmergencyLevel.Critical);
        
        // Add deployer as emergency contact
        emergencyContacts[msg.sender] = EmergencyContact({
            contactAddress: msg.sender,
            name: "Primary Contact",
            role: "System Owner",
            maxAuthority: EmergencyLevel.Critical,
            isActive: true,
            lastContact: block.timestamp,
            totalEmergencies: 0
        });
    }
    
    function _initializeDefaultRecoveryPlans() internal {
        // Security recovery plan
        _createRecoveryPlan(
            "Security Breach Recovery",
            "Recovery procedures for security-related emergencies",
            [EmergencyType.Security],
            [ActionType.Pause, ActionType.Freeze, ActionType.EmergencyWithdraw],
            24 hours
        );
        
        // Economic recovery plan
        _createRecoveryPlan(
            "Economic Crisis Recovery",
            "Recovery procedures for economic emergencies",
            [EmergencyType.Economic],
            [ActionType.Pause, ActionType.Freeze],
            12 hours
        );
        
        // Technical recovery plan
        _createRecoveryPlan(
            "Technical Failure Recovery",
            "Recovery procedures for technical emergencies",
            [EmergencyType.Technical],
            [ActionType.Pause, ActionType.Update],
            6 hours
        );
    }
    
    function declareEmergency(
        EmergencyLevel level,
        EmergencyType emergencyType,
        string memory description
    ) external onlyEmergencyContact returns (uint256) {
        require(level != EmergencyLevel.None, "Invalid emergency level");
        require(bytes(description).length > 0, "Description required");
        
        uint256 emergencyId = _emergencyIds.current();
        _emergencyIds.increment();
        
        Emergency memory newEmergency = Emergency({
            emergencyId: emergencyId,
            level: level,
            emergencyType: emergencyType,
            description: description,
            reporter: msg.sender,
            reportedAt: block.timestamp,
            isResolved: false,
            resolvedAt: 0,
            resolvedBy: address(0),
            resolutionNotes: "",
            actionsTaken: new ActionType[](0),
            totalActions: 0
        });
        
        emergencies[emergencyId] = newEmergency;
        emergencyTypeHistory[emergencyType].push(emergencyId);
        contactEmergencyHistory[msg.sender].push(emergencyId);
        
        totalEmergencies++;
        lastEmergencyTime = block.timestamp;
        
        // Update emergency contact stats
        emergencyContacts[msg.sender].totalEmergencies++;
        emergencyContacts[msg.sender].lastContact = block.timestamp;
        
        // Auto-escalate if threshold met
        if (level >= EmergencyLevel.High || _shouldAutoEscalate()) {
            _activateEmergencyMode(level);
        }
        
        emit EmergencyDeclared(emergencyId, level, emergencyType, description);
        return emergencyId;
    }
    
    function executeEmergencyAction(
        uint256 emergencyId,
        ActionType actionType,
        string memory target,
        string memory parameters
    ) external onlyAuthorizedContact(EmergencyLevel.High) returns (uint256) {
        require(emergencies[emergencyId].reporter != address(0), "Emergency not found");
        require(!emergencies[emergencyId].isResolved, "Emergency already resolved");
        
        uint256 actionId = _actionIds.current();
        _actionIds.increment();
        
        EmergencyAction memory newAction = EmergencyAction({
            actionId: actionId,
            emergencyId: emergencyId,
            actionType: actionType,
            executor: msg.sender,
            target: target,
            parameters: parameters,
            executedAt: block.timestamp,
            wasSuccessful: false,
            result: "",
            gasUsed: 0
        });
        
        emergencyActions[actionId] = newAction;
        totalActions++;
        
        // Execute the action
        bool success = _executeAction(actionType, target, parameters);
        emergencyActions[actionId].wasSuccessful = success;
        emergencyActions[actionId].result = success ? "Success" : "Failed";
        
        // Update emergency record
        Emergency storage emergency = emergencies[emergencyId];
        emergency.actionsTaken.push(actionType);
        emergency.totalActions++;
        
        emit EmergencyActionExecuted(actionId, emergencyId, actionType, target);
        return actionId;
    }
    
    function resolveEmergency(
        uint256 emergencyId,
        string memory resolutionNotes
    ) external onlyAuthorizedContact(EmergencyLevel.Medium) returns (bool) {
        require(emergencies[emergencyId].reporter != address(0), "Emergency not found");
        require(!emergencies[emergencyId].isResolved, "Emergency already resolved");
        
        Emergency storage emergency = emergencies[emergencyId];
        emergency.isResolved = true;
        emergency.resolvedAt = block.timestamp;
        emergency.resolvedBy = msg.sender;
        emergency.resolutionNotes = resolutionNotes;
        
        // Check if we can deactivate emergency mode
        if (_canDeactivateEmergencyMode()) {
            _deactivateEmergencyMode();
        }
        
        emit EmergencyResolved(emergencyId, msg.sender, resolutionNotes);
        return true;
    }
    
    function addEmergencyContact(
        address contact,
        string memory name,
        string memory role,
        EmergencyLevel maxAuthority
    ) external onlyOwner returns (bool) {
        require(contact != address(0), "Invalid contact address");
        require(emergencyContacts[contact].contactAddress == address(0), "Contact already exists");
        require(bytes(name).length > 0, "Name required");
        require(bytes(role).length > 0, "Role required");
        
        return _addEmergencyContact(contact, name, role, maxAuthority);
    }
    
    function _addEmergencyContact(
        address contact,
        string memory name,
        string memory role,
        EmergencyLevel maxAuthority
    ) internal returns (bool) {
        emergencyContacts[contact] = EmergencyContact({
            contactAddress: contact,
            name: name,
            role: role,
            maxAuthority: maxAuthority,
            isActive: true,
            lastContact: 0,
            totalEmergencies: 0
        });
        
        emit EmergencyContactAdded(contact, name, role, maxAuthority);
        return true;
    }
    
    function createRecoveryPlan(
        string memory name,
        string memory description,
        EmergencyType[] memory applicableTypes,
        ActionType[] memory requiredActions,
        uint256 estimatedTime
    ) external onlyOwner returns (uint256) {
        return _createRecoveryPlan(name, description, applicableTypes, requiredActions, estimatedTime);
    }
    
    function _createRecoveryPlan(
        string memory name,
        string memory description,
        EmergencyType[] memory applicableTypes,
        ActionType[] memory requiredActions,
        uint256 estimatedTime
    ) internal returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(applicableTypes.length > 0, "Applicable types required");
        require(requiredActions.length > 0, "Required actions required");
        require(estimatedTime > 0, "Estimated time required");
        
        uint256 planId = _planIds.current();
        _planIds.increment();
        
        RecoveryPlan memory newPlan = RecoveryPlan({
            planId: planId,
            name: name,
            description: description,
            applicableTypes: applicableTypes,
            requiredActions: requiredActions,
            estimatedTime: estimatedTime,
            isActive: true,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp
        });
        
        recoveryPlans[planId] = newPlan;
        totalRecoveryPlans++;
        
        emit RecoveryPlanCreated(planId, name, applicableTypes);
        return planId;
    }
    
    function activateEmergencyMode(EmergencyLevel level) external onlyAuthorizedContact(EmergencyLevel.Critical) returns (bool) {
        return _activateEmergencyMode(level);
    }
    
    function _activateEmergencyMode(EmergencyLevel level) internal returns (bool) {
        require(level >= EmergencyLevel.High, "Only High or Critical level can activate emergency mode");
        
        emergencyMode = true;
        currentEmergencyLevel = level;
        
        emit EmergencyModeActivated(level, block.timestamp);
        return true;
    }
    
    function deactivateEmergencyMode() external onlyAuthorizedContact(EmergencyLevel.High) returns (bool) {
        return _deactivateEmergencyMode();
    }
    
    function _deactivateEmergencyMode() internal returns (bool) {
        require(emergencyMode, "Emergency mode not active");
        require(_canDeactivateEmergencyMode(), "Cannot deactivate emergency mode yet");
        
        emergencyMode = false;
        currentEmergencyLevel = EmergencyLevel.None;
        
        emit EmergencyModeDeactivated(block.timestamp);
        return true;
    }
    
    function _canDeactivateEmergencyMode() internal view returns (bool) {
        // Check if all active emergencies are resolved
        for (uint256 i = 0; i < totalEmergencies; i++) {
            if (!emergencies[i].isResolved) {
                return false;
            }
        }
        return true;
    }
    
    function _shouldAutoEscalate() internal view returns (bool) {
        // Auto-escalate if multiple emergencies in short time
        if (totalEmergencies >= emergencyThreshold) {
            return (block.timestamp - lastEmergencyTime) < autoEscalationTime;
        }
        return false;
    }
    
    function _executeAction(
        ActionType actionType,
        string memory target,
        string memory parameters
    ) internal returns (bool) {
        // This is a simplified implementation
        // In production, you'd integrate with actual contract functions
        
        if (actionType == ActionType.Pause) {
            _pause();
            return true;
        } else if (actionType == ActionType.Unpause) {
            _unpause();
            return true;
        } else if (actionType == ActionType.Freeze) {
            // Implement freeze logic
            return true;
        } else if (actionType == ActionType.Unfreeze) {
            // Implement unfreeze logic
            return true;
        }
        
        return false;
    }
    
    function updateEmergencyThreshold(uint256 newThreshold) external onlyOwner returns (bool) {
        require(newThreshold > 0, "Threshold must be positive");
        emergencyThreshold = newThreshold;
        return true;
    }
    
    function updateAutoEscalationTime(uint256 newTime) external onlyOwner returns (bool) {
        require(newTime > 0, "Time must be positive");
        autoEscalationTime = newTime;
        return true;
    }
    
    function toggleAutoRecovery() external onlyOwner returns (bool) {
        autoRecoveryEnabled = !autoRecoveryEnabled;
        return autoRecoveryEnabled;
    }
    
    function getEmergency(uint256 emergencyId) external view returns (Emergency memory) {
        return emergencies[emergencyId];
    }
    
    function getEmergencyAction(uint256 actionId) external view returns (EmergencyAction memory) {
        return emergencyActions[actionId];
    }
    
    function getRecoveryPlan(uint256 planId) external view returns (RecoveryPlan memory) {
        return recoveryPlans[planId];
    }
    
    function getEmergencyContact(address contact) external view returns (EmergencyContact memory) {
        return emergencyContacts[contact];
    }
    
    function getEmergencyTypeHistory(EmergencyType emergencyType) external view returns (uint256[] memory) {
        return emergencyTypeHistory[emergencyType];
    }
    
    function getContactEmergencyHistory(address contact) external view returns (uint256[] memory) {
        return contactEmergencyHistory[contact];
    }
    
    function getTotalEmergencies() external view returns (uint256) {
        return totalEmergencies;
    }
    
    function getTotalActions() external view returns (uint256) {
        return totalActions;
    }
    
    function getTotalRecoveryPlans() external view returns (uint256) {
        return totalRecoveryPlans;
    }
    
    function getCurrentEmergencyLevel() external view returns (EmergencyLevel) {
        return currentEmergencyLevel;
    }
    
    function isEmergencyModeActive() external view returns (bool) {
        return emergencyMode;
    }
    
    function getEmergencyThreshold() external view returns (uint256) {
        return emergencyThreshold;
    }
    
    function getAutoEscalationTime() external view returns (uint256) {
        return autoEscalationTime;
    }
    
    function isAutoRecoveryEnabled() external view returns (bool) {
        return autoRecoveryEnabled;
    }
    
    function emergencyPause() external onlyEmergencyContact {
        _pause();
    }
    
    function emergencyUnpause() external onlyAuthorizedContact(EmergencyLevel.Medium) {
        _unpause();
    }
    
    function emergencyWithdraw() external onlyAuthorizedContact(EmergencyLevel.Critical) returns (bool) {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            payable(owner()).transfer(balance);
            return true;
        }
        return false;
    }
} 