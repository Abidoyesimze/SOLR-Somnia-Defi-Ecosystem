import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Minus, 
  ArrowDown, 
  Settings, 
  Info, 
  AlertTriangle, 
  Loader2,
  TrendingUp,
  DollarSign,
  Percent,
  Zap,
  ChevronDown,
  ArrowLeft,
  ExternalLink
} from 'lucide-react'

// Mock data - replace with your actual constants
const DEFI_TOKENS = {
  WSOM: { symbol: 'WSOM', logo: '🌟', address: '0x...', decimals: 18 },
  USDC: { symbol: 'USDC', logo: '💵', address: '0x...', decimals: 6 },
  WETH: { symbol: 'WETH', logo: '⚡', address: '0x...', decimals: 18 },
  USDT: { symbol: 'USDT', logo: '💰', address: '0x...', decimals: 6 }
} as const;

type TokenSymbol = keyof typeof DEFI_TOKENS;

const POPULAR_PAIRS: { token0: TokenSymbol; token1: TokenSymbol; apr: string; tvl: string }[] = [
  { token0: 'WSOM', token1: 'USDC', apr: '24.5%', tvl: '$1.2M' },
  { token0: 'WETH', token1: 'USDC', apr: '18.3%', tvl: '$890K' },
  { token0: 'WSOM', token1: 'WETH', apr: '31.2%', tvl: '$650K' },
  { token0: 'USDC', token1: 'USDT', apr: '12.1%', tvl: '$2.1M' }
]

export default function LiquidityInterface() {
  const [activeTab, setActiveTab] = useState('add') // 'add', 'remove', 'pools'
  const [token0, setToken0] = useState<TokenSymbol>('WSOM')
  const [token1, setToken1] = useState<TokenSymbol>('USDC')
  const [amount0, setAmount0] = useState('')
  const [amount1, setAmount1] = useState('')
  const [removePercentage, setRemovePercentage] = useState(25)
  const [showSettings, setShowSettings] = useState(false)
  const [slippage, setSlippage] = useState(0.5)
  const [deadline, setDeadline] = useState(20)
  const [loading, setLoading] = useState(false)
  const [poolData, setPoolData] = useState({
    reserve0: '1000000',
    reserve1: '2500000',
    userLPBalance: '0.5432',
    totalLPSupply: '10000',
    userPoolShare: '0.0054',
    token0Price: '2.50',
    token1Price: '1.00'
  })

  // Mock balances
  const [balances] = useState<Record<TokenSymbol, string>>({
    WSOM: '1250.75',
    USDC: '5000.00',
    WETH: '2.45',
    USDT: '3200.50'
  })

  const handleAmountChange = (value: string, isToken0: boolean) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      if (isToken0) {
        setAmount0(value)
        // Calculate corresponding amount for token1 based on pool ratio
        if (value && parseFloat(value) > 0) {
          const ratio = parseFloat(poolData.reserve1) / parseFloat(poolData.reserve0)
          setAmount1((parseFloat(value) * ratio).toFixed(6))
        } else {
          setAmount1('')
        }
      } else {
        setAmount1(value)
        // Calculate corresponding amount for token0 based on pool ratio
        if (value && parseFloat(value) > 0) {
          const ratio = parseFloat(poolData.reserve0) / parseFloat(poolData.reserve1)
          setAmount0((parseFloat(value) * ratio).toFixed(6))
        } else {
          setAmount0('')
        }
      }
    }
  }

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }: { id: string; label: string; icon: React.ElementType; isActive: boolean; onClick: () => void }) => (
    <motion.button
      onClick={onClick}
      className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </motion.button>
  )

  const TokenSelect = ({ token, onSelect, label, amount, onAmountChange, showMax = true }: { token: TokenSymbol; onSelect: (token: TokenSymbol) => void; label: string; amount: string; onAmountChange: (value: string, isToken0: boolean) => void; showMax?: boolean }) => (
    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-400">{label}</span>
        {showMax && (
          <button 
            onClick={() => onAmountChange(balances[token], label === 'Token A')}
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
            onChange={(e) => onAmountChange(e.target.value, label === 'Token A')}
            placeholder="0.0"
            className="w-full bg-transparent text-2xl font-bold text-white placeholder-slate-500 outline-none"
          />
          <div className="text-sm text-slate-500 mt-1">
            ${amount ? (parseFloat(amount) * parseFloat(poolData[label === 'Token A' ? 'token0Price' : 'token1Price'])).toFixed(2) : '0.00'}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onSelect(token)}
            className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-xl transition-all duration-200 border border-slate-600/50"
          >
            <span className="text-lg">{DEFI_TOKENS[token]?.logo}</span>
            <span className="font-semibold text-white">{token}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
      
      <div className="text-xs text-slate-500 mt-2">
        Balance: {parseFloat(balances[token] || '0').toFixed(4)} {token}
      </div>
    </div>
  )

  const TokenModal = ({ isOpen, onClose, onSelect }: { isOpen: boolean; onClose: () => void; onSelect: (token: TokenSymbol) => void }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-400">Select Token</span>
        <button 
          onClick={onClose}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
        >
          Close
        </button>
      </div>
      
      <div className="space-y-2">
        {Object.keys(DEFI_TOKENS).map((token) => (
          <button
            key={token}
            onClick={() => {
              onSelect(token as TokenSymbol)
              onClose()
            }}
            className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-xl hover:bg-slate-600/50 transition-all duration-200"
          >
            <span className="text-lg">{DEFI_TOKENS[token as TokenSymbol]?.logo}</span>
            <span className="font-medium text-white">{token}</span>
          </button>
        ))}
      </div>
    </motion.div>
  )

  const AddLiquidityTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <TokenSelect 
        token={token0}
        onSelect={setToken0}
        label="Token A"
        amount={amount0}
        onAmountChange={handleAmountChange}
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
        onAmountChange={handleAmountChange}
      />

      {amount0 && amount1 && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-slate-800/30 rounded-xl p-4 space-y-3"
        >
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">LP Tokens to Receive</span>
            <span className="text-white font-medium">~{(Math.sqrt(parseFloat(amount0) * parseFloat(amount1))).toFixed(6)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Pool Share</span>
            <span className="text-white font-medium">0.12%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Exchange Rate</span>
            <div className="text-right">
              <div className="text-white text-xs">1 {token0} = {(parseFloat(amount1) / parseFloat(amount0)).toFixed(4)} {token1}</div>
              <div className="text-white text-xs">1 {token1} = {(parseFloat(amount0) / parseFloat(amount1)).toFixed(4)} {token0}</div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.button
        disabled={!amount0 || !amount1 || loading}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        <span>{loading ? 'Adding Liquidity...' : 'Add Liquidity'}</span>
      </motion.button>
    </motion.div>
  )

  const RemoveLiquidityTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Remove Liquidity</h3>
          <div className="text-sm text-slate-400">
            Balance: {poolData.userLPBalance} LP
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
              <span className="text-lg">{DEFI_TOKENS[token0]?.logo}</span>
              <span className="font-medium text-white">{token0}</span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-white">
                {((parseFloat(poolData.userLPBalance) * removePercentage / 100) * (parseFloat(poolData.reserve0) / parseFloat(poolData.totalLPSupply))).toFixed(6)}
              </div>
              <div className="text-xs text-slate-400">
                ${((parseFloat(poolData.userLPBalance) * removePercentage / 100) * (parseFloat(poolData.reserve0) / parseFloat(poolData.totalLPSupply)) * parseFloat(poolData.token0Price)).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <span className="text-lg">{DEFI_TOKENS[token1]?.logo}</span>
              <span className="font-medium text-white">{token1}</span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-white">
                {((parseFloat(poolData.userLPBalance) * removePercentage / 100) * (parseFloat(poolData.reserve1) / parseFloat(poolData.totalLPSupply))).toFixed(6)}
              </div>
              <div className="text-xs text-slate-400">
                ${((parseFloat(poolData.userLPBalance) * removePercentage / 100) * (parseFloat(poolData.reserve1) / parseFloat(poolData.totalLPSupply)) * parseFloat(poolData.token1Price)).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.button
        disabled={loading}
        className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        <span>{loading ? 'Removing Liquidity...' : 'Remove Liquidity'}</span>
      </motion.button>
    </motion.div>
  )

  const PoolsTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Your Liquidity Positions</h3>
        <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
          View all
        </button>
      </div>

      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center -space-x-1">
              <span className="text-xl">{DEFI_TOKENS[token0]?.logo}</span>
              <span className="text-xl">{DEFI_TOKENS[token1]?.logo}</span>
            </div>
            <div>
              <div className="font-semibold text-white">{token0}/{token1}</div>
              <div className="text-xs text-slate-400">24.5% APR</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white">$1,250.50</div>
            <div className="text-xs text-green-400">+$45.20 (24h)</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xs text-slate-400 mb-1">Pool Share</div>
            <div className="font-semibold text-white">0.54%</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-400 mb-1">LP Tokens</div>
            <div className="font-semibold text-white">0.5432</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-400 mb-1">Fees Earned</div>
            <div className="font-semibold text-green-400">$12.50</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setActiveTab('add')}
            className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Add More
          </button>
          <button
            onClick={() => setActiveTab('remove')}
            className="py-2 px-4 border border-slate-600 hover:border-slate-500 text-white rounded-lg font-medium transition-colors"
          >
            Remove
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-md font-semibold text-white mb-3">Popular Pools</h4>
        <div className="space-y-2">
          {POPULAR_PAIRS.map((pair, index) => (
            <motion.div
              key={`${pair.token0}-${pair.token1}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-all duration-200 cursor-pointer"
              onClick={() => {
                setToken0(pair.token0)
                setToken1(pair.token1)
                setActiveTab('add')
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center -space-x-1">
                  <span className="text-lg">{DEFI_TOKENS[pair.token0]?.logo}</span>
                  <span className="text-lg">{DEFI_TOKENS[pair.token1]?.logo}</span>
                </div>
                <div>
                  <div className="font-medium text-white">{pair.token0}/{pair.token1}</div>
                  <div className="text-xs text-slate-400">TVL: {pair.tvl}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-semibold">{pair.apr}</div>
                <div className="text-xs text-slate-400">APR</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="max-w-lg mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Liquidity</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-slate-700/50 rounded-xl transition-colors"
              >
                <Settings className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 bg-slate-800/50 p-1 rounded-2xl">
            <TabButton 
              id="add" 
              label="Add" 
              icon={Plus} 
              isActive={activeTab === 'add'} 
              onClick={() => setActiveTab('add')} 
            />
            <TabButton 
              id="remove" 
              label="Remove" 
              icon={Minus} 
              isActive={activeTab === 'remove'} 
              onClick={() => setActiveTab('remove')} 
            />
            <TabButton 
              id="pools" 
              label="Pools" 
              icon={TrendingUp} 
              isActive={activeTab === 'pools'} 
              onClick={() => setActiveTab('pools')} 
            />
          </div>
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'add' && <AddLiquidityTab />}
            {activeTab === 'remove' && <RemoveLiquidityTab />}
            {activeTab === 'pools' && <PoolsTab />}
          </AnimatePresence>
        </div>

        {/* Info Section */}
        <div className="p-6 pt-0">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">Liquidity Provider Rewards</p>
                <p>Earn 0.20% of all trades on this pair proportional to your share of the pool. Fees are added to the pool and accrue in real time.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e293b;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e293b;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  )
}