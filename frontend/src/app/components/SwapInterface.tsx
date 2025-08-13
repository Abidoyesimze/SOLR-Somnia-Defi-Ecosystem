'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  ArrowDown, 
  RefreshCw,
  Globe,
  Shield,
  Zap,
  Palette,
  Gamepad2
} from 'lucide-react'
import { useStore } from '../lib/store'
import { TOKENS } from '../lib/constants'
import { toast } from 'react-hot-toast'

// Updated token types for metaverse assets
const METAVERSE_ASSETS = [
  { id: 'virtual-art', name: 'Virtual Art', symbol: 'VART', icon: '🎨', type: 'Digital Artwork' },
  { id: 'gaming-item', name: 'Gaming Item', symbol: 'GAME', icon: '🎮', type: 'Game Asset' },
  { id: 'virtual-land', name: 'Virtual Land', symbol: 'VLAND', icon: '🏞️', type: 'Virtual Property' },
  { id: 'experience', name: 'Experience', symbol: 'EXP', icon: '🌟', type: 'Virtual Experience' },
  { id: 'attestation', name: 'Attestation', symbol: 'ATT', icon: '✅', type: 'Verification' },
  { id: 'component', name: 'Component', symbol: 'COMP', icon: '🧩', type: 'World Component' }
]

const METAVERSE_DESTINATIONS = [
  { id: 'art-gallery', name: 'Art Gallery Metaverse', icon: '🖼️', type: 'Creative Space' },
  { id: 'gaming-world', name: 'Gaming World', icon: '🎮', type: 'Interactive Gaming' },
  { id: 'social-hub', name: 'Social Hub', icon: '👥', type: 'Community Space' },
  { id: 'commerce-mall', name: 'Commerce Mall', icon: '🛍️', type: 'Trading Hub' },
  { id: 'education-center', name: 'Education Center', icon: '📚', type: 'Learning Space' },
  { id: 'entertainment-zone', name: 'Entertainment Zone', icon: '🎭', type: 'Media Hub' }
]

export default function SwapInterface() {
  const { 
    fromToken, 
    toToken, 
    fromAmount, 
    toAmount, 
    route, 
    loading,
    setFromToken, 
    setToToken, 
    setFromAmount, 
    setToAmount, 
 
    setRoute, 
    setLoading 
  } = useStore()

  const [showSettings, setShowSettings] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [selectedDestination, setSelectedDestination] = useState<string>('')

  // Mock route calculation for metaverse assets
  const calculateRoute = useCallback(async (from: string, to: string, amount: string) => {
    setLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generate mock route data for metaverse assets
    const mockRoute = {
      from: from,
      to: to,
      amount: amount,
      estimatedOutput: (parseFloat(amount) * 0.95).toFixed(2),
      routingFee: '0.5%',
      gasEstimate: '0.002',
      routePath: [
        { step: 1, from: from, to: 'Bridge', protocol: 'Somnia Bridge' },
        { step: 2, from: 'Bridge', to: to, protocol: 'Destination Protocol' }
      ],
      estimatedTime: '~2-5 seconds',
      successRate: '99.8%',
      savings: '5% better than direct transfer'
    }
    
    setRoute(mockRoute)
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
      calculateRoute(fromToken, toToken, fromAmount)
    }
  }, [fromAmount, fromToken, toToken, calculateRoute])

  const handleAssetRouting = async () => {
    if (!fromToken || !toToken || !fromAmount) {
      toast.error('Please select assets and enter amount')
      return
    }

    if (!selectedDestination) {
      toast.error('Please select a destination metaverse')
      return
    }

    toast.success('Asset routing initiated! This is a demo - in production this would execute the actual transfer.')
  }

  const handleSwapTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div className="gradient-border card-glow">
        <div className="gradient-border-inner p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Asset Router</h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => {
                  if (fromAmount && fromToken && toToken) {
                    calculateRoute(fromToken, toToken, fromAmount)
                  }
                }}
                disabled={!fromAmount || !fromToken || !toToken || loading}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh route"
              >
                <motion.div
                  animate={{ rotate: loading ? 360 : 0 }}
                  transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
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

          {/* From Asset Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Route From
            </label>
            <div className="relative">
              <select
                value={fromToken || ''}
                onChange={(e) => setFromToken(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Virtual Asset</option>
                {METAVERSE_ASSETS.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.icon} {asset.name} ({asset.symbol}) - {asset.type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Swap Direction Button */}
          <div className="flex justify-center mb-4">
            <button
              onClick={handleSwapTokens}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>

          {/* To Asset Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Route To
            </label>
            <div className="relative">
              <select
                value={toToken || ''}
                onChange={(e) => setToToken(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Destination Asset</option>
                {METAVERSE_ASSETS.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.icon} {asset.name} ({asset.symbol}) - {asset.type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Destination Metaverse Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Destination Metaverse
            </label>
            <div className="relative">
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Metaverse</option>
                {METAVERSE_DESTINATIONS.map((dest) => (
                  <option key={dest.id} value={dest.id}>
                    {dest.icon} {dest.name} - {dest.type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Route Information */}
          {route && (
            <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold mb-3 text-blue-400">Route Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Estimated Output:</span>
                  <span className="text-white">{route.estimatedOutput}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Routing Fee:</span>
                  <span className="text-white">{route.routingFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gas Estimate:</span>
                  <span className="text-white">{route.gasEstimate} SOM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estimated Time:</span>
                  <span className="text-white">{route.estimatedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Success Rate:</span>
                  <span className="text-green-400">{route.successRate}</span>
                </div>
                <div className="mt-3 p-2 bg-green-500/20 border border-green-500/30 rounded text-green-300 text-xs">
                  💡 {route.savings}
                </div>
              </div>
              
              {lastRefresh && (
                <div className="text-xs text-gray-500 text-center mt-3">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </div>
              )}
            </div>
          )}

          {/* Route Path Visualization */}
          {route && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Route Path</h4>
              <div className="space-y-2">
                {route.routePath.map((step, index) => (
                  <div key={index} className="flex items-center space-x-3 text-sm">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-xs font-bold">
                      {step.step}
                    </div>
                    <span className="text-gray-300">{step.from}</span>
                    <ArrowDown className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-300">{step.to}</span>
                    <span className="text-gray-500 text-xs">via {step.protocol}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Execute Button */}
          <button
            onClick={handleAssetRouting}
            disabled={!fromToken || !toToken || !fromAmount || !selectedDestination || loading}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Calculating Route...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Route Asset</span>
              </div>
            )}
          </button>

          {/* Info Cards */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
              <Shield className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <div className="text-xs text-blue-300">Secure Routing</div>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-center">
              <Zap className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <div className="text-xs text-purple-300">Fast Execution</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}