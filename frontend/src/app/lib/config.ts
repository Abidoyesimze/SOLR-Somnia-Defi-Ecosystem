// Token addresses on Somnia Network
// These are the actual deployed token addresses
export const TOKEN_ADDRESSES = {
  SOM: '0x0000000000000000000000000000000000000000', // Replace with actual SOM address when deployed
  SOMG: '0xc8F6fF01fd1D981e627a8102fc334D360Af7384b', // This is the governance contract address
  USDC: '0x0000000000000000000000000000000000000000', // Replace with actual USDC address when deployed
  'SOM-LP': '0x0000000000000000000000000000000000000000', // Replace with actual LP token address when deployed
  WSOM: '0x0000000000000000000000000000000000000000', // Replace with actual Wrapped SOM address when deployed
} as const

// Faucet address for test tokens
export const FAUCET_ADDRESS = '0x0000000000000000000000000000000000000000' as const // Replace with actual faucet address when deployed

// Contract addresses (already deployed)
export const CONTRACT_ADDRESSES = {
  AMM: '0x50e640A4DeEcc4CC98EFb6fB59B655cc65565E77',
  GOVERNANCE: '0xc8F6fF01fd1D981e627a8102fc334D360Af7384b',
  LENDING: '0x58C125A48AE01B40800F1fe58C1Fc1208B12Fd20',
  STAKING: '0xD7f9C58211d1e38f0ef0f2c802CB36525466EA1f',
} as const

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 50312,
  name: 'Somnia Testnet',
  rpcUrl: 'https://testnet-rpc.somnia.network',
  explorer: 'https://testnet-explorer.somnia.network',
  nativeCurrency: {
    name: 'Somnia',
    symbol: 'SOM',
    decimals: 18,
  },
} as const

// AMM configuration
export const AMM_CONFIG = {
  defaultSlippage: 0.5, // 0.5%
  maxSlippage: 50, // 50%
  minSlippage: 0.1, // 0.1%
  gasLimit: 500000,
} as const 