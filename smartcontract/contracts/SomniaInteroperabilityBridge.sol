// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract SomniaInteroperabilityBridge is Ownable, ReentrancyGuard, Pausable {
    
    enum BridgeStatus { Pending, Processing, Completed, Failed, Cancelled }
    enum BridgeType { Asset, Experience, Component, Data, Custom }
    enum ChainType { Somnia, Ethereum, Polygon, Arbitrum, Optimism, Custom }
    
    struct BridgeRequest {
        string bridgeId;
        address requester;
        BridgeType bridgeType;
        string sourceChain;
        string destinationChain;
        string sourceId;
        string destinationId;
        string metadataUri;
        uint256 amount;
        address paymentToken;
        BridgeStatus status;
        uint256 createdAt;
        uint256 processedAt;
        uint256 completedAt;
        string failureReason;
        bool isReversible;
        uint256 gasEstimate;
        uint256 bridgeFee;
    }
    
    struct ChainConfig {
        string chainId;
        ChainType chainType;
        string rpcUrl;
        string explorerUrl;
        bool isActive;
        uint256 minConfirmations;
        uint256 maxGasLimit;
        uint256 bridgeFee;
        mapping(BridgeType => bool) supportedTypes;
    }
    
    struct BridgeRoute {
        string routeId;
        string[] chainPath;
        BridgeType[] bridgeTypes;
        uint256 totalFee;
        uint256 estimatedTime;
        bool isActive;
        uint256 successRate;
        uint256 totalBridges;
        uint256 successfulBridges;
    }
    
    mapping(string => BridgeRequest) public bridgeRequests;
    mapping(string => ChainConfig) public chainConfigs;
    mapping(string => BridgeRoute) public bridgeRoutes;
    mapping(address => string[]) public userBridgeRequests;
    mapping(string => string[]) public chainBridgeRequests;
    
    uint256 public bridgeRequestCount;
    uint256 public chainCount;
    uint256 public routeCount;
    uint256 public baseBridgeFee = 0.001 ether;
    uint256 public gasMultiplier = 120; // 120% of estimated gas
    
    event BridgeRequestCreated(string indexed bridgeId, address indexed requester, BridgeType bridgeType);
    event BridgeRequestProcessed(string indexed bridgeId, BridgeStatus status);
    event BridgeRequestCompleted(string indexed bridgeId, uint256 completedAt);
    event ChainRegistered(string indexed chainId, ChainType chainType);
    event BridgeRouteCreated(string indexed routeId, string[] chainPath);
    
    modifier bridgeRequestExists(string memory bridgeId) {
        require(bridgeRequests[bridgeId].requester != address(0), "Bridge request does not exist");
        _;
    }
    
    modifier onlyBridgeRequester(string memory bridgeId) {
        require(bridgeRequests[bridgeId].requester == msg.sender, "Not bridge requester");
        _;
    }
    
    modifier chainExists(string memory chainId) {
        require(chainConfigs[chainId].isActive, "Chain not found or inactive");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        // Register Somnia as default chain
        _registerChain("somnia-mainnet", ChainType.Somnia, "https://rpc.somnia.network", "https://explorer.somnia.network", true);
        _registerChain("somnia-testnet", ChainType.Somnia, "https://testnet-rpc.somnia.network", "https://testnet-explorer.somnia.network", true);
    }
    
    function createBridgeRequest(
        string memory bridgeId,
        BridgeType bridgeType,
        string memory sourceChain,
        string memory destinationChain,
        string memory sourceId,
        string memory destinationId,
        string memory metadataUri,
        uint256 amount,
        bool isReversible
    ) external payable nonReentrant whenNotPaused returns (bool) {
        require(bytes(bridgeId).length > 0, "Invalid bridge ID");
        require(bridgeRequests[bridgeId].requester == address(0), "Bridge request already exists");
        require(chainConfigs[sourceChain].isActive, "Source chain not supported");
        require(chainConfigs[destinationChain].isActive, "Destination chain not supported");
        require(sourceChain != destinationChain, "Source and destination must be different");
        require(msg.value >= baseBridgeFee, "Insufficient bridge fee");
        
        // Calculate gas estimate and total fee
        uint256 gasEstimate = _estimateGasCost(bridgeType, sourceChain, destinationChain);
        uint256 totalFee = baseBridgeFee + gasEstimate;
        
        BridgeRequest memory newRequest = BridgeRequest({
            bridgeId: bridgeId,
            requester: msg.sender,
            bridgeType: bridgeType,
            sourceChain: sourceChain,
            destinationChain: destinationChain,
            sourceId: sourceId,
            destinationId: destinationId,
            metadataUri: metadataUri,
            amount: amount,
            paymentToken: address(0), // Native token for now
            status: BridgeStatus.Pending,
            createdAt: block.timestamp,
            processedAt: 0,
            completedAt: 0,
            failureReason: "",
            isReversible: isReversible,
            gasEstimate: gasEstimate,
            bridgeFee: totalFee
        });
        
        bridgeRequests[bridgeId] = newRequest;
        userBridgeRequests[msg.sender].push(bridgeId);
        chainBridgeRequests[sourceChain].push(bridgeId);
        bridgeRequestCount++;
        
        emit BridgeRequestCreated(bridgeId, msg.sender, bridgeType);
        return true;
    }
    
    function processBridgeRequest(string memory bridgeId) external onlyOwner whenNotPaused returns (bool) {
        BridgeRequest storage request = bridgeRequests[bridgeId];
        require(request.status == BridgeStatus.Pending, "Request not pending");
        
        request.status = BridgeStatus.Processing;
        request.processedAt = block.timestamp;
        
        // Simulate bridge processing
        bool success = _simulateBridgeProcessing(request);
        
        if (success) {
            request.status = BridgeStatus.Completed;
            request.completedAt = block.timestamp;
            
            emit BridgeRequestCompleted(bridgeId, block.timestamp);
        } else {
            request.status = BridgeStatus.Failed;
            request.failureReason = "Bridge processing failed";
        }
        
        emit BridgeRequestProcessed(bridgeId, request.status);
        return success;
    }
    
    function cancelBridgeRequest(string memory bridgeId) external onlyBridgeRequester(bridgeId) returns (bool) {
        BridgeRequest storage request = bridgeRequests[bridgeId];
        require(request.status == BridgeStatus.Pending, "Request not pending");
        
        request.status = BridgeStatus.Cancelled;
        
        // Refund bridge fee
        payable(msg.sender).transfer(request.bridgeFee);
        
        emit BridgeRequestProcessed(bridgeId, BridgeStatus.Cancelled);
        return true;
    }
    
    function reverseBridgeRequest(string memory bridgeId) external onlyBridgeRequester(bridgeId) returns (bool) {
        BridgeRequest storage request = bridgeRequests[bridgeId];
        require(request.status == BridgeStatus.Completed, "Request not completed");
        require(request.isReversible, "Request not reversible");
        
        // Create reverse bridge request
        string memory reverseBridgeId = string(abi.encodePacked(bridgeId, "-reverse"));
        
        BridgeRequest memory reverseRequest = BridgeRequest({
            bridgeId: reverseBridgeId,
            requester: msg.sender,
            bridgeType: request.bridgeType,
            sourceChain: request.destinationChain,
            destinationChain: request.sourceChain,
            sourceId: request.destinationId,
            destinationId: request.sourceId,
            metadataUri: request.metadataUri,
            amount: request.amount,
            paymentToken: request.paymentToken,
            status: BridgeStatus.Pending,
            createdAt: block.timestamp,
            processedAt: 0,
            completedAt: 0,
            failureReason: "",
            isReversible: false,
            gasEstimate: request.gasEstimate,
            bridgeFee: request.bridgeFee
        });
        
        bridgeRequests[reverseBridgeId] = reverseRequest;
        userBridgeRequests[msg.sender].push(reverseBridgeId);
        chainBridgeRequests[request.destinationChain].push(reverseBridgeId);
        bridgeRequestCount++;
        
        emit BridgeRequestCreated(reverseBridgeId, msg.sender, request.bridgeType);
        return true;
    }
    
    function findOptimalRoute(
        string memory sourceChain,
        string memory destinationChain,
        BridgeType bridgeType
    ) external view returns (BridgeRoute memory) {
        // Find the best route between chains
        string memory routeId = _findRouteId(sourceChain, destinationChain, bridgeType);
        
        if (bytes(routeId).length > 0) {
            return bridgeRoutes[routeId];
        }
        
        // Return empty route if none found
        return BridgeRoute({
            routeId: "",
            chainPath: new string[](0),
            bridgeTypes: new BridgeType[](0),
            totalFee: 0,
            estimatedTime: 0,
            isActive: false,
            successRate: 0,
            totalBridges: 0,
            successfulBridges: 0
        });
    }
    
    function registerChain(
        string memory chainId,
        ChainType chainType,
        string memory rpcUrl,
        string memory explorerUrl,
        bool isActive
    ) external onlyOwner returns (bool) {
        require(bytes(chainId).length > 0, "Invalid chain ID");
        require(chainConfigs[chainId].chainId == "", "Chain already registered");
        
        return _registerChain(chainId, chainType, rpcUrl, explorerUrl, isActive);
    }
    
    function updateChainConfig(
        string memory chainId,
        bool isActive,
        uint256 minConfirmations,
        uint256 maxGasLimit,
        uint256 bridgeFee
    ) external onlyOwner returns (bool) {
        require(chainConfigs[chainId].chainId != "", "Chain not registered");
        
        ChainConfig storage config = chainConfigs[chainId];
        config.isActive = isActive;
        config.minConfirmations = minConfirmations;
        config.maxGasLimit = maxGasLimit;
        config.bridgeFee = bridgeFee;
        
        return true;
    }
    
    function createBridgeRoute(
        string memory routeId,
        string[] memory chainPath,
        BridgeType[] memory bridgeTypes,
        uint256 estimatedTime
    ) external onlyOwner returns (bool) {
        require(bytes(routeId).length > 0, "Invalid route ID");
        require(bridgeRoutes[routeId].routeId == "", "Route already exists");
        require(chainPath.length > 1, "Route must have at least 2 chains");
        require(chainPath.length == bridgeTypes.length + 1, "Invalid route configuration");
        
        uint256 totalFee = 0;
        for (uint256 i = 0; i < chainPath.length - 1; i++) {
            totalFee += chainConfigs[chainPath[i]].bridgeFee;
        }
        
        BridgeRoute memory newRoute = BridgeRoute({
            routeId: routeId,
            chainPath: chainPath,
            bridgeTypes: bridgeTypes,
            totalFee: totalFee,
            estimatedTime: estimatedTime,
            isActive: true,
            successRate: 100, // Initial success rate
            totalBridges: 0,
            successfulBridges: 0
        });
        
        bridgeRoutes[routeId] = newRoute;
        routeCount++;
        
        emit BridgeRouteCreated(routeId, chainPath);
        return true;
    }
    
    function getBridgeRequest(string memory bridgeId) external view returns (BridgeRequest memory) {
        return bridgeRequests[bridgeId];
    }
    
    function getUserBridgeRequests(address user) external view returns (string[] memory) {
        return userBridgeRequests[user];
    }
    
    function getChainBridgeRequests(string memory chainId) external view returns (string[] memory) {
        return chainBridgeRequests[chainId];
    }
    
    function getChainConfig(string memory chainId) external view returns (
        string memory chainId_,
        ChainType chainType,
        string memory rpcUrl,
        string memory explorerUrl,
        bool isActive,
        uint256 minConfirmations,
        uint256 maxGasLimit,
        uint256 bridgeFee
    ) {
        ChainConfig storage config = chainConfigs[chainId];
        return (
            config.chainId,
            config.chainType,
            config.rpcUrl,
            config.explorerUrl,
            config.isActive,
            config.minConfirmations,
            config.maxGasLimit,
            config.bridgeFee
        );
    }
    
    function getBridgeRoute(string memory routeId) external view returns (BridgeRoute memory) {
        return bridgeRoutes[routeId];
    }
    
    function _registerChain(
        string memory chainId,
        ChainType chainType,
        string memory rpcUrl,
        string memory explorerUrl,
        bool isActive
    ) internal returns (bool) {
        ChainConfig storage config = chainConfigs[chainId];
        config.chainId = chainId;
        config.chainType = chainType;
        config.rpcUrl = rpcUrl;
        config.explorerUrl = explorerUrl;
        config.isActive = isActive;
        config.minConfirmations = 12;
        config.maxGasLimit = 30000000;
        config.bridgeFee = baseBridgeFee;
        
        // Enable all bridge types by default
        for (uint256 i = 0; i < 5; i++) {
            config.supportedTypes[BridgeType(i)] = true;
        }
        
        chainCount++;
        
        emit ChainRegistered(chainId, chainType);
        return true;
    }
    
    function _estimateGasCost(
        BridgeType bridgeType,
        string memory sourceChain,
        string memory destinationChain
    ) internal view returns (uint256) {
        // Simplified gas estimation
        uint256 baseGas = 21000;
        
        if (bridgeType == BridgeType.Asset) baseGas = 100000;
        else if (bridgeType == BridgeType.Experience) baseGas = 150000;
        else if (bridgeType == BridgeType.Component) baseGas = 80000;
        else if (bridgeType == BridgeType.Data) baseGas = 50000;
        
        // Add chain-specific costs
        ChainConfig storage sourceConfig = chainConfigs[sourceChain];
        ChainConfig storage destConfig = chainConfigs[destinationChain];
        
        uint256 totalGas = baseGas + sourceConfig.bridgeFee + destConfig.bridgeFee;
        
        return (totalGas * gasMultiplier) / 100;
    }
    
    function _simulateBridgeProcessing(BridgeRequest storage request) internal view returns (bool) {
        // Simulate bridge processing success/failure
        // In production, this would involve actual cross-chain communication
        uint256 randomValue = uint256(keccak256(abi.encodePacked(
            request.bridgeId,
            block.timestamp,
            request.requester
        ))) % 100;
        
        return randomValue > 10; // 90% success rate
    }
    
    function _findRouteId(
        string memory sourceChain,
        string memory destinationChain,
        BridgeType bridgeType
    ) internal view returns (string memory) {
        // Find optimal route between chains
        // This is a simplified implementation
        for (uint256 i = 0; i < routeCount; i++) {
            // In production, you'd implement proper route finding algorithm
            if (i == 0) return "route-1"; // Placeholder
        }
        return "";
    }
    
    function updateBaseBridgeFee(uint256 newFee) external onlyOwner {
        baseBridgeFee = newFee;
    }
    
    function updateGasMultiplier(uint256 newMultiplier) external onlyOwner {
        require(newMultiplier >= 100 && newMultiplier <= 200, "Invalid multiplier");
        gasMultiplier = newMultiplier;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function emergencyCancelBridge(string memory bridgeId) external onlyOwner {
        BridgeRequest storage request = bridgeRequests[bridgeId];
        require(request.status == BridgeStatus.Pending || request.status == BridgeStatus.Processing, "Cannot cancel");
        
        request.status = BridgeStatus.Cancelled;
        
        // Refund bridge fee
        if (request.status == BridgeStatus.Pending) {
            payable(request.requester).transfer(request.bridgeFee);
        }
        
        emit BridgeRequestProcessed(bridgeId, BridgeStatus.Cancelled);
    }
} 