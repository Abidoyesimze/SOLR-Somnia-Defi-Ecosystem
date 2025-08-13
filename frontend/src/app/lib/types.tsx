export interface Token {
    address: string
    symbol: string
    name: string
    decimals: number
    logoUrl: string
    price: number
    color: string
  }
  
  export interface SwapRoute {
    path: string[]
    pools: string[]
    inputAmount: string
    outputAmount: string
    priceImpact: number
    fees: string
    gasEstimate: string
    savings: string
    savingsPercentage: number
  }
  
  export interface Protocol {
    name: string
    type: string
    tvl: number
    volume24h: number
    pools: number
    icon: string
    color: string
  }
  
  export interface SwapState {
    fromToken: string
    toToken: string
    fromAmount: string
    toAmount: string
    slippage: number
    route: SwapRoute | null
    isLoading: boolean
    isSwapping: boolean
  }