import Header from '../components/Header'
import { LENDING_MARKETS } from '../lib/constants'

export default function LendPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Lend & Borrow on Somnia
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Supply assets to earn interest or borrow against your collateral. 
            Competitive rates and secure lending markets.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lending Markets */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 mb-6">
              <h2 className="text-2xl font-semibold text-white mb-6">Lending Markets</h2>
              <div className="space-y-4">
                {LENDING_MARKETS.map((market) => (
                  <div key={market.token} className="bg-gray-700/30 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">💵</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{market.token}</h3>
                          <p className="text-sm text-gray-400">Utilization: {market.utilization}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-400">{market.supplyRate}</div>
                        <div className="text-sm text-gray-400">Supply APY</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{market.totalSupply}</div>
                        <div className="text-sm text-gray-400">Total Supply</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{market.totalBorrow}</div>
                        <div className="text-sm text-gray-400">Total Borrow</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-red-400">{market.borrowRate}</div>
                        <div className="text-sm text-gray-400">Borrow APY</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{market.utilization}</div>
                        <div className="text-sm text-gray-400">Utilization</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                        Supply {market.token}
                      </button>
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                        Borrow {market.token}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Positions */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Your Positions</h3>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🏦</div>
                  <p className="text-gray-400 mb-4">No active positions</p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Start Lending
                  </button>
                </div>
              </div>
            </div>

            {/* Market Stats */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Market Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Supply</span>
                  <span className="text-white font-medium">$12.5M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Borrow</span>
                  <span className="text-white font-medium">$8.2M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Utilization Rate</span>
                  <span className="text-white font-medium">65.6%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Markets</span>
                  <span className="text-white font-medium">3</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                  Supply Assets
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                  Borrow Assets
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                  View History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 