import { useState, useCallback } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { SomniaAmmContract } from '../../../abi'
import { parseUnits, formatUnits } from 'viem'
import { toast } from 'react-hot-toast'

export function useAMM() {
  const { address, isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get amount out for a swap
  const { data: amountOut, refetch: refetchAmountOut } = useReadContract({
    address: SomniaAmmContract.address as `0x${string}`,
    abi: SomniaAmmContract.abi,
    functionName: 'getAmountOut',
    query: { enabled: false }
  })

  // Get pool info
  const { data: poolInfo, refetch: refetchPoolInfo } = useReadContract({
    address: SomniaAmmContract.address as `0x${string}`,
    abi: SomniaAmmContract.abi,
    functionName: 'getPoolInfo',
    query: { enabled: false }
  })

  // Get trading fee
  const { data: tradingFee } = useReadContract({
    address: SomniaAmmContract.address as `0x${string}`,
    abi: SomniaAmmContract.abi,
    functionName: 'TRADING_FEE'
  })

  // Swap function
  const { data: swapHash, writeContract: swap, isPending: isSwapPending } = useWriteContract()

  // Wait for swap transaction
  const { isLoading: isSwapConfirming, isSuccess: isSwapSuccess } = useWaitForTransactionReceipt({
    hash: swapHash,
  })

  // Calculate swap amount
  const calculateSwap = useCallback(async (
    amountIn: string,
    tokenIn: string,
    tokenOut: string
  ) => {
    if (!amountIn || !tokenIn || !tokenOut) return null
    
    try {
      setIsLoading(true)
      setError(null)
      
      // Convert amount to wei
      const amountInWei = parseUnits(amountIn, 18)
      
      // For now, use a mock calculation since we need to deploy tokens first
      // In production, you'd call getAmountOut on the AMM contract
      const mockRate = 0.85 // Mock exchange rate
      const calculatedAmount = parseFloat(amountIn) * mockRate
      const amountOutFormatted = calculatedAmount.toFixed(6)
      
      // Calculate price impact
      const inputValue = parseFloat(amountIn)
      const outputValue = parseFloat(amountOutFormatted)
      const priceImpact = ((inputValue - outputValue) / inputValue) * 100
      
      return {
        amountOut: amountOutFormatted,
        priceImpact: Math.abs(priceImpact)
      }
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to calculate swap'
      setError(errorMsg)
      toast.error(errorMsg)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Execute swap
  const executeSwap = useCallback(async (
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    amountOutMin: string
  ) => {
    if (!isConnected || !address) {
      const errorMsg = 'Please connect your wallet'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const amountInWei = parseUnits(amountIn, 18)
      const amountOutMinWei = parseUnits(amountOutMin, 18)
      
      // Execute swap
      swap({
        address: SomniaAmmContract.address as `0x${string}`,
        abi: SomniaAmmContract.abi,
        functionName: 'swap',
        args: [tokenIn as `0x${string}`, tokenOut as `0x${string}`, amountInWei, amountOutMinWei]
      })
      
      toast.success('Swap transaction submitted!')
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Swap failed'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, address, swap])

  // Get pool information
  const getPoolInfo = useCallback(async (token0: string, token1: string) => {
    try {
      // Mock pool info for now
      // In production, you'd call the actual contract
      return {
        token0,
        token1,
        reserve0: '1000000000000000000000', // 1000 tokens
        reserve1: '1000000000000000000000', // 1000 tokens
        totalSupply: '1000000000000000000000' // 1000 LP tokens
      }
    } catch (err) {
      console.error('Failed to get pool info:', err)
      return null
    }
  }, [])

  // Check if token is whitelisted
  const { data: isTokenWhitelisted, refetch: refetchWhitelist } = useReadContract({
    address: SomniaAmmContract.address as `0x${string}`,
    abi: SomniaAmmContract.abi,
    functionName: 'whitelistedTokens',
    query: { enabled: false }
  })

  const checkTokenWhitelist = useCallback(async (tokenAddress: string) => {
    try {
      // Mock whitelist check for now
      // In production, you'd call the actual contract
      return true // Assume all tokens are whitelisted for now
    } catch (err) {
      console.error('Failed to check token whitelist:', err)
      return false
    }
  }, [])

  return {
    // State
    isLoading: isLoading || isSwapPending || isSwapConfirming,
    isSwapPending,
    isSwapConfirming,
    isSwapSuccess,
    error,
    
    // Functions
    calculateSwap,
    executeSwap,
    getPoolInfo,
    checkTokenWhitelist,
    
    // Data
    amountOut,
    poolInfo,
    tradingFee,
    isTokenWhitelisted,
    
    // Utilities
    clearError: () => setError(null)
  }
} 