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
  'STT': {
    address: '0x2345678901234567890123456789012345678901',
    symbol: 'STT',
    name: 'Somnia Test Token',
    decimals: 18,
    logoUrl: '/tokens/stt.png',
    price: 0.01,
    color: 'from-blue-400 to-blue-600'
  }
} as const

export const CONTRACTS = {
  SOMNIA_ASSET_ROUTER: '0x7890123456789901234567890123456789012346',
  LIQUIDITY_INDEXER: '0x8901234567890123456789012345678901234567',
  SOLR_ROUTER: '0x9012345678901234567890123456789012345678'
} as const

export const PROTOCOLS = [
  {
    name: 'SOM0',
    type: 'Asset Interoperability',
    description: 'Object Protocol, Attestation Protocol, Marketplace Protocol',
    features: ['Cross-application objects', 'Authenticity verification', 'Global commerce'],
    icon: '🌐',
    color: 'bg-blue-600',
    status: 'active'
  },
  {
    name: 'SOM1',
    type: 'Virtual World Composition',
    description: 'Entity-Component-System for composable virtual worlds',
    features: ['Dynamic NFTs', 'Autonomous objects', 'Component registries'],
    icon: '🎮',
    color: 'bg-purple-600',
    status: 'active'
  }
] as const

export const VIRTUAL_OBJECT_TYPES = [
  'nft',
  'wearable',
  'gadget', 
  'experience',
  'avatar',
  'building',
  'vehicle',
  'weapon',
  'tool',
  'decoration'
] as const

export const ATTESTATION_TYPES = [
  'authenticity',
  'age_verification',
  'moderation',
  'quality',
  'rarity',
  'compatibility',
  'ownership',
  'licensing'
] as const
  