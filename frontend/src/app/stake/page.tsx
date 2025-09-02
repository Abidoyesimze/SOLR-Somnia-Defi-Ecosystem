'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ethers } from 'ethers'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster, toast } from 'react-hot-toast'
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
import { DEFI_TOKENS } from '../lib/constants'
import { SomniaStakingContract } from "../../abi";
import { SOMNIA_CONFIG } from "../lib/constants";
import { useAccount, useChainId, useWalletClient, usePublicClient } from 'wagmi';
import NavigationTabs from '../components/NavigationTabs';

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)"
]

export default function IntegratedStakingInterface() {
  // Web3 state
  const { address: userAddress, isConnected } = useAccount();

  // Define StakingPoolCard component
  const StakingPoolCard = ({ pool }: { pool: any }) => {
    const { token, apy, totalStaked } = pool;
    const tokenInfo = DEFI_TOKENS[token as keyof typeof DEFI_TOKENS];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-lg hover:border-purple-500/50 transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`text-3xl ${tokenInfo?.color}`}>{tokenInfo?.logo}</div>
            <div>
              <h3 className="text-xl font-bold text-white">{token}</h3>
              <p className="text-sm text-slate-400">Staking Pool</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-green-400">{apy}</p>
            <p className="text-xs text-slate-500">APY</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div className="bg-slate-800/50 p-3 rounded-lg">
            <p className="text-slate-400">Total Staked</p>
            <p className="font-mono text-white">{totalStaked}</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg">
            <p className="text-slate-400">Your Stake</p>
            <p className="font-mono text-white">{dataState.balances[token] ? parseFloat(dataState.balances[token]).toFixed(4) : '0.00'}</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => openModal('stake', token)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Stake</span>
          </button>
          <button
            onClick={() => openModal('claim', token)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Award className="w-4 h-4" />
            <span>Claim</span>
          </button>
        </div>
      </motion.div>
    );
  };
  const chainId = useChainId()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const readProvider = useMemo(() => new ethers.JsonRpcProvider(SOMNIA_CONFIG.RPC_URL), [])

  // Data state
  const [dataState, setDataState] = useState({
    stakingPools: [] as any[],
    userStakes: {} as Record<string, any>,
    stakingTiers: {} as Record<string, any>,
    pendingRewards: {} as Record<string, any>,
    protocolStats: { totalStaked: '0', totalRewardsDistributed: '0' },
    balances: {} as Record<string, string>,
    ui: {
      loading: false,
      activeModal: null as string | null,
      selectedPool: null as string | null,
      selectedTier: 0,
      actionAmount: ''
    }
  })
  
  // Calculator state
  const [calculatorState, setCalculatorState] = useState({
    amount: '',
    tier: 0,
    duration: 365
  })

  // Check if user is contract owner
  const [isOwner, setIsOwner] = useState(false)
  
  // Destructure state for easier access
  const { stakingPools, userStakes, stakingTiers, pendingRewards, protocolStats, balances, ui } = dataState
  const { loading, activeModal, selectedPool, selectedTier, actionAmount } = ui
  const { amount: calcAmount, tier: calcTier, duration: calcDuration } = calculatorState;

  const openModal = (modalType: string, poolToken: string) => {
    setDataState(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        activeModal: modalType,
        selectedPool: poolToken,
        actionAmount: '',
      }
    }));
  };
  
  const getSigner = useCallback(async () => {
    if (!walletClient) return null
    const browserProvider = new ethers.BrowserProvider((walletClient as any).transport)
    return await browserProvider.getSigner()
  }, [walletClient])

  const checkIfOwner = useCallback(async () => {
    try {
      if (!userAddress) return
      
      const stakingContract = new ethers.Contract(SomniaStakingContract.address, SomniaStakingContract.abi, readProvider)
      const owner = await stakingContract.owner()
      
      setIsOwner(owner.toLowerCase() === userAddress.toLowerCase())
    } catch (error) {
      console.error('Failed to check owner status:', error)
      setIsOwner(false)
    }
  }, [readProvider, userAddress])

  // Load staking pools
  const loadStakingPools = useCallback(async () => {
    try {
      if (!readProvider) return
      
      const stakingContract = new ethers.Contract(SomniaStakingContract.address, SomniaStakingContract.abi, readProvider)
      
      // Get all pools from the contract
      const poolAddresses = await stakingContract.getAllPools()
      
      if (poolAddresses.length === 0) {
        setDataState(prev => ({ ...prev, stakingPools: [] }))
        return
      }
      
      const poolsData: any[] = [];
      
      for (const poolAddress of poolAddresses) {
        try {
          const poolInfo = await stakingContract.getPool(poolAddress)
          
          // Get token info
                    const tokenContract = new ethers.Contract(poolAddress, ERC20_ABI, readProvider)
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
      
      if (poolsData.length > 0) {
        setDataState(prev => ({ ...prev, stakingPools: poolsData }));
      }
    } catch (error) {
      console.error('Failed to load staking pools:', error)
      setDataState(prev => ({ ...prev, stakingPools: [] }))
    }
  }, [readProvider])

  // Load protocol stats
  const loadProtocolStats = useCallback(async () => {
    try {
      const stakingContract = new ethers.Contract(SomniaStakingContract.address, SomniaStakingContract.abi, readProvider)
      const stats = await stakingContract.getProtocolStats()
      
      setDataState(prev => ({ ...prev, protocolStats: {
        totalStaked: ethers.formatEther(stats.totalStaked),
        totalRewardsDistributed: ethers.formatEther(stats.totalRewardsDistributed)
      } }))
    } catch (error) {
      console.error('Failed to load protocol stats:', error)
      setDataState(prev => ({ ...prev, protocolStats: {
        totalStaked: '0',
        totalRewardsDistributed: '0'
      } }))
    }
  }, [readProvider])

  // Load staking tiers
  const loadStakingTiers = useCallback(async () => {
    try {
      if (stakingPools.length === 0) return
      
      const stakingContract = new ethers.Contract(SomniaStakingContract.address, SomniaStakingContract.abi, readProvider)
      
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
      
      setDataState(prev => ({ ...prev, stakingTiers: tiersData }))
    } catch (error) {
      console.error('Failed to load staking tiers:', error)
      setDataState(prev => ({ ...prev, stakingTiers: {} }))
    }
  }, [readProvider, stakingPools])

  // Load user data
  const loadUserData = useCallback(async () => {
    try {
      if (!userAddress || stakingPools.length === 0) return
      
      const stakingContract = new ethers.Contract(SomniaStakingContract.address, SomniaStakingContract.abi, readProvider)
      
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
      
      setDataState(prev => ({ ...prev, userStakes: userStakesData, pendingRewards: pendingRewardsData }))
    } catch (error) {
      console.error('Failed to load user data:', error)
      setDataState(prev => ({ ...prev, userStakes: {}, pendingRewards: {} }))
    }
  }, [readProvider, userAddress, stakingPools])

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

  const handleCalculatorChange = (field: keyof typeof calculatorState) => (value: string | number) => {
    setCalculatorState(prev => ({ ...prev, [field]: value }))
  }

  // Approve and stake
  const stake = async () => {
    if (!selectedPool || !actionAmount) return
    
    if (!userAddress) {
      toast.error('Wallet not connected. Please connect your wallet.')
      return
    }
    
    try {
      setDataState(prev => ({ ...prev, ui: { ...prev.ui, loading: true } }))
      
      const signer = await getSigner()
      if (!signer) {
        toast.error('Failed to get signer. Please connect your wallet.')
        setDataState(prev => ({ ...prev, ui: { ...prev.ui, loading: false } }))
        return
      }
      
      // Approve and stake logic
    } catch (error) {
      console.error('Staking failed:', error)
      toast.error('Failed to stake.')
    } finally {
      setDataState(prev => ({ ...prev, ui: { ...prev.ui, loading: false } }))
    }
  }

  // Claim rewards
  const claimRewards = async (token: string) => {
    if (!userAddress) {
      toast.error('Wallet not connected. Please connect your wallet.')
      return
    }
    
    try {
      setDataState(prev => ({ ...prev, ui: { ...prev.ui, loading: true } }))
      
      const signer = await getSigner()
      if (!signer) {
        toast.error('Failed to get signer. Please connect your wallet.')
        setDataState(prev => ({ ...prev, ui: { ...prev.ui, loading: false } }))
        return
      }
      
      const pool = stakingPools.find(p => p.token === token)
      if (!pool) throw new Error('Pool not found')
      
            const stakingContract = new ethers.Contract(SomniaStakingContract.address, SomniaStakingContract.abi, signer)
      
      // Execute claim rewards
    
    // Execute claim rewards
    toast.loading('Claiming rewards...')
    const claimTx = await stakingContract.claimRewards(pool.address)
    await claimTx.wait()
    
    toast.dismiss()
    toast.success(`Successfully claimed rewards for ${token}!`)
    
    // Reload data
    loadUserData()
    setDataState(prev => ({ ...prev, ui: { ...prev.ui, actionAmount: '', activeModal: null } }))
    
  } catch (error) {
    console.error('Claiming rewards failed:', error)
    toast.dismiss()
    toast.error('Failed to claim rewards.')
  } finally {
    setDataState(prev => ({ ...prev, ui: { ...prev.ui, loading: false } }))
  }
}

// ...

// Action Modal
const ActionModal = () => {
  if (!activeModal || !selectedPool) return null
  
  const pool = stakingPools.find(p => p.token === selectedPool)
  const balance = dataState.balances[selectedPool] || '0'
  const tiers = dataState.stakingTiers[selectedPool] || []
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setDataState(prev => ({ ...prev, ui: { ...prev.ui, activeModal: null } }))}
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
              onClick={() => setDataState(prev => ({ ...prev, ui: { ...prev.ui, activeModal: null } }))}
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
                value={dataState.ui.actionAmount}
                onChange={(e) => {
                  if (e.target.value === '' || /^\d*\.?\d*$/.test(e.target.value)) {
                    setDataState(prev => ({ ...prev, ui: { ...prev.ui, actionAmount: e.target.value } }))
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
                    value={dataState.ui.selectedTier}
                    onChange={(e) => setDataState(prev => ({ ...prev, ui: { ...prev.ui, selectedTier: parseInt(e.target.value) } }))}
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
                
                <button
                  onClick={stake}
                  disabled={dataState.ui.loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-medium flex items-center justify-center"
                >
                  {dataState.ui.loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Zap className="w-5 h-5 mr-2" />
                  )}
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
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Toaster position="top-center" toastOptions={{ className: 'bg-slate-800 text-white' }} />
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            {stakingPools.map(pool => (
              <StakingPoolCard key={pool.token} pool={pool} />
            ))}
          </div>

          <div className="space-y-6">
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
  </main>

  {/* Action Modal */}
  {activeModal && <ActionModal />}
</div>
  )
}