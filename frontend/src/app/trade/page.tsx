import Header from '../components/Header'
import SwapInterface from '../components/SwapInterface'

export default function TradePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Trade Tokens on Somnia
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Swap tokens instantly with our Automated Market Maker (AMM) DEX. 
            Low fees, high liquidity, and secure smart contracts.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Swap Interface */}
          <div className="lg:col-span-2">
            <SwapInterface />
          </div>

          {/* Market Info */}
          <div className="space-y-6">
            {/* Market Stats */}
            <div className="card card-hover p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Market Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">24h Volume</span>
                  <span className="text-white font-medium">$2.34M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Liquidity</span>
                  <span className="text-white font-medium">$8.45M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Pools</span>
                  <span className="text-white font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Trading Fee</span>
                  <span className="text-white font-medium">0.3%</span>
                </div>
              </div>
            </div>

            {/* Recent Trades */}
            <div className="card card-hover p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Trades</h3>
              <div className="space-y-3">
                {[
                  { from: 'SOM', to: 'SOMG', amount: '1,000', time: '2 min ago' },
                  { from: 'SOMG', to: 'USDC', amount: '500', time: '5 min ago' },
                  { from: 'USDC', to: 'SOM', amount: '100', time: '8 min ago' },
                  { from: 'SOM', to: 'WETH', amount: '2,000', time: '12 min ago' }
                ].map((trade, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{trade.from}</span>
                      <span className="text-slate-400">→</span>
                      <span className="text-sm">{trade.to}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">{trade.amount}</div>
                      <div className="text-xs text-slate-400">{trade.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Gainers/Losers */}
            <div className="card card-hover p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Top Movers</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🔵</span>
                    <span className="text-sm">SOM</span>
                  </div>
                  <span className="text-emerald-400 text-sm">+12.5%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🏛️</span>
                    <span className="text-sm">SOMG</span>
                  </div>
                  <span className="text-red-400 text-sm">-5.2%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">💵</span>
                    <span className="text-sm">USDC</span>
                  </div>
                  <span className="text-emerald-400 text-sm">+0.1%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 