'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Users, 
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  Shield,
  Clock
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart as RechartsPieChart, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart as RechartsBarChart, 
  Bar 
} from 'recharts'
import { formatNumber, formatPercentage } from '../lib/utils/format'
import { PROTOCOLS } from '../lib/constants'

const AnalyticsDashboard = () => {
  const [timeframe, setTimeframe] = useState('7d')
  const [stats, setStats] = useState({
    totalVolumeRouted: 2400000,
    totalSavings: 12800,
    totalTransactions: 15678,
    activeProtocols: 8,
    avgSavingsPerSwap: 8.2,
    protocolRevenue: 3200
  })

  // Mock data for charts
  const volumeData = [
    { day: 'Mon', volume: 180000, directVolume: 165000 },
    { day: 'Tue', volume: 220000, directVolume: 195000 },
    { day: 'Wed', volume: 280000, directVolume: 245000 },
    { day: 'Thu', volume: 320000, directVolume: 285000 },
    { day: 'Fri', volume: 450000, directVolume: 390000 },
    { day: 'Sat', volume: 380000, directVolume: 340000 },
    { day: 'Sun', volume: 420000, directVolume: 380000 }
  ]

  const savingsData = [
    { day: 'Mon', savings: 1200, percentage: 2.1 },
    { day: 'Tue', savings: 1850, percentage: 2.3 },
    { day: 'Wed', savings: 2100, percentage: 2.4 },
    { day: 'Thu', savings: 2650, percentage: 2.6 },
    { day: 'Fri', savings: 3200, percentage: 2.8 },
    { day: 'Sat', savings: 2900, percentage: 2.5 },
    { day: 'Sun', savings: 3100, percentage: 2.7 }
  ]

  const protocolDistribution = [
    { name: 'UniswapV2', value: 35, volume: 840000, color: '#FF6B9D' },
    { name: 'SushiSwap', value: 22, volume: 528000, color: '#4ECDC4' },
    { name: 'Curve', value: 28, volume: 672000, color: '#FFE66D' },
    { name: 'Balancer', value: 15, volume: 360000, color: '#A8E6CF' }
  ]

  const topRoutes = [
    { from: 'WSOM', to: 'USDC', volume: 450000, savings: 3200, count: 1234 },
    { from: 'WETH', to: 'DAI', volume: 320000, savings: 2100, count: 892 },
    { from: 'USDC', to: 'WSOM', volume: 280000, savings: 1800, count: 756 },
    { from: 'DAI', to: 'WETH', volume: 220000, savings: 1450, count: 643 },
    { from: 'WSOM', to: 'WETH', volume: 180000, savings: 1200, count: 521 }
  ]

  const timeframes = [
    { label: '24H', value: '1d' },
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' }
  ]

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Analytics Dashboard</h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Integrate SOLR into your applications with our comprehensive API, SDK, and examples.
              </p>
            </div>
            
            {/* Timeframe Selector */}
            <div className="mt-4 md:mt-0">
              <div className="flex bg-gray-800 rounded-lg p-1">
                {timeframes.map((tf) => (
                  <button
                    key={tf.value}
                    onClick={() => setTimeframe(tf.value)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      timeframe === tf.value 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div className="stat-card" variants={fadeInUp}>
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-blue-400" />
              <ArrowUpRight className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold gradient-text mb-1">
              ${formatNumber(stats.totalVolumeRouted / 1000000, 1)}M
            </div>
            <div className="text-sm text-gray-400">Total Volume</div>
          </motion.div>

          <motion.div className="stat-card" variants={fadeInUp}>
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <ArrowUpRight className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold gradient-text mb-1">
              ${formatNumber(stats.totalSavings / 1000, 1)}K
            </div>
            <div className="text-sm text-gray-400">User Savings</div>
          </motion.div>

          <motion.div className="stat-card" variants={fadeInUp}>
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-purple-400" />
              <ArrowUpRight className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold gradient-text mb-1">
              {formatNumber(stats.totalTransactions, 0)}
            </div>
            <div className="text-sm text-gray-400">Transactions</div>
          </motion.div>

          <motion.div className="stat-card" variants={fadeInUp}>
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-yellow-400" />
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <div className="text-2xl font-bold gradient-text mb-1">
              {stats.activeProtocols}
            </div>
            <div className="text-sm text-gray-400">Active Protocols</div>
          </motion.div>

          <motion.div className="stat-card" variants={fadeInUp}>
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-8 h-8 text-orange-400" />
              <ArrowUpRight className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold gradient-text mb-1">
              ${stats.avgSavingsPerSwap}
            </div>
            <div className="text-sm text-gray-400">Avg Savings</div>
          </motion.div>

          <motion.div className="stat-card" variants={fadeInUp}>
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-8 h-8 text-cyan-400" />
              <ArrowUpRight className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold gradient-text mb-1">
              ${formatNumber(stats.protocolRevenue / 1000, 1)}K
            </div>
            <div className="text-sm text-gray-400">Protocol Revenue</div>
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Volume Chart */}
          <motion.div 
            className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Volume Comparison</h3>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-400">SOLR</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-gray-400">Direct</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="day" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value: number) => `${formatNumber(value / 1000)}K`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: number) => [`${formatNumber(value)}`, '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#3B82F6" 
                  fill="url(#colorVolume)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="directVolume" 
                  stroke="#6B7280" 
                  fill="url(#colorDirect)" 
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDirect" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6B7280" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6B7280" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Savings Chart */}
          <motion.div 
            className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Daily Savings</h3>
              <div className="text-sm text-green-400">
                +{formatPercentage(12.3)} vs last week
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={savingsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="day" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value: number) => `${formatNumber(value)}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'savings' ? `${formatNumber(value)}` : `${value}%`,
                    name === 'savings' ? 'Savings' : 'Avg %'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="savings" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Protocol Distribution & Top Routes */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Protocol Distribution */}
          <motion.div 
            className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold mb-6">Protocol Distribution</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: number) => [`${value}%`, 'Share']}
                  />
                  <RechartsPieChart data={protocolDistribution}>
                    {protocolDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RechartsPieChart>
                </RechartsPieChart>
              </ResponsiveContainer>
              
              <div className="space-y-4">
                {protocolDistribution.map((protocol, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: protocol.color }}
                      ></div>
                      <span className="font-medium">{protocol.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{protocol.value}%</div>
                      <div className="text-sm text-gray-400">
                        ${formatNumber(protocol.volume / 1000)}K
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Top Routes */}
          <motion.div 
            className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-xl font-semibold mb-6">Top Trading Routes</h3>
            <div className="space-y-4">
              {topRoutes.map((route, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium text-gray-400">#{index + 1}</div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{route.from}</span>
                      <ArrowUpRight className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{route.to}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${formatNumber(route.volume / 1000)}K</div>
                    <div className="text-sm text-green-400">
                      +${formatNumber(route.savings)} saved
                    </div>
                    <div className="text-xs text-gray-400">
                      {route.count} swaps
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Protocol Performance */}
        <motion.div 
          className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold mb-6">Integrated Protocol Performance</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROTOCOLS.map((protocol, index) => (
              <div key={index} className="p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-10 h-10 ${protocol.color} rounded-xl flex items-center justify-center text-white font-bold`}>
                    {protocol.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold">{protocol.name}</h4>
                    <p className="text-sm text-gray-400">{protocol.type}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">TVL</span>
                    <span className="font-medium">${formatNumber(protocol.tvl / 1000000, 1)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">24h Volume</span>
                    <span className="font-medium">${formatNumber(protocol.volume24h / 1000, 1)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">SOLR Share</span>
                    <span className="font-medium text-green-400">
                      {Math.floor(Math.random() * 15 + 5)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Revenue Share</span>
                    <span className="font-medium text-blue-400">
                      ${formatNumber(Math.floor(Math.random() * 500 + 100))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Real-time Activity Feed */}
        <motion.div 
          className="mt-8 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Live Activity</h3>
            <div className="flex items-center space-x-2 text-sm text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {[
              { type: 'swap', from: 'WSOM', to: 'USDC', amount: '1,250', saved: '28.5', user: '0x1234...5678', time: '2s ago' },
              { type: 'swap', from: 'WETH', to: 'DAI', amount: '0.75', saved: '12.3', user: '0x2345...6789', time: '8s ago' },
              { type: 'integration', protocol: 'New DEX Alpha', time: '2m ago' },
              { type: 'swap', from: 'DAI', to: 'WSOM', amount: '2,500', saved: '45.2', user: '0x3456...7890', time: '3m ago' },
              { type: 'swap', from: 'USDC', to: 'WETH', amount: '5,000', saved: '89.7', user: '0x4567...8901', time: '5m ago' }
            ].map((activity, index) => (
              <motion.div 
                key={index}
                className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {activity.type === 'swap' ? (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {activity.amount} {activity.from} → {activity.to}
                        </div>
                        <div className="text-sm text-gray-400">
                          by {activity.user}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-medium">
                        +${activity.saved} saved
                      </div>
                      <div className="text-sm text-gray-400">{activity.time}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium">Protocol Integration</div>
                        <div className="text-sm text-gray-400">{activity.protocol}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">{activity.time}</div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard