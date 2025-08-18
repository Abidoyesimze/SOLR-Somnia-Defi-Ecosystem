'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ethers } from 'ethers'
import { toast } from 'react-hot-toast'
import Header from '../components/Header'
import {
  Star,
  TrendingUp,
  Clock,
  Shield,
  Zap,
  Gift,
  Calculator,
  Loader2,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  Info,
  AlertTriangle,
  Award,
  Target,
  DollarSign,
  Wallet
} from 'lucide-react'

// Import your constants and contracts
import { DEFI_TOKENS, CONTRACTS } from '../lib/constants'
import { SomniaStakingContract } from '../../abi'

// Staking Contract ABI
const STAKING_ABI = [
  "function getPool(address stakingToken) external view returns (tuple(address stakingToken, address rewardToken, uint256 totalStaked, uint256 totalRewards, uint256 rewardRate, uint256 lastUpdateTime, uint256 rewardPerTokenStored, uint256 periodFinish, bool isActive, uint256 minStakeDuration, uint256 maxStakeDuration, uint256 earlyWithdrawalPenalty))",
  "function getUserStake(address user, address stakingToken) external view returns (tuple(uint256 amount, uint256 stakedAt, uint256 lastClaimTime, uint256 rewardDebt, uint256 pendingRewards, bool isActive))",
  "function getStakingTiers(address stakingToken) external view returns (tuple(string name, uint256 minStake, uint256 maxStake, uint256 rewardMultiplier, uint256 lockDuration, uint256 earlyWithdrawalPenalty)[])",
  "function getPendingRewards(address user, address stakingToken) external view returns (uint256)",
  "function getProtocolStats() external view returns (uint256 totalStaked, uint256 totalRewardsDistributed)",
  "function getAllPools() external view returns (address[])",
  "function stake(address stakingToken, uint256 amount, uint256 tierIndex) external",
  "function unstake(address stakingToken, uint256 amount) external",
  "function claimRewards(address stakingToken) external"
]

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
]

export default function IntegratedStakingInterface() {
  // Web3 state
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [userAddress, setUserAddress] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  // Data state
  const [stakingPools, setStakingPools] = useState<any[]>([])
  const [userStakes, setUserStakes] = useState<Record<string, any>>({})
  const [stakingTiers, setStakingTiers] = useState<Record<string, any>>({})
  const [pendingRewards, setPendingRewards] = useState<Record<string, any>>({})
  const [protocolStats, setProtocolStats] = useState({ totalStaked: '0', totalRewardsDistributed: '0' })
  const [balances, setBalances] = useState<Record<string, string>>({})

  // UI state
  const [loading, setLoading] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [selectedPool, setSelectedPool] = useState<string | null>(null)
  const [selectedTier, setSelectedTier] = useState(0)
  const [actionAmount, setActionAmount] = useState('')
  
  // Calculator state
  const [calcAmount, setCalcAmount] = useState('')
  const [calcTier, setCalcTier] = useState(0)
  const [calcDuration, setCalcDuration] = useState(365)

  // Check if user is contract owner
  const [isOwner, setIsOwner] = useState(false)
  
  const checkIfOwner = useCallback(async () => {
    if (!provider || !userAddress) return
    
    try {
      const stakingContract = new ethers.Contract(SomniaStakingContract.address, STAKING_ABI, provider)
      const owner = await stakingContract.owner()
      setIsOwner(owner.toLowerCase() === userAddress.toLowerCase())
    } catch (error) {
      console.error('Failed to check owner status:', error)
      setIsOwner(false)
    }
  }, [provider, userAddress])

  // Initialize Web3
  useEffect(() => {
    const initWeb3 = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const web3Provider = new ethers.BrowserProvider(window.ethereum)
          setProvider(web3Provider)
          
          // Check if already connected
          const accounts = await web3Provider.listAccounts()
          if (accounts.length > 0) {
            const web3Signer = await web3Provider.getSigner()
            setSigner(web3Signer)
            const address = await web3Signer.getAddress()
            setUserAddress(address)
            setIsConnected(true)
          }

          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts: string[]) => {
            if (accounts.length === 0) {
              setIsConnected(false)
              setUserAddress('')
              setSigner(null)
            } else {
              window.location.reload()
            }
          })

          // Listen for chain changes
          window.ethereum.on('chainChanged', () => {
            window.location.reload()
          })

        } catch (error) {
          console.error('Failed to initialize Web3:', error)
        }
      }
    }
    
    initWeb3()
  }, [])

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask or another Web3 wallet')
      return
    }
    
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const web3Provider = new ethers.BrowserProvider(window.ethereum)
      const web3Signer = await web3Provider.getSigner()
      const address = await web3Signer.getAddress()
      
      setProvider(web3Provider)
      setSigner(web3Signer)
      setUserAddress(address)
      setIsConnected(true)
      
      toast.success('Wallet connected successfully!')
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      toast.error('Failed to connect wallet')
    }
  }

  // Load staking pools
  const loadStakingPools = useCallback(async () => {
    try {
      if (!provider) return
      
      const stakingContract = new ethers.Contract(SomniaStakingContract.address, STAKING_ABI, provider)
      
      // Get all pools from the contract
      const poolAddresses = await stakingContract.getAllPools()
      
      if (poolAddresses.length === 0) {
        setStakingPools([])
        return
      }
      
      const poolsData = []
      
      for (const poolAddress of poolAddresses) {
        try {
          const poolInfo = await stakingContract.getPool(poolAddress)
          
          // Get token info
          const tokenContract = new ethers.Contract(poolAddress, ERC20_ABI, provider)
          const symbol = await tokenContract.symbol()
          const decimals = await tokenContract.decimals()
          
          // Find token in our constants
          const tokenData = Object.values(DEFI_TOKENS).find(token => 
            token.address?.toLowerCase() === poolAddress.toLowerCase()
          )
          
          if (tokenData) {
            poolsData.push({
              token: symbol,
              logo: tokenData.logo,
              totalStaked: ethers.formatUnits(poolInfo.totalStaked, decimals),
              totalRewards: ethers.formatUnits(poolInfo.totalRewards, decimals),
              rewardRate: parseFloat(ethers.formatUnits(poolInfo.rewardRate, 18)).toFixed(2),
              isActive: poolInfo.isActive,
              minStakeDuration: Number(poolInfo.minStakeDuration),
              maxStakeDuration: Number(poolInfo.maxStakeDuration),
              address: poolAddress
            })
          }
        } catch (error) {
          console.error(`Failed to load pool ${poolAddress}:`, error)
          continue
        }
      }
      
      setStakingPools(poolsData)
    } catch (error) {
      console.error('Failed to load staking pools:', error)
      setStakingPools([])
    }
  }, [provider])

  // Load protocol stats
  const loadProtocolStats = useCallback(async () => {
    try {
      if (!provider) return
      
      const stakingContract = new ethers.Contract(SomniaStakingContract.address, STAKING_ABI, provider)
      const stats = await stakingContract.getProtocolStats()
      
      setProtocolStats({
        totalStaked: ethers.formatEther(stats.totalStaked),
        totalRewardsDistributed: ethers.formatEther(stats.totalRewardsDistributed)
      })
    } catch (error) {
      console.error('Failed to load protocol stats:', error)
      setProtocolStats({
        totalStaked: '0',
        totalRewardsDistributed: '0'
      })
    }
  }, [provider])

  // Load staking tiers
  const loadStakingTiers = useCallback(async () => {
    try {
      if (!provider || stakingPools.length === 0) return
      
      const stakingContract = new ethers.Contract(SomniaStakingContract.address, STAKING_ABI, provider)
      
      const tiersData: Record<string, any> = {}
      
      for (const pool of stakingPools) {
        try {
          const tiers = await stakingContract.getStakingTiers(pool.address)
          tiersData[pool.token] = tiers.map((tier: any) => ({
            name: tier.name,
            minStake: ethers.formatEther(tier.minStake),
            maxStake: ethers.formatEther(tier.maxStake),
            rewardMultiplier: parseFloat(ethers.formatUnits(tier.rewardMultiplier, 18)).toFixed(1),
            lockDuration: Number(tier.lockDuration),
            earlyWithdrawalPenalty: parseFloat(ethers.formatUnits(tier.earlyWithdrawalPenalty, 2))
          }))
        } catch (error) {
          console.error(`Failed to load tiers for ${pool.token}:`, error)
          continue
        }
      }
      
      setStakingTiers(tiersData)
    } catch (error) {
      console.error('Failed to load staking tiers:', error)
      setStakingTiers({})
    }
  }, [provider, stakingPools])

  // Load user data
  const loadUserData = useCallback(async () => {
    try {
      if (!provider || !userAddress || stakingPools.length === 0) return
      
      const stakingContract = new ethers.Contract(SomniaStakingContract.address, STAKING_ABI, provider)
      
      const userStakesData: Record<string, any> = {}
      const pendingRewardsData: Record<string, any> = {}
      
      for (const pool of stakingPools) {
        try {
          const userStake = await stakingContract.getUserStake(userAddress, pool.address)
          const pendingReward = await stakingContract.getPendingRewards(userAddress, pool.address)
          
          if (userStake.isActive) {
            userStakesData[pool.token] = {
              amount: ethers.formatUnits(userStake.amount, 18),
              stakedAt: Number(userStake.stakedAt) * 1000,
              isActive: userStake.isActive
            }
          }
          
          if (parseFloat(ethers.formatEther(pendingReward)) > 0) {
            pendingRewardsData[pool.token] = ethers.formatEther(pendingReward)
          }
        } catch (error) {
          console.error(`Failed to load user data for ${pool.token}:`, error)
          continue
        }
      }
      
      setUserStakes(userStakesData)
      setPendingRewards(pendingRewardsData)
    } catch (error) {
      console.error('Failed to load user data:', error)
      setUserStakes({})
      setPendingRewards({})
    }
  }, [provider, userAddress, stakingPools])

  // Effects
  useEffect(() => {
    if (isConnected && userAddress) {
      loadStakingPools()
      loadProtocolStats()
      checkIfOwner()
    }
  }, [isConnected, userAddress, loadStakingPools, loadProtocolStats, checkIfOwner])

  // Load user data when pools are loaded
  useEffect(() => {
    if (stakingPools.length > 0 && isConnected && userAddress) {
      loadStakingTiers()
      loadUserData()
    }
  }, [stakingPools, isConnected, userAddress, loadStakingTiers, loadUserData])

  // Approve and stake
  const stake = async () => {
    if (!selectedPool || !actionAmount) return
    
    if (!signer || !userAddress) {
      toast.error('Wallet not connected. Please connect your wallet.')
      return
    }
    
    try {
      setLoading(true)
      
      const pool = stakingPools.find(p => p.token === selectedPool)
      if (!pool) throw new Error('Pool not found')
      
      const stakingContract = new ethers.Contract(SomniaStakingContract.address, STAKING_ABI, signer)
      
      // Get token contract for approval
      const tokenData = Object.values(DEFI_TOKENS).find(token => 
        token.address?.toLowerCase() === pool.address.toLowerCase()
      )
      if (!tokenData?.address) throw new Error('Token not found')
      
      const tokenContract = new ethers.Contract(tokenData.address, ERC20_ABI, signer)
      const amountWei = ethers.parseUnits(actionAmount, tokenData.decimals || 18)
      
      // Check and approve token spending
      const allowance = await tokenContract.allowance(userAddress, SomniaStakingContract.address)
      if (allowance < amountWei) {
        toast.loading('Approving token spending...')
        const approveTx = await tokenContract.approve(SomniaStakingContract.address, ethers.MaxUint256)
        await approveTx.wait()
        toast.dismiss()
        toast.success('Token approved!')
      }
      
      // Execute stake
      toast.loading('Staking tokens...')
      const stakeTx = await stakingContract.stake(pool.address, amountWei, selectedTier)
      await stakeTx.wait()
      
      toast.dismiss()
      toast.success(`Successfully staked ${actionAmount} ${selectedPool}!`)
      setActionAmount('')
      setActiveModal(null)
      
      // Reload data
      loadStakingPools()
      loadUserData()
      
    } catch (error) {
      console.error('Staking failed:', error)
      toast.dismiss()
      toast.error('Staking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Unstake
  const unstake = async () => {
    if (!selectedPool || !actionAmount) return
    
    if (!signer || !userAddress) {
      toast.error('Wallet not connected. Please connect your wallet.')
      return
    }
    
    try {
      setLoading(true)
      
      const pool = stakingPools.find(p => p.token === selectedPool)
      if (!pool) throw new Error('Pool not found')
      
      const stakingContract = new ethers.Contract(SomniaStakingContract.address, STAKING_ABI, signer)
      const amountWei = ethers.parseUnits(actionAmount, 18)
      
      // Execute unstake
      toast.loading('Unstaking tokens...')
      const unstakeTx = await stakingContract.unstake(pool.address, amountWei)
      await unstakeTx.wait()
      
      toast.dismiss()
      toast.success(`Successfully unstaked ${actionAmount} ${selectedPool}!`)
      setActionAmount('')
      setActiveModal(null)
      
      // Reload data
      loadStakingPools()
      loadUserData()
      
    } catch (error) {
      console.error('Unstaking failed:', error)
      toast.dismiss()
      toast.error('Unstaking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Create staking pool
  const createStakingPool = async (tokenAddress: string) => {
    if (!signer || !userAddress) {
      toast.error('Wallet not connected. Please connect your wallet.')
      return
    }
    
    try {
      setLoading(true)
      
      const stakingContract = new ethers.Contract(SomniaStakingContract.address, STAKING_ABI, signer)
      
      // Create pool with default parameters
      toast.loading('Creating staking pool...')
      const createTx = await stakingContract.createPool(
        tokenAddress,
        ethers.parseEther('1000'), // 1000 tokens reward rate
        86400 * 30, // 30 days min stake
        86400 * 365, // 1 year max stake
        500 // 5% early withdrawal penalty
      )
      
      await createTx.wait()
      toast.dismiss()
      toast.success('Staking pool created successfully!')
      
      // Reload pools
      loadStakingPools()
      
    } catch (error) {
      console.error('Failed to create pool:', error)
      toast.dismiss()
      toast.error('Failed to create staking pool. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Claim rewards
  const claimRewards = async (token: string) => {
    if (!signer || !userAddress) {
      toast.error('Wallet not connected. Please connect your wallet.')
      return
    }
    
    try {
      setLoading(true)
      
      const pool = stakingPools.find(p => p.token === token)
      if (!pool) throw new Error('Pool not found')
      
      const stakingContract = new ethers.Contract(SomniaStakingContract.address, STAKING_ABI, signer)
      
      // Execute claim rewards
      toast.loading('Claiming rewards...')
      const claimTx = await stakingContract.claimRewards(pool.address)
      await claimTx.wait()
      
      toast.dismiss()
      toast.success(`Successfully claimed rewards for ${token}!`)
      
      // Reload data
      loadUserData()
      
    } catch (error) {
      console.error('Claiming rewards failed:', error)
      toast.dismiss()
      toast.error('Failed to claim rewards.')
    } finally {
      setLoading(false)
    }
  }

  // Calculate rewards
  const calculateRewards = (amount: string, tier: number, duration: number) => {
    const baseRate = 0.10 // 10% base rate
    const tierMultiplier = [1.0, 1.2, 1.5, 2.0][tier] || 1.0
    const durationMultiplier = duration / 365
    
    const annualReward = parseFloat(amount) * baseRate * tierMultiplier * durationMultiplier
    return annualReward.toFixed(2)
  }

  // Action Modal
  const ActionModal = () => {
    if (!activeModal || !selectedPool) return null
    
    const pool = stakingPools.find(p => p.token === selectedPool)
    const balance = balances[selectedPool] || '0'
    const tiers = stakingTiers[selectedPool] || []
    
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-900 rounded-2xl border border-slate-700 p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white capitalize">
                {activeModal} {selectedPool}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Amount</label>
                <input
                  type="text"
                  value={actionAmount}
                  onChange={(e) => {
                    if (e.target.value === '' || /^\d*\.?\d*$/.test(e.target.value)) {
                      setActionAmount(e.target.value)
                    }
                  }}
                  placeholder="0.0"
                  className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <div className="text-xs text-slate-500 mt-1">
                  Balance: {parseFloat(balance) > 0 ? `${parseFloat(balance).toFixed(4)} ${selectedPool}` : 'No balance data'}
                </div>
              </div>
              
              {activeModal === 'stake' && (
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Staking Tier</label>
                  {tiers.length > 0 ? (
                    <select
                      value={selectedTier}
                      onChange={(e) => setSelectedTier(parseInt(e.target.value))}
                      className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      {tiers.map((tier: any, index: number) => (
                        <option key={index} value={index}>
                          {tier.name} ({tier.rewardMultiplier}x rewards, {tier.lockDuration} days)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-slate-500 bg-slate-800 px-4 py-3 rounded-xl border border-slate-600">
                      No staking tiers available
                    </div>
                  )}
                </div>
              )}
              
              <button
                onClick={() => {
                  if (activeModal === 'stake') stake()
                  else if (activeModal === 'unstake') unstake()
                }}
                disabled={!actionAmount || parseFloat(actionAmount) <= 0 || loading || (activeModal === 'stake' && tiers.length === 0)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {loading ? `${activeModal.charAt(0).toUpperCase() + activeModal.slice(1)}ing...` : 
                   activeModal === 'stake' && tiers.length === 0 ? 'No Tiers Available' :
                   `${activeModal.charAt(0).toUpperCase() + activeModal.slice(1)} ${selectedPool}`}
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Stake & Earn on Somnia
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Stake your tokens to earn rewards with flexible staking tiers. 
            Higher tiers offer better rewards and longer lock periods.
          </p>
          
          {!isConnected && (
            <motion.button
              onClick={connectWallet}
              className="mt-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 px-8 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 mx-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Wallet className="w-5 h-5" />
              <span>Connect Wallet to Start</span>
            </motion.button>
          )}
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center space-x-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-sm text-slate-400">Total Staked</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {parseFloat(protocolStats.totalStaked) > 0 ? `$${parseFloat(protocolStats.totalStaked).toFixed(2)}M` : 'No Data'}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Gift className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-slate-400">Total Rewards</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {parseFloat(protocolStats.totalRewardsDistributed) > 0 ? `$${parseFloat(protocolStats.totalRewardsDistributed).toFixed(2)}K` : 'No Data'}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-slate-400">Active Pools</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stakingPools.length > 0 ? stakingPools.length : '0'}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Staking Pools */}
          <div className="lg:col-span-2 space-y-6">
            {/* Staking Pools List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Staking Pools</h2>
                <button
                  onClick={() => {
                    loadStakingPools()
                    loadProtocolStats()
                    loadUserData()
                  }}
                  className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm">Refresh</span>
                </button>
              </div>
              
              {stakingPools.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Staking Pools Available</h3>
                  
                  {isOwner ? (
                    <>
                      <p className="text-slate-400 mb-6">As the contract owner, you can create staking pools for available tokens.</p>
                      
                      {/* Pool Creation Interface for Owner */}
                      <div className="max-w-md mx-auto space-y-4">
                        <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                          <h4 className="text-sm font-medium text-white mb-3">Create Staking Pool</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs text-slate-400 mb-1 block">Select Token</label>
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    const tokenData = Object.values(DEFI_TOKENS).find(token => 
                                      token.address === e.target.value
                                    )
                                    if (tokenData) {
                                      createStakingPool(tokenData.address)
                                    }
                                  }
                                }}
                                className="w-full bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                              >
                                <option value="">Choose a token...</option>
                                {Object.entries(DEFI_TOKENS).map(([symbol, tokenData]) => (
                                  <option key={symbol} value={tokenData.address}>
                                    {tokenData.logo} {symbol} - {tokenData.address?.slice(0, 10)}...
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="text-xs text-slate-500 bg-slate-800/50 p-3 rounded-lg">
                              <p className="font-medium text-slate-300 mb-1">Default Pool Settings:</p>
                              <ul className="space-y-1">
                                <li>• Reward Rate: 1000 tokens/day</li>
                                <li>• Min Stake Duration: 30 days</li>
                                <li>• Max Stake Duration: 1 year</li>
                                <li>• Early Withdrawal Penalty: 5%</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-slate-400 mb-6">Staking pools need to be created by the contract owner before you can start staking.</p>
                      
                      <div className="max-w-md mx-auto space-y-4">
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-400" />
                            <div className="text-sm text-yellow-300">
                              <div className="font-medium">Admin Action Required</div>
                              <div className="text-xs">Only the contract owner can create staking pools.</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-xs text-slate-500 bg-slate-800/50 p-3 rounded-lg">
                          <p className="font-medium text-slate-300 mb-1">What you can do:</p>
                          <ul className="space-y-1">
                            <li>• Wait for pools to be created by the admin</li>
                            <li>• Contact the protocol team to request pool creation</li>
                            <li>• Check back later for new pools</li>
                          </ul>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {stakingPools.map((pool, index) => (
                    <motion.div
                      key={pool.token}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-slate-700/30 hover:bg-slate-700/50 rounded-xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-purple-500/20">
                            <span className="text-2xl">{pool.logo}</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{pool.token}</h3>
                            <p className="text-sm text-slate-400">
                              Lock: {pool.minStakeDuration}-{pool.maxStakeDuration} days
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-400">{pool.rewardRate}%</div>
                          <div className="text-sm text-slate-400">APY</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">
                            {parseFloat(pool.totalStaked).toFixed(2)}
                          </div>
                          <div className="text-xs text-slate-400">Total Staked</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">
                            {parseFloat(pool.totalRewards).toFixed(2)}
                          </div>
                          <div className="text-xs text-slate-400">Total Rewards</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">
                            {pool.isActive ? 'Active' : 'Inactive'}
                          </div>
                          <div className="text-xs text-slate-400">Status</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            setSelectedPool(pool.token)
                            setActiveModal('stake')
                            setActionAmount('')
                          }}
                          className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                          <span>Stake</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPool(pool.token)
                            setActiveModal('unstake')
                            setActionAmount('')
                          }}
                          className="flex items-center justify-center space-x-2 bg-slate-600 hover:bg-slate-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                        >
                          <ArrowDownLeft className="w-4 h-4" />
                          <span>Unstake</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Stakes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Your Stakes</h3>
              
              {Object.keys(userStakes).length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">No active stakes</p>
                  <p className="text-xs text-slate-500">Stake tokens to start earning rewards</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(userStakes).map(([token, stake]) => (
                    <div key={token} className="bg-slate-700/30 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{DEFI_TOKENS[token as keyof typeof DEFI_TOKENS]?.logo}</span>
                          <span className="font-semibold text-white">{token}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-400">Staked Amount</span>
                          <span className="text-sm font-semibold text-white">
                            {parseFloat(stake.amount).toFixed(4)} {token}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-400">Staked Since</span>
                          <span className="text-sm text-slate-300">
                            {new Date(stake.stakedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-400">Pending Rewards</span>
                          <span className="text-sm font-semibold text-green-400">
                            {parseFloat(pendingRewards[token] || '0').toFixed(4)} {token}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setSelectedPool(token)
                            setActiveModal('unstake')
                            setActionAmount(stake.amount)
                          }}
                          className="text-xs bg-slate-600 hover:bg-slate-500 text-white py-2 px-3 rounded-lg transition-colors"
                        >
                          Unstake
                        </button>
                        {parseFloat(pendingRewards[token] || '0') > 0 && (
                          <button
                            onClick={() => claimRewards(token)}
                            className="text-xs bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg transition-colors"
                          >
                            Claim
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {stakingPools.length === 0 ? (
                  <>
                    {isOwner ? (
                      <button
                        onClick={() => {
                          // Show pool creation modal or redirect to pool creation
                          toast.success('Use the pool creation interface above to create staking pools')
                        }}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <Star className="w-4 h-4" />
                        <span>Create Staking Pool</span>
                      </button>
                    ) : (
                      <div className="text-center py-4">
                        <div className="text-sm text-slate-400 mb-2">No pools available yet</div>
                        <div className="text-xs text-slate-500">Wait for admin to create pools</div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        if (stakingPools.length > 0) {
                          setSelectedPool(stakingPools[0].token)
                          setActiveModal('stake')
                          setActionAmount('')
                        }
                      }}
                      disabled={stakingPools.length === 0}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>{stakingPools.length === 0 ? 'No Pools Available' : 'Stake Tokens'}</span>
                    </button>
                    
                    {Object.keys(pendingRewards).some(token => parseFloat(pendingRewards[token]) > 0) ? (
                      <button
                        onClick={() => {
                          const tokenWithRewards = Object.keys(pendingRewards).find(token => parseFloat(pendingRewards[token]) > 0)
                          if (tokenWithRewards) claimRewards(tokenWithRewards)
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium"
                      >
                        Claim Rewards
                      </button>
                    ) : (
                      <div className="text-sm text-slate-500 text-center py-2">
                        No rewards to claim
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>

            {/* Protocol Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6"
            >
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-purple-300">
                  <p className="font-medium mb-1">Flexible Staking Protocol</p>
                  <p className="text-xs leading-relaxed">
                    Choose your staking tier based on your goals. Higher tiers offer better rewards 
                    but require longer lock periods. Early withdrawals may incur penalties.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      <ActionModal />
    </div>
  )
}