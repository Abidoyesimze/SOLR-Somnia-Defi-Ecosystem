// Somnia Blockchain Configuration
export const SOMNIA_CONFIG = {
  CHAIN_ID: 50312,
  RPC_URL: 'https://testnet-rpc.somnia.network',
  EXPLORER_URL: 'https://testnet-explorer.somnia.network',
  NATIVE_CURRENCY: 'SOM',
  NATIVE_DECIMALS: 18
}

// Virtual Asset Types for Metaverse Routing
export const VIRTUAL_OBJECT_TYPES = [
  'virtual-art',
  'gaming-item', 
  'virtual-land',
  'experience',
  'attestation',
  'component',
  'avatar',
  'virtual-property',
  'digital-collectible',
  'virtual-currency'
] as const

// Attestation Types for Asset Verification
export const ATTESTATION_TYPES = [
  'authenticity',
  'provenance',
  'quality',
  'ownership',
  'licensing',
  'compliance',
  'performance',
  'sustainability'
] as const

// Metaverse Destinations
export const METAVERSE_DESTINATIONS = [
  {
    id: 'art-gallery',
    name: 'Art Gallery Metaverse',
    icon: '🖼️',
    type: 'Creative Space',
    description: 'Digital art exhibitions and creative experiences'
  },
  {
    id: 'gaming-world',
    name: 'Gaming World',
    icon: '🎮',
    type: 'Interactive Gaming',
    description: 'Immersive gaming experiences and virtual worlds'
  },
  {
    id: 'social-hub',
    name: 'Social Hub',
    icon: '👥',
    type: 'Community Space',
    description: 'Social interactions and community building'
  },
  {
    id: 'commerce-mall',
    name: 'Commerce Mall',
    icon: '🛍️',
    type: 'Trading Hub',
    description: 'Virtual commerce and asset trading'
  },
  {
    id: 'education-center',
    name: 'Education Center',
    icon: '📚',
    type: 'Learning Space',
    description: 'Educational experiences and knowledge sharing'
  },
  {
    id: 'entertainment-zone',
    name: 'Entertainment Zone',
    icon: '🎭',
    type: 'Media Hub',
    description: 'Entertainment and media experiences'
  }
] as const

// Somnia Protocols (SOM0 & SOM1)
export const PROTOCOLS = [
  {
    name: 'SOM0',
    type: 'Asset Interoperability',
    description: 'Object Protocol, Attestation Protocol, Marketplace Protocol',
    features: [
      'Cross-application objects',
      'Authenticity verification', 
      'Global commerce',
      'Asset ownership management',
      'Interoperable marketplaces'
    ],
    icon: '🌐',
    color: 'bg-blue-600',
    status: 'active'
  },
  {
    name: 'SOM1',
    type: 'Virtual World Composition',
    description: 'Entity-Component-System for composable virtual worlds',
    features: [
      'Dynamic NFTs',
      'Autonomous objects',
      'Component registries',
      'Experience composition',
      'Virtual world building'
    ],
    icon: '🎮',
    color: 'bg-purple-600',
    status: 'active'
  }
] as const

// Smart Contract Addresses (To be populated after deployment)
export const CONTRACTS = {
  SOMNIA_ASSET_ROUTER: '0x...', // Main SOLR router
  SOMNIA_OBJECT_REGISTRY: '0x...', // SOM0 Object Protocol
  SOMNIA_ATTESTATION_REGISTRY: '0x...', // SOM0 Attestation Protocol
  SOMNIA_EXPERIENCE_REGISTRY: '0x...', // SOM1 Experience Protocol
  SOMNIA_MARKETPLACE_ADAPTER: '0x...', // Cross-application commerce
  SOMNIA_INTEROPERABILITY_BRIDGE: '0x...', // Cross-metaverse routing
  SOMNIA_ACCESS_CONTROL: '0x...', // Role-based permissions
  SOMNIA_FEE_MANAGER: '0x...', // Fee collection & distribution
  SOMNIA_EMERGENCY_CONTROLLER: '0x...' // Safety & recovery
} as const

// Virtual Asset Categories
export const ASSET_CATEGORIES = [
  {
    id: 'creative',
    name: 'Creative Assets',
    icon: '🎨',
    examples: ['Digital Art', 'Music', 'Videos', '3D Models']
  },
  {
    id: 'gaming',
    name: 'Gaming Assets',
    icon: '🎮',
    examples: ['Characters', 'Weapons', 'Vehicles', 'Maps']
  },
  {
    id: 'real-estate',
    name: 'Virtual Real Estate',
    icon: '🏠',
    examples: ['Land', 'Buildings', 'Stores', 'Venues']
  },
  {
    id: 'experiences',
    name: 'Virtual Experiences',
    icon: '🌟',
    examples: ['Events', 'Tours', 'Workshops', 'Performances']
  },
  {
    id: 'collectibles',
    name: 'Digital Collectibles',
    icon: '💎',
    examples: ['NFTs', 'Trading Cards', 'Memorabilia', 'Rare Items']
  }
] as const

// Routing Fee Structure
export const ROUTING_FEES = {
  STANDARD: 0.5, // 0.5% for standard asset routing
  PREMIUM: 1.0,  // 1.0% for premium services
  BRIDGE: 2.0,   // 2.0% for cross-chain bridging
  ATTESTATION: 0.25, // 0.25% for attestation services
  EXPERIENCE: 0.75   // 0.75% for experience composition
} as const

// Network Configuration
export const NETWORK_CONFIG = {
  MAINNET: {
    chainId: 1,
    name: 'Somnia Mainnet',
    rpcUrl: 'https://rpc.somnia.network',
    explorerUrl: 'https://explorer.somnia.network'
  },
  TESTNET: {
    chainId: 50312,
    name: 'Somnia Testnet',
    rpcUrl: 'https://testnet-rpc.somnia.network',
    explorerUrl: 'https://testnet-explorer.somnia.network'
  }
} as const

// Default Settings
export const DEFAULT_SETTINGS = {
  AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
  MAX_SLIPPAGE: 5.0, // 5%
  GAS_LIMIT_MULTIPLIER: 1.2,
  DEFAULT_TIMEOUT: 300000 // 5 minutes
} as const
  