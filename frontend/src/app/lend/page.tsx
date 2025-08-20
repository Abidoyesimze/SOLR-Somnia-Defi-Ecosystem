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
import { SomniaLendingFixedContract } from '../../abi'

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
  
  // Admin functions
  "function whitelistToken(address token) external",
  "function addInitialLiquidity(address token, uint256 amount) external",
  "function setMarketParameters(address token, uint256 supplyRate, uint256 borrowRate, uint256 collateralFactor) external",
  
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

  // Check if user is contract owner
  const [isOwner, setIsOwner] = useState(false)
  
  const checkIfOwner = useCallback(async () => {
    if (!provider || !userAddress) return
    
    try {
      // For now, assume any connected user can create markets
      // In production, you'd check against a whitelist or governance contract
      setIsOwner(true)
      console.log('User can create markets (owner check disabled)')
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

  // Load markets data
  const loadMarkets = useCallback(async () => {
    try {
      if (!provider) return
      
      console.log('Loading markets from contract:', SomniaLendingFixedContract.address)
      const lendingContract = new ethers.Contract(SomniaLendingFixedContract.address, LENDING_ABI, provider)
      
      // Get all markets from the contract
      const marketAddresses = await lendingContract.getAllMarkets()
      console.log('Found market addresses:', marketAddresses)
      
      if (marketAddresses.length === 0) {
        console.log('No markets found in contract')
        setMarkets([])
        return
      }
      
      const marketsData = []
      
      for (const marketAddress of marketAddresses) {
        try {
          console.log('Loading market info for:', marketAddress)
          const marketInfo = await lendingContract.getMarket(marketAddress)
          console.log('Market info:', marketInfo)
          
          // Get token info
          const tokenContract = new ethers.Contract(marketAddress, ERC20_ABI, provider)
          const symbol = await tokenContract.symbol()
          const decimals = await tokenContract.decimals()
          const name = await tokenContract.name()
          
          console.log('Token details:', { symbol, decimals, name, address: marketAddress })
          
          // Parse market info - handle both struct and array formats
          let marketData: any = {}
          
          // Check if marketInfo is a struct or array
          if (marketInfo && typeof marketInfo === 'object') {
            // Try to access as struct first
            if (marketInfo.totalSupply !== undefined) {
              marketData = marketInfo
            } else {
              // Handle as array format - map indices to expected fields
              // Based on the contract ABI, the order should be:
              // [token, totalSupply, totalBorrow, supplyRate, borrowRate, exchangeRate, lastUpdateTime, isActive, collateralFactor]
              marketData = {
                token: marketInfo[0],
                totalSupply: marketInfo[1] || BigInt(0),
                totalBorrow: marketInfo[2] || BigInt(0),
                supplyRate: marketInfo[3] || BigInt(0),
                borrowRate: marketInfo[4] || BigInt(0),
                exchangeRate: marketInfo[5] || BigInt(0),
                lastUpdateTime: marketInfo[6] || BigInt(0),
                isActive: marketInfo[7] || false,
                collateralFactor: marketInfo[8] || BigInt(0)
              }
            }
          }
          
          console.log('Parsed market data:', marketData)
          
          // Find token in our constants or create a default entry
          const tokenData = DEFI_TOKENS[symbol.toLowerCase() as keyof typeof DEFI_TOKENS]
          
          // Check if token is whitelisted
          let whitelisted = false
          try {
            whitelisted = await lendingContract.whitelistedTokens(marketAddress)
          } catch (error) {
            console.error(`Failed to check whitelist for ${symbol}:`, error)
            whitelisted = false
          }
          
          // If token not found in constants, create a default entry
          if (!tokenData) {
            console.log('Token not found in DEFI_TOKENS, creating default entry for:', symbol)
            // Create a basic market object without trying to match DEFI_TOKENS type
            const processedMarketData = {
              token: symbol,
              address: marketAddress,
              logo: '🌙',
              decimals: decimals,
              totalSupply: ethers.formatUnits(marketData.totalSupply || BigInt(0), decimals),
              totalBorrow: ethers.formatUnits(marketData.totalBorrow || BigInt(0), decimals),
              supplyRate: parseFloat(ethers.formatUnits(marketData.supplyRate || BigInt(0), 18)).toFixed(2),
              borrowRate: parseFloat(ethers.formatUnits(marketData.borrowRate || BigInt(0), 18)).toFixed(2),
              exchangeRate: ethers.formatUnits(marketData.exchangeRate || BigInt(0), 18),
              collateralFactor: parseFloat(ethers.formatUnits(marketData.collateralFactor || BigInt(0), 2)),
              utilization: (parseFloat(ethers.formatUnits(marketData.totalSupply || BigInt(0), decimals)) > 0 ? 
                (parseFloat(ethers.formatUnits(marketData.totalBorrow || BigInt(0), decimals)) / parseFloat(ethers.formatUnits(marketData.totalSupply || BigInt(0), decimals))) * 100 : 0).toFixed(1),
              isActive: marketData.isActive || false,
              lastUpdateTime: Number(marketData.lastUpdateTime || BigInt(0)) * 1000,
              whitelisted: whitelisted
            }
            
            console.log('Processed market data (default):', processedMarketData)
            marketsData.push(processedMarketData)
            continue // Skip the rest of the loop for this market
          }
          
          const totalSupply = ethers.formatUnits(marketData.totalSupply || BigInt(0), decimals)
          const totalBorrow = ethers.formatUnits(marketData.totalBorrow || BigInt(0), decimals)
          const utilization = parseFloat(totalSupply) > 0 ? (parseFloat(totalBorrow) / parseFloat(totalSupply)) * 100 : 0
          
          const processedMarketData = {
            token: symbol,
            address: marketAddress,
            logo: tokenData.logo,
            decimals: decimals,
            totalSupply: totalSupply,
            totalBorrow: totalBorrow,
            supplyRate: parseFloat(ethers.formatUnits(marketData.supplyRate || BigInt(0), 18)).toFixed(2),
            borrowRate: parseFloat(ethers.formatUnits(marketData.borrowRate || BigInt(0), 18)).toFixed(2),
            exchangeRate: ethers.formatUnits(marketData.exchangeRate || BigInt(0), 18),
            collateralFactor: parseFloat(ethers.formatUnits(marketData.collateralFactor || BigInt(0), 2)),
            utilization: utilization.toFixed(1),
            isActive: marketData.isActive || false,
            lastUpdateTime: Number(marketData.lastUpdateTime || BigInt(0)) * 1000,
            whitelisted: whitelisted
          }
          
          console.log('Processed market data:', processedMarketData)
          marketsData.push(processedMarketData)
          
        } catch (error) {
          console.error(`Failed to load market ${marketAddress}:`, error)
          // Still add the market with basic info even if some data fails to load
          try {
            const tokenContract = new ethers.Contract(marketAddress, ERC20_ABI, provider)
            const symbol = await tokenContract.symbol()
            const decimals = await tokenContract.decimals()
            
            marketsData.push({
              token: symbol,
              address: marketAddress,
              logo: '🌙',
              decimals: decimals,
              totalSupply: '0',
              totalBorrow: '0',
              supplyRate: '0.00',
              borrowRate: '0.00',
              exchangeRate: '1.0',
              collateralFactor: 0,
              utilization: '0.0',
              isActive: true,
              lastUpdateTime: Date.now(),
              whitelisted: false
            })
          } catch (fallbackError) {
            console.error(`Failed to load even basic info for market ${marketAddress}:`, fallbackError)
            continue
          }
        }
      }
      
      console.log('Final markets data:', marketsData)
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
      
      const lendingContract = new ethers.Contract(SomniaLendingFixedContract.address, LENDING_ABI, provider)
      
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
      
      const lendingContract = new ethers.Contract(SomniaLendingFixedContract.address, LENDING_ABI, provider)
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

  // Load user balances - simplified like SwapInterface
  const loadBalances = useCallback(async () => {
    if (!provider || !userAddress) return
    
    try {
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
      
      console.log('Loaded balances:', newBalances)
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
      const allowance = await tokenContract.allowance(userAddress, SomniaLendingFixedContract.address)
      
      if (allowance < amountWei) {
        toast.loading('Approving token spending...')
        const approveTx = await tokenContract.approve(SomniaLendingFixedContract.address, ethers.MaxUint256)
        await approveTx.wait()
        toast.dismiss()
        toast.success('Token approved!')
      }
    } catch (error) {
      throw new Error('Token approval failed')
    }
  }

  // Check if token is whitelisted
  const isTokenWhitelisted = useCallback(async (tokenAddress: string) => {
    if (!provider) return false
    
    try {
      const lendingContract = new ethers.Contract(SomniaLendingFixedContract.address, LENDING_ABI, provider)
      const whitelisted = await lendingContract.whitelistedTokens(tokenAddress)
      console.log(`Token ${tokenAddress} whitelisted:`, whitelisted)
      return whitelisted
    } catch (error) {
      console.error('Failed to check token whitelist:', error)
      return false
    }
  }, [provider])

  // Supply tokens
  const supply = async () => {
    if (!signer || !selectedToken || !actionAmount) return
    
    try {
      setLoading(true)
      
      const market = markets.find(m => m.token === selectedToken)
      if (!market) throw new Error('Market not found')
      
      // Check if token is whitelisted
      const whitelisted = await isTokenWhitelisted(market.address)
      if (!whitelisted) {
        throw new Error('Token is not whitelisted. Please contact admin to whitelist this token.')
      }
      
      // Allow supply to new markets (totalSupply can be 0 for first supply)
      console.log('Supply validation:', {
        token: selectedToken,
        amount: actionAmount,
        marketAddress: market.address,
        marketActive: market.isActive,
        totalSupply: market.totalSupply,
        whitelisted: whitelisted
      })
      
      // Check and approve token with better error handling
      try {
        await checkAndApprove(market.address, actionAmount, market.decimals)
      } catch (approvalError) {
        console.error('Token approval failed:', approvalError)
        throw new Error('Token approval failed. Please try again.')
      }
      
      // Execute supply with proper error handling
      const lendingContract = new ethers.Contract(SomniaLendingFixedContract.address, LENDING_ABI, signer)
      const amountWei = ethers.parseUnits(actionAmount, market.decimals)
      
      console.log('Executing supply with:', {
        contractAddress: SomniaLendingFixedContract.address,
        tokenAddress: market.address,
        amountWei: amountWei.toString(),
        amountHuman: actionAmount
      })
      
      toast.loading('Supplying tokens...')
      
      // First check if the transaction would succeed
      try {
        await lendingContract.supply.estimateGas(market.address, amountWei)
      } catch (estimateError) {
        console.error('Gas estimation failed:', estimateError)
        throw new Error('Transaction would fail. Please check market conditions.')
      }
      
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
      } else if (error.message) {
        toast.error(`Supply failed: ${error.message}`)
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
      const lendingContract = new ethers.Contract(SomniaLendingFixedContract.address, LENDING_ABI, signer)
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
      const lendingContract = new ethers.Contract(SomniaLendingFixedContract.address, LENDING_ABI, signer)
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
      const lendingContract = new ethers.Contract(SomniaLendingFixedContract.address, LENDING_ABI, signer)
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

  // Create Lending Market
  const createLendingMarket = async (tokenAddress: string) => {
    if (!signer || !userAddress) {
      toast.error('Wallet not connected')
      return
    }

    try {
      setLoading(true)
      const lendingContract = new ethers.Contract(SomniaLendingFixedContract.address, LENDING_ABI, signer)
      
      // Check if market already exists
      try {
        const existingMarket = await lendingContract.getMarket(tokenAddress)
        if (existingMarket && existingMarket.isActive) {
          toast.error('Market already exists for this token')
          return
        }
      } catch (error) {
        // Market doesn't exist, continue with creation
      }
      
      toast.loading('Creating market...')
      
      // Create market with proper parameters
      const collateralFactor = ethers.parseUnits('0.8', 2) // 80% collateral factor
      const tx = await lendingContract.createMarket(tokenAddress, collateralFactor)
      
      toast.dismiss()
      toast.loading('Confirming market creation...')
      const receipt = await tx.wait()
      
      toast.dismiss()
      toast.success('Market created successfully!')
      
      // Wait a bit for the market to be fully initialized
      setTimeout(() => {
        loadMarkets()
        loadProtocolStats()
      }, 2000)
      
    } catch (error: any) {
      console.error('Failed to create market:', error)
      toast.dismiss()
      
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction cancelled by user')
      } else if (error.reason) {
        toast.error(`Market creation failed: ${error.reason}`)
      } else if (error.message) {
        toast.error(`Market creation failed: ${error.message}`)
      } else {
        toast.error('Market creation failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Validate market readiness - relaxed validation
  const isMarketReady = (market: any) => {
    return market && 
           market.isActive && 
           market.address
    // Removed totalSupply > 0 requirement to allow new markets
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

  // Effects - simplified like SwapInterface
  useEffect(() => {
    if (isConnected && userAddress) {
      loadMarkets()
      loadProtocolStats()
      loadBalances() // Load balances when connected
    }
  }, [isConnected, userAddress])

  // Load user data when markets change
  useEffect(() => {
    if (isConnected && userAddress && markets.length > 0) {
      loadUserPositions()
    }
  }, [markets.length, isConnected, userAddress])

  // Check if owner when connected
  useEffect(() => {
    if (isConnected && userAddress) {
      checkIfOwner()
    }
  }, [isConnected, userAddress, checkIfOwner])

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
          // Calculate borrow capacity based on collateral and market conditions
          const collateralValue = parseFloat(userTotals.collateral)
          const currentBorrow = parseFloat(userTotals.borrow)
          const borrowCapacity = collateralValue * 0.8 // 80% of collateral
          const availableToBorrow = Math.max(0, borrowCapacity - currentBorrow)
          
          // Also consider market liquidity (total supply in the market)
          const marketLiquidity = parseFloat(market?.totalSupply || '0')
          const maxFromMarket = marketLiquidity * 0.8 // Don't borrow more than 80% of market liquidity
          
          // Return the smaller of the two limits
          return Math.min(availableToBorrow, maxFromMarket).toFixed(6)
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
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    loadBalances()
                    toast.success('Balances refreshed!')
                  }}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                  title="Refresh balances"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
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
                  <span className="text-white font-semibold">
                    {parseFloat(balance).toFixed(4)} {selectedToken}
                  </span>
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
                
                {/* Show available amount for borrow */}
                {activeModal === 'borrow' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Available to Borrow</span>
                      <span className="text-blue-400 font-semibold">
                        {getMaxAmount()} {selectedToken}
                      </span>
                    </div>
                    
                    {/* Debug info for borrow capacity */}
                    <div className="text-xs text-slate-500 bg-slate-900/50 p-2 rounded-lg">
                      <div className="font-medium text-slate-400 mb-1">Borrow Capacity Breakdown:</div>
                      <div>Your Collateral: ${parseFloat(userTotals.collateral).toFixed(2)}</div>
                      <div>Current Borrow: ${parseFloat(userTotals.borrow).toFixed(2)}</div>
                      <div>Borrow Capacity (80%): ${(parseFloat(userTotals.collateral) * 0.8).toFixed(2)}</div>
                      <div>Market Liquidity: {parseFloat(market?.totalSupply || '0').toFixed(4)} {selectedToken}</div>
                      <div>Max from Market: {(parseFloat(market?.totalSupply || '0') * 0.8).toFixed(4)} {selectedToken}</div>
                    </div>
                  </>
                )}
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

  // Admin functions
  const whitelistToken = async (tokenAddress: string) => {
    if (!signer || !userAddress) {
      toast.error('Wallet not connected')
      return
    }

    try {
      setLoading(true)
      const lendingContract = new ethers.Contract(SomniaLendingFixedContract.address, LENDING_ABI, signer)
      
      toast.loading('Whitelisting token...')
      const tx = await lendingContract.whitelistToken(tokenAddress)
      await tx.wait()
      toast.dismiss()
      toast.success('Token whitelisted successfully!')
      
      // Reload markets to reflect changes
      setTimeout(() => {
        loadMarkets()
      }, 1000)
      
    } catch (error: any) {
      console.error('Failed to whitelist token:', error)
      toast.dismiss()
      
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction cancelled by user')
      } else if (error.reason) {
        toast.error(`Whitelist failed: ${error.reason}`)
      } else if (error.message) {
        toast.error(`Whitelist failed: ${error.message}`)
      } else {
        toast.error('Whitelist failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const addInitialLiquidity = async (tokenAddress: string, amount: string) => {
    if (!signer || !userAddress) {
      toast.error('Wallet not connected')
      return
    }

    try {
      setLoading(true)
      const lendingContract = new ethers.Contract(SomniaLendingFixedContract.address, LENDING_ABI, signer)
      
      // First whitelist the token if not already whitelisted
      const whitelisted = await isTokenWhitelisted(tokenAddress)
      if (!whitelisted) {
        toast.loading('Whitelisting token first...')
        const whitelistTx = await lendingContract.whitelistToken(tokenAddress)
        await whitelistTx.wait()
        toast.dismiss()
        toast.success('Token whitelisted!')
      }
      
      // Add initial liquidity
      toast.loading('Adding initial liquidity...')
      const amountWei = ethers.parseUnits(amount, 18) // Assuming 18 decimals
      const tx = await lendingContract.addInitialLiquidity(tokenAddress, amountWei)
      await tx.wait()
      toast.dismiss()
      toast.success('Initial liquidity added successfully!')
      
      // Reload markets
      setTimeout(() => {
        loadMarkets()
        loadProtocolStats()
      }, 1000)
      
    } catch (error: any) {
      console.error('Failed to add initial liquidity:', error)
      toast.dismiss()
      
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction cancelled by user')
      } else if (error.reason) {
        toast.error(`Add liquidity failed: ${error.reason}`)
      } else if (error.message) {
        toast.error(`Add liquidity failed: ${error.message}`)
      } else {
        toast.error('Add liquidity failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
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
                <div className="flex items-center space-x-2">
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
                  
                  {/* Debug Button */}
                  <button
                    onClick={async () => {
                      if (!provider) {
                        toast.error('Provider not connected')
                        return
                      }
                      
                      try {
                        const lendingContract = new ethers.Contract(SomniaLendingFixedContract.address, LENDING_ABI, provider)
                        
                        // Check contract state
                        const allMarkets = await lendingContract.getAllMarkets()
                        const protocolTotals = await lendingContract.getProtocolTotals()
                        
                        console.log('=== DEBUG INFO ===')
                        console.log('Contract Address:', SomniaLendingFixedContract.address)
                        console.log('All Markets:', allMarkets)
                        console.log('Protocol Totals:', protocolTotals)
                        
                        if (allMarkets.length > 0) {
                          const firstMarket = await lendingContract.getMarket(allMarkets[0])
                          console.log('First Market Info:', firstMarket)
                          
                          const tokenContract = new ethers.Contract(allMarkets[0], ERC20_ABI, provider)
                          const symbol = await tokenContract.symbol()
                          const decimals = await tokenContract.decimals()
                          console.log('First Market Token:', { symbol, decimals, address: allMarkets[0] })
                        }
                        
                        toast.success(`Debug info logged. Found ${allMarkets.length} markets. Check console.`)
                      } catch (error) {
                        console.error('Debug failed:', error)
                        toast.error('Debug failed. Check console for error.')
                      }
                    }}
                    className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors text-xs"
                  >
                    <Info className="w-4 h-4" />
                    <span>Debug</span>
                  </button>
                </div>
              </div>
              
              {markets.length === 0 ? (
                <div className="text-center py-12">
                  <PieChart className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Markets Available</h3>
                  <p className="text-slate-400 mb-6">Lending markets need to be created before you can start lending or borrowing.</p>
                  
                  {/* Market Creation Interface */}
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                      <h4 className="text-sm font-medium text-white mb-3">Create Lending Market</h4>
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
                                  createLendingMarket(tokenData.address)
                                }
                              }
                            }}
                            className="w-full bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
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
                          <p className="font-medium text-slate-300 mb-1">Default Market Settings:</p>
                          <ul className="space-y-1">
                            <li>• Supply Rate: 5% APY</li>
                            <li>• Borrow Rate: 7% APY</li>
                            <li>• Collateral Factor: 80%</li>
                            <li>• Exchange Rate: 1.0</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-500">
                      💡 <strong>Note:</strong> Creating a market requires admin privileges. If you're not an admin, 
                      contact the protocol team to create markets for you.
                    </p>
                  </div>
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
                            {/* Market Status Indicator */}
                            <div className="flex items-center space-x-2 mt-1">
                              <div className={`w-2 h-2 rounded-full ${
                                isMarketReady(market) ? 'bg-green-400' : 'bg-yellow-400'
                              }`}></div>
                              <span className={`text-xs ${
                                isMarketReady(market) ? 'text-green-400' : 'text-yellow-400'
                              }`}>
                                {isMarketReady(market) ? 'Ready' : 'Initializing'}
                              </span>
                              {!isMarketReady(market) && (
                                <span className="text-xs text-slate-500">
                                  {!market.isActive ? 'Market not active' : 'Setting up'}
                                </span>
                              )}
                              {isMarketReady(market) && parseFloat(market.totalSupply) === 0 && (
                                <span className="text-xs text-blue-400">
                                  New market - be first to supply!
                                </span>
                              )}
                            </div>
                            
                            {/* Whitelist Status */}
                            <div className="flex items-center space-x-2 mt-1">
                              <div className={`w-2 h-2 rounded-full ${
                                market.whitelisted ? 'bg-green-400' : 'bg-red-400'
                              }`}></div>
                              <span className={`text-xs ${
                                market.whitelisted ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {market.whitelisted ? 'Whitelisted' : 'Not Whitelisted'}
                              </span>
                            </div>
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
                            disabled={!isMarketReady(market)}
                            className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-colors ${
                              isMarketReady(market)
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <ArrowUpRight className="w-4 h-4" />
                            <span>{isMarketReady(market) ? 
                              (parseFloat(market.totalSupply) === 0 ? 'Be First to Supply!' : 'Supply') : 
                              'Market Not Ready'}</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedToken(market.token)
                              setActiveModal('borrow')
                              setActionAmount('')
                            }}
                            disabled={!isMarketReady(market) || parseFloat(market.totalSupply) === 0}
                            className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-colors ${
                              isMarketReady(market) && parseFloat(market.totalSupply) > 0
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <ArrowDownLeft className="w-4 h-4" />
                            <span>{isMarketReady(market) ? 
                              (parseFloat(market.totalSupply) === 0 ? 'No Liquidity Yet' : 'Borrow') : 
                              'Market Not Ready'}</span>
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
                {markets.length === 0 ? (
                  <>
                    <button
                      onClick={() => {
                        if (Object.keys(DEFI_TOKENS).length > 0) {
                          const firstToken = Object.values(DEFI_TOKENS)[0]
                          createLendingMarket(firstToken.address)
                        }
                      }}
                      disabled={Object.keys(DEFI_TOKENS).length === 0}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>{Object.keys(DEFI_TOKENS).length === 0 ? 'No Tokens Available' : 'Create First Market'}</span>
                    </button>
                    
                    {/* Admin Setup Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          if (Object.keys(DEFI_TOKENS).length > 0) {
                            const firstToken = Object.values(DEFI_TOKENS)[0]
                            whitelistToken(firstToken.address)
                          }
                        }}
                        disabled={Object.keys(DEFI_TOKENS).length === 0}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 text-sm"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Whitelist Token</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          if (Object.keys(DEFI_TOKENS).length > 0) {
                            const firstToken = Object.values(DEFI_TOKENS)[0]
                            addInitialLiquidity(firstToken.address, '1000') // Add 1000 tokens as initial liquidity
                          }
                        }}
                        disabled={Object.keys(DEFI_TOKENS).length === 0}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 text-sm"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Add Initial Liquidity</span>
                      </button>
                    </div>
                    
                    {/* Debug Button */}
                    <button
                      onClick={async () => {
                        if (!provider) {
                          toast.error('Provider not connected')
                          return
                        }
                        
                        try {
                          const lendingContract = new ethers.Contract(SomniaLendingFixedContract.address, LENDING_ABI, provider)
                          
                          // Check contract state
                          const allMarkets = await lendingContract.getAllMarkets()
                          const protocolTotals = await lendingContract.getProtocolTotals()
                          
                          console.log('=== LENDING DEBUG INFO ===')
                          console.log('Contract Address:', SomniaLendingFixedContract.address)
                          console.log('All Markets:', allMarkets)
                          console.log('Protocol Totals:', protocolTotals)
                          
                          if (allMarkets.length > 0) {
                            const firstMarket = await lendingContract.getMarket(allMarkets[0])
                            console.log('First Market Info:', firstMarket)
                            
                            const tokenContract = new ethers.Contract(allMarkets[0], ERC20_ABI, provider)
                            const symbol = await tokenContract.symbol()
                            const decimals = await tokenContract.decimals()
                            console.log('First Market Token:', { symbol, decimals, address: allMarkets[0] })
                            
                            // Check if token is whitelisted
                            const whitelisted = await lendingContract.whitelistedTokens(allMarkets[0])
                            console.log('Token whitelisted:', whitelisted)
                          }
                          
                          toast.success(`Debug info logged. Found ${allMarkets.length} markets. Check console.`)
                        } catch (error) {
                          console.error('Debug failed:', error)
                          toast.error('Debug failed. Check console for error.')
                        }
                      }}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Info className="w-4 h-4" />
                      <span>Debug Contract State</span>
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
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