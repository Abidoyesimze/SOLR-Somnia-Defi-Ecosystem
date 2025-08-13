import { create } from 'zustand'

// Updated store for metaverse asset routing
interface MetaverseRoutingState {
  // Asset selection
  fromAsset: string
  toAsset: string
  fromMetaverse: string
  toMetaverse: string
  
  // Amount and routing
  assetAmount: string
  route: AssetRoute | null
  loading: boolean
  routing: boolean
  
  // Destination selection
  selectedDestination: string
  
  // Settings
  autoRefresh: boolean
  lastRefresh: Date | null
  
  // Actions
  setFromAsset: (asset: string) => void
  setToAsset: (asset: string) => void
  setFromMetaverse: (metaverse: string) => void
  setToMetaverse: (metaverse: string) => void
  setAssetAmount: (amount: string) => void
  setRoute: (route: AssetRoute | null) => void
  setLoading: (loading: boolean) => void
  setRouting: (routing: boolean) => void
  setSelectedDestination: (destination: string) => void
  setAutoRefresh: (autoRefresh: boolean) => void
  setLastRefresh: (date: Date | null) => void
  
  // Utility actions
  swapAssets: () => void
  clearRoute: () => void
  resetState: () => void
}

// Asset Route interface (simplified for store)
interface AssetRoute {
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

interface RouteStep {
  step: number
  from: string
  to: string
  protocol: string
}

export const useStore = create<MetaverseRoutingState>((set, get) => ({
  // Initial state
  fromAsset: '',
  toAsset: '',
  fromMetaverse: '',
  toMetaverse: '',
  assetAmount: '',
  route: null,
  loading: false,
  routing: false,
  selectedDestination: '',
  autoRefresh: true,
  lastRefresh: null,

  // Actions
  setFromAsset: (asset: string) => set({ fromAsset: asset }),
  setToAsset: (asset: string) => set({ toAsset: asset }),
  setFromMetaverse: (metaverse: string) => set({ fromMetaverse: metaverse }),
  setToMetaverse: (metaverse: string) => set({ toMetaverse: metaverse }),
  setAssetAmount: (amount: string) => set({ assetAmount: amount }),
  setRoute: (route: AssetRoute | null) => set({ route }),
  setLoading: (loading: boolean) => set({ loading }),
  setRouting: (routing: boolean) => set({ routing }),
  setSelectedDestination: (destination: string) => set({ selectedDestination: destination }),
  setAutoRefresh: (autoRefresh: boolean) => set({ autoRefresh }),
  setLastRefresh: (date: Date | null) => set({ lastRefresh: date }),

  // Utility actions
  swapAssets: () => {
    const { fromAsset, toAsset, fromMetaverse, toMetaverse } = get()
    set({
      fromAsset: toAsset,
      toAsset: fromAsset,
      fromMetaverse: toMetaverse,
      toMetaverse: fromMetaverse
    })
  },

  clearRoute: () => set({ route: null }),

  resetState: () => set({
    fromAsset: '',
    toAsset: '',
    fromMetaverse: '',
    toMetaverse: '',
    assetAmount: '',
    route: null,
    loading: false,
    routing: false,
    selectedDestination: '',
    lastRefresh: null
  })
}))

// Legacy compatibility exports (for existing components)
export const useSwapStore = useStore
export const useMetaverseStore = useStore