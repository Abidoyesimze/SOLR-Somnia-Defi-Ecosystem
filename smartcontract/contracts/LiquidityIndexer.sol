// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

interface IPool {
    function token0() external view returns (address);
    function token1() external view returns (address);
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

contract LiquidityIndexer {
    struct Pool {
        address poolAddress;
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 fee;           // Fee in basis points (30 = 0.3%)
        uint256 lastUpdated;
        bool isActive;
        string protocolName;
    }

    // State variables
    mapping(uint256 => Pool) public pools;
    mapping(bytes32 => uint256[]) public tokenPairPools; // keccak256(tokenA, tokenB) => poolIds
    mapping(address => bool) public authorizedUpdaters;
    address public owner;
    uint256 public poolCount;

    // Events
    event PoolRegistered(uint256 indexed poolId, address indexed poolAddress, address tokenA, address tokenB);
    event PoolUpdated(uint256 indexed poolId, uint256 reserveA, uint256 reserveB);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedUpdaters[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedUpdaters[msg.sender] = true;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function authorizeUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = true;
    }

    function revokeUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = false;
    }

    function registerPool(
        address poolAddress,
        address tokenA,
        address tokenB,
        uint256 fee,
        string calldata protocolName
    ) external onlyAuthorized returns (uint256 poolId) {
        require(poolAddress != address(0), "Invalid pool");
        require(tokenA != address(0) && tokenB != address(0), "Invalid tokens");
        require(tokenA != tokenB, "Identical tokens");

        // Ensure consistent token order (tokenA < tokenB)
        if (tokenA > tokenB) {
            (tokenA, tokenB) = (tokenB, tokenA);
        }

        poolId = poolCount++;
        bytes32 pairKey = keccak256(abi.encodePacked(tokenA, tokenB));

        // Get initial reserves
        (uint256 reserveA, uint256 reserveB) = getPoolReserves(poolAddress, tokenA, tokenB);

        pools[poolId] = Pool({
            poolAddress: poolAddress,
            tokenA: tokenA,
            tokenB: tokenB,
            reserveA: reserveA,
            reserveB: reserveB,
            fee: fee,
            lastUpdated: block.timestamp,
            isActive: true,
            protocolName: protocolName
        });

        tokenPairPools[pairKey].push(poolId);

        emit PoolRegistered(poolId, poolAddress, tokenA, tokenB);
    }

    function updatePoolReserves(uint256 poolId, uint256 reserveA, uint256 reserveB) external onlyAuthorized {
        require(poolId < poolCount, "Invalid pool");
        require(pools[poolId].isActive, "Pool inactive");

        pools[poolId].reserveA = reserveA;
        pools[poolId].reserveB = reserveB;
        pools[poolId].lastUpdated = block.timestamp;

        emit PoolUpdated(poolId, reserveA, reserveB);
    }

    function refreshPoolReserves(uint256 poolId) external {
        require(poolId < poolCount, "Invalid pool");
        Pool storage pool = pools[poolId];
        require(pool.isActive, "Pool inactive");

        (uint256 reserveA, uint256 reserveB) = getPoolReserves(pool.poolAddress, pool.tokenA, pool.tokenB);
        
        pool.reserveA = reserveA;
        pool.reserveB = reserveB;
        pool.lastUpdated = block.timestamp;

        emit PoolUpdated(poolId, reserveA, reserveB);
    }

    function deactivatePool(uint256 poolId) external onlyAuthorized {
        require(poolId < poolCount, "Invalid pool");
        pools[poolId].isActive = false;
    }

    // View functions
    function getPool(uint256 poolId) external view returns (Pool memory) {
        require(poolId < poolCount, "Invalid pool");
        return pools[poolId];
    }

    function getPoolsForPair(address tokenA, address tokenB) external view returns (uint256[] memory) {
        if (tokenA > tokenB) {
            (tokenA, tokenB) = (tokenB, tokenA);
        }
        bytes32 pairKey = keccak256(abi.encodePacked(tokenA, tokenB));
        return tokenPairPools[pairKey];
    }

    function getAllActivePools() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // Count active pools
        for (uint256 i = 0; i < poolCount; i++) {
            if (pools[i].isActive) activeCount++;
        }

        uint256[] memory activePools = new uint256[](activeCount);
        uint256 index = 0;

        // Collect active pool IDs
        for (uint256 i = 0; i < poolCount; i++) {
            if (pools[i].isActive) {
                activePools[index] = i;
                index++;
            }
        }

        return activePools;
    }

    function getPoolReserves(address poolAddress, address tokenA, address tokenB) 
        public view returns (uint256 reserveA, uint256 reserveB) {
        try IPool(poolAddress).getReserves() returns (uint112 reserve0, uint112 reserve1, uint32) {
            address token0 = IPool(poolAddress).token0();
            if (token0 == tokenA) {
                reserveA = uint256(reserve0);
                reserveB = uint256(reserve1);
            } else {
                reserveA = uint256(reserve1);
                reserveB = uint256(reserve0);
            }
        } catch {
            reserveA = 0;
            reserveB = 0;
        }
    }
}
