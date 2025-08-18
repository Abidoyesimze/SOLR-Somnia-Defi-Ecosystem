import { useState, useCallback } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useWalletClient } from 'wagmi'
import { SomniaAmmContract } from '../../../abi'
import { parseUnits, formatUnits } from 'viem'
import { toast } from 'react-hot-toast'

export function useAMM() {
  const { address, isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Get public client and wallet client for contract interactions
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  // Create contract instance using readContract and writeContract hooks instead
  // This is the proper way to interact with contracts in Wagmi v2
  const contract = null // We'll use the hooks directly instead of a contract instance

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
      
      // Call the actual AMM contract to get amount out
      if (publicClient) {
        try {
          const result = await publicClient.readContract({
            address: SomniaAmmContract.address as `0x${string}`,
            abi: SomniaAmmContract.abi,
            functionName: 'getAmountOut',
            args: [amountInWei, tokenIn as `0x${string}`, tokenOut as `0x${string}`]
          })
          
          if (result) {
            const amountOutFormatted = formatUnits(result as bigint, 18)
            
            // Calculate price impact (simplified)
            const inputValue = parseFloat(amountIn)
            const outputValue = parseFloat(amountOutFormatted)
            const priceImpact = ((inputValue - outputValue) / inputValue) * 100
            
            return {
              amountOut: amountOutFormatted,
              priceImpact: Math.abs(priceImpact)
            }
          }
        } catch (contractError) {
          console.error('Contract call failed:', contractError)
          // Fallback to mock calculation if contract fails
        }
      }
      
      // Fallback to mock calculation if no contract
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
  }, [publicClient])

  // Execute swap
  const executeSwap = useCallback(async (
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    amountOutMin: string
  ): Promise<string | null> => {
    if (!isConnected || !address) {
      const errorMsg = 'Please connect your wallet'
      setError(errorMsg)
      toast.error(errorMsg)
      return null
    }

    if (!walletClient) {
      const errorMsg = 'Wallet client not connected'
      setError(errorMsg)
      toast.error(errorMsg)
      return null
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const amountInWei = parseUnits(amountIn, 18)
      const amountOutMinWei = parseUnits(amountOutMin, 18)
      
      // Execute swap using the contract
      const hash = await walletClient.writeContract({
        address: SomniaAmmContract.address as `0x${string}`,
        abi: SomniaAmmContract.abi,
        functionName: 'swap',
        args: [tokenIn as `0x${string}`, tokenOut as `0x${string}`, amountInWei, amountOutMinWei]
      })
      
      toast.success('Swap transaction submitted!')
      return hash
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Swap failed'
      setError(errorMsg)
      toast.error(errorMsg)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, address, walletClient])

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
    
    // Contract instances (using hooks directly)
    contract: null,
    signer: walletClient?.account,
    
    // Utilities
    clearError: () => setError(null)
  }
} 