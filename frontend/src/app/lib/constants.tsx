// Somnia Blockchain Configuration
export const SOMNIA_CONFIG = {
  CHAIN_ID: 50312,
  RPC_URL: 'https://testnet-rpc.somnia.network',
  EXPLORER_URL: 'https://testnet-explorer.somnia.network',
  NATIVE_CURRENCY: 'SOM',
  NATIVE_DECIMALS: 18
}

// DeFi Token Types
export const DEFI_TOKENS = [
  { id: 'som', name: 'Somnia', symbol: 'SOM', icon: '🔵', type: 'Native Token', decimals: 18 },
  { id: 'somg', name: 'Somnia Governance', symbol: 'SOMG', icon: '🏛️', type: 'Governance Token', decimals: 18 },
  { id: 'usdc', name: 'USD Coin', symbol: 'USDC', icon: '💵', type: 'Stablecoin', decimals: 6 },
  { id: 'weth', name: 'Wrapped Ether', symbol: 'WETH', icon: '⚡', type: 'Wrapped Token', decimals: 18 }
] as const

// DeFi Protocols
export const DEFI_PROTOCOLS = [
  {
    name: 'SomniaAMM',
    type: 'Automated Market Maker',
    description: 'Uniswap-like DEX for token trading',
    features: [
      'Token swapping',
      'Liquidity provision',
      'Automated pricing',
      'Fee collection',
      'Pool management'
    ],
    icon: '🔄',
    color: 'bg-green-600',
    status: 'active',
    tvl: '$0', // To be updated after deployment
    volume24h: '$0',
    pools: 0
  },
  {
    name: 'SomniaLending',
    type: 'Lending & Borrowing',
    description: 'Supply and borrow with collateral',
    features: [
      'Supply tokens',
      'Borrow against collateral',
      'Interest earning',
      'Liquidation system',
      'Risk management'
    ],
    icon: '🏦',
    color: 'bg-blue-600',
    status: 'active',
    tvl: '$0',
    volume24h: '$0',
    pools: 0
  },
  {
    name: 'SomniaStaking',
    type: 'Staking & Rewards',
    description: 'Stake tokens to earn rewards',
    features: [
      'Multiple staking tiers',
      'Reward multipliers',
      'Flexible staking',
      'Early withdrawal penalties',
      'Governance rewards'
    ],
    icon: '💰',
    color: 'bg-purple-600',
    status: 'active',
    tvl: '$0',
    volume24h: '$0',
    pools: 0
  },
  {
    name: 'SomniaGovernance',
    type: 'Governance & Voting',
    description: 'Community governance token',
    features: [
      'Proposal creation',
      'Voting system',
      'Token distribution',
      'Community control',
      'Protocol upgrades'
    ],
    icon: '🏛️',
    color: 'bg-yellow-600',
    status: 'active',
    tvl: '$0',
    volume24h: '$0',
    pools: 0
  }
] as const

// Smart Contract Addresses (To be populated after deployment)
export const CONTRACTS = {
  SOMNIA_GOVERNANCE: '0x...', // Governance token (SOMG)
  SOMNIA_AMM: '0x...', // AMM DEX
  SOMNIA_LENDING: '0x...', // Lending protocol
  SOMNIA_STAKING: '0x...' // Staking protocol
} as const

// DeFi Categories
export const DEFI_CATEGORIES = [
  { id: 'trading', name: 'Trading', icon: '🔄', description: 'Swap tokens on AMM', route: '/trade' },
  { id: 'lending', name: 'Lending', icon: '🏦', description: 'Supply and borrow', route: '/lend' },
  { id: 'staking', name: 'Staking', icon: '💰', description: 'Earn rewards', route: '/stake' },
  { id: 'governance', name: 'Governance', icon: '🏛️', description: 'Vote on proposals', route: '/governance' },
  { id: 'yield', name: 'Yield Farming', icon: '🌾', description: 'Maximize returns', route: '/stake' },
  { id: 'portfolio', name: 'Portfolio', icon: '📊', description: 'Track investments', route: '/analytics' }
] as const

// Trading Pairs
export const TRADING_PAIRS = [
  { id: 'som-somg', token0: 'SOM', token1: 'SOMG', icon0: '🔵', icon1: '🏛️', volume24h: '$0' },
  { id: 'som-usdc', token0: 'SOM', token1: 'USDC', icon0: '🔵', icon1: '💵', volume24h: '$0' },
  { id: 'somg-usdc', token0: 'SOMG', token1: 'USDC', icon0: '🏛️', icon1: '💵', volume24h: '$0' }
] as const

// Staking Tiers
export const STAKING_TIERS = [
  { name: 'Bronze', minStake: '1,000', maxStake: '10,000', multiplier: '1x', lockDuration: '30 days', penalty: '5%' },
  { name: 'Silver', minStake: '10,000', maxStake: '100,000', multiplier: '1.2x', lockDuration: '90 days', penalty: '3%' },
  { name: 'Gold', minStake: '100,000', maxStake: '1,000,000', multiplier: '1.5x', lockDuration: '180 days', penalty: '2%' }
] as const

// Lending Markets
export const LENDING_MARKETS = [
  { token: 'SOM', supplyRate: '10%', borrowRate: '12%', totalSupply: '$0', totalBorrow: '$0', utilization: '0%' },
  { token: 'SOMG', supplyRate: '8%', borrowRate: '10%', totalSupply: '$0', totalBorrow: '$0', utilization: '0%' },
  { token: 'USDC', supplyRate: '5%', borrowRate: '7%', totalSupply: '$0', totalBorrow: '$0', utilization: '0%' }
] as const

// Network Configuration
export const NETWORK_CONFIG = {
  CHAIN_ID: 50312,
  RPC_URL: 'https://testnet-rpc.somnia.network',
  EXPLORER_URL: 'https://testnet-explorer.somnia.network',
  BLOCK_TIME: 12, // seconds
  CONFIRMATIONS: 1
} as const

// Default Settings
export const DEFAULT_SETTINGS = {
  SLIPPAGE_TOLERANCE: 0.5, // 0.5%
  GAS_LIMIT: 300000,
  MAX_PRIORITY_FEE: 1.5, // gwei
  AUTO_APPROVE: true,
  SHOW_ZERO_BALANCES: false
} as const

// Fee Structure
export const FEE_STRUCTURE = {
  AMM_TRADING_FEE: 0.3, // 0.3%
  AMM_LIQUIDITY_FEE: 0.2, // 0.2%
  LENDING_ORIGINATION_FEE: 0.1, // 0.1%
  STAKING_WITHDRAWAL_PENALTY: 0.05, // 5%
  GOVERNANCE_PROPOSAL_FEE: 1000 // 1000 SOMG
} as const

// Legacy exports for backward compatibility
export const TOKENS = DEFI_TOKENS
export const PROTOCOLS = DEFI_PROTOCOLS
  