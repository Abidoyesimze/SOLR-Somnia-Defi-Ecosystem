# SomniaLending Protocol Scripts

This directory contains scripts to interact with the SomniaLending protocol on the Somnia testnet blockchain.

## 📋 Overview

The SomniaLending contract is a decentralized lending protocol that allows users to:
- Supply tokens to earn interest
- Borrow tokens against collateral
- Liquidate undercollateralized positions
- Manage lending markets with configurable collateral factors

## 🚀 Quick Start

### Prerequisites

1. **Node.js and npm** installed
2. **Hardhat** configured for Somnia testnet
3. **Private key** with testnet WSOM for gas fees
4. **Environment variables** set up

### Environment Setup

Create a `.env` file in the `smartcontract` directory:

```bash
# Somnia Testnet Configuration
SOMNIA_TESTNET_RPC=https://dream-rpc.somnia.network/
PRIVATE_KEY=your_private_key_here
SOMNIA_API_KEY=your_api_key_here
```

## 📜 Available Scripts

### 1. Setup Lending Markets (`setup-lending-markets.js`)

Creates 4 lending markets with specified collateral factors:

- **WSOM**: 80% collateral factor
- **SOMG**: 75% collateral factor  
- **USDC**: 75% collateral factor
- **SOMLP**: 75% collateral factor

```bash
npx hardhat run scripts/setup-lending-markets.js --network somniaTestnet
```

**What it does:**
- Whitelists all tokens
- Creates markets with specified collateral factors
- Displays market information
- Saves setup details to `lending-markets-setup.json`

### 2. Test Lending Interactions (`test-lending-interactions.js`)

Comprehensive testing of all lending functionality:

```bash
npx hardhat run scripts/test-lending-interactions.js --network somniaTestnet
```

**Tests include:**
- ✅ Supply SOMG tokens
- ✅ Supply native WSOM tokens
- ✅ Borrow tokens against collateral
- ✅ Repay borrowed tokens
- ✅ Withdraw supplied tokens
- ✅ Interest accrual
- ✅ Liquidation threshold checks

### 3. Check Lending Status (`check-lending-status.js`)

Quick status check of the lending protocol:

```bash
npx hardhat run scripts/check-lending-status.js --network somniaTestnet
```

**Shows:**
- Protocol overview (total markets, collateral, borrowed)
- Market details for each token
- Whitelist status
- Protocol constants

## 🏗️ Contract Architecture

### Core Components

- **Market**: Represents a lending market for a specific token
- **UserPosition**: Tracks user's supply and borrow in each market
- **LiquidationInfo**: Manages liquidation processes

### Key Functions

- `createMarket()`: Create new lending markets
- `supply()`: Supply tokens to earn interest
- `borrow()`: Borrow tokens against collateral
- `repay()`: Repay borrowed tokens
- `withdraw()`: Withdraw supplied tokens
- `liquidate()`: Liquidate undercollateralized positions

### Interest Model

- **Supply Rate**: 10% annual (1000 basis points)
- **Borrow Rate**: 12% annual (1200 basis points)
- **Interest accrues** based on time elapsed

## 🔒 Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownable**: Only owner can create markets and whitelist tokens
- **Collateral Requirements**: Users must maintain sufficient collateral
- **Liquidation Threshold**: 85% minimum collateral ratio
- **Liquidation Bonus**: 5% bonus for liquidators

## 📊 Market Parameters

| Token | Collateral Factor | Description |
|-------|------------------|-------------|
| WSOM  | 80%              | Wrapped Somnia token |
| SOMG  | 75%              | Somnia Governance token |
| USDC  | 75%              | USD Coin stablecoin |
| SOMLP | 75%              | Somnia LP token |

## 🧪 Testing Workflow

1. **Setup Markets**: Run `setup-lending-markets.js`
2. **Test Functions**: Run `test-lending-interactions.js`
3. **Check Status**: Run `check-lending-status.js`
4. **Monitor**: Watch for interest accrual and market changes

## ⚠️ Important Notes

### Gas Requirements
- Ensure your account has sufficient WSOM for gas fees
- Large transactions may require higher gas limits

### Token Approvals
- Users must approve the lending contract to spend their tokens
- Native WSOM transactions include value in the transaction

### Market Creation
- Only the contract owner can create markets
- Tokens must be whitelisted before market creation
- Collateral factors cannot exceed 90%

## 🔧 Troubleshooting

### Common Issues

1. **"TOKEN_NOT_WHITELISTED"**
   - Run the setup script first
   - Check if token is properly whitelisted

2. **"INSUFFICIENT_COLLATERAL"**
   - User needs more collateral before borrowing
   - Check collateral factors and market conditions

3. **"MARKET_NOT_EXISTS"**
   - Market hasn't been created yet
   - Run the setup script

4. **"INSUFFICIENT_LIQUIDITY"**
   - Market doesn't have enough supply
   - Wait for more users to supply tokens

### Debug Commands

```bash
# Check specific market
npx hardhat console --network somniaTestnet
> const lending = await ethers.getContractAt("SomniaLending", "0x58C125A48AE01B40800F1fe58C1Fc1208B12Fd20")
> await lending.getMarket("0x37FcBDc9Ff829279Ad49dFFdDeDAa7B224B1b0B2")

# Check user position
> await lending.getUserPosition("0xYourAddress", "0xTokenAddress")
```

## 📈 Next Steps

After setting up markets:

1. **Frontend Integration**: Connect to the lending contract
2. **User Testing**: Test with real users and tokens
3. **Monitoring**: Set up monitoring for market health
4. **Governance**: Implement governance for parameter updates

## 🔗 Useful Links

- [Somnia Testnet Explorer](https://shannon-explorer.somnia.network/)
- [Somnia RPC Endpoint](https://dream-rpc.somnia.network/)
- [Contract Source Code](./contracts/SomniaLending.sol)
- [Deployment Info](./deployment-info.json)

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review contract logs and error messages
3. Verify network configuration
4. Ensure sufficient gas and token balances

---

**Happy Lending! 🏦✨**
