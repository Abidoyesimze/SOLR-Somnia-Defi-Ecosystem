# 🚀 Somnia DeFi Ecosystem

Complete DeFi infrastructure for the Somnia blockchain, implementing foundational protocols for trading, lending, staking, and governance.

## 📋 Overview

This ecosystem provides the essential DeFi building blocks that Somnia needs:

- **🔄 AMM DEX** - Automated Market Maker for token trading
- **🏦 Lending Protocol** - Borrow and lend with collateral
- **💰 Staking Protocol** - Earn rewards by staking tokens
- **🏛️ Governance Token** - Community governance and voting

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Somnia DeFi Ecosystem                   │
├─────────────────────────────────────────────────────────────┤
│  🏛️  SomniaGovernance (SOMG)                              │
│  ├─ ERC20 Governance Token                                │
│  ├─ Voting & Proposals                                    │
│  └─ Community Control                                     │
├─────────────────────────────────────────────────────────────┤
│  🔄 SomniaAMM                                             │
│  ├─ Automated Market Making                               │
│  ├─ Liquidity Pools                                       │
│  └─ Token Swapping                                        │
├─────────────────────────────────────────────────────────────┤
│  🏦 SomniaLending                                         │
│  ├─ Supply & Borrow                                       │
│  ├─ Interest Rates                                        │
│  └─ Liquidation System                                    │
├─────────────────────────────────────────────────────────────┤
│  💰 SomniaStaking                                         │
│  ├─ Staking Pools                                         │
│  ├─ Tier-based Rewards                                    │
│  └─ Flexible Staking                                      │
└─────────────────────────────────────────────────────────────┘
```

## 📜 Smart Contracts

### 1. **SomniaGovernance.sol** 🏛️
**Purpose:** Governance token and voting system for the ecosystem

**Features:**
- ERC20 governance token (SOMG)
- Proposal creation and voting
- Configurable governance parameters
- Pausable and upgradeable

**Key Functions:**
- `createProposal(string description)` - Create new governance proposal
- `vote(uint256 proposalId, bool support)` - Vote on proposals
- `executeProposal(uint256 proposalId)` - Execute successful proposals
- `updateSettings(...)` - Update governance parameters

**Initial Supply:** 100,000,000 SOMG tokens

### 2. **SomniaAMM.sol** 🔄
**Purpose:** Automated Market Maker for token trading

**Features:**
- Uniswap v2-like AMM
- Liquidity pools and trading
- Configurable fees (0.3% trading, 0.2% liquidity)
- Token whitelisting system

**Key Functions:**
- `createPool(address token0, address token1)` - Create new trading pair
- `addLiquidity(...)` - Provide liquidity to pools
- `swap(address tokenIn, address tokenOut, uint256 amountIn)` - Trade tokens
- `getAmountOut(...)` - Calculate swap output

**Fees:**
- Trading Fee: 0.3% (30 basis points)
- Liquidity Fee: 0.2% (20 basis points)

### 3. **SomniaLending.sol** 🏦
**Purpose:** Lending and borrowing protocol

**Features:**
- Supply tokens to earn interest
- Borrow against collateral
- Interest rate model
- Liquidation system

**Key Functions:**
- `createMarket(address token, uint256 collateralFactor)` - Create lending market
- `supply(address token, uint256 amount)` - Supply tokens
- `borrow(address token, uint256 amount)` - Borrow tokens
- `liquidate(...)` - Liquidate undercollateralized positions

**Parameters:**
- Liquidation Threshold: 85%
- Liquidation Bonus: 5%
- Interest Rate: 10% annual (configurable)

### 4. **SomniaStaking.sol** 💰
**Purpose:** Staking and rewards protocol

**Features:**
- Multiple staking tiers
- Tier-based reward multipliers
- Flexible staking periods
- Early withdrawal penalties

**Key Functions:**
- `createPool(...)` - Create staking pool
- `addStakingTier(...)` - Add staking tier
- `stake(address stakingToken, uint256 amount, uint256 tierIndex)` - Stake tokens
- `claimRewards(address stakingToken)` - Claim earned rewards

**Staking Tiers:**
- **Bronze:** 1x multiplier, 30-day lock, 5% penalty
- **Silver:** 1.2x multiplier, 90-day lock, 3% penalty  
- **Gold:** 1.5x multiplier, 180-day lock, 2% penalty

## 🚀 Deployment

### Prerequisites
- Hardhat development environment
- Somnia Testnet RPC access
- Wallet with testnet SOM tokens

### Quick Deploy
```bash
cd smartcontract
npm install
npx hardhat compile
npx hardhat run scripts/deploy-defi.js --network somniaTestnet
```

### Deployment Order
1. **SomniaGovernance** - Deploy governance token
2. **SomniaAMM** - Deploy AMM DEX
3. **SomniaLending** - Deploy lending protocol
4. **SomniaStaking** - Deploy staking protocol

### Post-Deployment Setup
- Whitelist governance token in all protocols
- Create initial staking pools and tiers
- Set up lending markets
- Fund protocols with initial liquidity

## 🔧 Configuration

### Network Configuration
```javascript
// hardhat.config.js
networks: {
  somniaTestnet: {
    url: "https://testnet-rpc.somnia.network",
    chainId: 50312,
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

### Environment Variables
```bash
# .env
PRIVATE_KEY=your_private_key_here
SOMNIA_RPC_URL=https://testnet-rpc.somnia.network
SOMNIA_EXPLORER=https://testnet-explorer.somnia.network
```

## 📊 Usage Examples

### Trading on AMM
```javascript
// Create trading pair
await amm.createPool(tokenA, tokenB);

// Add liquidity
await amm.addLiquidity(tokenA, tokenB, amountA, amountB, 0, 0);

// Swap tokens
await amm.swap(tokenA, tokenB, amountIn, minAmountOut);
```

### Lending
```javascript
// Supply tokens
await lending.supply(token, amount);

// Borrow tokens
await lending.borrow(token, amount);

// Repay loan
await lending.repay(token, amount);
```

### Staking
```javascript
// Stake tokens
await staking.stake(token, amount, tierIndex);

// Claim rewards
await staking.claimRewards(token);

// Unstake tokens
await staking.unstake(token, amount);
```

### Governance
```javascript
// Create proposal
const proposalId = await governance.createProposal("Increase staking rewards");

// Vote on proposal
await governance.vote(proposalId, true);

// Execute proposal
await governance.executeProposal(proposalId);
```

## 🧪 Testing

### Run Tests
```bash
npx hardhat test
```

### Test Coverage
```bash
npx hardhat coverage
```

### Local Testing
```bash
npx hardhat node
npx hardhat run scripts/deploy-defi.js --network localhost
```

## 🔒 Security Features

- **Reentrancy Protection** - All external calls protected
- **Access Control** - Owner-only functions for critical operations
- **Input Validation** - Comprehensive parameter checking
- **Emergency Controls** - Pause functionality for all protocols
- **Liquidation System** - Automated risk management

## 📈 Economic Model

### Tokenomics
- **Governance Token (SOMG):** 100M total supply
- **Staking Rewards:** 15% annual rate (configurable)
- **Lending Rates:** 10% supply, 12% borrow
- **Trading Fees:** 0.3% per trade
- **Liquidity Fees:** 0.2% for pool providers

### Incentives
- **Staking Rewards** - Earn SOMG by staking
- **Liquidity Mining** - Earn fees by providing liquidity
- **Governance Rights** - Vote on protocol changes
- **Early Adopter Benefits** - Higher rewards for early participants

## 🔮 Future Enhancements

### Phase 2 Features
- **Cross-Chain Bridging** - Connect to other blockchains
- **Advanced AMM** - Concentrated liquidity pools
- **Derivatives** - Options and futures trading
- **Insurance** - Protocol insurance coverage
- **Analytics** - Advanced trading analytics

### Phase 3 Features
- **DAO Governance** - Full decentralized governance
- **Multi-Sig Treasury** - Community-controlled funds
- **Advanced Risk Management** - AI-powered risk assessment
- **Mobile App** - Native mobile experience

## 🤝 Contributing

### Development Guidelines
1. Follow Solidity best practices
2. Write comprehensive tests
3. Use OpenZeppelin contracts where possible
4. Document all public functions
5. Implement proper access controls

### Testing Requirements
- 100% function coverage
- Edge case testing
- Gas optimization
- Security audit recommendations

## 📚 Resources

### Documentation
- [Somnia Network Docs](https://docs.somnia.network)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)

### Community
- [Somnia Discord](https://discord.gg/somnia)
- [GitHub Repository](https://github.com/somnia-network)
- [Community Forum](https://forum.somnia.network)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This software is provided "as is" without warranty. Use at your own risk. The contracts have not been audited and should not be used in production without proper security review.

---

**Built with ❤️ for the Somnia ecosystem** 