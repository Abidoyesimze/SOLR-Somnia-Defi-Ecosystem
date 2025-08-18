'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { useAccount, useReadContract } from 'wagmi'
import { 
  SomniaAmmContract, 
  SomniaGovernanceContract, 
  SomniaLendingContract, 
  SomniaStakingContract,
  TestTokenFaucetContract
} from '../../abi'

export default function TestPage() {
  const { address, isConnected } = useAccount()
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<any>({})

  // Test contract connections
  const testContracts = async () => {
    setIsTesting(true)
    const results: any = {}

    try {
      // Test AMM Contract
      try {
        const ammResult = await useReadContract({
          address: SomniaAmmContract.address as `0x${string}`,
          abi: SomniaAmmContract.abi,
          functionName: 'TRADING_FEE',
        })
        results.amm = { success: true, data: ammResult }
      } catch (error) {
        results.amm = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }

      // Test Governance Contract
      try {
        const govResult = await useReadContract({
          address: SomniaGovernanceContract.address as `0x${string}`,
          abi: SomniaGovernanceContract.abi,
          functionName: 'name',
        })
        results.governance = { success: true, data: govResult }
      } catch (error) {
        results.governance = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }

      // Test Lending Contract
      try {
        const lendingResult = await useReadContract({
          address: SomniaLendingContract.address as `0x${string}`,
          abi: SomniaLendingContract.abi,
          functionName: 'owner',
        })
        results.lending = { success: true, data: lendingResult }
      } catch (error) {
        results.lending = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }

      // Test Staking Contract
      try {
        const stakingResult = await useReadContract({
          address: SomniaStakingContract.address as `0x${string}`,
          abi: SomniaStakingContract.abi,
          functionName: 'owner',
        })
        results.staking = { success: true, data: stakingResult }
      } catch (error) {
        results.staking = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }

      // Test Faucet Contract
      try {
        const faucetResult = await useReadContract({
          address: TestTokenFaucetContract.address as `0x${string}`,
          abi: TestTokenFaucetContract.abi,
          functionName: 'owner',
        })
        results.faucet = { success: true, data: faucetResult }
      } catch (error) {
        results.faucet = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }

      setTestResults(results)
    } catch (error) {
      console.error('Test failed:', error)
    } finally {
      setIsTesting(false)
    }
  }

  const getStatusIcon = (success: boolean) => {
    if (success) return <CheckCircle className="w-5 h-5 text-emerald-400" />
    return <XCircle className="w-5 h-5 text-red-400" />
  }

  const getStatusColor = (success: boolean) => {
    if (success) return 'border-emerald-500/30 bg-emerald-500/10'
    return 'border-red-500/30 bg-red-500/10'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900">
      <div className="max-w-4xl mx-auto p-6 pt-20">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Contract Integration Test</h1>
          <p className="text-slate-300 text-lg">
            Test all smart contract connections and verify they're working properly
          </p>
        </motion.div>

        {/* Test Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-8"
        >
          <button
            onClick={testContracts}
            disabled={!isConnected || isTesting}
            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 ${
              isConnected && !isTesting
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isTesting ? (
              <div className="flex items-center justify-center space-x-3">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Testing Contracts...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <AlertCircle className="w-5 h-5" />
                <span>Run Integration Tests</span>
              </div>
            )}
          </button>
        </motion.div>

        {/* Connection Status */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card card-hover p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Wallet Connection</h3>
          <div className="flex items-center space-x-3">
            {isConnected ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span className={isConnected ? 'text-emerald-400' : 'text-red-400'}>
              {isConnected ? 'Connected' : 'Not Connected'}
            </span>
            {isConnected && (
              <span className="text-slate-400 text-sm">
                ({address?.slice(0, 6)}...{address?.slice(-4)})
              </span>
            )}
          </div>
        </motion.div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white">Test Results</h3>
            
            {Object.entries(testResults).map(([contract, result]: [string, any]) => (
              <div
                key={contract}
                className={`p-4 rounded-lg border ${getStatusColor(result.success)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result.success)}
                    <span className="text-white font-medium capitalize">{contract}</span>
                  </div>
                  <span className={result.success ? 'text-emerald-400' : 'text-red-400'}>
                    {result.success ? 'Connected' : 'Failed'}
                  </span>
                </div>
                
                {result.success ? (
                  <p className="text-slate-300 text-sm mt-2">
                    Data: {result.data?.toString() || 'No data'}
                  </p>
                ) : (
                  <p className="text-red-300 text-sm mt-2">
                    Error: {result.error}
                  </p>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card card-hover p-6 mt-8"
        >
          <h3 className="text-lg font-semibold text-white mb-4">What This Tests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div>
              <p className="font-medium text-white mb-2">✅ Success means:</p>
              <ul className="space-y-1 text-slate-400">
                <li>• Contract is deployed and accessible</li>
                <li>• RPC connection is working</li>
                <li>• ABI matches deployed contract</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-white mb-2">❌ Failure means:</p>
              <ul className="space-y-1 text-slate-400">
                <li>• Contract not deployed yet</li>
                <li>• Wrong contract address</li>
                <li>• Network/RPC issues</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 