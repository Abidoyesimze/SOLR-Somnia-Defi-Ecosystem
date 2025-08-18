'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Code, 
  FileText, 
  Shield, 
  Zap, 
  CheckCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react'
import { DEFI_PROTOCOLS, CONTRACTS } from '../lib/constants'

const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    content: `
# Getting Started with Somnia DeFi

Welcome to the complete DeFi ecosystem for Somnia Network. This guide will help you integrate with our protocols and start building DeFi applications.

## Prerequisites
- Node.js 18+ and npm/yarn
- Solidity development environment (Hardhat/Foundry)
- Somnia testnet RPC access
- Basic understanding of DeFi concepts

## Quick Start
1. Add our contracts to your project
2. Configure your network settings
3. Deploy or interact with existing protocols
4. Start building your DeFi application

## Network Configuration
- **Network**: Somnia Testnet
- **Chain ID**: 50312
- **RPC URL**: https://dream-rpc.somnia.network/
- **Explorer**: https://testnet-explorer.somnia.network
    `
  },
  {
    id: 'smart-contracts',
    title: 'Smart Contracts',
    icon: Code,
    content: `
# Smart Contract Architecture

Our DeFi ecosystem consists of four core protocols, each designed to work together seamlessly.

## Core Contracts

### 1. SomniaAMM (Automated Market Maker)
- **Purpose**: Token swapping and liquidity provision
- **Features**: Uniswap v2-like AMM with customizable fees
- **Key Functions**: \`swap()\`, \`addLiquidity()\`, \`removeLiquidity()\`

### 2. SomniaLending (Lending Protocol)
- **Purpose**: Supply and borrow with collateral
- **Features**: Interest earning, liquidation system, risk management
- **Key Functions**: \`supply()\`, \`borrow()\`, \`repay()\`, \`liquidate()\`

### 3. SomniaStaking (Staking Protocol)
- **Purpose**: Stake tokens to earn rewards
- **Features**: Multiple tiers, reward multipliers, flexible staking
- **Key Functions**: \`stake()\`, \`unstake()\`, \`claimRewards()\`

### 4. SomniaGovernance (Governance Token)
- **Purpose**: Community governance and voting
- **Features**: Proposal creation, voting system, token distribution
- **Key Functions**: \`createProposal()\`, \`vote()\`, \`executeProposal()\`

## Contract Addresses
\`\`\`javascript
const contractAddresses = {
  'SomniaAMM': '${CONTRACTS.AMM}',
  'SomniaLending': '${CONTRACTS.LENDING}',
  'SomniaStaking': '${CONTRACTS.STAKING}',
  'SomniaGovernance': '${CONTRACTS.GOVERNANCE}'
}
\`\`\`
    `
  },
  {
    id: 'protocols',
    title: 'DeFi Protocols',
    icon: Zap,
    content: `
# DeFi Protocol Integration

Each protocol in our ecosystem can be used independently or combined for advanced DeFi strategies.

## AMM Protocol (SomniaAMM)

### Basic Swap
\`\`\`solidity
// Swap tokens using the AMM
function swap(
    address tokenIn,
    address tokenOut,
    uint256 amountIn,
    uint256 amountOutMin
) external returns (uint256 amountOut);
\`\`\`

### Add Liquidity
\`\`\`solidity
// Provide liquidity to a pool
function addLiquidity(
    address token0,
    address token1,
    uint256 amount0Desired,
    uint256 amount1Desired,
    uint256 amount0Min,
    uint256 amount1Min
) external returns (uint256 liquidity);
\`\`\`

## Lending Protocol (SomniaLending)

### Supply Assets
\`\`\`solidity
// Supply tokens to earn interest
function supply(address token, uint256 amount) external;
\`\`\`

### Borrow Assets
\`\`\`solidity
// Borrow against collateral
function borrow(address token, uint256 amount) external;
\`\`\`

## Staking Protocol (SomniaStaking)

### Stake Tokens
\`\`\`solidity
// Stake tokens in a specific tier
function stake(
    address stakingToken,
    uint256 amount,
    uint256 tierIndex
) external;
\`\`\`

### Claim Rewards
\`\`\`solidity
// Claim accumulated rewards
function claimRewards(address stakingToken) external;
\`\`\`

## Governance Protocol (SomniaGovernance)

### Create Proposal
\`\`\`solidity
// Create a new governance proposal
function createProposal(string memory description) external returns (uint256);
\`\`\`

### Vote on Proposal
\`\`\`solidity
// Vote on an active proposal
function vote(uint256 proposalId, bool support) external;
\`\`\`
    `
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    icon: FileText,
    content: `
# API Reference

## Contract Interfaces

### IERC20 Interface
\`\`\`solidity
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}
\`\`\`

### AMM Interface
\`\`\`solidity
interface ISomniaAMM {
    function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMin) external returns (uint256);
    function getAmountOut(uint256 amountIn, address tokenIn, address tokenOut) external view returns (uint256);
    function getPoolInfo(address token0, address token1) external view returns (PoolInfo memory);
}
\`\`\`

### Lending Interface
\`\`\`solidity
interface ISomniaLending {
    function supply(address token, uint256 amount) external;
    function borrow(address token, uint256 amount) external;
    function getUserPosition(address user, address token) external view returns (UserPosition memory);
}
\`\`\`

## View Functions

### Get Pool Information
\`\`\`solidity
// Get detailed pool information
function getPoolInfo(address token0, address token1) external view returns (PoolInfo memory) {
    return PoolInfo({
        token0: pool.token0,
        token1: pool.token1,
        reserve0: pool.reserve0,
        reserve1: pool.reserve1,
        totalSupply: pool.totalSupply,
        fee0: pool.fee0,
        fee1: pool.fee1,
        price0CumulativeLast: 0,
        price1CumulativeLast: 0,
        blockTimestampLast: block.timestamp
    });
}
\`\`\`

### Get User Position
\`\`\`solidity
// Get user's lending position
function getUserPosition(address user, address token) external view returns (UserPosition memory) {
    return userPositions[user][token];
}
\`\`\`
    `
  },
  {
    id: 'code-examples',
    title: 'Code Examples',
    icon: Code,
    content: `
# Code Examples

## JavaScript/TypeScript Integration

### Initialize Contracts
\`\`\`typescript
import { ethers } from 'ethers';
import SomniaAMM from './contracts/SomniaAMM.json';
import SomniaLending from './contracts/SomniaLending.json';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const ammContract = new ethers.Contract(
  CONTRACTS.SOMNIA_AMM,
  SomniaAMM.abi,
  signer
);

const lendingContract = new ethers.Contract(
  CONTRACTS.SOMNIA_LENDING,
  SomniaLending.abi,
  signer
);
\`\`\`

### Execute Token Swap
\`\`\`typescript
async function swapTokens(tokenIn: string, tokenOut: string, amountIn: string) {
  try {
    // Get minimum amount out
    const amountOutMin = await ammContract.getAmountOut(amountIn, tokenIn, tokenOut);
    
    // Execute swap
    const tx = await ammContract.swap(tokenIn, tokenOut, amountIn, amountOutMin);
    await tx.wait();
    
    console.log('Swap executed successfully!');
  } catch (error) {
    console.error('Swap failed:', error);
  }
}
\`\`\`

### Supply Assets to Lending
\`\`\`typescript
async function supplyAssets(token: string, amount: string) {
  try {
    // Approve tokens first
    const tokenContract = new ethers.Contract(token, ERC20_ABI, signer);
    await tokenContract.approve(CONTRACTS.SOMNIA_LENDING, amount);
    
    // Supply tokens
    const tx = await lendingContract.supply(token, amount);
    await tx.wait();
    
    console.log('Assets supplied successfully!');
  } catch (error) {
    console.error('Supply failed:', error);
  }
}
\`\`\`

### Stake Tokens
\`\`\`typescript
async function stakeTokens(stakingToken: string, amount: string, tier: number) {
  try {
    // Approve tokens first
    const tokenContract = new ethers.Contract(stakingToken, ERC20_ABI, signer);
    await tokenContract.approve(CONTRACTS.SOMNIA_STAKING, amount);
    
    // Stake tokens
    const tx = await stakingContract.stake(stakingToken, amount, tier);
    await tx.wait();
    
    console.log('Tokens staked successfully!');
  } catch (error) {
    console.error('Staking failed:', error);
  }
}
\`\`\`

## React Hook Example

### Custom Hook for AMM
\`\`\`typescript
import { useState, useEffect } from 'react';
import { useContract, useProvider, useSigner } from 'wagmi';

export function useAMM() {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const contract = useContract({
    address: CONTRACTS.SOMNIA_AMM,
    abi: SomniaAMM.abi,
  });
  
  const getPools = async () => {
    setLoading(true);
    try {
      const poolCount = await contract.getPoolCount();
      const poolList = [];
      
      for (let i = 0; i < poolCount; i++) {
        const pool = await contract.getPoolByIndex(i);
        poolList.push(pool);
      }
      
      setPools(poolList);
    } catch (error) {
      console.error('Failed to fetch pools:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    getPools();
  }, []);
  
  return { pools, loading, getPools };
}
\`\`\`
    `
  },
  {
    id: 'security',
    title: 'Security & Best Practices',
    icon: Shield,
    content: `
# Security & Best Practices

## Smart Contract Security

### 1. Access Control
- All critical functions are protected with \`onlyOwner\` modifier
- Emergency pause functionality available
- Upgradeable contract architecture

### 2. Reentrancy Protection
- All external calls use \`ReentrancyGuard\`
- Checks-Effects-Interactions pattern implemented
- Safe transfer functions used

### 3. Input Validation
- Comprehensive parameter validation
- Bounds checking for numerical inputs
- Address validation and zero-address checks

## Integration Security

### 1. Frontend Security
\`\`\`typescript
// Always validate user inputs
function validateSwapInputs(tokenIn: string, amount: string) {
  if (!ethers.utils.isAddress(tokenIn)) {
    throw new Error('Invalid token address');
  }
  
  if (parseFloat(amount) <= 0) {
    throw new Error('Amount must be greater than 0');
  }
}
\`\`\`

### 2. Transaction Security
\`\`\`typescript
// Use proper error handling
async function executeTransaction(txFunction: () => Promise<any>) {
  try {
    const tx = await txFunction();
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log('Transaction successful');
    } else {
      throw new Error('Transaction failed');
    }
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
}
\`\`\`

### 3. Rate Limiting
\`\`\`typescript
// Implement rate limiting for user actions
const rateLimit = new Map();

function checkRateLimit(user: string, action: string, limit: number) {
  const key = \`\${user}:\${action}\`;
  const lastAction = rateLimit.get(key) || 0;
  const now = Date.now();
  
  if (now - lastAction < limit) {
    throw new Error('Rate limit exceeded');
  }
  
  rateLimit.set(key, now);
}
\`\`\`

## Testing Guidelines

### 1. Unit Tests
- Test all public functions
- Test edge cases and error conditions
- Mock external dependencies

### 2. Integration Tests
- Test contract interactions
- Test with real network conditions
- Test gas optimization

### 3. Security Tests
- Fuzz testing for inputs
- Reentrancy attack testing
- Access control testing

## Monitoring & Alerts

### 1. Event Monitoring
\`\`\`typescript
// Listen to important events
contract.on('Swap', (sender, tokenIn, tokenOut, amountIn, amountOut) => {
  console.log('Swap event:', { sender, tokenIn, tokenOut, amountIn, amountOut });
  
  // Send alert for large swaps
  if (parseFloat(amountIn) > 10000) {
    sendAlert('Large swap detected', { amount: amountIn, token: tokenIn });
  }
});
\`\`\`

### 2. Health Checks
\`\`\`typescript
// Regular health checks
setInterval(async () => {
  try {
    const tvl = await contract.getTotalValueLocked();
    const volume = await contract.getTotalVolume();
    
    if (tvl < MINIMUM_TVL || volume < MINIMUM_VOLUME) {
      sendAlert('Protocol health check failed', { tvl, volume });
    }
  } catch (error) {
    sendAlert('Health check error', { error: error.message });
  }
}, 5 * 60 * 1000); // Every 5 minutes
\`\`

## Quick Links

${Object.values(DEFI_PROTOCOLS).map((protocol) => `
- **${protocol.name}**: ${protocol.description}
`).join('')}

## Support

For technical support, please refer to the official Somnia documentation or contact the development team.
`
  }
]

export default function DeveloperDocs() {
  const [openSections, setOpenSections] = useState<string[]>(['getting-started'])
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const copyToClipboard = async (text: string, sectionId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(sectionId)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const renderMarkdown = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold text-white mb-4">{line.substring(2)}</h1>
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-semibold text-white mb-3 mt-6">{line.substring(3)}</h2>
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-semibold text-white mb-2 mt-4">{line.substring(4)}</h3>
      }
      if (line.startsWith('```')) {
        const codeBlock = content.split('```')[Math.floor(index / 2) + 1]
        if (codeBlock) {
          return (
            <div key={index} className="relative my-4">
              <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto text-sm text-gray-200">
                <code>{codeBlock}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(codeBlock, `code-${index}`)}
                className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                {copiedCode === `code-${index}` ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <FileText className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          )
        }
        return null
      }
      if (line.trim() === '') {
        return <div key={index} className="h-4" />
      }
      return <p key={index} className="text-gray-300 leading-relaxed mb-2">{line}</p>
    })
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-white mb-4">Developer Documentation</h1>
        <p className="text-slate-300 mb-4">
                  Somnia&apos;s DeFi ecosystem provides comprehensive smart contracts for trading, lending, staking, and governance.
                </p>
      </motion.div>

      {/* Documentation Sections */}
      <div className="space-y-6">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <section.icon className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              </div>
              {openSections.includes(section.id) ? (
                <ArrowRight className="w-5 h-5 text-gray-400" />
              ) : (
                <ArrowRight className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {openSections.includes(section.id) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 pb-6"
              >
                <div className="prose prose-invert max-w-none">
                  {renderMarkdown(section.content)}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-12 text-center"
      >
        <h3 className="text-2xl font-bold text-white mb-6">Quick Links</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {Object.values(DEFI_PROTOCOLS).map((protocol) => (
            <a
              key={protocol.name}
              href={`/protocols/${protocol.name.toLowerCase()}`}
              className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-4 py-3 text-white transition-colors"
            >
              <span className="text-xl">{protocol.icon}</span>
              <span>{protocol.name}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  )
}