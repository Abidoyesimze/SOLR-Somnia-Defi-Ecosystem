'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ethers } from 'ethers'
import { toast } from 'react-hot-toast'
import Header from '../components/Header'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Settings,
  Info,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Shield,
  Target,
  Zap
} from 'lucide-react'

// Import your constants and contracts
import { DEFI_TOKENS, CONTRACTS } from '../lib/constants'
import { SomniaLendingContract } from '../../abi'

// Lending Contract ABI
const LENDING_ABI = [
  // View functions
  "function getMarket(address token) external view returns (tuple(address token, uint256 totalSupply, uint256 totalBorrow, uint256 supplyRate, uint256 borrowRate, uint256 exchangeRate, uint256 lastUpdateTime, bool isActive, uint256 collateralFactor))",
  "function getUserPosition(address user, address token) external view returns (tuple(uint256 supplied, uint256 borrowed, uint256 lastUpdateTime, bool isActive))",
  "function getUserTotals(address user) external view returns (uint256 collateral, uint256 borrow)",
  "function getProtocolTotals() external view returns (uint256 totalCollateral, uint256 totalBorrowed)",
  "function getAllMarkets() external view returns (address[])",
  "function whitelistedTokens(address token) external view returns (bool)",
  
  // Write functions
  "function supply(address token, uint256 amount) external",
  "function withdraw(address token, uint256 amount) external",
  "function borrow(address token, uint256 amount) external",
  "function repay(address token, uint256 amount) external",
  "function createMarket(address token, uint256 collateralFactor) external",
  
  // Events
  "event Supply(address indexed user, address indexed token, uint256 amount, uint256 exchangeRate)",
  "event Withdraw(address indexed user, address indexed token, uint256 amount, uint256 exchangeRate)",
  "event Borrow(address indexed user, address indexed token, uint256 amount, uint256 borrowRate)",
  "event Repay(address indexed user, address indexed token, uint256 amount, uint256 borrowRate)"
]

// ERC20 ABI
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
]

// Type definitions
interface UserPool {
  token0: string;
  token1: string;
  userLPBalance: string;
  poolShare: string;
  reserve0: string;
  reserve1: string;
  lpTokenAddress: string;
}

interface PoolData {
  totalLPSupply: string;
  lpTokenAddress: string;
}

export default function IntegratedLendingInterface() {
  // Web3 state
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [userAddress, setUserAddress] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  // Data state
  const [markets, setMarkets] = useState<any[]>([])
  const [userPositions, setUserPositions] = useState<Record<string, any>>({})
  const [userTotals, setUserTotals] = useState({ collateral: '0', borrow: '0' })
  const [protocolStats, setProtocolStats] = useState({ totalCollateral: '0', totalBorrowed: '0' })
  const [balances, setBalances] = useState<Record<string, string>>({})
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null) // 'supply', 'withdraw', 'borrow', 'repay'
  const [selectedToken, setSelectedToken] = useState<string | null>(null)
  const [actionAmount, setActionAmount] = useState('')
  const [showSettings, setShowSettings] = useState(false)

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

  // Load markets data
  const loadMarkets = useCallback(async () => {
    try {
      if (!provider) return
      
      const lendingContract = new ethers.Contract(SomniaLendingContract.address, LENDING_ABI, provider)
      
      // Get all markets from the contract
      const marketAddresses = await lendingContract.getAllMarkets()
      
      if (marketAddresses.length === 0) {
        setMarkets([])
        return
      }
      
      const marketsData = []
      
      for (const marketAddress of marketAddresses) {
        try {
          const marketInfo = await lendingContract.getMarket(marketAddress)
          
          // Get token info
          const tokenContract = new ethers.Contract(marketAddress, ERC20_ABI, provider)
          const symbol = await tokenContract.symbol()
          const decimals = await tokenContract.decimals()
          
          // Find token in our constants
          const tokenData = Object.values(DEFI_TOKENS).find(token => 
            token.address?.toLowerCase() === marketAddress.toLowerCase()
          )
          
          if (tokenData) {
            const totalSupply = ethers.formatUnits(marketInfo.totalSupply, decimals)
            const totalBorrow = ethers.formatUnits(marketInfo.totalBorrow, decimals)
            const utilization = parseFloat(totalBorrow) > 0 ? (parseFloat(totalBorrow) / parseFloat(totalSupply)) * 100 : 0
            
            marketsData.push({
              token: symbol,
              address: marketAddress,
              logo: tokenData.logo,
              decimals: decimals,
              totalSupply: totalSupply,
              totalBorrow: totalBorrow,
              supplyRate: parseFloat(ethers.formatUnits(marketInfo.supplyRate, 18)).toFixed(2),
              borrowRate: parseFloat(ethers.formatUnits(marketInfo.borrowRate, 18)).toFixed(2),
              exchangeRate: ethers.formatUnits(marketInfo.exchangeRate, 18),
              collateralFactor: parseFloat(ethers.formatUnits(marketInfo.collateralFactor, 2)),
              utilization: utilization.toFixed(1),
              isActive: marketInfo.isActive,
              lastUpdateTime: Number(marketInfo.lastUpdateTime) * 1000
            })
          }
        } catch (error) {
          console.error(`Failed to load market ${marketAddress}:`, error)
          continue
        }
      }
      
      setMarkets(marketsData)
    } catch (error) {
      console.error('Failed to load markets:', error)
      toast.error('Failed to load lending markets')
      setMarkets([])
    }
  }, [provider])

  // Load user positions
  const loadUserPositions = useCallback(async () => {
    try {
      if (!provider || !userAddress) return
      
      const lendingContract = new ethers.Contract(SomniaLendingContract.address, LENDING_ABI, provider)
      
      // Get user totals
      const userTotalsData = await lendingContract.getUserTotals(userAddress)
      
      setUserTotals({
        collateral: ethers.formatEther(userTotalsData.collateral),
        borrow: ethers.formatEther(userTotalsData.borrow)
      })
      
      // Get individual positions for each market
      const positions: Record<string, any> = {}
      
      for (const market of markets) {
        try {
          const position = await lendingContract.getUserPosition(userAddress, market.address)
          
          if (position.isActive) {
            positions[market.token] = {
              supplied: ethers.formatUnits(position.supplied, market.decimals),
              borrowed: ethers.formatUnits(position.borrowed, market.decimals),
              lastUpdateTime: Number(position.lastUpdateTime) * 1000,
              isActive: position.isActive
            }
          }
        } catch (error) {
          console.error(`Failed to load position for ${market.token}:`, error)
          continue
        }
      }
      
      setUserPositions(positions)
      
    } catch (error) {
      console.error('Failed to load user positions:', error)
      setUserPositions({})
      setUserTotals({
        collateral: '0',
        borrow: '0'
      })
    }
  }, [provider, userAddress, markets])

  // Load protocol stats
  const loadProtocolStats = useCallback(async () => {
    try {
      if (!provider) return
      
      const lendingContract = new ethers.Contract(SomniaLendingContract.address, LENDING_ABI, provider)
      const stats = await lendingContract.getProtocolTotals()
      
      setProtocolStats({
        totalCollateral: ethers.formatEther(stats.totalCollateral),
        totalBorrowed: ethers.formatEther(stats.totalBorrowed)
      })
    } catch (error) {
      console.error('Failed to load protocol stats:', error)
      setProtocolStats({
        totalCollateral: '0',
        totalBorrowed: '0'
      })
    }
  }, [provider])

  // Load user balances
  const loadBalances = useCallback(async () => {
    try {
      if (!provider || !userAddress) return
      
      const newBalances: Record<string, string> = {}
      
      for (const [symbol, token] of Object.entries(DEFI_TOKENS)) {
        if (token.address) {
          try {
            const tokenContract = new ethers.Contract(token.address, ERC20_ABI, provider)
            const balance = await tokenContract.balanceOf(userAddress)
            const decimals = await tokenContract.decimals()
            newBalances[symbol] = ethers.formatUnits(balance, decimals)
          } catch (error) {
            console.error(`Failed to load balance for ${symbol}:`, error)
            newBalances[symbol] = '0'
          }
        }
      }
      
      setBalances(newBalances)
    } catch (error) {
      console.error('Failed to load balances:', error)
      setBalances({})
    }
  }, [provider, userAddress])

  // Check and approve token
  const checkAndApprove = async (tokenAddress: string, amount: string, decimals: number) => {
    try {
      if (!signer || !userAddress) throw new Error('Wallet not connected')
      
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer)
      const amountWei = ethers.parseUnits(amount, decimals)
      
      // Check current allowance
      const allowance = await tokenContract.allowance(userAddress, SomniaLendingContract.address)
      
      if (allowance < amountWei) {
        toast.loading('Approving token spending...')
        const approveTx = await tokenContract.approve(SomniaLendingContract.address, ethers.MaxUint256)
        await approveTx.wait()
        toast.dismiss()
        toast.success('Token approved!')
      }
    } catch (error) {
      throw new Error('Token approval failed')
    }
  }

  // Supply tokens
  const supply = async () => {
    if (!signer || !selectedToken || !actionAmount) return
    
    try {
      setLoading(true)
      
      const market = markets.find(m => m.token === selectedToken)
      if (!market) throw new Error('Market not found')
      
      // Check and approve token
      await checkAndApprove(market.address, actionAmount, market.decimals)
      
      // Execute supply
      const lendingContract = new ethers.Contract(SomniaLendingContract.address, LENDING_ABI, signer)
      const amountWei = ethers.parseUnits(actionAmount, market.decimals)
      
      toast.loading('Supplying tokens...')
      const tx = await lendingContract.supply(market.address, amountWei)
      await tx.wait()
      
      toast.dismiss()
      toast.success(`Successfully supplied ${actionAmount} ${selectedToken}!`)
      
      // Reset and reload data
      setActionAmount('')
      setActiveModal(null)
      loadMarkets()
      loadUserPositions()
      loadBalances()
      loadProtocolStats()
      
    } catch (error: any) {
      console.error('Supply failed:', error)
      toast.dismiss()
      
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction cancelled by user')
      } else if (error.reason) {
        toast.error(`Supply failed: ${error.reason}`)
      } else {
        toast.error('Supply failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Withdraw tokens
  const withdraw = async () => {
    if (!signer || !selectedToken || !actionAmount) return
    
    try {
      setLoading(true)
      
      const market = markets.find(m => m.token === selectedToken)
      if (!market) throw new Error('Market not found')
      
      // Execute withdraw
      const lendingContract = new ethers.Contract(SomniaLendingContract.address, LENDING_ABI, signer)
      const amountWei = ethers.parseUnits(actionAmount, market.decimals)
      
      toast.loading('Withdrawing tokens...')
      const tx = await lendingContract.withdraw(market.address, amountWei)
      await tx.wait()
      
      toast.dismiss()
      toast.success(`Successfully withdrew ${actionAmount} ${selectedToken}!`)
      
      // Reset and reload data
      setActionAmount('')
      setActiveModal(null)
      loadMarkets()
      loadUserPositions()
      loadBalances()
      loadProtocolStats()
      
    } catch (error: any) {
      console.error('Withdraw failed:', error)
      toast.dismiss()
      
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction cancelled by user')
      } else if (error.reason) {
        toast.error(`Withdraw failed: ${error.reason}`)
      } else {
        toast.error('Withdraw failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Borrow tokens
  const borrow = async () => {
    if (!signer || !selectedToken || !actionAmount) return
    
    try {
      setLoading(true)
      
      const market = markets.find(m => m.token === selectedToken)
      if (!market) throw new Error('Market not found')
      
      // Execute borrow
      const lendingContract = new ethers.Contract(SomniaLendingContract.address, LENDING_ABI, signer)
      const amountWei = ethers.parseUnits(actionAmount, market.decimals)
      
      toast.loading('Borrowing tokens...')
      const tx = await lendingContract.borrow(market.address, amountWei)
      await tx.wait()
      
      toast.dismiss()
      toast.success(`Successfully borrowed ${actionAmount} ${selectedToken}!`)
      
      // Reset and reload data
      setActionAmount('')
      setActiveModal(null)
      loadMarkets()
      loadUserPositions()
      loadBalances()
      loadProtocolStats()
      
    } catch (error: any) {
      console.error('Borrow failed:', error)
      toast.dismiss()
      
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction cancelled by user')
      } else if (error.reason) {
        toast.error(`Borrow failed: ${error.reason}`)
      } else {
        toast.error('Borrow failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Repay tokens
  const repay = async () => {
    if (!signer || !selectedToken || !actionAmount) return
    
    try {
      setLoading(true)
      
      const market = markets.find(m => m.token === selectedToken)
      if (!market) throw new Error('Market not found')
      
      // Check and approve token
      await checkAndApprove(market.address, actionAmount, market.decimals)
      
      // Execute repay
      const lendingContract = new ethers.Contract(SomniaLendingContract.address, LENDING_ABI, signer)
      const amountWei = ethers.parseUnits(actionAmount, market.decimals)
      
      toast.loading('Repaying tokens...')
      const tx = await lendingContract.repay(market.address, amountWei)
      await tx.wait()
      
      toast.dismiss()
      toast.success(`Successfully repaid ${actionAmount} ${selectedToken}!`)
      
      // Reset and reload data
      setActionAmount('')
      setActiveModal(null)
      loadMarkets()
      loadUserPositions()
      loadBalances()
      loadProtocolStats()
      
    } catch (error: any) {
      console.error('Repay failed:', error)
      toast.dismiss()
      
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction cancelled by user')
      } else if (error.reason) {
        toast.error(`Repay failed: ${error.reason}`)
      } else {
        toast.error('Repay failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Calculate health factor
  const calculateHealthFactor = () => {
    const collateralValue = parseFloat(userTotals.collateral)
    const borrowValue = parseFloat(userTotals.borrow)
    
    if (borrowValue === 0) return 'Safe'
    
    const healthFactor = (collateralValue * 0.85) / borrowValue // 85% liquidation threshold
    
    if (healthFactor > 1.5) return 'Safe'
    if (healthFactor > 1.2) return 'Good' 
    if (healthFactor > 1.0) return 'At Risk'
    return 'Liquidation Risk'
  }

  // Get health factor color
  const getHealthFactorColor = () => {
    const factor = calculateHealthFactor()
    switch (factor) {
      case 'Safe': return 'text-green-400'
      case 'Good': return 'text-blue-400'
      case 'At Risk': return 'text-yellow-400'
      case 'Liquidation Risk': return 'text-red-400'
      default: return 'text-slate-400'
    }
  }

  // Effects
  useEffect(() => {
    if (isConnected && userAddress) {
      loadMarkets()
      loadProtocolStats()
      loadUserPositions()
      loadBalances()
    }
  }, [isConnected, userAddress, loadMarkets, loadProtocolStats, loadUserPositions, loadBalances])

  // Load data when markets change
  useEffect(() => {
    if (isConnected && userAddress && markets.length > 0) {
      loadUserPositions()
    }
  }, [markets, isConnected, userAddress, loadUserPositions])

  // Action Modal Component
  const ActionModal = () => {
    if (!activeModal || !selectedToken) return null
    
    const market = markets.find(m => m.token === selectedToken)
    const position = userPositions[selectedToken]
    const balance = balances[selectedToken] || '0'
    
    const getMaxAmount = () => {
      switch (activeModal) {
        case 'supply':
          return balance
        case 'withdraw':
          return position?.supplied || '0'
        case 'borrow':
          // Simplified: 80% of collateral value
          return (parseFloat(userTotals.collateral) * 0.8).toFixed(6)
        case 'repay':
          return Math.min(parseFloat(position?.borrowed || '0'), parseFloat(balance)).toFixed(6)
        default:
          return '0'
      }
    }
    
    const executeAction = () => {
      switch (activeModal) {
        case 'supply': return supply()
        case 'withdraw': return withdraw()
        case 'borrow': return borrow()
        case 'repay': return repay()
      }
    }
    
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
                {activeModal} {selectedToken}
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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-slate-400">Amount</label>
                  <button
                    onClick={() => setActionAmount(getMaxAmount())}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    MAX: {parseFloat(getMaxAmount()).toFixed(4)}
                  </button>
                </div>
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
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Wallet Balance</span>
                  <span className="text-white">{parseFloat(balance).toFixed(4)} {selectedToken}</span>
                </div>
                {position && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Supplied</span>
                      <span className="text-white">{parseFloat(position.supplied).toFixed(4)} {selectedToken}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Borrowed</span>
                      <span className="text-white">{parseFloat(position.borrowed).toFixed(4)} {selectedToken}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">
                    {activeModal === 'supply' || activeModal === 'withdraw' ? 'Supply' : 'Borrow'} APY
                  </span>
                  <span className="text-green-400">
                    {activeModal === 'supply' || activeModal === 'withdraw' ? market?.supplyRate : market?.borrowRate}%
                  </span>
                </div>
              </div>
              
              <button
                onClick={executeAction}
                disabled={!actionAmount || parseFloat(actionAmount) <= 0 || loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {loading ? `${activeModal.charAt(0).toUpperCase() + activeModal.slice(1)}ing...` : 
                   `${activeModal.charAt(0).toUpperCase() + activeModal.slice(1)} ${selectedToken}`}
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Lend & Borrow on Somnia
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Supply assets to earn interest or borrow against your collateral. 
            Competitive rates and secure lending markets.
          </p>
          
          {!isConnected && (
            <motion.button
              onClick={connectWallet}
              className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-8 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 mx-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Wallet className="w-5 h-5" />
              <span>Connect Wallet to Start</span>
            </motion.button>
          )}
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center space-x-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-sm text-slate-400">Total Supply</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {parseFloat(protocolStats.totalCollateral) > 0 ? `$${parseFloat(protocolStats.totalCollateral).toFixed(2)}M` : 'No Data'}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center space-x-3 mb-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              <span className="text-sm text-slate-400">Total Borrow</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {parseFloat(protocolStats.totalBorrowed) > 0 ? `$${parseFloat(protocolStats.totalBorrowed).toFixed(2)}M` : 'No Data'}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Target className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-slate-400">Your Collateral</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {parseFloat(userTotals.collateral) > 0 ? `$${parseFloat(userTotals.collateral).toFixed(2)}` : 'No Data'}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-slate-400">Health Factor</span>
            </div>
            <div className={`text-2xl font-bold ${getHealthFactorColor()}`}>
              {calculateHealthFactor()}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Markets */}
          <div className="lg:col-span-2 space-y-6">
            {/* Markets List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Lending Markets</h2>
                <button
                  onClick={() => {
                    loadMarkets()
                    loadProtocolStats()
                    loadUserPositions()
                    loadBalances()
                  }}
                  className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm">Refresh</span>
                </button>
              </div>
              
              {markets.length === 0 ? (
                <div className="text-center py-12">
                  <PieChart className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Markets Available</h3>
                  <p className="text-slate-400">Lending markets will appear here when available.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {markets.map((market, index) => (
                    <motion.div
                      key={market.token}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-slate-700/30 hover:bg-slate-700/50 rounded-xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-blue-500/20">
                            <span className="text-2xl">{market.logo}</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{market.token}</h3>
                            <p className="text-sm text-slate-400">
                              Utilization: {market.utilization}% • CF: {market.collateralFactor}%
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400">{market.supplyRate}%</div>
                          <div className="text-sm text-slate-400">Supply APY</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">
                            {parseFloat(market.totalSupply).toFixed(2)}
                          </div>
                          <div className="text-xs text-slate-400">Total Supply</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">
                            {parseFloat(market.totalBorrow).toFixed(2)}
                          </div>
                          <div className="text-xs text-slate-400">Total Borrow</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-400">{market.borrowRate}%</div>
                          <div className="text-xs text-slate-400">Borrow APY</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-400">{market.utilization}%</div>
                          <div className="text-xs text-slate-400">Utilization</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              setSelectedToken(market.token)
                              setActiveModal('supply')
                              setActionAmount('')
                            }}
                            className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                            <span>Supply</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedToken(market.token)
                              setActiveModal('borrow')
                              setActionAmount('')
                            }}
                            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                          >
                            <ArrowDownLeft className="w-4 h-4" />
                            <span>Borrow</span>
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
            {/* Your Positions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Your Positions</h3>
              
              {Object.keys(userPositions).length === 0 ? (
                <div className="text-center py-8">
                  <PieChart className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">No active positions</p>
                  <p className="text-xs text-slate-500">Supply assets to start earning interest</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(userPositions).map(([token, position]) => (
                    <div key={token} className="bg-slate-700/30 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{DEFI_TOKENS[token as keyof typeof DEFI_TOKENS]?.logo}</span>
                          <span className="font-semibold text-white">{token}</span>
                        </div>
                      </div>
                      
                      {parseFloat(position.supplied) > 0 && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-slate-400">Supplied</span>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-green-400">
                              {parseFloat(position.supplied).toFixed(4)} {token}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {parseFloat(position.borrowed) > 0 && (
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-slate-400">Borrowed</span>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-red-400">
                              {parseFloat(position.borrowed).toFixed(4)} {token}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2">
                        {parseFloat(position.supplied) > 0 && (
                          <button
                            onClick={() => {
                              setSelectedToken(token)
                              setActiveModal('withdraw')
                              setActionAmount('')
                            }}
                            className="text-xs bg-slate-600 hover:bg-slate-500 text-white py-2 px-3 rounded-lg transition-colors"
                          >
                            Withdraw
                          </button>
                        )}
                        {parseFloat(position.borrowed) > 0 && (
                          <button
                            onClick={() => {
                              setSelectedToken(token)
                              setActiveModal('repay')
                              setActionAmount('')
                            }}
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg transition-colors"
                          >
                            Repay
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Account Health */}
            {parseFloat(userTotals.collateral) > 0 || parseFloat(userTotals.borrow) > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4">Account Health</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Collateral</span>
                    <span className="text-white font-semibold">
                      ${parseFloat(userTotals.collateral).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Borrowed</span>
                    <span className="text-white font-semibold">
                      ${parseFloat(userTotals.borrow).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Borrow Capacity</span>
                    <span className="text-white font-semibold">
                      ${(parseFloat(userTotals.collateral) * 0.8).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Health Factor</span>
                    <span className={`font-semibold ${getHealthFactorColor()}`}>
                      {calculateHealthFactor()}
                    </span>
                  </div>
                  
                  {/* Borrow Capacity Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Borrow Usage</span>
                      <span>
                        {parseFloat(userTotals.collateral) > 0 
                          ? ((parseFloat(userTotals.borrow) / (parseFloat(userTotals.collateral) * 0.8)) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          parseFloat(userTotals.borrow) / (parseFloat(userTotals.collateral) * 0.8) > 0.8 
                            ? 'bg-red-500' 
                            : parseFloat(userTotals.borrow) / (parseFloat(userTotals.collateral) * 0.8) > 0.6
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ 
                          width: `${Math.min(
                            parseFloat(userTotals.collateral) > 0 
                              ? (parseFloat(userTotals.borrow) / (parseFloat(userTotals.collateral) * 0.8)) * 100
                              : 0,
                            100
                          )}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (markets.length > 0) {
                      setSelectedToken(markets[0].token)
                      setActiveModal('supply')
                      setActionAmount('')
                    }
                  }}
                  disabled={markets.length === 0}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{markets.length === 0 ? 'No Markets Available' : 'Supply Assets'}</span>
                </button>
                <button
                  onClick={() => {
                    if (markets.length > 0) {
                      setSelectedToken(markets[0].token)
                      setActiveModal('borrow')
                      setActionAmount('')
                    }
                  }}
                  disabled={markets.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>{markets.length === 0 ? 'No Markets Available' : 'Borrow Assets'}</span>
                </button>
              </div>
            </motion.div>

            {/* Protocol Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6"
            >
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-300">
                  <p className="font-medium mb-1">Secure Lending Protocol</p>
                  <p className="text-xs leading-relaxed">
                    Supply assets to earn interest or borrow against your collateral. 
                    All positions are secured by smart contracts with automated liquidation protection.
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