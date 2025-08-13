// Core Virtual Asset Types
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
  attributes: Record<string, any>
  tags: string[]
}

export interface VirtualExperience {
  id: string
  name: string
  description: string
  experienceType: string
  components: string[]
  supportedAssetTypes: string[]
  creator: string
  status: 'active' | 'inactive' | 'draft'
  createdAt: number
  updatedAt: number
  metadata: Record<string, any>
}

export interface Attestation {
  id: string
  objectId: string
  attestationType: string
  value: string
  attester: string
  validUntil: number
  status: 'active' | 'expired' | 'revoked'
  createdAt: number
  metadata: Record<string, any>
}

// Asset Routing Types
export interface AssetRoute {
  id: string
  fromAsset: string
  toAsset: string
  fromMetaverse: string
  toMetaverse: string
  routePath: RouteStep[]
  estimatedOutput: string
  routingFee: string
  gasEstimate: string
  estimatedTime: string
  successRate: string
  savings: string
  status: 'pending' | 'executing' | 'completed' | 'failed'
  createdAt: number
}

export interface RouteStep {
  step: number
  from: string
  to: string
  protocol: string
  estimatedGas: string
  estimatedTime: string
}

// Metaverse Types
export interface Metaverse {
  id: string
  name: string
  description: string
  type: string
  icon: string
  status: 'active' | 'inactive' | 'maintenance'
  supportedAssetTypes: string[]
  protocols: string[]
  metadata: Record<string, any>
}

export interface CrossMetaverseTransfer {
  id: string
  assetId: string
  fromMetaverse: string
  toMetaverse: string
  bridgeRoute: BridgeRoute
  status: 'pending' | 'bridging' | 'completed' | 'failed'
  createdAt: number
  completedAt?: number
}

export interface BridgeRoute {
  id: string
  fromChain: string
  toChain: string
  bridgeProtocol: string
  estimatedTime: string
  fee: string
  gasEstimate: string
}

// Marketplace Types
export interface MarketplaceListing {
  id: string
  assetId: string
  seller: string
  price: string
  currency: string
  listingType: 'fixed' | 'auction'
  status: 'active' | 'sold' | 'cancelled' | 'expired'
  createdAt: number
  expiresAt?: number
  metadata: Record<string, any>
}

export interface Auction {
  id: string
  listingId: string
  startingPrice: string
  currentPrice: string
  highestBidder: string
  endTime: number
  status: 'active' | 'ended' | 'cancelled'
  bids: Bid[]
}

export interface Bid {
  id: string
  auctionId: string
  bidder: string
  amount: string
  timestamp: number
}

// Protocol Types
export interface SomniaProtocol {
  name: string
  type: string
  description: string
  features: string[]
  icon: string
  color: string
  status: 'active' | 'inactive' | 'beta'
  version: string
  contracts: string[]
}

// User and Permission Types
export interface UserProfile {
  address: string
  username?: string
  avatar?: string
  ownedAssets: string[]
  createdExperiences: string[]
  attestations: string[]
  reputation: number
  joinedAt: number
  metadata: Record<string, any>
}

export interface Permission {
  resource: string
  action: string
  grantedTo: string
  grantedBy: string
  grantedAt: number
  expiresAt?: number
  metadata: Record<string, any>
}

// Fee and Economic Types
export interface FeeStructure {
  routingFee: number
  bridgeFee: number
  attestationFee: number
  marketplaceFee: number
  gasMultiplier: number
}

export interface RevenueShare {
  id: string
  recipient: string
  percentage: number
  totalEarned: string
  lastPayout: number
  nextPayout: number
  status: 'active' | 'paused' | 'terminated'
}

// Emergency and Safety Types
export interface EmergencyAction {
  id: string
  type: 'pause' | 'freeze' | 'withdraw' | 'upgrade'
  target: string
  executedBy: string
  executedAt: number
  reason: string
  status: 'pending' | 'executed' | 'reverted'
}

export interface RecoveryPlan {
  id: string
  name: string
  description: string
  steps: RecoveryStep[]
  estimatedTime: string
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  createdAt: number
}

export interface RecoveryStep {
  step: number
  action: string
  description: string
  estimatedTime: string
  dependencies: string[]
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
}

// Analytics and Metrics Types
export interface MetaverseMetrics {
  metaverseId: string
  totalAssets: number
  totalTransfers: number
  activeUsers: number
  dailyVolume: string
  weeklyGrowth: number
  monthlyGrowth: number
  topAssetTypes: AssetTypeMetric[]
  topRoutes: RouteMetric[]
}

export interface AssetTypeMetric {
  assetType: string
  count: number
  volume: string
  growth: number
}

export interface RouteMetric {
  fromMetaverse: string
  toMetaverse: string
  transferCount: number
  volume: string
  averageFee: string
}

// Notification and Event Types
export interface Notification {
  id: string
  userId: string
  type: 'transfer' | 'attestation' | 'marketplace' | 'emergency' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: number
  metadata: Record<string, any>
}

export interface SystemEvent {
  id: string
  type: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  message: string
  timestamp: number
  metadata: Record<string, any>
}

// Legacy Types (for backward compatibility)
export interface SwapRoute {
  from: string
  to: string
  amount: string
  estimatedOutput: string
  routingFee: string
  gasEstimate: string
  routePath: RouteStep[]
  estimatedTime: string
  successRate: string
  savings: string
}

// Utility Types
export type AssetType = typeof import('./constants').VIRTUAL_OBJECT_TYPES[number]
export type AttestationType = typeof import('./constants').ATTESTATION_TYPES[number]
export type MetaverseDestination = typeof import('./constants').METAVERSE_DESTINATIONS[number]
export type Protocol = typeof import('./constants').PROTOCOLS[number]
export type AssetCategory = typeof import('./constants').ASSET_CATEGORIES[number]