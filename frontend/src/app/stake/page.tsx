import Header from '../components/Header'
import { STAKING_TIERS } from '../lib/constants'

export default function StakePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Stake & Earn Rewards
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Stake your tokens to earn rewards with multiple tiers and multipliers. 
            Higher stakes, better rewards, and flexible withdrawal options.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Staking Pools */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 mb-6">
              <h2 className="text-2xl font-semibold text-white mb-6">Staking Pools</h2>
              <div className="space-y-4">
                {STAKING_TIERS.map((tier) => (
                  <div key={tier.name} className="bg-gray-700/30 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          tier.name === 'Bronze' ? 'bg-yellow-500/20' :
                          tier.name === 'Silver' ? 'bg-gray-400/20' :
                          'bg-yellow-400/20'
                        }`}>
                          <span className="text-2xl">💰</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{tier.name} Tier</h3>
                          <p className="text-sm text-gray-400">{tier.multiplier} Multiplier</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-400">{tier.multiplier}</div>
                        <div className="text-sm text-gray-400">Reward Multiplier</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{tier.minStake}</div>
                        <div className="text-sm text-gray-400">Min Stake</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{tier.maxStake}</div>
                        <div className="text-sm text-gray-400">Max Stake</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-400">{tier.lockDuration}</div>
                        <div className="text-sm text-gray-400">Lock Duration</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-red-400">{tier.penalty}</div>
                        <div className="text-sm text-gray-400">Early Penalty</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                        Stake in {tier.name}
                      </button>
                      <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Stakes */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Your Stakes</h3>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">💰</div>
                  <p className="text-gray-400 mb-4">No active stakes</p>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Start Staking
                  </button>
                </div>
              </div>
            </div>

            {/* Staking Stats */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Staking Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Staked</span>
                  <span className="text-white font-medium">$15.2M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Rewards</span>
                  <span className="text-white font-medium">$2.1M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Stakers</span>
                  <span className="text-white font-medium">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg APY</span>
                  <span className="text-white font-medium">12.5%</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                  Stake Tokens
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                  Claim Rewards
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                  View History
                </button>
              </div>
            </div>

            {/* Rewards Calculator */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Rewards Calculator</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Stake Amount</label>
                  <input 
                    type="number" 
                    placeholder="1000" 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tier</label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500">
                    <option>Bronze (1x)</option>
                    <option>Silver (1.2x)</option>
                    <option>Gold (1.5x)</option>
                  </select>
                </div>
                <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">$125</div>
                  <div className="text-sm text-gray-400">Estimated Annual Rewards</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 