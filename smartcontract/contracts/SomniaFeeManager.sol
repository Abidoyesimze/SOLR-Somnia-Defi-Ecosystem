// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SomniaFeeManager is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    enum FeeType { 
        ObjectRegistration, 
        ExperienceRegistration, 
        ComponentRegistration, 
        AttestationCreation, 
        BridgeOperation, 
        MarketplaceTransaction, 
        RoutingFee, 
        Custom 
    }
    
    enum DistributionType { 
        Platform, 
        Creator, 
        Attester, 
        ExperienceOwner, 
        ComponentCreator, 
        Referrer, 
        Treasury, 
        Burn 
    }
    
    struct FeeConfig {
        FeeType feeType;
        uint256 baseAmount;
        uint256 dynamicMultiplier;
        bool isActive;
        uint256 minAmount;
        uint256 maxAmount;
        uint256 createdAt;
        uint256 lastUpdated;
    }
    
    struct DistributionConfig {
        DistributionType distType;
        uint256 percentage;
        address recipient;
        bool isActive;
        uint256 totalDistributed;
        uint256 lastDistribution;
    }
    
    struct RevenueShare {
        address recipient;
        uint256 percentage;
        uint256 totalEarned;
        uint256 lastClaimed;
        bool isActive;
        uint256 createdAt;
    }
    
    struct FeeCollection {
        uint256 collectionId;
        FeeType feeType;
        address payer;
        uint256 amount;
        string metadata;
        uint256 timestamp;
        bool isDistributed;
    }
    
    mapping(FeeType => FeeConfig) public feeConfigs;
    mapping(DistributionType => DistributionConfig) public distributionConfigs;
    mapping(address => RevenueShare) public revenueShares;
    mapping(uint256 => FeeCollection) public feeCollections;
    mapping(address => uint256[]) public userFeeCollections;
    mapping(FeeType => uint256) public totalFeesCollected;
    
    Counters.Counter private _collectionIds;
    
    uint256 public totalFeesDistributed;
    uint256 public totalRevenueShares;
    uint256 public platformTreasury;
    uint256 public burnAmount;
    uint256 public distributionThreshold = 0.1 ether;
    uint256 public lastDistributionTime;
    
    event FeeCollected(uint256 indexed collectionId, FeeType feeType, address indexed payer, uint256 amount);
    event FeeDistributed(uint256 indexed collectionId, DistributionType distType, address indexed recipient, uint256 amount);
    event RevenueShareCreated(address indexed recipient, uint256 percentage);
    event RevenueShareClaimed(address indexed recipient, uint256 amount);
    event FeeConfigUpdated(FeeType indexed feeType, uint256 newAmount, uint256 newMultiplier);
    event DistributionConfigUpdated(DistributionType indexed distType, uint256 newPercentage, address newRecipient);
    
    modifier feeTypeExists(FeeType feeType) {
        require(feeConfigs[feeType].isActive, "Fee type not configured");
        _;
    }
    
    modifier distributionTypeExists(DistributionType distType) {
        require(distributionConfigs[distType].isActive, "Distribution type not configured");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        _initializeDefaultConfigs();
    }
    
    function _initializeDefaultConfigs() internal {
        // Initialize fee configurations
        _setFeeConfig(FeeType.ObjectRegistration, 0.001 ether, 100, 0.0001 ether, 0.01 ether);
        _setFeeConfig(FeeType.ExperienceRegistration, 0.002 ether, 100, 0.0005 ether, 0.02 ether);
        _setFeeConfig(FeeType.ComponentRegistration, 0.001 ether, 100, 0.0001 ether, 0.01 ether);
        _setFeeConfig(FeeType.AttestationCreation, 0.0005 ether, 100, 0.0001 ether, 0.005 ether);
        _setFeeConfig(FeeType.BridgeOperation, 0.005 ether, 120, 0.001 ether, 0.05 ether);
        _setFeeConfig(FeeType.MarketplaceTransaction, 0.0025 ether, 100, 0.0005 ether, 0.025 ether);
        _setFeeConfig(FeeType.RoutingFee, 0.0001 ether, 100, 0.00001 ether, 0.001 ether);
        
        // Initialize distribution configurations
        _setDistributionConfig(DistributionType.Platform, 30, address(0)); // 30% to platform
        _setDistributionConfig(DistributionType.Creator, 25, address(0)); // 25% to creators
        _setDistributionConfig(DistributionType.Attester, 15, address(0)); // 15% to attesters
        _setDistributionConfig(DistributionType.ExperienceOwner, 15, address(0)); // 15% to experience owners
        _setDistributionConfig(DistributionType.ComponentCreator, 10, address(0)); // 10% to component creators
        _setDistributionConfig(DistributionType.Treasury, 5, address(0)); // 5% to treasury
    }
    
    function collectFee(
        FeeType feeType,
        string memory metadata
    ) external payable feeTypeExists(feeType) returns (uint256) {
        FeeConfig storage config = feeConfigs[feeType];
        require(msg.value >= config.minAmount, "Fee too low");
        require(msg.value <= config.maxAmount, "Fee too high");
        
        uint256 collectionId = _collectionIds.current();
        _collectionIds.increment();
        
        FeeCollection memory newCollection = FeeCollection({
            collectionId: collectionId,
            feeType: feeType,
            payer: msg.sender,
            amount: msg.value,
            metadata: metadata,
            timestamp: block.timestamp,
            isDistributed: false
        });
        
        feeCollections[collectionId] = newCollection;
        userFeeCollections[msg.sender].push(collectionId);
        totalFeesCollected[feeType] += msg.value;
        
        emit FeeCollected(collectionId, feeType, msg.sender, msg.value);
        
        // Auto-distribute if threshold met
        if (address(this).balance >= distributionThreshold) {
            _distributeFees();
        }
        
        return collectionId;
    }
    
    function _distributeFees() internal {
        uint256 totalBalance = address(this).balance;
        require(totalBalance >= distributionThreshold, "Insufficient balance for distribution");
        
        // Distribute according to configured percentages
        for (uint256 i = 0; i < 8; i++) {
            DistributionType distType = DistributionType(i);
            DistributionConfig storage config = distributionConfigs[distType];
            
            if (config.isActive && config.percentage > 0) {
                uint256 distributionAmount = (totalBalance * config.percentage) / 100;
                
                if (distributionAmount > 0) {
                    if (distType == DistributionType.Burn) {
                        // Burn tokens (send to zero address)
                        payable(address(0)).transfer(distributionAmount);
                        burnAmount += distributionAmount;
                    } else if (config.recipient != address(0)) {
                        // Send to configured recipient
                        payable(config.recipient).transfer(distributionAmount);
                        config.totalDistributed += distributionAmount;
                        config.lastDistribution = block.timestamp;
                    } else {
                        // Add to platform treasury
                        platformTreasury += distributionAmount;
                    }
                    
                    totalFeesDistributed += distributionAmount;
                }
            }
        }
        
        lastDistributionTime = block.timestamp;
    }
    
    function manualDistributeFees() external onlyOwner returns (bool) {
        require(address(this).balance > 0, "No fees to distribute");
        _distributeFees();
        return true;
    }
    
    function createRevenueShare(
        address recipient,
        uint256 percentage
    ) external onlyOwner returns (bool) {
        require(recipient != address(0), "Invalid recipient");
        require(percentage > 0 && percentage <= 100, "Invalid percentage");
        require(revenueShares[recipient].recipient == address(0), "Revenue share already exists");
        
        RevenueShare memory newShare = RevenueShare({
            recipient: recipient,
            percentage: percentage,
            totalEarned: 0,
            lastClaimed: 0,
            isActive: true,
            createdAt: block.timestamp
        });
        
        revenueShares[recipient] = newShare;
        totalRevenueShares++;
        
        emit RevenueShareCreated(recipient, percentage);
        return true;
    }
    
    function claimRevenueShare() external nonReentrant returns (uint256) {
        RevenueShare storage share = revenueShares[msg.sender];
        require(share.isActive, "Revenue share not active");
        require(share.percentage > 0, "No revenue share");
        
        uint256 claimableAmount = _calculateClaimableAmount(msg.sender);
        require(claimableAmount > 0, "Nothing to claim");
        
        share.totalEarned += claimableAmount;
        share.lastClaimed = block.timestamp;
        
        payable(msg.sender).transfer(claimableAmount);
        
        emit RevenueShareClaimed(msg.sender, claimableAmount);
        return claimableAmount;
    }
    
    function _calculateClaimableAmount(address recipient) internal view returns (uint256) {
        RevenueShare storage share = revenueShares[recipient];
        if (!share.isActive || share.percentage == 0) return 0;
        
        // Calculate based on total fees collected since last claim
        uint256 totalFeesSinceLastClaim = 0;
        for (uint256 i = 0; i < 8; i++) {
            FeeType feeType = FeeType(i);
            totalFeesSinceLastClaim += totalFeesCollected[feeType];
        }
        
        uint256 claimable = (totalFeesSinceLastClaim * share.percentage) / 100;
        return claimable;
    }
    
    function setFeeConfig(
        FeeType feeType,
        uint256 baseAmount,
        uint256 dynamicMultiplier,
        uint256 minAmount,
        uint256 maxAmount
    ) external onlyOwner returns (bool) {
        return _setFeeConfig(feeType, baseAmount, dynamicMultiplier, minAmount, maxAmount);
    }
    
    function _setFeeConfig(
        FeeType feeType,
        uint256 baseAmount,
        uint256 dynamicMultiplier,
        uint256 minAmount,
        uint256 maxAmount
    ) internal returns (bool) {
        require(baseAmount > 0, "Base amount must be positive");
        require(dynamicMultiplier >= 100, "Multiplier must be >= 100");
        require(minAmount <= maxAmount, "Invalid amount range");
        
        feeConfigs[feeType] = FeeConfig({
            feeType: feeType,
            baseAmount: baseAmount,
            dynamicMultiplier: dynamicMultiplier,
            isActive: true,
            minAmount: minAmount,
            maxAmount: maxAmount,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp
        });
        
        emit FeeConfigUpdated(feeType, baseAmount, dynamicMultiplier);
        return true;
    }
    
    function setDistributionConfig(
        DistributionType distType,
        uint256 percentage,
        address recipient
    ) external onlyOwner returns (bool) {
        return _setDistributionConfig(distType, percentage, recipient);
    }
    
    function _setDistributionConfig(
        DistributionType distType,
        uint256 percentage,
        address recipient
    ) internal returns (bool) {
        require(percentage <= 100, "Percentage cannot exceed 100");
        
        distributionConfigs[distType] = DistributionConfig({
            distType: distType,
            percentage: percentage,
            recipient: recipient,
            isActive: true,
            totalDistributed: 0,
            lastDistribution: 0
        });
        
        emit DistributionConfigUpdated(distType, percentage, recipient);
        return true;
    }
    
    function updateDistributionThreshold(uint256 newThreshold) external onlyOwner returns (bool) {
        require(newThreshold > 0, "Threshold must be positive");
        distributionThreshold = newThreshold;
        return true;
    }
    
    function pauseFeeCollection(FeeType feeType) external onlyOwner returns (bool) {
        feeConfigs[feeType].isActive = false;
        feeConfigs[feeType].lastUpdated = block.timestamp;
        return true;
    }
    
    function unpauseFeeCollection(FeeType feeType) external onlyOwner returns (bool) {
        feeConfigs[feeType].isActive = true;
        feeConfigs[feeType].lastUpdated = block.timestamp;
        return true;
    }
    
    function pauseDistribution(DistributionType distType) external onlyOwner returns (bool) {
        distributionConfigs[distType].isActive = false;
        return true;
    }
    
    function unpauseDistribution(DistributionType distType) external onlyOwner returns (bool) {
        distributionConfigs[distType].isActive = true;
        return true;
    }
    
    function deactivateRevenueShare(address recipient) external onlyOwner returns (bool) {
        require(revenueShares[recipient].recipient != address(0), "Revenue share not found");
        revenueShares[recipient].isActive = false;
        return true;
    }
    
    function getFeeConfig(FeeType feeType) external view returns (FeeConfig memory) {
        return feeConfigs[feeType];
    }
    
    function getDistributionConfig(DistributionType distType) external view returns (DistributionConfig memory) {
        return distributionConfigs[distType];
    }
    
    function getRevenueShare(address recipient) external view returns (RevenueShare memory) {
        return revenueShares[recipient];
    }
    
    function getFeeCollection(uint256 collectionId) external view returns (FeeCollection memory) {
        return feeCollections[collectionId];
    }
    
    function getUserFeeCollections(address user) external view returns (uint256[] memory) {
        return userFeeCollections[user];
    }
    
    function getTotalFeesCollected(FeeType feeType) external view returns (uint256) {
        return totalFeesCollected[feeType];
    }
    
    function getTotalFeesDistributed() external view returns (uint256) {
        return totalFeesDistributed;
    }
    
    function getPlatformTreasury() external view returns (uint256) {
        return platformTreasury;
    }
    
    function getBurnAmount() external view returns (uint256) {
        return burnAmount;
    }
    
    function getDistributionThreshold() external view returns (uint256) {
        return distributionThreshold;
    }
    
    function getLastDistributionTime() external view returns (uint256) {
        return lastDistributionTime;
    }
    
    function withdrawTreasury(uint256 amount) external onlyOwner returns (bool) {
        require(amount <= platformTreasury, "Insufficient treasury balance");
        platformTreasury -= amount;
        payable(owner()).transfer(amount);
        return true;
    }
    
    function emergencyWithdraw() external onlyOwner returns (bool) {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        payable(owner()).transfer(balance);
        return true;
    }
} 