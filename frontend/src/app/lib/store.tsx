import { create } from 'zustand'
import { SwapRoute } from './types'

// DeFi Application State
interface DeFiState {
  // Trading State
  fromToken: string
  toToken: string
  fromAmount: string
  toAmount: string
  slippage: number
  isSwapping: boolean
  
  // Lending State
  selectedLendingMarket: string
  supplyAmount: string
  borrowAmount: string
  isSupplying: boolean
  isBorrowing: boolean
  
  // Staking State
  selectedStakingPool: string
  stakeAmount: string
  selectedTier: number
  isStaking: boolean
  isUnstaking: boolean
  
  // Governance State
  selectedProposal: number | null
  voteAmount: string
  isVoting: boolean
  
  // General State
  loading: boolean
  error: string | null
  lastUpdate: Date | null
  
  // Actions
  setFromToken: (token: string) => void
  setToToken: (token: string) => void
  setFromAmount: (amount: string) => void
  setToAmount: (amount: string) => void
  setSlippage: (slippage: number) => void
  setSwapRoute: (route: SwapRoute | null) => void
  setIsSwapping: (swapping: boolean) => void
  
  setSelectedLendingMarket: (market: string) => void
  setSupplyAmount: (amount: string) => void
  setBorrowAmount: (amount: string) => void
  setIsSupplying: (supplying: boolean) => void
  setIsBorrowing: (borrowing: boolean) => void
  
  setSelectedStakingPool: (pool: string) => void
  setStakeAmount: (amount: string) => void
  setSelectedTier: (tier: number) => void
  setIsStaking: (staking: boolean) => void
  setIsUnstaking: (unstaking: boolean) => void
  
  setSelectedProposal: (proposal: number | null) => void
  setVoteAmount: (amount: string) => void
  setIsVoting: (voting: boolean) => void
  
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setLastUpdate: (date: Date) => void
  
  // Utility Actions
  swapTokens: () => void
  clearError: () => void
  resetState: () => void
}

export const useStore = create<DeFiState>((set, get) => ({
  // Initial state
  fromToken: 'SOM',
  toToken: 'SOMG',
  fromAmount: '',
  toAmount: '',
  slippage: 0.5,
  isSwapping: false,
  
  selectedLendingMarket: '',
  supplyAmount: '',
  borrowAmount: '',
  isSupplying: false,
  isBorrowing: false,
  
  selectedStakingPool: '',
  stakeAmount: '',
  selectedTier: 0,
  isStaking: false,
  isUnstaking: false,
  
  selectedProposal: null,
  voteAmount: '',
  isVoting: false,
  
  loading: false,
  error: null,
  lastUpdate: null,
  
  // Actions
  setFromToken: (token: string) => set({ fromToken: token }),
  setToToken: (token: string) => set({ toToken: token }),
  setFromAmount: (amount: string) => set({ fromAmount: amount }),
  setToAmount: (amount: string) => set({ toAmount: amount }),
  setSlippage: (slippage: number) => set({ slippage }),
  setSwapRoute: (route: SwapRoute | null) => set({ toAmount: route?.amountOut || '' }),
  setIsSwapping: (swapping: boolean) => set({ isSwapping: swapping }),
  
  setSelectedLendingMarket: (market: string) => set({ selectedLendingMarket: market }),
  setSupplyAmount: (amount: string) => set({ supplyAmount: amount }),
  setBorrowAmount: (amount: string) => set({ borrowAmount: amount }),
  setIsSupplying: (supplying: boolean) => set({ isSupplying: supplying }),
  setIsBorrowing: (borrowing: boolean) => set({ isBorrowing: borrowing }),
  
  setSelectedStakingPool: (pool: string) => set({ selectedStakingPool: pool }),
  setStakeAmount: (amount: string) => set({ stakeAmount: amount }),
  setSelectedTier: (tier: number) => set({ selectedTier: tier }),
  setIsStaking: (staking: boolean) => set({ isStaking: staking }),
  setIsUnstaking: (unstaking: boolean) => set({ isUnstaking: unstaking }),
  
  setSelectedProposal: (proposal: number | null) => set({ selectedProposal: proposal }),
  setVoteAmount: (amount: string) => set({ voteAmount: amount }),
  setIsVoting: (voting: boolean) => set({ isVoting: voting }),
  
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  setLastUpdate: (date: Date) => set({ lastUpdate: date }),
  
  // Utility actions
  swapTokens: () => {
    const { fromToken, toToken, fromAmount, toAmount } = get()
    set({
      fromToken: toToken,
      toToken: fromToken,
      fromAmount: toAmount,
      toAmount: fromAmount
    })
  },
  
  clearError: () => set({ error: null }),
  
  resetState: () => set({
    fromToken: 'SOM',
    toToken: 'SOMG',
    fromAmount: '',
    toAmount: '',
    slippage: 0.5,
    isSwapping: false,
    selectedLendingMarket: '',
    supplyAmount: '',
    borrowAmount: '',
    isSupplying: false,
    isBorrowing: false,
    selectedStakingPool: '',
    stakeAmount: '',
    selectedTier: 0,
    isStaking: false,
    isUnstaking: false,
    selectedProposal: null,
    voteAmount: '',
    isVoting: false,
    loading: false,
    error: null,
    lastUpdate: null
  })
}))

// Legacy compatibility exports
export const useSwapStore = useStore
export const useDeFiStore = useStore