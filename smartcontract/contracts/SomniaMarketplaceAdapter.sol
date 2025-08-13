// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SomniaMarketplaceAdapter is Ownable, ReentrancyGuard {
    
    enum ListingStatus { Active, Sold, Cancelled, Expired }
    enum PaymentType { Native, ERC20, CrossChain }
    enum ListingType { FixedPrice, Auction, Bundle }
    
    struct MarketplaceListing {
        string listingId;
        string objectId;
        address seller;
        address buyer;
        ListingType listingType;
        ListingStatus status;
        uint256 price;
        address paymentToken;
        uint256 quantity;
        uint256 startTime;
        uint256 endTime;
        uint256 minBid;
        uint256 highestBid;
        address highestBidder;
        string metadataUri;
        bool isCrossChain;
        string sourceChain;
        uint256 createdAt;
        uint256 lastUpdated;
    }
    
    struct CrossChainOrder {
        string orderId;
        string listingId;
        address buyer;
        string sourceChain;
        string destinationChain;
        uint256 amount;
        address paymentToken;
        bool isProcessed;
        uint256 createdAt;
        uint256 processedAt;
    }
    
    struct MarketplaceStats {
        uint256 totalListings;
        uint256 totalSales;
        uint256 totalVolume;
        uint256 activeListings;
        uint256 crossChainOrders;
    }
    
    mapping(string => MarketplaceListing) public listings;
    mapping(string => CrossChainOrder) public crossChainOrders;
    mapping(address => string[]) public userListings;
    mapping(address => string[]) public userPurchases;
    mapping(address => uint256) public userVolume;
    mapping(string => uint256[]) public listingBids;
    
    uint256 public listingCount;
    uint256 public crossChainOrderCount;
    uint256 public platformFee = 25; // 2.5% (250 basis points)
    uint256 public listingFee = 0.001 ether;
    uint256 public crossChainFee = 0.005 ether;
    
    MarketplaceStats public stats;
    
    event ListingCreated(string indexed listingId, address indexed seller, string objectId, uint256 price);
    event ListingSold(string indexed listingId, address indexed buyer, uint256 price);
    event ListingCancelled(string indexed listingId, address indexed seller);
    event BidPlaced(string indexed listingId, address indexed bidder, uint256 amount);
    event CrossChainOrderCreated(string indexed orderId, string sourceChain, string destinationChain);
    event CrossChainOrderProcessed(string indexed orderId, address indexed buyer);
    
    modifier listingExists(string memory listingId) {
        require(listings[listingId].seller != address(0), "Listing does not exist");
        _;
    }
    
    modifier onlyListingOwner(string memory listingId) {
        require(listings[listingId].seller == msg.sender, "Not listing owner");
        _;
    }
    
    modifier listingActive(string memory listingId) {
        require(listings[listingId].status == ListingStatus.Active, "Listing not active");
        _;
    }
    
    constructor() Ownable(msg.sender) {}
    
    function createListing(
        string memory listingId,
        string memory objectId,
        ListingType listingType,
        uint256 price,
        address paymentToken,
        uint256 quantity,
        uint256 startTime,
        uint256 endTime,
        uint256 minBid,
        string memory metadataUri,
        bool isCrossChain,
        string memory sourceChain
    ) external payable nonReentrant returns (bool) {
        require(bytes(listingId).length > 0, "Invalid listing ID");
        require(listings[listingId].seller == address(0), "Listing already exists");
        require(bytes(objectId).length > 0, "Object ID required");
        require(price > 0, "Price must be greater than 0");
        require(msg.value >= listingFee, "Insufficient listing fee");
        
        if (listingType == ListingType.Auction) {
            require(minBid > 0, "Minimum bid required for auctions");
            require(endTime > startTime, "Invalid auction duration");
        }
        
        MarketplaceListing memory newListing = MarketplaceListing({
            listingId: listingId,
            objectId: objectId,
            seller: msg.sender,
            buyer: address(0),
            listingType: listingType,
            status: ListingStatus.Active,
            price: price,
            paymentToken: paymentToken,
            quantity: quantity,
            startTime: startTime,
            endTime: endTime,
            minBid: minBid,
            highestBid: 0,
            highestBidder: address(0),
            metadataUri: metadataUri,
            isCrossChain: isCrossChain,
            sourceChain: sourceChain,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp
        });
        
        listings[listingId] = newListing;
        userListings[msg.sender].push(listingId);
        listingCount++;
        stats.totalListings++;
        stats.activeListings++;
        
        emit ListingCreated(listingId, msg.sender, objectId, price);
        return true;
    }
    
    function purchaseListing(string memory listingId) external payable nonReentrant returns (bool) {
        MarketplaceListing storage listing = listings[listingId];
        require(listing.status == ListingStatus.Active, "Listing not active");
        require(listing.seller != msg.sender, "Cannot buy your own listing");
        require(block.timestamp >= listing.startTime, "Listing not yet active");
        require(block.timestamp <= listing.endTime, "Listing expired");
        
        if (listing.listingType == ListingType.FixedPrice) {
            require(msg.value >= listing.price, "Insufficient payment");
            
            // Process payment
            uint256 platformFeeAmount = (listing.price * platformFee) / 1000;
            uint256 sellerAmount = listing.price - platformFeeAmount;
            
            payable(owner()).transfer(platformFeeAmount);
            payable(listing.seller).transfer(sellerAmount);
            
            // Update listing
            listing.status = ListingStatus.Sold;
            listing.buyer = msg.sender;
            listing.lastUpdated = block.timestamp;
            
            // Update stats
            stats.totalSales++;
            stats.totalVolume += listing.price;
            stats.activeListings--;
            userVolume[msg.sender] += listing.price;
            userPurchases[msg.sender].push(listingId);
            
            emit ListingSold(listingId, msg.sender, listing.price);
            return true;
        }
        
        return false;
    }
    
    function placeBid(string memory listingId) external payable nonReentrant returns (bool) {
        MarketplaceListing storage listing = listings[listingId];
        require(listing.listingType == ListingType.Auction, "Not an auction listing");
        require(listing.status == ListingStatus.Active, "Listing not active");
        require(block.timestamp >= listing.startTime, "Auction not yet active");
        require(block.timestamp <= listing.endTime, "Auction expired");
        require(msg.value > listing.highestBid, "Bid too low");
        require(msg.value >= listing.minBid, "Bid below minimum");
        
        // Return previous highest bid
        if (listing.highestBid > 0) {
            payable(listing.highestBidder).transfer(listing.highestBid);
        }
        
        // Update highest bid
        listing.highestBid = msg.value;
        listing.highestBidder = msg.sender;
        listing.lastUpdated = block.timestamp;
        
        // Record bid
        listingBids[listingId].push(msg.value);
        
        emit BidPlaced(listingId, msg.sender, msg.value);
        return true;
    }
    
    function finalizeAuction(string memory listingId) external nonReentrant returns (bool) {
        MarketplaceListing storage listing = listings[listingId];
        require(listing.listingType == ListingType.Auction, "Not an auction listing");
        require(listing.status == ListingStatus.Active, "Listing not active");
        require(block.timestamp > listing.endTime, "Auction not ended");
        require(listing.highestBid > 0, "No bids placed");
        
        // Process payment
        uint256 platformFeeAmount = (listing.highestBid * platformFee) / 1000;
        uint256 sellerAmount = listing.highestBid - platformFeeAmount;
        
        payable(owner()).transfer(platformFeeAmount);
        payable(listing.seller).transfer(sellerAmount);
        
        // Update listing
        listing.status = ListingStatus.Sold;
        listing.buyer = listing.highestBidder;
        listing.lastUpdated = block.timestamp;
        
        // Update stats
        stats.totalSales++;
        stats.totalVolume += listing.highestBid;
        stats.activeListings--;
        userVolume[listing.highestBidder] += listing.highestBid;
        userPurchases[listing.highestBidder].push(listingId);
        
        emit ListingSold(listingId, listing.highestBidder, listing.highestBid);
        return true;
    }
    
    function cancelListing(string memory listingId) external onlyListingOwner(listingId) returns (bool) {
        MarketplaceListing storage listing = listings[listingId];
        require(listing.status == ListingStatus.Active, "Listing not active");
        require(listing.listingType != ListingType.Auction || listing.highestBid == 0, "Cannot cancel auction with bids");
        
        listing.status = ListingStatus.Cancelled;
        listing.lastUpdated = block.timestamp;
        stats.activeListings--;
        
        emit ListingCancelled(listingId, msg.sender);
        return true;
    }
    
    function createCrossChainOrder(
        string memory orderId,
        string memory listingId,
        string memory sourceChain,
        string memory destinationChain,
        uint256 amount
    ) external payable nonReentrant returns (bool) {
        require(bytes(orderId).length > 0, "Invalid order ID");
        require(crossChainOrders[orderId].buyer == address(0), "Order already exists");
        require(msg.value >= crossChainFee, "Insufficient cross-chain fee");
        
        CrossChainOrder memory newOrder = CrossChainOrder({
            orderId: orderId,
            listingId: listingId,
            buyer: msg.sender,
            sourceChain: sourceChain,
            destinationChain: destinationChain,
            amount: amount,
            paymentToken: address(0), // Native token for cross-chain
            isProcessed: false,
            createdAt: block.timestamp,
            processedAt: 0
        });
        
        crossChainOrders[orderId] = newOrder;
        crossChainOrderCount++;
        stats.crossChainOrders++;
        
        emit CrossChainOrderCreated(orderId, sourceChain, destinationChain);
        return true;
    }
    
    function processCrossChainOrder(string memory orderId) external onlyOwner returns (bool) {
        CrossChainOrder storage order = crossChainOrders[orderId];
        require(!order.isProcessed, "Order already processed");
        
        order.isProcessed = true;
        order.processedAt = block.timestamp;
        
        emit CrossChainOrderProcessed(orderId, order.buyer);
        return true;
    }
    
    function getListing(string memory listingId) external view returns (MarketplaceListing memory) {
        return listings[listingId];
    }
    
    function getCrossChainOrder(string memory orderId) external view returns (CrossChainOrder memory) {
        return crossChainOrders[orderId];
    }
    
    function getUserListings(address user) external view returns (string[] memory) {
        return userListings[user];
    }
    
    function getUserPurchases(address user) external view returns (string[] memory) {
        return userPurchases[user];
    }
    
    function getUserVolume(address user) external view returns (uint256) {
        return userVolume[user];
    }
    
    function getListingBids(string memory listingId) external view returns (uint256[] memory) {
        return listingBids[listingId];
    }
    
    function getMarketplaceStats() external view returns (MarketplaceStats memory) {
        return stats;
    }
    
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 100, "Fee cannot exceed 10%");
        platformFee = newFee;
    }
    
    function updateListingFee(uint256 newFee) external onlyOwner {
        listingFee = newFee;
    }
    
    function updateCrossChainFee(uint256 newFee) external onlyOwner {
        crossChainFee = newFee;
    }
    
    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function emergencyPauseListing(string memory listingId) external onlyOwner {
        listings[listingId].status = ListingStatus.Suspended;
        listings[listingId].lastUpdated = block.timestamp;
        stats.activeListings--;
    }
} 