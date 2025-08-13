# 🚀 Somnia Ecosystem Smart Contracts

Complete smart contract ecosystem for Somnia's SOM0 and SOM1 protocols, implementing SOLR (Somnia Asset & Experience Router).

## 📋 Contract Overview

### **Core Protocol Contracts**

#### 1. **SomniaAccessControl.sol** 🔐
- **Purpose**: Role-based access control and permissions management
- **Features**: 
  - Multiple role levels (Admin, Moderator, Attester, etc.)
  - Resource-based permissions
  - Role expiration and renewal
  - Emergency role management
- **Key Functions**: `grantRole()`, `revokeRole()`, `hasResourcePermission()`

#### 2. **SomniaFeeManager.sol** 💰
- **Purpose**: Fee collection, distribution, and revenue sharing
- **Features**:
  - Configurable fee structures for different operations
  - Automated fee distribution
  - Revenue sharing for ecosystem participants
  - Treasury management
- **Key Functions**: `collectFee()`, `distributeFees()`, `createRevenueShare()`

#### 3. **SomniaEmergencyController.sol** 🚨
- **Purpose**: Emergency controls, safety mechanisms, and recovery
- **Features**:
  - Multi-level emergency system (Low → Critical)
  - Automated escalation
  - Recovery plans and procedures
  - Emergency contact management
- **Key Functions**: `declareEmergency()`, `executeEmergencyAction()`, `activateEmergencyMode()`

### **SOM0 Protocol Contracts (Asset Interoperability)**

#### 4. **SomniaObjectRegistry.sol** 🌐
- **Purpose**: Virtual object registration and management
- **Features**:
  - Object creation and ownership transfer
  - Metadata management and versioning
  - Cross-application compatibility
  - Object status management
- **Key Functions**: `registerVirtualObject()`, `transferObjectOwnership()`, `updateObjectMetadata()`

#### 5. **SomniaAttestationRegistry.sol** ✅
- **Purpose**: Proof, verification, and trust systems
- **Features**:
  - Attestation creation and management
  - Attester reputation system
  - Attestation requests and bounties
  - Evidence and verification
- **Key Functions**: `createAttestation()`, `registerAttester()`, `createAttestationRequest()`

#### 6. **SomniaMarketplaceAdapter.sol** 🛒
- **Purpose**: Cross-application commerce and asset trading
- **Features**:
  - Fixed price and auction listings
  - Cross-chain marketplace operations
  - Fee management and revenue sharing
  - Listing management
- **Key Functions**: `createListing()`, `purchaseListing()`, `placeBid()`, `createCrossChainOrder()`

### **SOM1 Protocol Contracts (Virtual World Composition)**

#### 7. **SomniaExperienceRegistry.sol** 🎮
- **Purpose**: Virtual experience and component management
- **Features**:
  - Experience creation and registration
  - Component system management
  - Experience composition
  - Player session management
- **Key Functions**: `registerVirtualExperience()`, `registerComponent()`, `createExperienceComposition()`

#### 8. **SomniaInteroperabilityBridge.sol** 🌉
- **Purpose**: Cross-metaverse routing and asset bridging
- **Features**:
  - Multi-chain bridge operations
  - Optimal route finding
  - Cross-chain asset transfer
  - Bridge request management
- **Key Functions**: `createBridgeRequest()`, `findOptimalRoute()`, `processBridgeRequest()`

### **Main Router Contract**

#### 9. **SomniaAssetRouter.sol** 🎯
- **Purpose**: Core routing logic for virtual assets and experiences
- **Features**:
  - Asset routing across experiences
  - Route optimization
  - Fee collection and distribution
  - Cross-protocol integration
- **Key Functions**: `findBestRoute()`, `executeAssetRouting()`, `registerVirtualObject()`

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Somnia Ecosystem                        │
├─────────────────────────────────────────────────────────────┤
│  🔐 Access Control  │  💰 Fee Manager  │  🚨 Emergency    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🌐 SOM0 Protocol (Asset Interoperability)                 │
│  ├─ Object Registry    ├─ Attestation    ├─ Marketplace   │
│  │  • Virtual Objects  │  • Proof System │  • Commerce    │
│  │  • Ownership        │  • Verification │  • Trading     │
│  │  • Metadata         │  • Trust        │  • Cross-chain │
│                                                             │
│  🎮 SOM1 Protocol (Virtual World Composition)              │
│  ├─ Experience Registry ├─ Component System                │
│  │  • Virtual Worlds   │  • Composable   │                │
│  │  • Player Sessions  │  • Reusable     │                │
│  │  • Cross-Exp        │  • Modular      │                │
│                                                             │
│  🌉 Interoperability Bridge                                │
│  • Cross-metaverse routing                                  │
│  • Asset bridging                                          │
│  • Route optimization                                       │
│                                                             │
│  🎯 Main Asset Router (SOLR)                               │
│  • Unified interface                                        │
│  • Route calculation                                        │
│  • Execution engine                                         │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Deployment

### **Prerequisites**
- Node.js 18+
- Hardhat
- Solidity 0.8.19+
- OpenZeppelin contracts

### **Environment Setup**
```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your configuration
```

### **Deploy All Contracts**
```bash
# Deploy complete ecosystem
npx hardhat run scripts/deploy-all.js --network somniaTestnet

# Deploy individual contracts
npx hardhat run scripts/deploy-somnia-router.js --network somniaTestnet
```

### **Deployment Order**
1. **Access Control** - Foundation for permissions
2. **Fee Manager** - Economic infrastructure
3. **Emergency Controller** - Safety mechanisms
4. **Object Registry** - SOM0 core
5. **Attestation Registry** - SOM0 trust system
6. **Experience Registry** - SOM1 core
7. **Marketplace Adapter** - Commerce layer
8. **Interoperability Bridge** - Cross-chain
9. **Asset Router** - Main SOLR contract

## 💰 Fee Structure

| Operation | Fee | Description |
|-----------|-----|-------------|
| Object Registration | 0.001 ETH | Register virtual object |
| Experience Registration | 0.002 ETH | Register virtual experience |
| Component Registration | 0.001 ETH | Register reusable component |
| Attestation Creation | 0.0005 ETH | Create proof/verification |
| Bridge Operation | 0.005 ETH | Cross-chain transfer |
| Marketplace Transaction | 0.0025 ETH | Asset trading |
| Routing Fee | 0.0001 ETH | Asset routing |

## 🛡️ Security Features

### **Access Control**
- Role-based permissions
- Resource-level access control
- Role expiration and renewal
- Emergency role management

### **Emergency Controls**
- Multi-level emergency system
- Automated escalation
- Emergency pause mechanisms
- Recovery procedures

### **Fee Management**
- Configurable fee structures
- Automated distribution
- Revenue sharing
- Treasury controls

## 🔧 Integration

### **Frontend Integration**
```typescript
// Example: Register virtual object
const objectRegistry = new ethers.Contract(
  OBJECT_REGISTRY_ADDRESS,
  OBJECT_REGISTRY_ABI,
  signer
);

await objectRegistry.registerVirtualObject(
  "object-123",
  "ipfs://metadata",
  0, // NFT type
  ["tag1", "tag2"],
  ["exp1", "exp2"],
  true, // tradeable
  true, // composable
  { value: ethers.parseEther("0.001") }
);
```

### **Contract Interaction**
```solidity
// Example: Check object ownership
function isObjectOwner(string memory objectId, address user) 
    external view returns (bool) {
    return virtualObjects[objectId].currentOwner == user;
}
```

## 📊 Testing

### **Run Tests**
```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/SomniaAssetRouter.test.js

# Run with coverage
npx hardhat coverage
```

### **Test Networks**
- **Hardhat Network**: Local development
- **Somnia Testnet**: Test deployment (Chain ID: 50312)
- **Somnia Mainnet**: Production deployment

## 📚 API Reference

### **Core Functions**
- `registerVirtualObject()` - Create virtual object
- `createAttestation()` - Create proof/verification
- `registerVirtualExperience()` - Create virtual world
- `findBestRoute()` - Find optimal asset route
- `executeAssetRouting()` - Execute asset transfer

### **Query Functions**
- `getObject()` - Get object details
- `getAttestation()` - Get attestation info
- `getExperience()` - Get experience details
- `getUserObjects()` - Get user's objects
- `getUserExperiences()` - Get user's experiences

## 🔄 Upgradeability

### **Current Status**
- All contracts are **NOT upgradeable** by default
- Use proxy pattern for upgradeability if needed
- Emergency controls allow pausing and recovery

### **Upgrade Strategy**
1. Deploy new contract version
2. Use emergency controls to pause old version
3. Migrate data and state
4. Update frontend references

## 🌐 Network Configuration

### **Somnia Testnet**
```javascript
{
  url: "https://testnet-rpc.somnia.network",
  chainId: 50312,
  gas: 2100000,
  gasPrice: 8000000000
}
```

### **Somnia Mainnet**
```javascript
{
  url: "https://rpc.somnia.network",
  chainId: 50313, // Expected
  gas: 2100000,
  gasPrice: 8000000000
}
```

## 📈 Monitoring

### **Key Metrics**
- Total objects registered
- Total experiences created
- Bridge operations count
- Fee collection volume
- Emergency events

### **Health Checks**
- Contract balance monitoring
- Gas usage optimization
- Emergency contact availability
- Fee distribution accuracy

## 🚨 Emergency Procedures

### **Emergency Levels**
1. **Low** - Minor issues, automated resolution
2. **Medium** - Requires attention, manual intervention
3. **High** - Significant impact, emergency mode activation
4. **Critical** - System-wide impact, immediate action required

### **Recovery Actions**
- Pause affected operations
- Execute recovery plans
- Contact emergency contacts
- Deploy fixes if needed
- Resume normal operations

## 🤝 Contributing

### **Development Guidelines**
- Follow Solidity best practices
- Include comprehensive tests
- Document all functions
- Use proper access controls
- Implement emergency mechanisms

### **Code Review Process**
1. Create feature branch
2. Implement changes
3. Add tests
4. Submit pull request
5. Code review and approval
6. Merge to main branch

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

- **Documentation**: [docs.somnia.network](https://docs.somnia.network)
- **Discord**: [discord.gg/somnia](https://discord.gg/somnia)
- **GitHub Issues**: Report bugs and feature requests
- **Emergency**: Use emergency contacts for critical issues

---

**Built with ❤️ for the Somnia ecosystem**
