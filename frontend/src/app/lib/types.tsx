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

  // New Somnia-specific types
  export interface VirtualObject {
    objectAddress: string
    objectId: string
    metadataUri: string
    creator: string
    currentOwner: string
    objectType: string
    isActive: boolean
    createdAt: number
    lastUpdated: number
  }

  export interface VirtualExperience {
    experienceAddress: string
    experienceId: string
    name: string
    description: string
    owner: string
    supportedObjectTypes: string[]
    isActive: boolean
    createdAt: number
  }

  export interface AssetRoute {
    object: VirtualObject
    path: VirtualExperience[]
    estimatedCost: number
    estimatedTime: number
    isDirect: boolean
  }

  export interface Attestation {
    attester: string
    subject: string
    attestationType: string
    value: string
    validUntil: number
    isValid: boolean
  }

  export interface SomniaProtocol {
    name: string
    type: string
    description: string
    features: string[]
    icon: string
    color: string
    status: string
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