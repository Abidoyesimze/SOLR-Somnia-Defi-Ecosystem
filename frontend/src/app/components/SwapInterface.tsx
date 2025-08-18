'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ethers } from 'ethers'
import { toast } from 'react-hot-toast'
import { 
  Plus, 
  Minus, 
  ArrowDown, 
  Settings, 
  Info, 
  AlertTriangle, 
  Loader2,
  TrendingUp, 
  ChevronDown,
  BarChart3,
  Wallet,
  RefreshCw,
  ExternalLink
} from 'lucide-react'

// Import your constants and contracts
import { DEFI_TOKENS, CONTRACTS, SOMNIA_CONFIG } from '../lib/constants'
import { SomniaAmmContract } from '../../abi'
import { useStore } from '../lib/store'

// Complete AMM Contract ABI
const AMM_ABI = [
  // View functions
  "function getAmountOut(uint256 amountIn, address tokenIn, address tokenOut) external view returns (uint256)",
  "function getPoolInfo(address token0, address token1) external view returns (tuple(address token0, address token1, uint256 reserve0, uint256 reserve1, uint256 totalSupply, uint256 fee0, uint256 fee1, address lpToken))",
  "function checkPoolExists(address token0, address token1) external view returns (bool)",
  "function getLPToken(address token0, address token1) external view returns (address)",
  "function getPoolsForToken(address token) external view returns (address[])",
  "function getStats() external view returns (uint256 totalVolume, uint256 totalFees)",
  
  // Write functions
  "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMin) external returns (uint256)",
  "function createPool(address token0, address token1) external returns (address)",
  "function addLiquidity(address token0, address token1, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min) external returns (uint256 liquidity, uint256 amount0, uint256 amount1)",
  "function removeLiquidity(address token0, address token1, uint256 liquidity, uint256 amount0Min, uint256 amount1Min) external returns (uint256 amount0, uint256 amount1)",
  
  // Events
  "event Swap(address indexed sender, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut)",
  "event PoolCreated(address indexed token0, address indexed token1, address lpToken)",
  "event LiquidityAdded(address indexed provider, address indexed token0, address indexed token1, uint256 amount0, uint256 amount1, uint256 liquidity)",
  "event LiquidityRemoved(address indexed provider, address indexed token0, address indexed token1, uint256 amount0, uint256 amount1, uint256 liquidity)"
]

// LP Token ABI
const LP_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)"
]

// ERC20 ABI
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)"
]

export default function CompleteDEXInterface() {
  const store = useStore()
  
  // Navigation state
  const [currentView, setCurrentView] = useState('swap') // 'swap', 'liquidity'
  const [liquidityTab, setLiquidityTab] = useState('add') // 'add', 'remove', 'pools'

  // Web3 state
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [userAddress, setUserAddress] = useState('')
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Common state
  const [balances, setBalances] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [slippage, setSlippage] = useState(0.5)
  const [deadline, setDeadline] = useState(20)
  const [protocolStats, setProtocolStats] = useState({
    totalVolume: '0',
    totalFees: '0',
    totalTVL: '0'
  })

  // Swap state
  const [fromToken, setFromToken] = useState('WSOM')
  const [toToken, setToToken] = useState('USDC')
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [swapping, setSwapping] = useState(false)
  const [priceImpact, setPriceImpact] = useState(0)
  const [exchangeRate, setExchangeRate] = useState('0')

  // Liquidity state
  const [token0, setToken0] = useState('WSOM')
  const [token1, setToken1] = useState('USDC')
  const [amount0, setAmount0] = useState('')
  const [amount1, setAmount1] = useState('')
  const [removePercentage, setRemovePercentage] = useState(25)
  const [poolData, setPoolData] = useState({
    reserve0: '0',
    reserve1: '0',
    userLPBalance: '0',
    totalLPSupply: '0',
    userPoolShare: '0',
    lpTokenAddress: '',
    poolExists: false,
    fee0: '0',
    fee1: '0'
  })
  const [userPools, setUserPools] = useState<Array<{
    token0: string;
    token1: string;
    userLPBalance: string;
    poolShare: string;
    reserve0: string;
    reserve1: string;
    lpTokenAddress: string;
  }>>([])

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
            
            // Get chain ID
            const network = await web3Provider.getNetwork()
            setChainId(Number(network.chainId))
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
          toast.error('Failed to initialize wallet connection')
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
      
      const network = await web3Provider.getNetwork()
      setChainId(Number(network.chainId))
      
      toast.success('Wallet connected successfully!')
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      toast.error('Failed to connect wallet')
    }
  }

  // Load user balances
  const loadBalances = useCallback(async () => {
    if (!provider || !userAddress) return
    
    try {
      const newBalances: Record<string, string> = {}
      
      for (const [symbol, token] of Object.entries(DEFI_TOKENS)) {
        if (token.address) {
          const tokenContract = new ethers.Contract(token.address, ERC20_ABI, provider)
          const balance = await tokenContract.balanceOf(userAddress)
          const decimals = await tokenContract.decimals()
          newBalances[symbol] = ethers.formatUnits(balance, decimals)
        }
      }
      
      setBalances(newBalances)
    } catch (error) {
      console.error('Failed to load balances:', error)
      toast.error('Failed to load token balances')
    }
  }, [provider, userAddress])

  // Load protocol stats
  const loadProtocolStats = useCallback(async () => {
    if (!provider) return
    
    try {
      const ammContract = new ethers.Contract(SomniaAmmContract.address, AMM_ABI, provider)
      const [totalVolume, totalFees] = await ammContract.getStats()
      
      // Calculate total TVL by summing all pools (simplified)
      let totalTVL = '0'
      
      setProtocolStats({
        totalVolume: ethers.formatEther(totalVolume),
        totalFees: ethers.formatEther(totalFees),
        totalTVL
      })
    } catch (error) {
      console.error('Failed to load protocol stats:', error)
      setProtocolStats({
        totalVolume: '0',
        totalFees: '0',
        totalTVL: '0'
      })
    }
  }, [provider])

  // Load pool data
  const loadPoolData = useCallback(async () => {
    if (!provider || !token0 || !token1) return
    
    try {
      const token0Data = DEFI_TOKENS[token0 as keyof typeof DEFI_TOKENS]
      const token1Data = DEFI_TOKENS[token1 as keyof typeof DEFI_TOKENS]
      
      if (!token0Data?.address || !token1Data?.address) return
      
      const ammContract = new ethers.Contract(SomniaAmmContract.address, AMM_ABI, provider)
      
      // Check if pool exists
      const poolExists = await ammContract.checkPoolExists(token0Data.address, token1Data.address)
      
      if (poolExists) {
        // Get pool info
        const poolInfo = await ammContract.getPoolInfo(token0Data.address, token1Data.address)
        
        // Get LP token address
        const lpTokenAddress = await ammContract.getLPToken(token0Data.address, token1Data.address)
        
        let userLPBalance = '0'
        let userPoolShare = '0'
        
        if (userAddress && lpTokenAddress) {
          const lpContract = new ethers.Contract(lpTokenAddress, LP_TOKEN_ABI, provider)
          const lpBalance = await lpContract.balanceOf(userAddress)
          const lpDecimals = await lpContract.decimals()
          userLPBalance = ethers.formatUnits(lpBalance, lpDecimals)
          
          if (poolInfo.totalSupply > 0) {
            userPoolShare = ((parseFloat(userLPBalance) / parseFloat(ethers.formatUnits(poolInfo.totalSupply, lpDecimals))) * 100).toFixed(4)
          }
        }
        
        setPoolData({
          reserve0: ethers.formatUnits(poolInfo.reserve0, token0Data.decimals || 18),
          reserve1: ethers.formatUnits(poolInfo.reserve1, token1Data.decimals || 18),
          userLPBalance,
          totalLPSupply: ethers.formatUnits(poolInfo.totalSupply, 18),
          userPoolShare,
          lpTokenAddress,
          poolExists: true,
          fee0: ethers.formatUnits(poolInfo.fee0, token0Data.decimals || 18),
          fee1: ethers.formatUnits(poolInfo.fee1, token1Data.decimals || 18)
        })
      } else {
        setPoolData(prev => ({ 
          ...prev, 
          poolExists: false,
          reserve0: '0',
          reserve1: '0',
          userLPBalance: '0',
          totalLPSupply: '0',
          userPoolShare: '0',
          lpTokenAddress: '',
          fee0: '0',
          fee1: '0'
        }))
      }
    } catch (error) {
      console.error('Failed to load pool data:', error)
      setPoolData(prev => ({ 
        ...prev, 
        poolExists: false,
        reserve0: '0',
        reserve1: '0'
      }))
    }
  }, [provider, token0, token1, userAddress])

  // Calculate swap output
  const calculateSwapOutput = useCallback(async () => {
    if (!provider || !fromAmount || parseFloat(fromAmount) <= 0 || !fromToken || !toToken) {
      setToAmount('')
      setExchangeRate('0')
      setPriceImpact(0)
      return
    }
    
    try {
      setLoading(true)
      
      const fromTokenData = DEFI_TOKENS[fromToken as keyof typeof DEFI_TOKENS]
      const toTokenData = DEFI_TOKENS[toToken as keyof typeof DEFI_TOKENS]
      
      if (!fromTokenData?.address || !toTokenData?.address) return
      
      const ammContract = new ethers.Contract(SomniaAmmContract.address, AMM_ABI, provider)
      
      // Check if pool exists
      const poolExists = await ammContract.checkPoolExists(fromTokenData.address, toTokenData.address)
      if (!poolExists) {
        setToAmount('')
        setExchangeRate('0')
        setPriceImpact(0)
        return
      }
      
      // Convert input amount to wei
      const amountInWei = ethers.parseUnits(fromAmount, fromTokenData.decimals || 18)
      
      // Get output amount
      const amountOutWei = await ammContract.getAmountOut(
        amountInWei,
        fromTokenData.address,
        toTokenData.address
      )
      
      // Convert back to readable format
      const amountOut = ethers.formatUnits(amountOutWei, toTokenData.decimals || 18)
      setToAmount(parseFloat(amountOut).toFixed(6))
      
      // Calculate exchange rate
      const rate = parseFloat(amountOut) / parseFloat(fromAmount)
      setExchangeRate(rate.toFixed(6))
      
      // Calculate price impact (simplified)
      const poolInfo = await ammContract.getPoolInfo(fromTokenData.address, toTokenData.address)
      const reserve0 = parseFloat(ethers.formatUnits(poolInfo.reserve0, fromTokenData.decimals || 18))
      const reserve1 = parseFloat(ethers.formatUnits(poolInfo.reserve1, toTokenData.decimals || 18))
      
      const currentRate = fromTokenData.address === poolInfo.token0 ? reserve1 / reserve0 : reserve0 / reserve1
      const impact = Math.abs((rate - currentRate) / currentRate * 100)
      setPriceImpact(impact)
      
    } catch (error) {
      console.error('Failed to calculate output:', error)
      setToAmount('')
      setExchangeRate('0')
      setPriceImpact(0)
      toast.error('Failed to calculate swap amount')
    } finally {
      setLoading(false)
    }
  }, [provider, fromAmount, fromToken, toToken])

  // Calculate liquidity amounts
  const handleLiquidityAmountChange = useCallback((value: string, isToken0?: boolean) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      if (isToken0) {
        setAmount0(value)
        // Only calculate the other amount if pool exists and has reserves
        if (value && parseFloat(value) > 0 && poolData.poolExists && parseFloat(poolData.reserve0) > 0 && parseFloat(poolData.reserve1) > 0) {
          const ratio = parseFloat(poolData.reserve1) / parseFloat(poolData.reserve0)
          const calculatedAmount1 = (parseFloat(value) * ratio).toFixed(6)
          setAmount1(calculatedAmount1)
        } else if (!value) {
          setAmount1('')
        }
        // If pool doesn't exist, don't auto-calculate - let user set both amounts freely
      } else {
        setAmount1(value)
        // Only calculate the other amount if pool exists and has reserves
        if (value && parseFloat(value) > 0 && poolData.poolExists && parseFloat(poolData.reserve1) > 0 && parseFloat(poolData.reserve0) > 0) {
          const ratio = parseFloat(poolData.reserve0) / parseFloat(poolData.reserve1)
          const calculatedAmount0 = (parseFloat(value) * ratio).toFixed(6)
          setAmount0(calculatedAmount0)
        } else if (!value) {
          setAmount0('')
        }
        // If pool doesn't exist, don't auto-calculate - let user set both amounts freely
      }
    }
  }, [poolData.poolExists, poolData.reserve0, poolData.reserve1])

  // Check and approve token allowance
  const checkAndApprove = async (tokenAddress: string, amount: string, decimals: number, spenderAddress: string = SomniaAmmContract.address) => {
    if (!signer || !userAddress) throw new Error('Wallet not connected')
    
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer)
    const amountWei = ethers.parseUnits(amount, decimals)
    
    // Check current allowance
    const allowance = await tokenContract.allowance(userAddress, spenderAddress)
    
    if (allowance < amountWei) {
      toast.loading('Approving token spending...')
      const approveTx = await tokenContract.approve(spenderAddress, ethers.MaxUint256)
      await approveTx.wait()
      toast.dismiss()
      toast.success('Token approved!')
    }
  }

  // Execute swap
  const executeSwap = async () => {
    if (!signer || !fromAmount || !toAmount || !fromToken || !toToken) return
    
    try {
      setSwapping(true)
      
      const fromTokenData = DEFI_TOKENS[fromToken as keyof typeof DEFI_TOKENS]
      const toTokenData = DEFI_TOKENS[toToken as keyof typeof DEFI_TOKENS]
      
      if (!fromTokenData?.address || !toTokenData?.address) {
        throw new Error('Invalid token addresses')
      }
      
      // Check and approve token
      await checkAndApprove(fromTokenData.address, fromAmount, fromTokenData.decimals || 18)
      
      // Prepare swap parameters
      const amountInWei = ethers.parseUnits(fromAmount, fromTokenData.decimals || 18)
      const amountOutWei = ethers.parseUnits(toAmount, toTokenData.decimals || 18)
      
      // Calculate minimum output with slippage
      const slippageMultiplier = (100 - slippage) / 100
      const amountOutMinWei = amountOutWei * BigInt(Math.floor(slippageMultiplier * 1000)) / BigInt(1000)
      
      // Execute swap
      const ammContract = new ethers.Contract(SomniaAmmContract.address, AMM_ABI, signer)
      
      toast.loading('Executing swap...')
      const swapTx = await ammContract.swap(
        fromTokenData.address,
        toTokenData.address,
        amountInWei,
        amountOutMinWei
      )
      
      toast.dismiss()
      toast.loading('Confirming transaction...')
      const receipt = await swapTx.wait()
      
      toast.dismiss()
      toast.success(`Successfully swapped ${fromAmount} ${fromToken} for ${toAmount} ${toToken}!`)
      
      // Reset form and reload data
      setFromAmount('')
      setToAmount('')
      loadBalances()
      loadProtocolStats()
      
    } catch (error: any) {
      console.error('Swap failed:', error)
      toast.dismiss()
      
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction cancelled by user')
      } else if (error.reason) {
        toast.error(`Swap failed: ${error.reason}`)
      } else {
        toast.error('Swap failed. Please try again.')
      }
    } finally {
      setSwapping(false)
    }
  }

  // Add liquidity
  const addLiquidity = async () => {
    if (!signer || !amount0 || !amount1 || !token0 || !token1) return
    
    try {
      setLoading(true)
      
      const token0Data = DEFI_TOKENS[token0 as keyof typeof DEFI_TOKENS]
      const token1Data = DEFI_TOKENS[token1 as keyof typeof DEFI_TOKENS]
      
      if (!token0Data?.address || !token1Data?.address) {
        throw new Error('Invalid token addresses')
      }
      
      // Check and approve both tokens
      await checkAndApprove(token0Data.address, amount0, token0Data.decimals || 18)
      await checkAndApprove(token1Data.address, amount1, token1Data.decimals || 18)
      
      // Prepare amounts
      const amount0Wei = ethers.parseUnits(amount0, token0Data.decimals || 18)
      const amount1Wei = ethers.parseUnits(amount1, token1Data.decimals || 18)
      
      // Calculate minimum amounts with slippage
      const slippageMultiplier = (100 - slippage) / 100
      const amount0MinWei = amount0Wei * BigInt(Math.floor(slippageMultiplier * 1000)) / BigInt(1000)
      const amount1MinWei = amount1Wei * BigInt(Math.floor(slippageMultiplier * 1000)) / BigInt(1000)
      
      const ammContract = new ethers.Contract(SomniaAmmContract.address, AMM_ABI, signer)
      
      // Check if pool exists, create if not
      if (!poolData.poolExists) {
        toast.loading('Creating pool...')
        const createTx = await ammContract.createPool(token0Data.address, token1Data.address)
        await createTx.wait()
        toast.dismiss()
        toast.success('Pool created!')
      }
      
      toast.loading('Adding liquidity...')
      const addTx = await ammContract.addLiquidity(
        token0Data.address,
        token1Data.address,
        amount0Wei,
        amount1Wei,
        amount0MinWei,
        amount1MinWei
      )
      
      toast.dismiss()
      toast.loading('Confirming transaction...')
      await addTx.wait()
      
      toast.dismiss()
      toast.success('Liquidity added successfully!')
      
      // Reset form and reload data
      setAmount0('')
      setAmount1('')
      loadBalances()
      loadPoolData()
      loadProtocolStats()
      
    } catch (error: any) {
      console.error('Add liquidity failed:', error)
      toast.dismiss()
      
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction cancelled by user')
      } else if (error.reason) {
        toast.error(`Add liquidity failed: ${error.reason}`)
      } else {
        toast.error('Failed to add liquidity')
      }
    } finally {
      setLoading(false)
    }
  }

  // Remove liquidity
  const removeLiquidity = async () => {
    if (!signer || removePercentage <= 0 || !token0 || !token1) return
    
    try {
      setLoading(true)
      
      const token0Data = DEFI_TOKENS[token0 as keyof typeof DEFI_TOKENS]
      const token1Data = DEFI_TOKENS[token1 as keyof typeof DEFI_TOKENS]
      
      if (!token0Data?.address || !token1Data?.address || !poolData.lpTokenAddress) {
        throw new Error('Invalid token or LP token addresses')
      }
      
      // Calculate liquidity to remove
      const liquidityToRemove = (parseFloat(poolData.userLPBalance) * removePercentage / 100).toString()
      const liquidityWei = ethers.parseUnits(liquidityToRemove, 18)
      
      // Approve LP token spending
      await checkAndApprove(poolData.lpTokenAddress, liquidityToRemove, 18)
      
      // Calculate minimum amounts (simplified)
      const amount0Expected = (parseFloat(poolData.reserve0) * removePercentage / 100).toString()
      const amount1Expected = (parseFloat(poolData.reserve1) * removePercentage / 100).toString()
      
      const slippageMultiplier = (100 - slippage) / 100
      const amount0MinWei = ethers.parseUnits((parseFloat(amount0Expected) * slippageMultiplier).toString(), token0Data.decimals || 18)
      const amount1MinWei = ethers.parseUnits((parseFloat(amount1Expected) * slippageMultiplier).toString(), token1Data.decimals || 18)
      
      const ammContract = new ethers.Contract(SomniaAmmContract.address, AMM_ABI, signer)
      
      toast.loading('Removing liquidity...')
      const removeTx = await ammContract.removeLiquidity(
        token0Data.address,
        token1Data.address,
        liquidityWei,
        amount0MinWei,
        amount1MinWei
      )
      
      toast.dismiss()
      toast.loading('Confirming transaction...')
      await removeTx.wait()
      
      toast.dismiss()
      toast.success('Liquidity removed successfully!')
      
      // Reset and reload data
      setRemovePercentage(25)
      loadBalances()
      loadPoolData()
      loadProtocolStats()
      
    } catch (error: any) {
      console.error('Remove liquidity failed:', error)
      toast.dismiss()
      
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction cancelled by user')
      } else if (error.reason) {
        toast.error(`Remove liquidity failed: ${error.reason}`)
      } else {
        toast.error('Failed to remove liquidity')
      }
    } finally {
      setLoading(false)
    }
  }

  // Load user pools
  const loadUserPools = useCallback(async () => {
    if (!provider || !userAddress) return
    
    try {
      const userPoolsList: Array<{
        token0: string;
        token1: string;
        userLPBalance: string;
        poolShare: string;
        reserve0: string;
        reserve1: string;
        lpTokenAddress: string;
      }> = []
      
      // Check all possible token combinations for user's liquidity positions
      const tokens = Object.entries(DEFI_TOKENS)
      
      for (let i = 0; i < tokens.length; i++) {
        for (let j = i + 1; j < tokens.length; j++) {
          const [symbol0, token0Data] = tokens[i]
          const [symbol1, token1Data] = tokens[j]
          
          if (!token0Data.address || !token1Data.address) continue
          
          try {
            const ammContract = new ethers.Contract(SomniaAmmContract.address, AMM_ABI, provider)
            const poolExists = await ammContract.checkPoolExists(token0Data.address, token1Data.address)
            
            if (poolExists) {
              const lpTokenAddress = await ammContract.getLPToken(token0Data.address, token1Data.address)
              const lpContract = new ethers.Contract(lpTokenAddress, LP_TOKEN_ABI, provider)
              const lpBalance = await lpContract.balanceOf(userAddress)
              
              if (lpBalance > 0) {
                const poolInfo = await ammContract.getPoolInfo(token0Data.address, token1Data.address)
                const lpDecimals = await lpContract.decimals()
                const userLPBalance = ethers.formatUnits(lpBalance, lpDecimals)
                const totalSupply = ethers.formatUnits(poolInfo.totalSupply, lpDecimals)
                const poolShare = (parseFloat(userLPBalance) / parseFloat(totalSupply)) * 100
                
                userPoolsList.push({
                  token0: symbol0,
                  token1: symbol1,
                  userLPBalance,
                  poolShare: poolShare.toFixed(4),
                  reserve0: ethers.formatUnits(poolInfo.reserve0, token0Data.decimals || 18),
                  reserve1: ethers.formatUnits(poolInfo.reserve1, token1Data.decimals || 18),
                  lpTokenAddress
                })
              }
            }
          } catch (error) {
            // Skip this pair if there's an error
            continue
          }
        }
      }
      
      setUserPools(userPoolsList)
    } catch (error) {
      console.error('Failed to load user pools:', error)
    }
  }, [provider, userAddress])

  // Effects
  useEffect(() => {
    if (isConnected && userAddress) {
      loadBalances()
      loadProtocolStats()
      loadUserPools()
    }
  }, [isConnected, userAddress, loadBalances, loadProtocolStats, loadUserPools])

  useEffect(() => {
    if (currentView === 'liquidity') {
      loadPoolData()
    }
  }, [currentView, token0, token1, loadPoolData])

  // Separate useEffect for swap calculations with better debouncing
  useEffect(() => {
    if (currentView !== 'swap' || !fromAmount || parseFloat(fromAmount) <= 0) {
      if (currentView === 'swap') {
        setToAmount('')
        setExchangeRate('0')
        setPriceImpact(0)
      }
      return
    }

    const timer = setTimeout(() => {
      calculateSwapOutput()
    }, 800) // Increased debounce time to reduce blinking
    
    return () => clearTimeout(timer)
  }, [fromAmount, fromToken, toToken, currentView, calculateSwapOutput])

  // Check if user has sufficient balance
  const hasSufficientBalance = (token: string, amount: string) => {
    if (!amount || !token) return false
    const balance = parseFloat(balances[token] || '0')
    const requiredAmount = parseFloat(amount)
    return balance >= requiredAmount
  }

  // Navigation component
  const NavigationTabs = () => (
    <div className="flex items-center space-x-1 bg-slate-800/50 p-1 rounded-2xl mb-6">
      <motion.button
        onClick={() => setCurrentView('swap')}
        className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
          currentView === 'swap'
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <ArrowDown className="w-4 h-4" />
        <span>Swap</span>
      </motion.button>
      
      <motion.button
        onClick={() => setCurrentView('liquidity')}
        className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
          currentView === 'liquidity'
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <TrendingUp className="w-4 h-4" />
        <span>Liquidity</span>
      </motion.button>
    </div>
  )

  // Token select component
  const TokenSelect = ({ 
    token, 
    onSelect, 
    label, 
    amount, 
    onAmountChange, 
    showMax = true, 
    disabled = false 
  }: {
    token: string;
    onSelect: (token: string) => void;
    label: string;
    amount: string;
    onAmountChange: (value: string, isToken0?: boolean) => void;
    showMax?: boolean;
    disabled?: boolean;
  }) => (
    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-400">{label}</span>
        {showMax && (
            <button 
            onClick={() => onAmountChange(balances[token] || '0', label.includes('A') || label.includes('From'))}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
            MAX
            </button>
        )}
          </div>
          
      <div className="flex items-center space-x-3">
        <div className="flex-1">
              <input 
            type="text"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value, label.includes('A') || label.includes('From'))}
                placeholder="0.0"
            disabled={disabled}
            className="w-full bg-transparent text-2xl font-bold text-white placeholder-slate-500 outline-none disabled:opacity-50"
          />
          <div className="text-sm text-slate-500 mt-1">
            Balance: {parseFloat(balances[token] || '0').toFixed(4)} {token}
          </div>
        </div>
        
        <select
          value={token}
          onChange={(e) => onSelect(e.target.value)}
          disabled={disabled}
          className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-xl transition-all duration-200 border border-slate-600/50 text-white font-semibold disabled:opacity-50"
        >
          {Object.entries(DEFI_TOKENS).map(([symbol, tokenData]) => (
            <option key={symbol} value={symbol}>
              {tokenData.logo} {symbol}
            </option>
          ))}
        </select>
      </div>
      
      {!hasSufficientBalance(token, amount) && amount && parseFloat(amount) > 0 && (
        <div className="text-xs text-red-400 mt-2">Insufficient balance</div>
      )}
    </div>
  )

  // Swap interface
  const SwapInterface = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <TokenSelect 
        token={fromToken}
        onSelect={setFromToken}
        label="From"
        amount={fromAmount}
        onAmountChange={(value: string) => {
          if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setFromAmount(value)
          }
        }}
      />

      <div className="flex justify-center">
        <motion.button 
          onClick={() => {
            const tempToken = fromToken
            const tempAmount = fromAmount
            setFromToken(toToken)
            setToToken(tempToken)
            setFromAmount(toAmount)
            setToAmount(tempAmount)
          }}
          className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-full transition-all duration-200 border border-slate-600/50"
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowDown className="w-5 h-5 text-slate-300" />
        </motion.button>
      </div>

      <TokenSelect 
        token={toToken}
        onSelect={setToToken}
        label="To (Estimated)"
        amount={toAmount}
        onAmountChange={() => {}}
        showMax={false}
        disabled={true}
      />

      {/* Price Impact Warning */}
      {priceImpact > 3 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
              <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-300">
              High price impact: {priceImpact.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {fromAmount && toAmount && parseFloat(fromAmount) > 0 && parseFloat(toAmount) > 0 && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-slate-800/30 rounded-xl p-4 space-y-3"
        >
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Exchange Rate</span>
            <span className="text-white font-medium">1 {fromToken} = {exchangeRate} {toToken}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Trading Fee (0.3%)</span>
            <span className="text-white font-medium">{(parseFloat(fromAmount) * 0.003).toFixed(6)} {fromToken}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Price Impact</span>
            <div className={`font-medium ${priceImpact > 3 ? 'text-yellow-400' : priceImpact > 1 ? 'text-orange-400' : 'text-green-400'}`}>
              {priceImpact.toFixed(2)}%
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Minimum Received</span>
            <span className="text-white font-medium">{(parseFloat(toAmount) * (100 - slippage) / 100).toFixed(6)} {toToken}</span>
          </div>
        </motion.div>
      )}

      {!isConnected ? (
        <motion.button
          onClick={connectWallet}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Wallet className="w-5 h-5" />
          <span>Connect Wallet</span>
        </motion.button>
      ) : (
        <motion.button
          onClick={executeSwap}
          disabled={
            !fromAmount || 
            !toAmount || 
            parseFloat(fromAmount) <= 0 || 
            !hasSufficientBalance(fromToken, fromAmount) ||
            swapping ||
            loading
          }
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {(swapping || loading) && <Loader2 className="w-5 h-5 animate-spin" />}
          <span>
            {swapping ? 'Swapping...' : 
             loading ? 'Loading...' :
             !fromAmount || !toAmount ? 'Enter Amount' : 
             !hasSufficientBalance(fromToken, fromAmount) ? 'Insufficient Balance' :
             `Swap ${fromToken} for ${toToken}`}
          </span>
        </motion.button>
      )}
    </motion.div>
  )

  // Liquidity interface tabs
  const LiquidityTabs = () => (
    <div className="flex items-center space-x-1 bg-slate-800/50 p-1 rounded-2xl mb-4">
      {[
        { id: 'add', label: 'Add', icon: Plus },
        { id: 'remove', label: 'Remove', icon: Minus },
        { id: 'pools', label: 'Pools', icon: BarChart3 }
      ].map(({ id, label, icon: Icon }) => (
        <motion.button
          key={id}
          onClick={() => setLiquidityTab(id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm ${
            liquidityTab === id
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </motion.button>
      ))}
    </div>
  )

  // Add liquidity tab
  const AddLiquidityTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {!poolData.poolExists && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <div className="text-sm text-yellow-300">
              <div className="font-medium">Pool doesn't exist</div>
              <div className="text-xs">You can set any ratio for the initial liquidity. The pool will be created when you add liquidity.</div>
            </div>
          </div>
        </div>
      )}

      {poolData.poolExists && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-blue-400" />
            <div className="text-sm text-blue-300">
              <div className="font-medium">Pool exists</div>
              <div className="text-xs">Amounts will be automatically calculated to maintain the current pool ratio.</div>
            </div>
          </div>
        </div>
      )}

      <TokenSelect 
        token={token0}
        onSelect={setToken0}
        label="Token A"
        amount={amount0}
        onAmountChange={handleLiquidityAmountChange}
      />

      <div className="flex justify-center">
        <div className="p-2 bg-slate-700/50 rounded-full border border-slate-600/50">
          <Plus className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      <TokenSelect 
        token={token1}
        onSelect={setToken1}
        label="Token B"
        amount={amount1}
        onAmountChange={handleLiquidityAmountChange}
      />

      {amount0 && amount1 && parseFloat(amount0) > 0 && parseFloat(amount1) > 0 && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-slate-800/30 rounded-xl p-4 space-y-3"
        >
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">LP Tokens to Receive</span>
            <span className="text-white font-medium">
              ~{poolData.poolExists ? 
                ((parseFloat(amount0) * parseFloat(poolData.totalLPSupply)) / parseFloat(poolData.reserve0)).toFixed(6) :
                Math.sqrt(parseFloat(amount0) * parseFloat(amount1)).toFixed(6)
              }
            </span>
          </div>
          {poolData.poolExists && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Pool Share</span>
              <span className="text-white font-medium">
                {((parseFloat(amount0) / (parseFloat(poolData.reserve0) + parseFloat(amount0))) * 100).toFixed(4)}%
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Exchange Rate</span>
            <div className="text-right">
              <div className="text-white text-xs">1 {token0} = {(parseFloat(amount1) / parseFloat(amount0)).toFixed(6)} {token1}</div>
              <div className="text-white text-xs">1 {token1} = {(parseFloat(amount0) / parseFloat(amount1)).toFixed(6)} {token0}</div>
            </div>
          </div>
        </motion.div>
      )}

      {!isConnected ? (
        <motion.button
          onClick={connectWallet}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Wallet className="w-5 h-5" />
          <span>Connect Wallet</span>
        </motion.button>
      ) : (
        <motion.button
          onClick={addLiquidity}
          disabled={
            !amount0 || 
            !amount1 || 
            parseFloat(amount0) <= 0 || 
            parseFloat(amount1) <= 0 ||
            !hasSufficientBalance(token0, amount0) ||
            !hasSufficientBalance(token1, amount1) ||
            loading
          }
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          <span>
            {loading ? 'Adding Liquidity...' : 
             !amount0 || !amount1 ? 'Enter Amounts' :
             !hasSufficientBalance(token0, amount0) || !hasSufficientBalance(token1, amount1) ? 'Insufficient Balance' :
             'Add Liquidity'}
          </span>
        </motion.button>
      )}
    </motion.div>
  )

  // Remove liquidity tab
  const RemoveLiquidityTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {parseFloat(poolData.userLPBalance) === 0 ? (
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Liquidity Position</h3>
          <p className="text-slate-400">You don't have any liquidity in this pool.</p>
        </div>
      ) : (
        <>
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Remove Liquidity</h3>
              <div className="text-sm text-slate-400">
                Balance: {parseFloat(poolData.userLPBalance).toFixed(6)} LP
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400">Amount to Remove</span>
                <span className="text-2xl font-bold text-white">{removePercentage}%</span>
              </div>
              
              <div className="relative mb-4">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={removePercentage}
                  onChange={(e) => setRemovePercentage(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map((percent) => (
                  <button
                    key={percent}
                    onClick={() => setRemovePercentage(percent)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      removePercentage === percent
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {percent}%
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{DEFI_TOKENS[token0 as keyof typeof DEFI_TOKENS]?.logo}</span>
                  <span className="font-medium text-white">{token0}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">
                    {((parseFloat(poolData.userLPBalance) * removePercentage / 100) * (parseFloat(poolData.reserve0) / parseFloat(poolData.totalLPSupply))).toFixed(6)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
              <div className="flex items-center space-x-3">
                  <span className="text-lg">{DEFI_TOKENS[token1 as keyof typeof DEFI_TOKENS]?.logo}</span>
                  <span className="font-medium text-white">{token1}</span>
              </div>
                <div className="text-right">
                  <div className="font-semibold text-white">
                    {((parseFloat(poolData.userLPBalance) * removePercentage / 100) * (parseFloat(poolData.reserve1) / parseFloat(poolData.totalLPSupply))).toFixed(6)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {!isConnected ? (
            <motion.button
              onClick={connectWallet}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Wallet className="w-5 h-5" />
              <span>Connect Wallet</span>
            </motion.button>
          ) : (
            <motion.button
              onClick={removeLiquidity}
              disabled={loading || parseFloat(poolData.userLPBalance) === 0}
              className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              <span>{loading ? 'Removing Liquidity...' : 'Remove Liquidity'}</span>
            </motion.button>
          )}
        </>
      )}
    </motion.div>
  )

  // Pools tab
  const PoolsTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Your Positions</h3>
        <button 
          onClick={loadUserPools}
          className="flex items-center space-x-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {userPools.length === 0 ? (
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Liquidity Positions</h3>
          <p className="text-slate-400">Add liquidity to a pool to start earning fees</p>
        </div>
      ) : (
        <div className="space-y-3">
          {userPools.map((pool, index) => (
            <motion.div
              key={`${pool.token0}-${pool.token1}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50"
            >
              <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                  <div className="flex items-center -space-x-1">
                    <span className="text-xl">{DEFI_TOKENS[pool.token0 as keyof typeof DEFI_TOKENS]?.logo}</span>
                    <span className="text-xl">{DEFI_TOKENS[pool.token1 as keyof typeof DEFI_TOKENS]?.logo}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">{pool.token0}/{pool.token1}</div>
                    <div className="text-xs text-slate-400">Pool Share: {pool.poolShare}%</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">{pool.token0} Balance</div>
                  <div className="font-semibold text-white">
                    {(parseFloat(pool.userLPBalance) * parseFloat(pool.reserve0) / parseFloat(poolData.totalLPSupply)).toFixed(6)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">{pool.token1} Balance</div>
                  <div className="font-semibold text-white">
                    {(parseFloat(pool.userLPBalance) * parseFloat(pool.reserve1) / parseFloat(poolData.totalLPSupply)).toFixed(6)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setToken0(pool.token0)
                    setToken1(pool.token1)
                    setLiquidityTab('add')
                  }}
                  className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  Add More
                </button>
                <button
                  onClick={() => {
                    setToken0(pool.token0)
                    setToken1(pool.token1)
                    setLiquidityTab('remove')
                  }}
                  className="py-2 px-4 border border-slate-600 hover:border-slate-500 text-white rounded-lg font-medium transition-colors"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )

  return (
    <div className="max-w-lg mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Somnia DEX
            </h1>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-700/50">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-white font-medium">
                    {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                  </span>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="flex items-center space-x-2 bg-slate-800/50 hover:bg-slate-700/50 px-3 py-2 rounded-xl border border-slate-700/50 transition-colors"
                >
                  <Wallet className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Connect</span>
                </button>
              )}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-slate-700/50 rounded-xl transition-colors"
              >
                <Settings className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

          <NavigationTabs />
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 py-4 bg-slate-800/30 border-b border-slate-700/30"
            >
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-400 mb-2 block">Slippage Tolerance</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={slippage}
                      onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
                      step="0.1"
                      min="0.1"
                      max="50"
                      className="flex-1 bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <span className="text-white">%</span>
                  </div>
                  <div className="flex space-x-2 mt-2">
                    {[0.1, 0.5, 1.0].map((value) => (
                      <button
                        key={value}
                        onClick={() => setSlippage(value)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          slippage === value 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {value}%
                      </button>
                    ))}
                  </div>
                </div>
                {currentView === 'liquidity' && (
                  <div>
                    <label className="text-sm font-medium text-slate-400 mb-2 block">Transaction Deadline</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={deadline}
                        onChange={(e) => setDeadline(parseInt(e.target.value) || 20)}
                        min="1"
                        max="180"
                        className="flex-1 bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                      <span className="text-white">min</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {currentView === 'swap' && <SwapInterface />}
            {currentView === 'liquidity' && (
              <div className="space-y-4">
                <LiquidityTabs />
                <AnimatePresence mode="wait">
                  {liquidityTab === 'add' && <AddLiquidityTab />}
                  {liquidityTab === 'remove' && <RemoveLiquidityTab />}
                  {liquidityTab === 'pools' && <PoolsTab />}
                </AnimatePresence>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Info Section */}
        <div className="p-6 pt-0">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">
                  {currentView === 'swap' ? 'Instant Token Swaps' : 'Liquidity Provider Rewards'}
                </p>
                <p>
                  {currentView === 'swap' 
                    ? 'Trade tokens instantly with minimal slippage and low fees on Somnia\'s high-performance blockchain.' 
                    : 'Earn 0.20% of all trades proportional to your share of the pool. Fees are automatically compounded into your position.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {currentView === 'swap' && protocolStats && (
          <div className="p-6 pt-0">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-slate-800/30 rounded-xl">
                <div className="text-lg font-bold text-white">
                  {parseFloat(protocolStats.totalVolume) > 0 ? `$${parseFloat(protocolStats.totalVolume).toFixed(1)}M` : 'No Data'}
                </div>
                <div className="text-xs text-slate-400">24h Volume</div>
              </div>
              <div className="text-center p-3 bg-slate-800/30 rounded-xl">
                <div className="text-lg font-bold text-white">
                  {parseFloat(protocolStats.totalTVL || '0') > 0 ? `$${parseFloat(protocolStats.totalTVL || '0').toFixed(1)}M` : 'No Data'}
                </div>
                <div className="text-xs text-slate-400">Total TVL</div>
              </div>
              <div className="text-center p-3 bg-slate-800/30 rounded-xl">
                <div className="text-lg font-bold text-white">0.3%</div>
                <div className="text-xs text-slate-400">Trading Fee</div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: 2px solid #1e293b;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
          transition: all 0.2s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: 2px solid #1e293b;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }
        
        .slider::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(90deg, #1e293b 0%, #3b82f6 var(--percentage, 25%), #1e293b var(--percentage, 25%));
        }
      `}</style>
    </div>
  )
}