'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowUpDown, 
  Settings, 
  Info, 
  Zap, 
  TrendingUp, 
  Clock,
  ChevronDown,
  X,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { TOKENS, CONTRACTS } from '../lib/constants'
import { useSolrStore } from '../lib/store'
import { useAccount } from 'wagmi'
import { useTokenBalance } from '../lib/hooks/useTokenBalance'
import { formatNumber, formatCurrency, formatPercentage } from '../lib/utils/format'
import { SwapRoute } from '../lib/types'

const TokenSelector = ({ 
  selectedToken, 
  onTokenSelect, 
  otherToken, 
  label, 
  balance, 
  onClose 
}: {
  selectedToken: string
  onTokenSelect: (token: string) => void
  otherToken: string
  label: string
  balance: string
  onClose: () => void
}) => {
  const availableTokens = Object.keys(TOKENS).filter(symbol => symbol !== otherToken)
  
  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="bg-gray-800 rounded-2xl p-6 m-4 w-full max-w-md border border-gray-700"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Select Token</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-2">
          {availableTokens.map(symbol => {
            const token = TOKENS[symbol as keyof typeof TOKENS]
            return (
              <button
                key={symbol}
                onClick={() => {
                  onTokenSelect(symbol)
                  onClose()
                }}
                className="w-full flex items-center space-x-4 p-4 hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${token.color} rounded-full flex items-center justify-center text-white font-bold`}>
                  {symbol[0]}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{token.symbol}</div>
                  <div className="text-sm text-gray-400">{token.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{balance}</div>
                  <div className="text-sm text-gray-400">{formatCurrency(parseFloat(balance.replace(',', '')) * token.price)}</div>
                </div>
              </button>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}

const RouteDisplay = ({ route }: { route: SwapRoute | null }) => {
  if (!route) return null
  
  return (
    <motion.div 
      className="bg-blue-900/10 border border-blue-500/30 rounded-xl p-4 mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">Best Route Found</span>
        <span className="text-green-400 text-sm font-medium flex items-center">
          <TrendingUp className="w-4 h-4 mr-1" />
          {route.savingsPercentage}% better
        </span>
      </div>
      
      {/* Route Path */}
      <div className="flex items-center space-x-2 mb-3">
        {route.path.map((token: string, index: number) => (
          <React.Fragment key={index}>
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 bg-gradient-to-br ${TOKENS[token as keyof typeof TOKENS].color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                {token[0]}
              </div>
              <span className="text-sm font-medium">{token}</span>
            </div>
            {index < route.path.length - 1 && (
              <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded relative">
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-[4px] border-l-purple-500 border-t-[2px] border-t-transparent border-b-[2px] border-b-transparent"></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Route Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-400">Est. Output:</span>
          <div className="font-medium">{route.outputAmount}</div>
        </div>
        <div>
          <span className="text-gray-400">You Save:</span>
          <div className="font-medium text-green-400">+{route.savings}</div>
        </div>
        <div>
          <span className="text-gray-400">Price Impact:</span>
          <div className={`font-medium ${route.priceImpact > 1 ? 'text-red-400' : 'text-green-400'}`}>
            {formatPercentage(route.priceImpact)}
          </div>
        </div>
        <div>
          <span className="text-gray-400">Est. Gas:</span>
          <div className="font-medium">{route.gasEstimate} SOM</div>
        </div>
      </div>
    </motion.div>
  )
}

const SwapInterface = () => {
  const { 
    fromToken, 
    toToken, 
    fromAmount, 
    toAmount, 
    slippage, 
    route,
    isLoading,
    isSwapping,
    setFromToken,
    setToToken,
    setFromAmount,
    setToAmount,
    setSlippage,
    setRoute,
    setLoading,
    setSwapping,
    swapTokens,
    resetSwap
  } = useSolrStore()
  
  const { isConnected } = useAccount()
  const fromBalance = useTokenBalance(fromToken)
  const toBalance = useTokenBalance(toToken)
  
  const [showFromSelector, setShowFromSelector] = useState(false)
  const [showToSelector, setShowToSelector] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [customSlippage, setCustomSlippage] = useState('')
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Mock route calculation
  const calculateRoute = useCallback(async (from: string, to: string, amount: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      setRoute(null)
      setToAmount('')
      return
    }
    
    setLoading(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Mock route calculation
    const inputAmount = parseFloat(amount)
    const fromPrice = TOKENS[from as keyof typeof TOKENS].price
    const toPrice = TOKENS[to as keyof typeof TOKENS].price
    
    // Direct swap simulation
    const directOutput = (inputAmount * fromPrice) / toPrice
    
    // SOLR optimized route (2-3% better)
    const optimizedMultiplier = 1 + (Math.random() * 0.03 + 0.015) // 1.5-4.5% improvement
    const optimizedOutput = directOutput * optimizedMultiplier
    const savings = optimizedOutput - directOutput
    const savingsPercentage = ((optimizedOutput - directOutput) / directOutput) * 100
    
    const mockRoute = {
      path: from === 'WSOM' && to === 'USDC' ? ['WSOM', 'WETH', 'USDC'] : [from, to],
      pools: ['Pool1', 'Pool2'],
      inputAmount: amount,
      outputAmount: optimizedOutput.toFixed(6),
      priceImpact: Math.random() * 2, // 0-2% price impact
      fees: '0.3',
      gasEstimate: '0.002',
      savings: savings.toFixed(6),
      savingsPercentage: savingsPercentage
    }
    
    setRoute(mockRoute)
    setToAmount(optimizedOutput.toFixed(6))
    setLoading(false)
    setLastRefresh(new Date())
  }, [setRoute, setToAmount, setLoading])

  // Auto-refresh timer
  useEffect(() => {
    if (!autoRefresh || !fromAmount || !fromToken || !toToken) return

    const interval = setInterval(() => {
      if (fromAmount && fromToken && toToken) {
        calculateRoute(fromToken, toToken, fromAmount)
      }
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, fromAmount, fromToken, toToken, calculateRoute])

  // Auto-calculate route when inputs change
  useEffect(() => {
    if (fromAmount && fromToken && toToken) {
      const debounceTimer = setTimeout(() => {
        calculateRoute(fromToken, toToken, fromAmount)
      }, 500)
      
      return () => clearTimeout(debounceTimer)
    } else {
      setRoute(null)
      setToAmount('')
    }
  }, [fromAmount, fromToken, toToken, calculateRoute, setRoute, setToAmount])

  const handleSwap = async () => {
    if (!isConnected) {
      // Show a message to connect wallet first
      toast.error('Please connect your wallet first')
      return
    }
    
    if (!route) {
      toast.error('Please enter an amount to swap')
      return
    }
    
    setSwapping(true)
    
    try {
      // Mock swap execution
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(
        <div>
          <div className="font-medium">Swap Successful!</div>
          <div className="text-sm">You saved {route.savings} {toToken}</div>
        </div>
      )
      
      resetSwap()
    } catch (error) {
      toast.error('Swap failed. Please try again.')
    } finally {
      setSwapping(false)
    }
  }

  const handleMaxAmount = () => {
    const balance = parseFloat(fromBalance.formattedBalance)
    if (balance > 0) {
      setFromAmount(balance.toString())
    }
  }

  const handleSlippageChange = (value: number) => {
    setSlippage(value)
    setCustomSlippage('')
    setShowSettings(false)
  }

  const handleCustomSlippage = (value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0 && numValue <= 50) {
      setSlippage(numValue)
      setCustomSlippage(value)
    }
  }

  const isInsufficientBalance = fromAmount && parseFloat(fromAmount) > parseFloat(fromBalance.formattedBalance)
  const canSwap = fromAmount && toAmount && route && !isInsufficientBalance && !isLoading

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Swap Card */}
      <motion.div 
        className="gradient-border card-glow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="gradient-border-inner p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Swap</h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => {
                  if (fromAmount && fromToken && toToken) {
                    calculateRoute(fromToken, toToken, fromAmount)
                  }
                }}
                disabled={!fromAmount || !fromToken || !toToken || isLoading}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh route"
              >
                <motion.div
                  animate={{ rotate: isLoading ? 360 : 0 }}
                  transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
                >
                  <RefreshCw className="w-5 h-5" />
                </motion.div>
              </button>
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* From Token */}
          <div className="swap-section mb-3 relative">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-400">From</span>
              <span className="text-sm text-gray-400">
                Balance: <span className="balance-amount">{fromBalance.formattedBalance}</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <input 
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="swap-input"
                step="any"
              />
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleMaxAmount}
                  className="max-button"
                >
                  MAX
                </button>
                <button 
                  onClick={() => setShowFromSelector(true)}
                  className="token-selector"
                >
                  <div className="token-icon bg-gradient-to-br from-orange-400 to-orange-600">
                    {fromToken[0]}
                  </div>
                  <span className="token-symbol">{fromToken}</span>
                  <ChevronDown className="chevron" />
                </button>
              </div>
            </div>
            <div className="text-right text-sm text-gray-400 mt-2">
              {fromAmount && `~${formatCurrency(parseFloat(fromAmount) * TOKENS[fromToken as keyof typeof TOKENS].price)}`}
            </div>
            
            {isInsufficientBalance && (
              <div className="text-red-400 text-sm mt-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                Insufficient balance
              </div>
            )}
          </div>
          
          {/* Swap Direction Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <motion.button 
              onClick={swapTokens}
              className="bg-gray-800 hover:bg-gray-700 border-4 border-gray-900 rounded-xl p-2 transition-all duration-200"
              whileHover={{ rotate: 180 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowUpDown className="w-5 h-5" />
            </motion.button>
          </div>
          
          {/* To Token */}
          <div className="swap-section mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-400">To</span>
              <span className="text-sm text-gray-400">
                Balance: <span className="balance-amount">{toBalance.formattedBalance}</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <input 
                type="number"
                placeholder="0.0"
                value={toAmount}
                readOnly
                className="swap-input text-gray-400"
              />
              <button 
                onClick={() => setShowToSelector(true)}
                className="token-selector"
              >
                <div className="token-icon bg-gradient-to-br from-blue-400 to-blue-600">
                  {toToken[0]}
                </div>
                <span className="token-symbol">{toToken}</span>
                <ChevronDown className="chevron" />
              </button>
            </div>
            <div className="text-right text-sm text-gray-400 mt-2">
              {toAmount && `~${formatCurrency(parseFloat(toAmount) * TOKENS[toToken as keyof typeof TOKENS].price)}`}
            </div>
          </div>
          
          {/* Loading State */}
          {isLoading && (
            <div className="bg-blue-900/10 border border-blue-500/30 rounded-xl p-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-blue-400">Finding best route...</span>
              </div>
            </div>
          )}
          
          {/* Route Display */}
          <RouteDisplay route={route} />
          
          {/* Last Updated Info */}
          {route && (
            <div className="text-xs text-gray-500 text-center mb-4">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          )}
          
          {/* Swap Button */}
          <motion.button
            onClick={handleSwap}
            disabled={!canSwap || isSwapping}
            className="w-full btn-primary py-4 text-lg font-semibold"
            whileTap={{ scale: 0.98 }}
          >
            {!isConnected ? (
              'Connect Wallet'
            ) : isSwapping ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Swapping...</span>
              </div>
            ) : isInsufficientBalance ? (
              'Insufficient Balance'
            ) : !fromAmount ? (
              'Enter Amount'
            ) : !route ? (
              'Select Tokens'
            ) : (
              `Swap ${fromToken} → ${toToken}`
            )}
          </motion.button>
          
          {/* Swap Details */}
          {route && (
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Slippage Tolerance:</span>
                <span>{slippage}%</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Minimum Received:</span>
                <span>{(parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6)} {toToken}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Network Fee:</span>
                <span>~{route.gasEstimate} SOM</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Recent Transactions */}
      <motion.div 
        className="mt-6 bg-gray-800/30 rounded-xl p-4 border border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h3 className="font-medium mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { from: 'WSOM', to: 'USDC', amount: '500', saved: '12.3', time: '2 min ago', status: 'success' },
            { from: 'WETH', to: 'DAI', amount: '1.5', saved: '5.7', time: '1 hour ago', status: 'success' },
            { from: 'USDC', to: 'WSOM', amount: '1000', saved: '18.9', time: '3 hours ago', status: 'success' }
          ].map((tx, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <div className={`w-6 h-6 bg-gradient-to-br ${TOKENS[tx.from as keyof typeof TOKENS].color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                    {tx.from[0]}
                  </div>
                  <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  <div className={`w-6 h-6 bg-gradient-to-br ${TOKENS[tx.to as keyof typeof TOKENS].color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                    {tx.to[0]}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">{tx.amount} {tx.from} → {tx.to}</div>
                  <div className="text-xs text-green-400">Saved {tx.saved} {tx.to}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <ExternalLink className="w-3 h-3 text-gray-400 cursor-pointer hover:text-white" />
                </div>
                <div className="text-xs text-gray-400">{tx.time}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Token Selector Modals */}
      <AnimatePresence>
        {showFromSelector && (
          <TokenSelector
            selectedToken={fromToken}
            onTokenSelect={setFromToken}
            otherToken={toToken}
            label="From"
            balance={fromBalance.formattedBalance}
            onClose={() => setShowFromSelector(false)}
          />
        )}
        
        {showToSelector && (
          <TokenSelector
            selectedToken={toToken}
            onTokenSelect={setToToken}
            otherToken={fromToken}
            label="To"
            balance={toBalance.formattedBalance}
            onClose={() => setShowToSelector(false)}
          />
        )}
        
        {/* Settings Modal */}
        {showSettings && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
          >
            <motion.div 
              className="bg-gray-800 rounded-2xl p-6 m-4 w-full max-w-md border border-gray-700"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Swap Settings</h3>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Slippage Tolerance</label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[0.1, 0.5, 1.0, 3.0].map(value => (
                    <button
                      key={value}
                      onClick={() => handleSlippageChange(value)}
                      className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                        slippage === value 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Custom"
                    value={customSlippage}
                    onChange={(e) => {
                      setCustomSlippage(e.target.value)
                      handleCustomSlippage(e.target.value)
                    }}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                    min="0"
                    max="50"
                    step="0.1"
                  />
                  <span className="text-sm text-gray-400">%</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-400">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="w-4 h-4" />
                  <span>Higher slippage = faster execution</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4" />
                  <span>Lower slippage = better prices</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SwapInterface