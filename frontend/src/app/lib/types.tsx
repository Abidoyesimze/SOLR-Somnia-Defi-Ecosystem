// Legacy compatibility types (keeping for backward compatibility)
export interface SwapRoute {
  id: string
  tokenIn: string
  tokenOut: string
  amountIn: string
  amountOut: string
  priceImpact: number
  fee: number
  gasEstimate: number
  route: string[]
}

export interface VirtualObject {
  id: string
  name: string
  description: string
  assetType: string
  metadataUri: string
  owner: string
  status: 'active' | 'inactive' | 'suspended'
  createdAt: number
  updatedAt: number
  attributes: Record<string, string | number | boolean>
  tags: string[]
}

export interface VirtualExperience {
  id: string
  name: string
  description: string
  owner: string
  experienceType: string
  status: 'active' | 'under_development' | 'paused' | 'suspended'
  maxPlayers: number
  currentPlayers: number
  rating: number
  totalRatings: number
  createdAt: number
  updatedAt: number
  components: string[]
  tags: string[]
}

export interface Attestation {
  id: string
  attester: string
  subject: string
  data: string
  type: string
  status: 'active' | 'revoked' | 'expired'
  createdAt: number
  expiresAt?: number
  evidence: string[]
  confidence: number
}

export interface AssetRoute {
  id: string
  fromAsset: string
  toAsset: string
  fromMetaverse: string
  toMetaverse: string
  route: RouteStep[]
  totalFee: number
  estimatedTime: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: number
}

export interface RouteStep {
  id: string
  type: string
  from: string
  to: string
  protocol: string
  fee: number
  estimatedTime: number
  status: 'pending' | 'completed' | 'failed'
}

export interface Metaverse {
  id: string
  name: string
  description: string
  owner: string
  type: string
  status: 'active' | 'inactive' | 'maintenance'
  maxUsers: number
  currentUsers: number
  supportedAssets: string[]
  createdAt: number
  updatedAt: number
}

export interface CrossMetaverseTransfer {
  id: string
  user: string
  asset: string
  fromMetaverse: string
  toMetaverse: string
  amount: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: number
  completedAt?: number
  fee: number
  route: string[]
}

export interface BridgeRoute {
  id: string
  fromChain: string
  toChain: string
  asset: string
  amount: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: number
  completedAt?: number
  fee: number
  estimatedTime: number
}

export interface MarketplaceListing {
  id: string
  seller: string
  asset: string
  price: string
  currency: string
  listingType: 'fixed' | 'auction' | 'bundle'
  status: 'active' | 'sold' | 'cancelled' | 'expired'
  createdAt: number
  expiresAt?: number
  bids: Bid[]
  metadata: Record<string, string | number | boolean>
}

export interface Bid {
  id: string
  bidder: string
  amount: string
  timestamp: number
  status: 'active' | 'accepted' | 'rejected' | 'withdrawn'
}

export interface UserActivity {
  id: string
  user: string
  action: string
  target: string
  timestamp: number
  metadata: Record<string, string | number | boolean>
}