import { create } from 'zustand'
import { SwapState, SwapRoute } from './types'

interface SolrStore extends SwapState {
  setFromToken: (token: string) => void
  setToToken: (token: string) => void
  setFromAmount: (amount: string) => void
  setToAmount: (amount: string) => void
  setSlippage: (slippage: number) => void
  setRoute: (route: SwapRoute | null) => void
  setLoading: (loading: boolean) => void
  setSwapping: (swapping: boolean) => void
  swapTokens: () => void
  resetSwap: () => void
}

export const useSolrStore = create<SolrStore>((set, get) => ({
  fromToken: 'WSOM',
  toToken: 'USDC',
  fromAmount: '',
  toAmount: '',
  slippage: 0.5,
  route: null,
  isLoading: false,
  isSwapping: false,
  
  setFromToken: (token) => set({ fromToken: token }),
  setToToken: (token) => set({ toToken: token }),
  setFromAmount: (amount) => set({ fromAmount: amount }),
  setToAmount: (amount) => set({ toAmount: amount }),
  setSlippage: (slippage) => set({ slippage }),
  setRoute: (route) => set({ route }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSwapping: (swapping) => set({ isSwapping: swapping }),
  
  swapTokens: () => {
    const { fromToken, toToken } = get()
    set({ 
      fromToken: toToken, 
      toToken: fromToken,
      fromAmount: '',
      toAmount: '',
      route: null
    })
  },
  
  resetSwap: () => set({
    fromAmount: '',
    toAmount: '',
    route: null,
    isLoading: false,
    isSwapping: false
  })
}))