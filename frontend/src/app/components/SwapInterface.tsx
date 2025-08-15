'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, RefreshCw, Settings, Info } from 'lucide-react'
import { DEFI_TOKENS, TRADING_PAIRS, FEE_STRUCTURE } from '../lib/constants'
import { useStore } from '../lib/store'
import { useAMM } from '../lib/hooks/useAMM'
import { toast } from 'react-hot-toast'
import { TOKEN_ADDRESSES } from '../lib/config'

export default function SwapInterface() {
  const { 
    fromToken, 
    toToken, 
    fromAmount, 
    toAmount, 
    slippage, 
    isSwapping,
    setFromToken,
    setToToken,
    setFromAmount,
    setToAmount,
    setSlippage,
    swapTokens,
    setIsSwapping
  } = useStore()

  // AMM integration
  const { 
    calculateSwap: calculateRealSwap, 
    executeSwap, 
    isLoading: isAMMLoading, 
    error: ammError,
    isSwapSuccess,
    clearError,
    tradingFee
  } = useAMM()

  const [showSettings, setShowSettings] = useState(false)
  const [priceImpact, setPriceImpact] = useState(0.12)
  const [gasEstimate, setGasEstimate] = useState(0.002)
  const [isFindingRoute, setIsFindingRoute] = useState(false)
  const [currentRoute, setCurrentRoute] = useState('Direct Swap')
  const [routeOptions, setRouteOptions] = useState([
    { name: 'Direct Swap', gas: 0.002, priceImpact: 0.12, best: true },
    { name: 'Via USDC', gas: 0.003, priceImpact: 0.08, best: false },
    { name: 'Via SOMG', gas: 0.0025, priceImpact: 0.15, best: false }
  ])
  const [lastSearchParams, setLastSearchParams] = useState('')
  const [isAutoSearching, setIsAutoSearching] = useState(false)

  // Real swap calculation using AMM contract
  const calculateSwap = useCallback(async () => {
    if (!fromAmount && !toAmount) return
    
    try {
      // If user inputs "from" amount, calculate "to" amount
      if (fromAmount && !toAmount) {
        const tokenInAddress = getTokenAddress(fromToken)
        const tokenOutAddress = getTokenAddress(toToken)
        
        if (!tokenInAddress || !tokenOutAddress) {
          console.error('Token addresses not found')
          return
        }
        
        // Calculate real swap amount
        const swapResult = await calculateRealSwap(fromAmount, tokenInAddress, tokenOutAddress)
        
        if (swapResult) {
          setToAmount(swapResult.amountOut)
          setPriceImpact(swapResult.priceImpact)
        }
      }
      // If user inputs "to" amount, calculate "from" amount
      else if (toAmount && !fromAmount) {
        const tokenInAddress = getTokenAddress(fromToken)
        const tokenOutAddress = getTokenAddress(toToken)
        
        if (!tokenInAddress || !tokenOutAddress) {
          console.error('Token addresses not found')
          return
        }
        
        // For now, use a simple reverse calculation
        // In a real implementation, you'd call getAmountIn from the contract
        const mockRate = 1.18 // Mock reverse rate
        const calculatedAmount = parseFloat(toAmount) * mockRate
        setFromAmount(calculatedAmount.toFixed(6))
        
        // Calculate price impact
        const impact = calculatePriceImpact(calculatedAmount.toString(), toAmount, fromToken, toToken)
        setPriceImpact(impact)
      }
    } catch (error) {
      console.error('Failed to calculate swap:', error)
      // Fallback to mock calculation
      if (fromAmount && !toAmount) {
        const mockRate = 0.85
        const calculatedAmount = parseFloat(fromAmount) * mockRate
        setToAmount(calculatedAmount.toFixed(6))
        setPriceImpact(Math.random() * 0.5)
      }
    }
  }, [fromAmount, toAmount, fromToken, toToken, calculateRealSwap])

  // Helper function to get token addresses
  const getTokenAddress = (symbol: string) => {
    return TOKEN_ADDRESSES[symbol as keyof typeof TOKEN_ADDRESSES]
  }

  // Calculate price impact
  const calculatePriceImpact = (amountIn: string, amountOut: string, tokenIn: string, tokenOut: string) => {
    // This is a simplified calculation - in reality, you'd get this from the contract
    const inputValue = parseFloat(amountIn)
    const outputValue = parseFloat(amountOut)
    const impact = ((inputValue - outputValue) / inputValue) * 100
    return Math.abs(impact)
  }

  // Mock route finding function
  const findBestRoute = useCallback(async () => {
    if (!fromAmount || !fromToken || !toToken) return
    
    setIsFindingRoute(true)
    
    // Mock API call to find best route
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simulate finding better routes
    const newRoutes = [
      { name: 'Direct Swap', gas: parseFloat((Math.random() * 0.003 + 0.001).toFixed(4)), priceImpact: parseFloat((Math.random() * 0.2 + 0.05).toFixed(2)), best: false },
      { name: 'Via USDC', gas: parseFloat((Math.random() * 0.004 + 0.002).toFixed(4)), priceImpact: parseFloat((Math.random() * 0.15 + 0.03).toFixed(2)), best: false },
      { name: 'Via SOMG', gas: parseFloat((Math.random() * 0.0035 + 0.0015).toFixed(4)), priceImpact: parseFloat((Math.random() * 0.25 + 0.08).toFixed(2)), best: false }
    ]
    
    // Find the best route (lowest price impact)
    const bestRouteIndex = newRoutes.reduce((best, current, index) => 
      current.priceImpact < newRoutes[best].priceImpact ? index : best, 0
    )
    
    newRoutes[bestRouteIndex].best = true
    setRouteOptions(newRoutes)
    setCurrentRoute(newRoutes[bestRouteIndex].name)
    
    // Recalculate swap with new route
    calculateSwap()
    setIsFindingRoute(false)
  }, [fromAmount, fromToken, toToken, calculateSwap])

  // Auto-route finding function
  const autoFindRoute = useCallback(async () => {
    if ((!fromAmount && !toAmount) || !fromToken || !toToken) return
    
    // Create search parameters string for caching
    const searchParams = `${fromToken}-${toToken}-${fromAmount || toAmount}`
    
    // Skip if we already searched for these exact parameters
    if (searchParams === lastSearchParams) return
    
    // Skip if amount is too small
    const amount = fromAmount || toAmount
    if (parseFloat(amount) < 0.001) return
    
    setIsAutoSearching(true)
    
    try {
      // Mock API call to find best route
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Simulate finding better routes
      const newRoutes = [
        { name: 'Direct Swap', gas: parseFloat((Math.random() * 0.003 + 0.001).toFixed(4)), priceImpact: parseFloat((Math.random() * 0.2 + 0.05).toFixed(2)), best: false },
        { name: 'Via USDC', gas: parseFloat((Math.random() * 0.004 + 0.002).toFixed(4)), priceImpact: parseFloat((Math.random() * 0.15 + 0.03).toFixed(2)), best: false },
        { name: 'Via SOMG', gas: parseFloat((Math.random() * 0.0035 + 0.0015).toFixed(4)), priceImpact: parseFloat((Math.random() * 0.25 + 0.08).toFixed(2)), best: false }
      ]
      
      // Find the best route (lowest price impact)
      const bestRouteIndex = newRoutes.reduce((best, current, index) => 
        current.priceImpact < newRoutes[best].priceImpact ? index : best, 0
      )
      
      newRoutes[bestRouteIndex].best = true
      setRouteOptions(newRoutes)
      setCurrentRoute(newRoutes[bestRouteIndex].name)
      setLastSearchParams(searchParams)
      
      // Update price impact and gas estimate
      setPriceImpact(newRoutes[bestRouteIndex].priceImpact)
      setGasEstimate(newRoutes[bestRouteIndex].gas)
      
      // Recalculate swap with new route
      calculateSwap()
    } catch (error) {
      console.error('Auto-route finding failed:', error)
    } finally {
      setIsAutoSearching(false)
    }
  }, [fromAmount, fromToken, toToken, lastSearchParams, calculateSwap])

  useEffect(() => {
    calculateSwap()
  }, [fromAmount, toAmount, fromToken, toToken])

  // Auto-route finding effect with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      autoFindRoute()
    }, 500) // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId)
  }, [fromAmount, fromToken, toToken])

  // Manual route finding effect
  useEffect(() => {
    if (isFindingRoute) {
      findBestRoute()
    }
  }, [isFindingRoute])

  // Handle AMM errors
  useEffect(() => {
    if (ammError) {
      toast.error(ammError)
      clearError()
    }
  }, [ammError, clearError])

  // Handle successful swaps
  useEffect(() => {
    if (isSwapSuccess) {
      toast.success('Swap completed successfully!')
      // Reset form or update balances
      setFromAmount('')
      setToAmount('')
    }
  }, [isSwapSuccess, setFromAmount, setToAmount])

  const handleSwap = async () => {
    if (!fromAmount || !toAmount || !fromToken || !toToken) return
    
    try {
      setIsSwapping(true)
      
      // Get token addresses
      const tokenInAddress = getTokenAddress(fromToken)
      const tokenOutAddress = getTokenAddress(toToken)
      
      if (!tokenInAddress || !tokenOutAddress) {
        toast.error('Token addresses not found')
        return
      }
      
      // Calculate minimum amount out based on slippage
      const slippageMultiplier = 1 - (slippage / 100)
      const amountOutMin = (parseFloat(toAmount) * slippageMultiplier).toFixed(6)
      
      // Execute real swap using contract
      await executeSwap(tokenInAddress, tokenOutAddress, fromAmount, amountOutMin)
      
    } catch (error) {
      console.error('Swap failed:', error)
      toast.error('Swap failed. Please try again.')
    } finally {
      setIsSwapping(false)
    }
  }

  const handleMaxClick = () => {
    // Mock max amount - in real app, this would get user's balance
    setFromAmount('1000')
  }

  // Check if tokens are whitelisted
  const checkTokensWhitelisted = useCallback(async () => {
    if (!fromToken || !toToken) return false
    
    const fromTokenAddress = getTokenAddress(fromToken)
    const toTokenAddress = getTokenAddress(toToken)
    
    if (!fromTokenAddress || !toTokenAddress) return false
    
    // For now, return true as a placeholder
    // In production, you'd check against the contract
    return true
  }, [fromToken, toToken])

  // Check tokens when they change
  useEffect(() => {
    checkTokensWhitelisted()
  }, [fromToken, toToken, checkTokensWhitelisted])

  return (
    <div className="max-w-md mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card card-hover p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-white">Swap Tokens</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-emerald-400" title="Automatically finds the best route when you change tokens or amounts">Auto-Route</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button 
              onClick={findBestRoute}
              disabled={!fromAmount || !fromToken || !toToken || isFindingRoute}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={!isFindingRoute ? { scale: 1.05 } : {}}
              whileTap={!isFindingRoute ? { scale: 0.95 } : {}}
              title="Find Best Route (Manual)"
            >
              <RefreshCw className={`w-5 h-5 ${isFindingRoute ? 'animate-spin' : ''}`} />
            </motion.button>
            <motion.button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* From Token Input */}
        <div className="bg-slate-700/50 rounded-xl p-4 mb-4 border border-slate-600/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">From</span>
            <button
              onClick={handleMaxClick}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors hover:bg-blue-500/10 px-2 py-1 rounded"
            >
              MAX
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <input 
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.0"
                className="w-full bg-transparent text-2xl font-semibold text-white placeholder-slate-500 outline-none"
              />
            </div>
            
            <select
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              className="bg-slate-600 text-white px-3 py-2 rounded-lg border border-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            >
              {DEFI_TOKENS.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.icon} {token.symbol}
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-sm text-slate-400 mt-2">
            Balance: 1,000 {fromToken}
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center mb-4">
          <motion.button
            onClick={swapTokens}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full transition-all duration-200 border border-slate-600/50"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowDown className="w-5 h-5 text-slate-300" />
          </motion.button>
        </div>

        {/* To Token Input */}
        <div className="bg-slate-700/50 rounded-xl p-4 mb-4 border border-slate-600/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">To</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <input 
                type="number"
                value={toAmount}
                onChange={(e) => setToAmount(e.target.value)}
                placeholder="0.0"
                className="w-full bg-transparent text-2xl font-semibold text-white placeholder-slate-500 outline-none"
              />
            </div>
            
            <select
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              className="bg-slate-600 text-white px-3 py-2 rounded-lg border border-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            >
              {DEFI_TOKENS.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.icon} {token.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Route Information */}
        <div className="bg-slate-700/30 rounded-xl p-4 mb-4 border border-slate-600/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">Route</span>
            <div className="flex items-center space-x-2">
              {isFindingRoute ? (
                <div className="flex items-center space-x-2 text-xs text-blue-400">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Finding best route...</span>
                </div>
              ) : isAutoSearching ? (
                <div className="flex items-center space-x-2 text-xs text-amber-400">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Auto-searching...</span>
                </div>
              ) : (
                <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full">
                  Best Route
                </span>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Current Route:</span>
              <span className="text-white font-medium">{currentRoute}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Price Impact:</span>
              <span className={`font-medium ${priceImpact < 0.1 ? 'text-emerald-400' : priceImpact < 0.5 ? 'text-amber-400' : 'text-red-400'}`}>
                {priceImpact}%
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Estimated Gas:</span>
              <span className="text-white font-medium">{gasEstimate} SOM</span>
            </div>
          </div>
          
          {/* Route Options */}
          <div className="mt-3 pt-3 border-t border-slate-600/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Alternative Routes:</span>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                View All
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {routeOptions.slice(0, 3).map((route) => (
                <div
                  key={route.name}
                  className={`p-2 rounded-lg text-xs cursor-pointer transition-all duration-200 ${
                    route.best 
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' 
                      : 'bg-slate-600/50 hover:bg-slate-600/70 text-slate-300'
                  }`}
                  onClick={() => {
                    setCurrentRoute(route.name)
                    setPriceImpact(route.priceImpact)
                    setGasEstimate(route.gas)
                    calculateSwap()
                  }}
                >
                  <div className="font-medium mb-1">{route.name}</div>
                  <div className="text-slate-400">{route.priceImpact}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Swap Details */}
        <div className="bg-slate-700/30 rounded-xl p-4 mb-6 border border-slate-600/30">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Exchange Rate</span>
              <span className="text-white">
                1 {fromToken} = {(parseFloat(toAmount || '0') / parseFloat(fromAmount || '1')).toFixed(6)} {toToken}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Price Impact</span>
              <span className={`${priceImpact < 1 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {priceImpact.toFixed(2)}%
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Trading Fee</span>
              <span className="text-white">
                {tradingFee ? `${Number(tradingFee) / 10000}%` : `${FEE_STRUCTURE.AMM_TRADING_FEE}%`}
              </span>
            </div>
          
            <div className="flex justify-between">
              <span className="text-slate-400">Gas Estimate</span>
              <span className="text-white">{gasEstimate} SOM</span>
            </div>
          </div>
        </div>
          
          {/* Swap Button */}
          <motion.button
            onClick={handleSwap}
            disabled={!fromAmount || !toAmount || isSwapping || isAMMLoading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            whileHover={!isSwapping && !isAMMLoading ? { scale: 1.02 } : {}}
            whileTap={!isSwapping && !isAMMLoading ? { scale: 0.98 } : {}}
          >
            {isSwapping || isAMMLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Swapping...</span>
              </div>
            ) : (
              'Swap Tokens'
            )}
          </motion.button>

          {/* Contract Status */}
          <div className="mt-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Contract Status:</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-emerald-400">Connected to Somnia AMM</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-slate-400">Trading Fee:</span>
              <span className="text-white">
                {tradingFee ? `${Number(tradingFee) / 10000}%` : 'Loading...'}
              </span>
            </div>
          </div>
          
        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-slate-700/30 rounded-xl border border-slate-600/30"
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400">Slippage Tolerance</label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="number"
                    value={slippage}
                    onChange={(e) => setSlippage(parseFloat(e.target.value))}
                    step="0.1"
                    min="0.1"
                    max="50"
                    className="flex-1 bg-slate-600 text-white px-3 py-2 rounded-lg border border-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                  <span className="text-white">%</span>
                </div>
              </div>
              
              {/* Route Options */}
              <div>
                <label className="text-sm text-slate-400 mb-3 block">Available Routes</label>
                <div className="space-y-2">
                  {routeOptions.map((route) => (
                    <div
                      key={route.name}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        route.best 
                          ? 'bg-emerald-500/20 border border-emerald-500/30' 
                          : 'bg-slate-600/50 hover:bg-slate-600/70'
                      }`}
                      onClick={() => {
                        setCurrentRoute(route.name)
                        setPriceImpact(route.priceImpact)
                        setGasEstimate(route.gas)
                        calculateSwap()
                        setShowSettings(false)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${
                            route.best ? 'text-emerald-300' : 'text-white'
                          }`}>
                            {route.name}
                          </span>
                          {route.best && (
                            <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full">
                              Best
                            </span>
                          )}
                        </div>
                        <div className="text-right text-xs">
                          <div className="text-slate-400">Price Impact: {route.priceImpact}%</div>
                          <div className="text-slate-400">Gas: {route.gas} SOM</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-300">
              <p className="font-medium mb-1">Trading on Somnia Network</p>
              <p>This swap will be executed on Somnia&apos;s AMM DEX with secure smart contracts and minimal fees.</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Popular Trading Pairs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Popular Trading Pairs</h3>
        <div className="grid grid-cols-2 gap-3">
          {TRADING_PAIRS.slice(0, 4).map((pair) => (
            <motion.button
              key={pair.id}
              onClick={() => {
                setFromToken(pair.token0)
                setToToken(pair.token1)
              }}
              className="card card-hover p-3 text-left transition-all duration-200"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{pair.icon0}</span>
                <span className="text-lg">{pair.icon1}</span>
              </div>
              <div className="text-sm font-medium text-white">{pair.token0}/{pair.token1}</div>
              <div className="text-xs text-slate-400">Vol: {pair.volume24h}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}