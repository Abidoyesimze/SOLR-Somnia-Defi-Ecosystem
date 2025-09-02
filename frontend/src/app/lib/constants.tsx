// Somnia Blockchain Configuration
export const SOMNIA_CONFIG = {
  CHAIN_ID: 50312,
  RPC_URL: 'https://dream-rpc.somnia.network/',
  EXPLORER_URL: 'https://testnet-explorer.somnia.network',
  NATIVE_CURRENCY: 'SOM',
  NATIVE_DECIMALS: 18
}

// DeFi tokens supported by the ecosystem
export const DEFI_TOKENS = {
  WSOM: {
    symbol: 'WSOM',
    name: 'Wrapped Somnia',
    decimals: 18,
    address: '0x7E3EeD3f3B09Df10A06adA95Bc9887D5385935DB',
    logo: '🌙',
    color: 'from-blue-500 to-indigo-600'
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    address: '0xe2dB8A87E83b1A3fE7db7128d186079A9F958bEA',
    logo: '💵',
    color: 'from-green-500 to-emerald-600'
  },
  SOMG: {
    symbol: 'SOMG',
    name: 'Somnia Governance',
    decimals: 18,
    address: '0x58f5C4d7C08C6D9B45624ffE1C9fA3119e98991a',
    logo: '🗳️',
    color: 'from-purple-500 to-violet-600'
  },
  'SOM-LP': {
    symbol: 'SOM-LP',
    name: 'Somnia Liquidity Provider',
    decimals: 18,
    address: '0x22e308D3F15C44456413FA0a4C75B113aB348B6D',
    logo: '',
    color: 'from-yellow-500 to-orange-500'
  }
} as const

// DeFi protocols in the ecosystem (as array for mapping)
export const DEFI_PROTOCOLS = [
  {
    name: 'Automated Market Maker',
    description: 'Decentralized exchange for token swapping',
    address: '0xD1c15525a977e590dE0178a598C9BE0B5788851B',
    icon: '',
    color: 'bg-blue-500'
  },
  {
    name: 'Lending Protocol',
    description: 'Borrow and lend tokens with interest',
    address: '0x086233C8613829AD73d00c63848d927dd6f2F345',
    icon: '',
    color: 'bg-green-500'
  },
  {
    name: 'Staking Protocol',
    description: 'Stake tokens to earn rewards',
    address: '0xcd593658F4A1ceDb941efe7991c5Ff5AA5899F23',
    icon: '',
    color: 'bg-purple-500'
  },
  {
    name: 'Governance Protocol',
    description: 'Vote on protocol proposals',
    address: '0x58f5C4d7C08C6D9B45624ffE1C9fA3119e98991a',
    icon: '',
    color: 'bg-orange-500'
  }
] as const

// DeFi categories for navigation
export const DEFI_CATEGORIES = [
  {
    name: 'Trade',
    description: 'Swap tokens with low slippage',
    icon: '🔄',
    color: 'from-blue-500 to-indigo-600',
    route: '/trade'
  },
  {
    name: 'Lend',
    description: 'Borrow and lend with interest',
    icon: '💰',
    color: 'from-green-500 to-emerald-600',
    route: '/lend'
  },
  {
    name: 'Stake',
    description: 'Stake tokens for rewards',
    icon: '🔒',
    color: 'from-purple-500 to-violet-600',
    route: '/stake'
  },
  {
    name: 'Govern',
    description: 'Vote on protocol decisions',
    icon: '🗳️',
    color: 'from-yellow-500 to-orange-500',
    route: '/governance'
  }
] as const

// Trading pairs available on the AMM
export const TRADING_PAIRS = [
  {
    pair: 'WSOM/USDC',
    token0: 'WSOM',
    token1: 'USDC',
    liquidity: '$2.5M',
    volume24h: '$450K',
    fee: '0.3%',
    color: 'from-blue-500 to-green-500'
  },
  {
    pair: 'WSOM/SOMG',
    token0: 'WSOM',
    token1: 'SOMG',
    liquidity: '$800K',
    volume24h: '$120K',
    fee: '0.3%',
    color: 'from-blue-500 to-purple-500'
  },
  {
    pair: 'USDC/SOMG',
    token0: 'USDC',
    token1: 'SOMG',
    liquidity: '$600K',
    volume24h: '$80K',
    fee: '0.3%',
    color: 'from-green-500 to-purple-500'
  }
] as const

// Staking tiers and rewards
export const STAKING_TIERS = [
  {
    name: 'Bronze',
    minStake: '100 WSOM',
    apy: '8.5%',
    lockPeriod: '30 days',
    color: 'from-amber-500 to-orange-500'
  },
  {
    name: 'Silver',
    minStake: '500 WSOM',
    apy: '12.5%',
    lockPeriod: '90 days',
    color: 'from-slate-400 to-slate-600'
  },
  {
    name: 'Gold',
    minStake: '1000 WSOM',
    apy: '18.5%',
    lockPeriod: '180 days',
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    name: 'Platinum',
    minStake: '5000 WSOM',
    apy: '25.5%',
    lockPeriod: '365 days',
    color: 'from-purple-500 to-indigo-600'
  }
] as const

// Lending markets and rates
export const LENDING_MARKETS = [
  {
    token: 'WSOM',
    supplyAPY: '4.2%',
    borrowAPY: '8.5%',
    totalSupply: '$1.2M',
    totalBorrow: '$450K',
    utilization: '37.5%',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    token: 'USDC',
    supplyAPY: '3.8%',
    borrowAPY: '7.2%',
    totalSupply: '$2.1M',
    totalBorrow: '$800K',
    utilization: '38.1%',
    color: 'from-green-500 to-emerald-600'
  },
  {
    token: 'SOMG',
    supplyAPY: '5.5%',
    borrowAPY: '10.2%',
    totalSupply: '$800K',
    totalBorrow: '$200K',
    utilization: '25.0%',
    color: 'from-purple-500 to-violet-600'
  }
] as const

// Fee structure for the AMM
export const FEE_STRUCTURE = {
  tradingFee: '0.3%',
  liquidityProviderFee: '0.25%',
  protocolFee: '0.05%',
  slippageTolerance: '0.5%',
  maxPriceImpact: '10%'
} as const

// Contract addresses for integration
export const CONTRACTS = {
  AMM: '0xD1c15525a977e590dE0178a598C9BE0B5788851B',
  LENDING: '0x412D57f6cb2dAbF7C9d694AcB78b1c52d6140f56',
  STAKING: '0xcd593658F4A1ceDb941efe7991c5Ff5AA5899F23',
  GOVERNANCE: '0x1f8E2fA22951F4a9a387af9675880716dbEdB345',
  FAUCET: '0x96562913b9A78983cB459e7A1B36c7166F7F1734'
} as const

// Default Settings
export const DEFAULT_SETTINGS = {
  SLIPPAGE_TOLERANCE: 0.5, // 0.5%
  GAS_LIMIT: 300000,
  MAX_PRIORITY_FEE: 1.5, // gwei
  AUTO_APPROVE: true,
  SHOW_ZERO_BALANCES: false
} as const

// Legacy exports for backward compatibility
export const TOKENS = DEFI_TOKENS
export const PROTOCOLS = DEFI_PROTOCOLS
  