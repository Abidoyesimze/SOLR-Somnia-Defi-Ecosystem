// Token addresses for the DeFi ecosystem
export const TOKEN_ADDRESSES = {
  WSOM: '0x956Ed4d2D7caD091b1C12dEC28AaEe5332D8e1e3', // Newly deployed TestWrappedSomnia
  USDC: '0x4b1e4aE3ba5b0e1bEaf2627299BD4c87Af99fB5e', // Newly deployed USDCToken
  SOMG: '0x95892d596d3427555b071DCBE2Ba2873dAFef122', // Newly deployed SomniaGovernanceToken
  'SOM-LP': '0x22e308D3F15C44456413FA0a4C75B113aB348B6D', // Newly deployed SomniaLPToken
} as const

// Faucet address for test tokens
export const FAUCET_ADDRESS = '0x96562913b9A78983cB459e7A1B36c7166F7F1734' as const // Newly deployed TestTokenFaucet

// Contract addresses (newly deployed permissionless contracts)
export const CONTRACT_ADDRESSES = {
  AMM: '0xD1c15525a977e590dE0178a598C9BE0B5788851B',
  GOVERNANCE: '0x1f8E2fA22951F4a9a387af9675880716dbEdB345',
  LENDING: '0x412D57f6cb2dAbF7C9d694AcB78b1c52d6140f56',
  STAKING: '0xcd593658F4A1ceDb941efe7991c5Ff5AA5899F23',
} as const

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 50312,
  name: 'Somnia Testnet',
  rpcUrl: process.env.NEXT_PUBLIC_SOMNIA_RPC_URL || 'https://dream-rpc.somnia.network/',
  explorer: process.env.NEXT_PUBLIC_SOMNIA_EXPLORER || 'https://testnet-explorer.somnia.network',
} as const

// AMM configuration
export const AMM_CONFIG = {
  tradingFee: 0.003, // 0.3%
  slippageTolerance: 0.05, // 5%
  maxPriceImpact: 0.10, // 10%
} as const 