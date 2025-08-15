# 🚀 **SOLR DeFi Integration Deployment Guide**

## **Current Status**
✅ **Smart Contracts Deployed** - All 4 core contracts are live on Somnia testnet
✅ **Frontend Integration** - AMM hook and SwapInterface are connected to contracts
❌ **Token Contracts** - SOM and USDC tokens need to be deployed

## **Contracts Already Deployed**
- **SomniaAMM**: `0x50e640A4DeEcc4CC98EFb6fB59B655cc65565E77`
- **SomniaGovernance**: `0xc8F6fF01fd1D981e627a8102fc334D360Af7384b`
- **SomniaLending**: `0x58C125A48AE01B40800F1fe58C1Fc1208B12Fd20`
- **SomniaStaking**: `0xD7f9C58211d1e38f0ef0f2c802CB36525466EA1f`

## **Next Steps to Complete Integration**

### **1. Deploy SOM Token (Native Token)**
```bash
# Using Hardhat
cd smartcontract
npx hardhat run scripts/deploy-token.js --network somniaTestnet

# Or using Foundry
forge script scripts/DeployToken.s.sol --rpc-url $SOMNIA_RPC --broadcast
```

**Required Token Contract:**
```solidity
// Simple ERC-20 token for SOM
contract SomniaToken is ERC20 {
    constructor() ERC20("Somnia", "SOM") {
        _mint(msg.sender, 1000000 * 10**18); // 1M tokens
    }
}
```

### **2. Deploy USDC Token (Stablecoin)**
```bash
# Deploy USDC mock token
npx hardhat run scripts/deploy-usdc.js --network somniaTestnet
```

**Required Token Contract:**
```solidity
// Mock USDC for testing
contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {
        _mint(msg.sender, 1000000 * 10**6); // 1M USDC (6 decimals)
    }
}
```

### **3. Update Configuration**
After deployment, update `frontend/src/app/lib/config.ts`:
```typescript
export const TOKEN_ADDRESSES = {
  SOM: '0x...', // Newly deployed SOM address
  SOMG: '0xc8F6fF01fd1D981e627a8102fc334D360Af7384b', // Governance contract
  USDC: '0x...', // Newly deployed USDC address
} as const
```

### **4. Add Liquidity to AMM**
```bash
# Create pool and add initial liquidity
npx hardhat run scripts/add-liquidity.js --network somniaTestnet
```

**Required Steps:**
1. Create pool for SOM/USDC pair
2. Add initial liquidity (e.g., 1000 SOM + 1000 USDC)
3. Approve tokens for AMM contract
4. Call `addLiquidity()` function

### **5. Test the Integration**
1. **Start Frontend**: `npm run dev`
2. **Connect Wallet** to Somnia testnet
3. **Try Swapping**: SOM ↔ USDC
4. **Check Transactions** on Somnia explorer

## **Testing Checklist**
- [ ] Wallet connects to Somnia testnet
- [ ] Token balances display correctly
- [ ] Swap calculation works
- [ ] Swap execution succeeds
- [ ] Transaction appears on explorer
- [ ] Price impact calculation accurate

## **Troubleshooting**
- **"Token addresses not found"** → Update config with deployed addresses
- **"Insufficient liquidity"** → Add more liquidity to pools
- **"Token not whitelisted"** → Call `whitelistToken()` on AMM contract
- **"Swap failed"** → Check slippage tolerance and gas limits

## **Production Readiness**
- [ ] Deploy to Somnia mainnet
- [ ] Add real USDC bridge integration
- [ ] Implement proper token validation
- [ ] Add comprehensive error handling
- [ ] Security audit completed

## **Resources**
- [Somnia Network Documentation](https://docs.somnia.network/)
- [Somnia Testnet RPC](https://testnet-rpc.somnia.network)
- [Somnia Explorer](https://testnet-explorer.somnia.network)
- [Hardhat Configuration](./hardhat.config.js)

---
**Status**: Ready for token deployment and testing! 🎯 