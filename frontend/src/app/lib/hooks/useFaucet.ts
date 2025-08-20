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
  const { address, isConnected, status } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastClaimTime, setLastClaimTime] = useState<number | null>(null)
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState<number>(0)
  
  // Manual wallet connection check as fallback
  const [manualWalletState, setManualWalletState] = useState({
    address: '',
    isConnected: false
  })

  // Check manual wallet connection
  useEffect(() => {
    const checkManualWallet = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            setManualWalletState({
              address: accounts[0],
              isConnected: true
            })
          } else {
            setManualWalletState({
              address: '',
              isConnected: false
            })
          }
        } catch (error) {
          console.error('Manual wallet check failed:', error)
        }
      }
    }

    checkManualWallet()

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setManualWalletState({
            address: accounts[0],
            isConnected: true
          })
        } else {
          setManualWalletState({
            address: '',
            isConnected: false
          })
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

  // Use manual wallet state if Wagmi is not working
  const effectiveAddress = address || manualWalletState.address
  const effectiveIsConnected = isConnected || manualWalletState.isConnected

  // Debug logging
  console.log('🔍 useFaucet Debug:', {
    wagmiAddress: address,
    wagmiIsConnected: isConnected,
    wagmiStatus: status,
    manualAddress: manualWalletState.address,
    manualIsConnected: manualWalletState.isConnected,
    effectiveAddress,
    effectiveIsConnected,
    faucetAddress: TestTokenFaucetContract.address,
    faucetABI: TestTokenFaucetContract.abi ? '✅ Loaded' : '❌ Missing'
  })

  // Check if user can claim (24-hour cooldown)
  const { data: canClaim, refetch: refetchCanClaim, error: canClaimError } = useReadContract({
    address: TestTokenFaucetContract.address as `0x${string}`,
    abi: TestTokenFaucetContract.abi,
    functionName: 'canClaim',
    args: [effectiveAddress as `0x${string}`],
    query: { 
      enabled: !!effectiveAddress && effectiveIsConnected,
      refetchInterval: 30000 // Refetch every 30 seconds
    }
  })

  // Get user's last claim time
  const { data: claimStatus, refetch: refetchClaimStatus, error: claimStatusError } = useReadContract({
    address: TestTokenFaucetContract.address as `0x${string}`,
    abi: TestTokenFaucetContract.abi,
    functionName: 'getTimeUntilNextClaim',
    args: [effectiveAddress as `0x${string}`],
    query: { 
      enabled: !!effectiveAddress && effectiveIsConnected,
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
    if (!effectiveIsConnected || !effectiveAddress) {
      throw new Error('Please connect your wallet first')
    }

    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔍 Claiming all tokens with:', {
        address: TestTokenFaucetContract.address,
        functionName: 'claimTokens',
        userAddress: effectiveAddress
      })
      
      claimAll({
        address: TestTokenFaucetContract.address as `0x${string}`,
        abi: TestTokenFaucetContract.abi,
        functionName: 'claimTokens'
      })
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to claim tokens'
      console.error('❌ Claim all tokens failed:', err)
      setError(errorMsg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [effectiveIsConnected, effectiveAddress, claimAll])

  // Claim specific token function
  const claimSpecificToken = useCallback(async (token: 'WSOM' | 'USDC' | 'SOMG') => {
    if (!effectiveIsConnected || !effectiveAddress) {
      throw new Error('Please connect your wallet first')
    }

    try {
      setIsLoading(true)
      setError(null)
      
      // Map token to the correct function name
      let functionName: string
      switch (token) {
        case 'WSOM':
          functionName = 'claimWSOM'
          break
        case 'USDC':
          functionName = 'claimUSDC'
          break
        case 'SOMG':
          functionName = 'claimSOMG'
          break
        default:
          throw new Error(`Unknown token: ${token}`)
      }
      
      console.log('🔍 Claiming specific token:', {
        token,
        functionName,
        address: TestTokenFaucetContract.address,
        userAddress: effectiveAddress
      })
      
      claimSpecific({
        address: TestTokenFaucetContract.address as `0x${string}`,
        abi: TestTokenFaucetContract.abi,
        functionName
      })
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : `Failed to claim ${token}`
      console.error(`❌ Claim ${token} failed:`, err)
      setError(errorMsg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [effectiveIsConnected, effectiveAddress, claimSpecific])

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

  // Check faucet token balances
  useEffect(() => {
    const checkFaucetBalances = async () => {
      if (!effectiveAddress || !effectiveIsConnected) return
      
      try {
        // We'll need to check the token contracts directly
        console.log('🔍 Checking faucet token balances...')
        // This would require importing the token contracts, but for now let's just log the attempt
        console.log('💡 To check faucet balances, we need to query the individual token contracts')
      } catch (error) {
        console.error('Failed to check faucet balances:', error)
      }
    }
    
    checkFaucetBalances()
  }, [effectiveAddress, effectiveIsConnected])

  return {
    // State
    isLoading: isLoadingState,
    isClaimSuccess: isClaimSuccessState,
    error,
    
    // Wallet state
    address: effectiveAddress,
    isConnected: effectiveIsConnected,
    
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