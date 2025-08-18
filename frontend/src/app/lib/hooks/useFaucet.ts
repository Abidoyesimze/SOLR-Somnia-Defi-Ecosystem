import { useState, useCallback, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { TestTokenFaucetContract } from '../../../abi'
import { toast } from 'react-hot-toast'

// Helper function to safely handle BigInt values
const safeBigIntToString = (value: any): string => {
  if (typeof value === 'bigint') {
    return value.toString()
  }
  if (Array.isArray(value)) {
    return value.map(safeBigIntToString).join(', ')
  }
  if (value && typeof value === 'object') {
    const result: any = {}
    for (const key in value) {
      result[key] = safeBigIntToString(value[key])
    }
    return result
  }
  return String(value)
}

export function useFaucet() {
  const { address, isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastClaimTime, setLastClaimTime] = useState<number | null>(null)
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState<number>(0)

  // Debug logging
  console.log('🔍 useFaucet Debug:', {
    address,
    isConnected,
    faucetAddress: TestTokenFaucetContract.address,
    faucetABI: TestTokenFaucetContract.abi ? '✅ Loaded' : '❌ Missing'
  })

  // Check if user can claim (24-hour cooldown)
  const { data: canClaim, refetch: refetchCanClaim, error: canClaimError } = useReadContract({
    address: TestTokenFaucetContract.address as `0x${string}`,
    abi: TestTokenFaucetContract.abi,
    functionName: 'canClaim',
    args: [address as `0x${string}`],
    query: { 
      enabled: !!address && isConnected,
      refetchInterval: 30000 // Refetch every 30 seconds
    }
  })

  // Get user's last claim time
  const { data: claimStatus, refetch: refetchClaimStatus, error: claimStatusError } = useReadContract({
    address: TestTokenFaucetContract.address as `0x${string}`,
    abi: TestTokenFaucetContract.abi,
    functionName: 'getTimeUntilNextClaim',
    args: [address as `0x${string}`],
    query: { 
      enabled: !!address && isConnected,
      refetchInterval: 30000 // Refetch every 30 seconds
    }
  })

  // Update time tracking when claim status changes
  useEffect(() => {
    if (claimStatus !== undefined) {
      const timeRemaining = Number(claimStatus)
      setTimeUntilNextClaim(timeRemaining)
      
      if (timeRemaining === 0) {
        setLastClaimTime(null) // Can claim now
      } else {
        // Calculate last claim time from cooldown
        const now = Math.floor(Date.now() / 1000)
        const cooldownPeriod = 24 * 60 * 60 // 24 hours in seconds
        const lastClaim = now - (cooldownPeriod - timeRemaining)
        setLastClaimTime(lastClaim)
      }
    }
  }, [claimStatus])

  // Update countdown timer
  useEffect(() => {
    if (timeUntilNextClaim > 0) {
      const interval = setInterval(() => {
        setTimeUntilNextClaim(prev => {
          const newTime = Math.max(0, prev - 1)
          if (newTime === 0) {
            // Cooldown finished, refetch status
            refetchCanClaim()
            refetchClaimStatus()
          }
          return newTime
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [timeUntilNextClaim, refetchCanClaim, refetchClaimStatus])

  // Claim all tokens
  const { data: claimHash, writeContract: claimAll, isPending: isClaimPending } = useWriteContract()

  // Wait for claim transaction
  const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimHash,
  })

  // Claim specific token
  const { data: claimSpecificHash, writeContract: claimSpecific, isPending: isClaimSpecificPending } = useWriteContract()

  // Wait for specific claim transaction
  const { isLoading: isClaimSpecificConfirming, isSuccess: isClaimSpecificSuccess } = useWaitForTransactionReceipt({
    hash: claimSpecificHash,
  })

  // Combined loading state
  const isLoadingState = isLoading || isClaimPending || isClaimConfirming || isClaimSpecificPending || isClaimSpecificConfirming

  // Combined success state
  const isClaimSuccessState = isClaimSuccess || isClaimSpecificSuccess

  // Claim all tokens function
  const claimTokens = useCallback(async () => {
    if (!isConnected || !address) {
      throw new Error('Please connect your wallet first')
    }

    try {
      setIsLoading(true)
      setError(null)
      
      claimAll({
        address: TestTokenFaucetContract.address as `0x${string}`,
        abi: TestTokenFaucetContract.abi,
        functionName: 'claimTokens'
      })
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to claim tokens'
      setError(errorMsg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, address, claimAll])

  // Claim specific token function
  const claimSpecificToken = useCallback(async (token: 'WSOM' | 'USDC' | 'SOMG') => {
    if (!isConnected || !address) {
      throw new Error('Please connect your wallet first')
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const functionName = `claim${token}` as 'claimWSOM' | 'claimUSDC' | 'claimSOMG'
      
      claimSpecific({
        address: TestTokenFaucetContract.address as `0x${string}`,
        abi: TestTokenFaucetContract.abi,
        functionName
      })
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : `Failed to claim ${token}`
      setError(errorMsg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, address, claimSpecific])

  // Handle successful claims
  useEffect(() => {
    if (isClaimSuccessState) {
      // Refetch user status after successful claim
      refetchCanClaim()
      refetchClaimStatus()
      
      // Reset error state
      setError(null)
    }
  }, [isClaimSuccessState, refetchCanClaim, refetchClaimStatus])

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error)
      setError(null)
    }
  }, [error])

  // Debug logging for contract calls
  console.log('🔍 Contract Call Results:', {
    canClaim: canClaim ? safeBigIntToString(canClaim) : undefined,
    canClaimError: canClaimError ? safeBigIntToString(canClaimError) : null,
    claimStatus: claimStatus ? safeBigIntToString(claimStatus) : null,
    claimStatusError: claimStatusError ? safeBigIntToString(claimStatusError) : null
  })

  return {
    // State
    isLoading: isLoadingState,
    isClaimSuccess: isClaimSuccessState,
    error,
    
    // Data
    canClaim: canClaim ? Boolean(canClaim) : undefined,
    claimStatus: claimStatus ? safeBigIntToString(claimStatus) : undefined,
    lastClaimTime,
    timeUntilNextClaim,
    
    // Functions
    claimTokens,
    claimSpecificToken,
    
    // Utilities
    clearError: () => setError(null),
    refetchCanClaim,
    refetchClaimStatus
  }
} 