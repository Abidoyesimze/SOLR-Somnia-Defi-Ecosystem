# Contract Verification Guide

## 📋 Contract Deployment Status

All contracts are successfully deployed on **Somnia Testnet** (Chain ID: 50312)

### 🏗️ Deployed Contracts

| Contract | Address | Status | Bytecode Size |
|----------|---------|--------|---------------|
| **SomniaGovernance** | `0xc8F6fF01fd1D981e627a8102fc334D360Af7384b` | ✅ Deployed | 29,540 bytes |
| **SomniaAMM** | `0x50e640A4DeEcc4CC98EFb6fB59B655cc65565E77` | ✅ Deployed | 13,748 bytes |
| **SomniaLending** | `0x58C125A48AE01B40800F1fe58C1Fc1208B12Fd20` | ✅ Deployed | 14,436 bytes |
| **SomniaStaking** | `0xD7f9C58211d1e38f0ef0f2c802CB36525466EA1f` | ✅ Deployed | 18,556 bytes |

## 🔗 Explorer Links

- **Somnia Explorer**: https://shannon-explorer.somnia.network/
- **Network**: Somnia Testnet (Shannon)
- **Chain ID**: 50312

## 📁 Generated Files

The following files have been generated for verification:

- `abi/` - Individual contract ABIs
  - `SomniaGovernance.json` - Governance token ABI
  - `SomniaAMM.json` - AMM DEX ABI
  - `SomniaLending.json` - Lending protocol ABI
  - `SomniaStaking.json` - Staking protocol ABI
- `verification-info.json` - Complete verification information
- `deployment-info.json` - Deployment details

## 🔧 Verification Information

### Compiler Settings
- **Solidity Version**: 0.8.19
- **Optimizer**: Enabled
- **Optimizer Runs**: 200
- **Via IR**: Enabled

### Constructor Arguments
All contracts have **no constructor arguments** (empty arrays).

## 📝 Manual Verification Steps

### 1. SomniaGovernance Token
- **Address**: `0xc8F6fF01fd1D981e627a8102fc334D360Af7384b`
- **Source**: `contracts/SomniaGovernance.sol`
- **Constructor Args**: None
- **Verification URL**: https://shannon-explorer.somnia.network/address/0xc8F6fF01fd1D981e627a8102fc334D360Af7384b#code

### 2. SomniaAMM DEX
- **Address**: `0x50e640A4DeEcc4CC98EFb6fB59B655cc65565E77`
- **Source**: `contracts/SomniaAMM.sol`
- **Constructor Args**: None
- **Verification URL**: https://shannon-explorer.somnia.network/address/0x50e640A4DeEcc4CC98EFb6fB59B655cc65565E77#code

### 3. SomniaLending Protocol
- **Address**: `0x58C125A48AE01B40800F1fe58C1Fc1208B12Fd20`
- **Source**: `contracts/SomniaLending.sol`
- **Constructor Args**: None
- **Verification URL**: https://shannon-explorer.somnia.network/address/0x58C125A48AE01B40800F1fe58C1Fc1208B12Fd20#code

### 4. SomniaStaking Protocol
- **Address**: `0xD7f9C58211d1e38f0ef0f2c802CB36525466EA1f`
- **Source**: `contracts/SomniaStaking.sol`
- **Constructor Args**: None
- **Verification URL**: https://shannon-explorer.somnia.network/address/0xD7f9C58211d1e38f0ef0f2c802CB36525466EA1f#code

## 🚀 Verification Process

1. **Go to Somnia Explorer**: https://shannon-explorer.somnia.network/
2. **Search for contract address** (use any of the addresses above)
3. **Click "Contract" tab**
4. **Click "Verify and Publish"**
5. **Upload contract source code** (from `contracts/` directory)
6. **Enter constructor arguments**: Leave empty (no arguments)
7. **Set compiler settings**:
   - Solidity version: 0.8.19
   - Optimizer: Enabled
   - Optimizer runs: 200
   - Via IR: Enabled
8. **Submit for verification**

## 📊 Contract Status

### SomniaGovernance
- ✅ **Deployed and Functional**
- ✅ **Token Name**: "Somnia Governance"
- ✅ **Token Symbol**: "SOMG"
- ✅ **Decimals**: 18
- ✅ **Initial Supply**: 100,000,000 SOMG

### SomniaAMM
- ✅ **Deployed and Functional**
- ✅ **Owner**: `0x95e1CF9174AbD55E47b9EDa1b3f0F2ba0f4369a0`
- ✅ **Pool Count**: 1 (SOMG/USDC pool created)
- ✅ **Tokens Whitelisted**: SOMG, USDC, Mock Token

### SomniaLending
- ✅ **Deployed and Functional**
- ✅ **Owner**: `0x95e1CF9174AbD55E47b9EDa1b3f0F2ba0f4369a0`

### SomniaStaking
- ✅ **Deployed and Functional**
- ✅ **Owner**: `0x95e1CF9174AbD55E47b9EDa1b3f0F2ba0f4369a0`

## 🎯 Next Steps

1. **Verify all contracts** on the Somnia Explorer
2. **Test contract functionality** using the provided scripts
3. **Deploy frontend integration** using the generated ABIs
4. **Launch governance proposals** using the SomniaGovernance contract

## 📞 Support

If you encounter any issues during verification:
1. Check that you're using the correct network (Somnia Testnet)
2. Ensure compiler settings match exactly
3. Verify that constructor arguments are empty
4. Make sure all contract dependencies are included

---

**🎉 All contracts are deployed, functional, and ready for verification!**
