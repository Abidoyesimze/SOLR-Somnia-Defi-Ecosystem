'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Globe,
  Shield,
  Zap,
  Palette,
  Gamepad2,
  Star,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

// Mock data for metaverse analytics
const mockData = {
  totalAssets: 15420,
  totalTransfers: 8920,
  activeUsers: 3420,
  totalMetaverses: 8,
  dailyTransfers: 156,
  weeklyGrowth: 12.5,
  monthlyGrowth: 28.3,
  protocolUsage: {
    som0: 65,
    som1: 35
  },
  assetTypes: [
    { name: 'Virtual Art', value: 35, color: '#8B5CF6' },
    { name: 'Gaming Items', value: 28, color: '#06B6D4' },
    { name: 'Virtual Land', value: 20, color: '#10B981' },
    { name: 'Experiences', value: 12, color: '#F59E0B' },
    { name: 'Components', value: 5, color: '#EF4444' }
  ],
  transferHistory: [
    { date: 'Jan 1', transfers: 120, assets: 89 },
    { date: 'Jan 2', transfers: 145, assets: 112 },
    { date: 'Jan 3', transfers: 132, assets: 98 },
    { date: 'Jan 4', transfers: 167, assets: 134 },
    { date: 'Jan 5', transfers: 189, assets: 156 },
    { date: 'Jan 6', transfers: 201, assets: 178 },
    { date: 'Jan 7', transfers: 156, assets: 134 }
  ],
  metaverseStats: [
    { name: 'Art Gallery', transfers: 2340, growth: 15.2, icon: Palette },
    { name: 'Gaming World', transfers: 1890, growth: 8.7, icon: Gamepad2 },
    { name: 'Social Hub', transfers: 1560, growth: 22.1, icon: Users },
    { name: 'Commerce Mall', transfers: 1340, growth: 18.9, icon: Globe },
    { name: 'Education Center', transfers: 890, growth: 12.4, icon: Star },
    { name: 'Entertainment Zone', transfers: 1120, growth: 14.6, icon: Zap }
  ]
}

const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }: any) => (
  <motion.div 
    className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-blue-500/50 transition-all duration-300"
    whileHover={{ y: -5 }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 bg-${color}-500/20 rounded-xl flex items-center justify-center text-${color}-400`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className={`flex items-center space-x-1 text-sm ${
        change >= 0 ? 'text-green-400' : 'text-red-400'
      }`}>
        {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        <span>{Math.abs(change)}%</span>
      </div>
    </div>
    <div className="text-2xl font-bold text-white mb-2">{value.toLocaleString()}</div>
    <div className="text-gray-400 text-sm">{title}</div>
  </motion.div>
)

const MetaverseCard = ({ metaverse }: any) => (
  <motion.div 
    className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-4 hover:border-blue-500/50 transition-all duration-300"
    whileHover={{ y: -2 }}
  >
    <div className="flex items-center space-x-3 mb-3">
      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
        <metaverse.icon className="w-5 h-5" />
      </div>
      <div>
        <div className="font-semibold text-white">{metaverse.name}</div>
        <div className="text-sm text-gray-400">{metaverse.transfers.toLocaleString()} transfers</div>
      </div>
    </div>
    <div className={`flex items-center space-x-1 text-sm ${
      metaverse.growth >= 0 ? 'text-green-400' : 'text-red-400'
    }`}>
      {metaverse.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      <span>{metaverse.growth}%</span>
    </div>
  </motion.div>
)

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('7d')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4">Metaverse Analytics</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Track virtual asset routing, cross-metaverse transfers, and protocol usage across the Somnia ecosystem
          </p>
        </motion.div>

        {/* Time Range Selector */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700 p-1">
            {['24h', '7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  timeRange === range
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Key Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <StatCard 
            title="Total Virtual Assets" 
            value={mockData.totalAssets} 
            change={mockData.weeklyGrowth} 
            icon={Palette} 
            color="purple"
          />
          <StatCard 
            title="Cross-Metaverse Transfers" 
            value={mockData.totalTransfers} 
            change={mockData.monthlyGrowth} 
            icon={Globe} 
            color="blue"
          />
          <StatCard 
            title="Active Users" 
            value={mockData.activeUsers} 
            change={8.9} 
            icon={Users} 
            color="green"
          />
          <StatCard 
            title="Connected Metaverses" 
            value={mockData.totalMetaverses} 
            change={12.5} 
            icon={Star} 
            color="yellow"
          />
        </motion.div>

        {/* Charts Section */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Transfer History Chart */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Transfer Volume</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockData.transferHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="transfers" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="assets" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-300">Transfers</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-300">Assets</span>
              </div>
            </div>
          </div>

          {/* Asset Type Distribution */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Asset Type Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockData.assetTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockData.assetTypes.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
              {mockData.assetTypes.map((asset: any, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: asset.color }}
                  ></div>
                  <span className="text-gray-300">{asset.name}</span>
                  <span className="text-white font-medium">{asset.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Protocol Usage */}
        <motion.div 
          className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-xl font-semibold text-white mb-6">Protocol Usage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-medium text-gray-300 mb-4">SOM0 vs SOM1 Distribution</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { protocol: 'SOM0', usage: mockData.protocolUsage.som0, color: '#3B82F6' },
                  { protocol: 'SOM1', usage: mockData.protocolUsage.som1, color: '#8B5CF6' }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="protocol" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="usage" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-white font-medium">SOM0 Protocol</span>
                </div>
                <span className="text-2xl font-bold text-blue-400">{mockData.protocolUsage.som0}%</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-white font-medium">SOM1 Protocol</span>
                </div>
                <span className="text-2xl font-bold text-purple-400">{mockData.protocolUsage.som1}%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metaverse Performance */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Metaverse Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockData.metaverseStats.map((metaverse, index) => (
              <MetaverseCard key={metaverse.name} metaverse={metaverse} />
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'Virtual Art transferred', from: 'Art Gallery', to: 'Gaming World', time: '2 min ago', type: 'transfer' },
              { action: 'New attestation created', from: 'Verification System', to: 'Marketplace', time: '5 min ago', type: 'attestation' },
              { action: 'Experience component added', from: 'Component Registry', to: 'Social Hub', time: '12 min ago', type: 'component' },
              { action: 'Virtual land purchased', from: 'Commerce Mall', to: 'User Wallet', time: '18 min ago', type: 'purchase' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.type === 'transfer' ? 'bg-blue-500' :
                    activity.type === 'attestation' ? 'bg-green-500' :
                    activity.type === 'component' ? 'bg-purple-500' : 'bg-yellow-500'
                  }`}></div>
                  <div>
                    <div className="text-white font-medium">{activity.action}</div>
                    <div className="text-sm text-gray-400">{activity.from} → {activity.to}</div>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}