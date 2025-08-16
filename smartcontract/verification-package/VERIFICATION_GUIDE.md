# Contract Verification Guide

## Overview
This guide explains how to verify the deployed Somnia DeFi contracts on the Somnia Explorer.

## Network Information
- **Network**: Somnia Testnet
- **Deployer**: 0x95e1CF9174AbD55E47b9EDa1b3f0F2ba0f4369a0
- **Deployment Time**: 2025-08-16T11:34:44.445Z

## Contract Addresses

### WrappedSomnia
- **Address**: 0x37FcBDc9Ff829279Ad49dFFdDeDAa7B224B1b0B2
- **Purpose**: Wraps native SOM to WSOM (ERC20)
- **Verification**: Use WrappedSomnia-verification.json

### USDCToken
- **Address**: 0xA20E9Db778125527a53069f502292B2b02e3D7CF
- **Purpose**: USDC stablecoin with minting controls
- **Verification**: Use USDCToken-verification.json

### SomniaLPToken
- **Address**: 0xE018246306b3e3AE88b618aD2c2E0Bc10A86AD65
- **Purpose**: LP tokens for AMM pools
- **Verification**: Use SomniaLPToken-verification.json

### TestTokenFaucet
- **Address**: 0x5908225583f89A3060D5f9eecbc0288fcEc2c512
- **Purpose**: Faucet for testing tokens
- **Verification**: Use TestTokenFaucet-verification.json

## Verification Steps

### 1. Somnia Explorer
1. Go to [Somnia Explorer](https://explorer.somnia.network)
2. Search for the contract address
3. Click on "Contract" tab
4. Click "Verify and Publish"

### 2. Compiler Settings
- **Compiler Version**: 0.8.19
- **Optimization**: Enabled
- **Runs**: 200
- **EVM Version**: paris

### 3. Constructor Arguments
All contracts use default constructors with no arguments except:
- **USDCToken**: Owner address
- **SomniaLPToken**: Owner address
- **TestTokenFaucet**: Token addresses and owner

### 4. Source Code
Use the individual verification files which contain the complete source code and ABI.

## Frontend Integration

### 1. Install Dependencies
```bash
npm install ethers@5.7.2
# or for newer versions
npm install ethers@6.x
```

### 2. Import Contract Information
```typescript
import { CONTRACT_ADDRESSES } from './contract-types';
import WrappedSomniaABI from './WrappedSomnia-verification.json';
```

### 3. Create Contract Instance
```typescript
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const wrappedSomnia = new ethers.Contract(
  CONTRACT_ADDRESSES.WrappedSomnia,
  WrappedSomniaABI.abi,
  signer
);
```

## Testing

### 1. Run Tests Locally
```bash
npx hardhat test
```

### 2. Test on Testnet
```bash
npx hardhat run scripts/deploy-new-tokens.js --network somniaTestnet
```

## Support
For issues or questions, refer to the contract source code and test files.
