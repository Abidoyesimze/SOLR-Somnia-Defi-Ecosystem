import { useState, useCallback } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { TestTokenFaucetContract } from '../../../abi'
import { toast } from 'react-hot-toast'

export function useFaucet() {
  const { address, isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if user can claim
  const { data: canClaim, refetch: refetchCanClaim } = useReadContract({
    address: TestTokenFaucetContract.address as `0x${string}`,
    abi: TestTokenFaucetContract.abi,
    functionName: 'canClaim',
    args: [address as `0x${string}`],
    query: { enabled: !!address }
  })

  // Get user claim status
  const { data: claimStatus, refetch: refetchClaimStatus } = useReadContract({
    address: TestTokenFaucetContract.address as `0x${string}`,
    abi: TestTokenFaucetContract.abi,
    functionName: 'getUserClaimStatus',
    args: [address as `0x${string}`],
    query: { enabled: !!address }
  })

  // Claim all tokens
  const { data: claimHash, writeContract: claimTokens } = useWriteContract()

  // Wait for claim transaction
  const { isLoading: isClaimPending, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimHash,
  })

  // Claim specific token functions
  const { writeContract: claimSOM } = useWriteContract()
  const { writeContract: claimUSDC } = useWriteContract()
  const { writeContract: claimSOMG } = useWriteContract()

  // Main claim function
  const handleClaimAll = useCallback(async () => {
    if (!isConnected || !address) {
      const errorMsg = 'Please connect your wallet'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      claimTokens({
        address: TestTokenFaucetContract.address as `0x${string}`,
        abi: TestTokenFaucetContract.abi,
        functionName: 'claimTokens',
      })

      toast.success('Claiming tokens...')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to claim tokens'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, address, claimTokens])

  // Claim specific token
  const handleClaimSpecific = useCallback(async (tokenType: 'SOM' | 'USDC' | 'SOMG') => {
    if (!isConnected || !address) {
      const errorMsg = 'Please connect your wallet'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const functionName = `claim${tokenType}` as const
      const writeContract = tokenType === 'SOM' ? claimSOM : tokenType === 'USDC' ? claimUSDC : claimSOMG

      writeContract({
        address: TestTokenFaucetContract.address as `0x${string}`,
        abi: TestTokenFaucetContract.abi,
        functionName,
      })

      toast.success(`Claiming ${tokenType}...`)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : `Failed to claim ${tokenType}`
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, address, claimSOM, claimUSDC, claimSOMG])

  // Format time until next claim
  const formatTimeUntilNextClaim = useCallback((seconds: number): string => {
    if (seconds === 0) return 'Ready to claim'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`
    }
    return `${minutes}m remaining`
  }, [])

  // Get faucet amounts
  const faucetAmounts = {
    SOM: '1000',
    USDC: '1000',
    SOMG: '100'
  }

  return {
    // State
    isLoading: isLoading || isClaimPending,
    isClaimPending,
    isClaimSuccess,
    error,
    
    // Data
    canClaim: canClaim || false,
    claimStatus,
    faucetAmounts,
    
    // Functions
    handleClaimAll,
    handleClaimSpecific,
    refetchCanClaim,
    refetchClaimStatus,
    
    // Utilities
    formatTimeUntilNextClaim,
    clearError: () => setError(null)
  }
} 