export const TOKENS = {
    'WSOM': {
      address: '0x1234567890123456789012345678901234567890',
      symbol: 'WSOM',
      name: 'Wrapped Somnia',
      decimals: 18,
      logoUrl: '/tokens/wsom.png',
      price: 1.85,
      color: 'from-orange-400 to-orange-600'
    },
    'USDC': {
      address: '0x2345678901234567890123456789012345678901',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      logoUrl: '/tokens/usdc.png',
      price: 1.00,
      color: 'from-blue-400 to-blue-600'
    },
    'WETH': {
      address: '0x3456789012345678901234567890123456789012',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      logoUrl: '/tokens/weth.png',
      price: 3420.50,
      color: 'from-gray-400 to-gray-600'
    },
    'DAI': {
      address: '0x4567890123456789012345678901234567890123',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      logoUrl: '/tokens/dai.png',
      price: 0.999,
      color: 'from-yellow-400 to-yellow-600'
    }
  } as const
  
  export const CONTRACTS = {
    ROUTER: '0x5678901234567890123456789012345678901234',
    INDEXER: '0x6789012345678901234567890123456789012345',
    REVENUE_DISTRIBUTOR: '0x7890123456789901234567890123456789012346'
  } as const
  
  export const PROTOCOLS = [
    {
      name: 'UniswapV2',
      type: 'AMM',
      tvl: 2400000,
      volume24h: 150000,
      pools: 12,
      icon: 'U',
      color: 'bg-pink-600'
    },
    {
      name: 'SushiSwap',
      type: 'AMM',
      tvl: 1800000,
      volume24h: 98000,
      pools: 8,
      icon: 'S',
      color: 'bg-blue-600'
    },
    {
      name: 'Curve',
      type: 'Stable AMM',
      tvl: 3200000,
      volume24h: 210000,
      pools: 6,
      icon: 'C',
      color: 'bg-yellow-600'
    },
    {
      name: 'Balancer',
      type: 'Weighted AMM',
      tvl: 1500000,
      volume24h: 75000,
      pools: 10,
      icon: 'B',
      color: 'bg-purple-600'
    }
  ] as const
  