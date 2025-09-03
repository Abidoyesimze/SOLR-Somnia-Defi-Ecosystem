'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Users, 
  BarChart3,
  RefreshCw,
  ArrowRight,
  DollarSign,
  Zap,
  LucideIcon
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts'

// Types
type Stat = {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: LucideIcon;
  color: string;
};

type VolumeData = {
  time: string;
  volume: number;
};

type TvlData = {
  protocol: string;
  tvl: number;
  change: number;
};

// Mock data for charts
const volumeData: VolumeData[] = [
  { time: '00:00', volume: 125000 },
  { time: '04:00', volume: 189000 },
  { time: '08:00', volume: 156000 },
  { time: '12:00', volume: 234000 },
  { time: '16:00', volume: 198000 },
  { time: '20:00', volume: 267000 },
  { time: '24:00', volume: 189000 }
];

const tvlData: TvlData[] = [
  { protocol: 'AMM', tvl: 2500000, change: 12.5 },
  { protocol: 'Lending', tvl: 1800000, change: 8.2 },
  { protocol: 'Staking', tvl: 3200000, change: 15.7 },
  { protocol: 'Governance', tvl: 950000, change: 3.1 }
];

const userActivityData = [
  { hour: '0', users: 45, transactions: 120 },
  { hour: '4', users: 32, transactions: 89 },
  { hour: '8', users: 78, transactions: 234 },
  { hour: '12', users: 156, transactions: 456 },
  { hour: '16', users: 134, transactions: 389 },
  { hour: '20', users: 98, transactions: 267 },
  { hour: '24', users: 67, transactions: 189 }
];

const protocolUsageData = [
  { name: 'Trading', value: 45, color: '#3B82F6' },
  { name: 'Lending', value: 25, color: '#10B981' },
  { name: 'Staking', value: 20, color: '#8B5CF6' },
  { name: 'Governance', value: 10, color: '#F59E0B' }
];

export default function AnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState<string>('24h');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshData = async (): Promise<void> => {
    setIsLoading(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [timeframe]);

  const stats: Stat[] = [
    {
      title: 'Total Value Locked',
      value: '$8.45M',
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-green-400'
    },
    {
      title: '24h Trading Volume',
      value: '$2.34M',
      change: '+8.2%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'text-blue-400'
    },
    {
      title: 'Active Users',
      value: '1,234',
      change: '+15.7%',
      changeType: 'positive',
      icon: Users,
      color: 'text-purple-400'
    },
    {
      title: 'Total Transactions',
      value: '45,678',
      change: '+3.1%',
      changeType: 'positive',
      icon: Zap,
      color: 'text-yellow-400'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">DeFi Analytics Dashboard</h1>
          <p className="text-lg text-slate-300 mb-8">
            Track your DeFi portfolio performance, monitor protocol usage, and analyze market trends across Somnia's ecosystem.
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="1h">1 Hour</option>
            <option value="24h">24 Hours</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
          </select>
          
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div 
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 bg-gray-700 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
              }`}>
                {stat.changeType === 'positive' ? (
                  <ArrowRight className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                <span>{stat.change}</span>
              </div>
            </div>
            
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Trading Volume Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Trading Volume (24h)</h3>
            <div className="flex items-center space-x-2 text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">+12.5%</span>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
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
                dataKey="volume" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* TVL by Protocol */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">TVL by Protocol</h3>
            <div className="flex items-center space-x-2 text-blue-400">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">Total: $8.45M</span>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={tvlData}>
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
              <Bar dataKey="tvl" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Protocol Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 mb-8"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Protocol Performance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'AMM', tvl: '$2.5M', volume24h: '$1.2M', pools: 10, icon: '💸', color: 'bg-blue-500' },
            { name: 'Lending', tvl: '$1.8M', volume24h: '$900k', pools: 8, icon: '📈', color: 'bg-green-500' },
            { name: 'Staking', tvl: '$3.2M', volume24h: '$1.5M', pools: 12, icon: '🔒', color: 'bg-purple-500' },
            { name: 'Governance', tvl: '$950k', volume24h: '$450k', pools: 6, icon: '🗳️', color: 'bg-yellow-500' }
          ].map((protocol) => (
            <div key={protocol.name} className="text-center">
              <div className={`w-16 h-16 ${protocol.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                <span className="text-3xl">{protocol.icon}</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">{protocol.name}</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div>TVL: {protocol.tvl}</div>
                <div>Volume: {protocol.volume24h}</div>
                <div>Pools: {protocol.pools}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* User Activity & Protocol Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* User Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-6">User Activity (24h)</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="users" 
                stackId="1"
                stroke="#8B5CF6" 
                fill="#8B5CF6" 
                fillOpacity={0.3}
              />
              <Area 
                type="monotone" 
                dataKey="transactions" 
                stackId="2"
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Protocol Usage Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Protocol Usage Distribution</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={protocolUsageData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {protocolUsageData.map((entry, index) => (
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
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            {protocolUsageData.map((item) => (
              <div key={item.name} className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-300">{item.name}</span>
                <span className="text-sm font-medium text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Lending & Staking Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lending Markets */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Lending Markets</h3>
          
          <div className="space-y-4">
            {[
              { token: 'DAI', utilization: '80%', supplyRate: '10%', borrowRate: '15%' },
              { token: 'USDC', utilization: '70%', supplyRate: '8%', borrowRate: '12%' },
              { token: 'USDT', utilization: '60%', supplyRate: '6%', borrowRate: '10%' }
            ].map((market) => (
              <div key={market.token} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-lg">💵</span>
                  </div>
                  <div>
                    <div className="font-medium text-white">{market.token}</div>
                    <div className="text-sm text-gray-400">Utilization: {market.utilization}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-green-400">Supply: {market.supplyRate}</div>
                  <div className="text-sm text-red-400">Borrow: {market.borrowRate}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Staking Tiers */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Staking Tiers</h3>
          
          <div className="space-y-4">
            {[
              { name: 'Tier 1', multiplier: '1.5x', lockDuration: '30 days', penalty: '10%' },
              { name: 'Tier 2', multiplier: '2x', lockDuration: '60 days', penalty: '20%' },
              { name: 'Tier 3', multiplier: '2.5x', lockDuration: '90 days', penalty: '30%' }
            ].map((tier) => (
              <div key={tier.name} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-lg">💰</span>
                  </div>
                  <div>
                    <div className="font-medium text-white">{tier.name}</div>
                    <div className="text-sm text-gray-400">{tier.multiplier} Multiplier</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-purple-400">{tier.lockDuration}</div>
                  <div className="text-sm text-gray-400">Penalty: {tier.penalty}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}