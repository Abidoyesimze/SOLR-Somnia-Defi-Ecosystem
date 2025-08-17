'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Coins, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { useFaucet } from '../lib/hooks/useFaucet'
import { toast } from 'react-hot-toast'

export default function TokenFaucet() {
  const {
    isLoading,
    isClaimSuccess,
    error,
    canClaim,
    claimStatus,
    faucetAmounts,
    handleClaimAll,
    handleClaimSpecific,
    refetchCanClaim,
    refetchClaimStatus,
    formatTimeUntilNextClaim,
    clearError
  } = useFaucet()

  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isContractDeployed, setIsContractDeployed] = useState<boolean>(true) // Assume deployed for now

  // Check if faucet contract is deployed
  useEffect(() => {
    const checkContract = async () => {
      try {
        // Try to call a simple function to check if contract exists
        // This will fail if the contract isn't deployed
        await refetchCanClaim()
        setIsContractDeployed(true)
      } catch (err) {
        setIsContractDeployed(false)
      }
    }
    
    checkContract()
  }, [refetchCanClaim])

  // Update time remaining every second
  useEffect(() => {
    if (claimStatus && Array.isArray(claimStatus) && claimStatus[1] > 0) {
      const interval = setInterval(() => {
        const now = Math.floor(Date.now() / 1000)
        const remaining = Math.max(0, claimStatus[1] - now)
        setTimeRemaining(remaining)
        
        if (remaining === 0) {
          refetchCanClaim()
          refetchClaimStatus()
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [claimStatus, refetchCanClaim, refetchClaimStatus])

  // Handle successful claims
  useEffect(() => {
    if (isClaimSuccess) {
      toast.success('Tokens claimed successfully! 🎉')
      refetchCanClaim()
      refetchClaimStatus()
    }
  }, [isClaimSuccess, refetchCanClaim, refetchClaimStatus])

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  const tokenCards = [
    {
      symbol: 'SOM',
      name: 'Somnia Token',
      amount: faucetAmounts.SOM,
      color: 'from-blue-500 to-indigo-600',
      icon: '🌙'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      amount: faucetAmounts.USDC,
      color: 'from-green-500 to-emerald-600',
      icon: '💵'
    },
    {
      symbol: 'SOMG',
      name: 'Governance Token',
      amount: faucetAmounts.SOMG,
      color: 'from-purple-500 to-violet-600',
      icon: '🗳️'
    }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
            <Coins className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Test Token Faucet
          </h1>
        </div>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Get test tokens to explore our DeFi ecosystem! Claim tokens every 24 hours to test swapping, 
          lending, staking, and governance features.
        </p>
      </motion.div>

      {/* Status Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="card card-hover p-6 mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {!isContractDeployed ? (
              <AlertCircle className="w-6 h-6 text-red-400" />
            ) : canClaim ? (
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            ) : (
              <Clock className="w-6 h-6 text-amber-400" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-white">
                {!isContractDeployed 
                  ? 'Faucet Not Deployed' 
                  : canClaim 
                    ? 'Ready to Claim!' 
                    : 'Cooldown Active'
                }
              </h3>
              <p className="text-slate-400">
                {!isContractDeployed 
                  ? 'Deploy the faucet contract first' 
                  : canClaim 
                    ? 'You can claim tokens now' 
                    : formatTimeUntilNextClaim(timeRemaining)
                }
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              refetchCanClaim()
              refetchClaimStatus()
            }}
            disabled={!isContractDeployed}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh status"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Token Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {tokenCards.map((token, index) => (
          <motion.div
            key={token.symbol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            className="card card-hover p-6 text-center"
          >
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${token.color} flex items-center justify-center text-3xl`}>
              {token.icon}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{token.name}</h3>
            <p className="text-2xl font-bold text-slate-300 mb-4">{token.amount} {token.symbol}</p>
            
            <button
              onClick={() => handleClaimSpecific(token.symbol as 'SOM' | 'USDC' | 'SOMG')}
              disabled={!isContractDeployed || !canClaim || isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                isContractDeployed && canClaim && !isLoading
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transform hover:scale-105'
                  : 'bg-slate-600 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Claiming...</span>
                </div>
              ) : !isContractDeployed ? (
                'Contract Not Deployed'
              ) : (
                `Claim ${token.symbol}`
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Claim All Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-center mb-8"
      >
        <button
          onClick={handleClaimAll}
          disabled={!isContractDeployed || !canClaim || isLoading}
          className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 ${
            isContractDeployed && canClaim && !isLoading
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl'
              : 'bg-slate-600 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-3">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Claiming All Tokens...</span>
            </div>
          ) : !isContractDeployed ? (
            <div className="flex items-center justify-center space-x-3">
              <AlertCircle className="w-6 h-6" />
              <span>Deploy Faucet First</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3">
              <Coins className="w-6 h-6" />
              <span>Claim All Tokens</span>
            </div>
          )}
        </button>
      </motion.div>

      {/* Info Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="card card-hover p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-blue-400" />
          <span>How it works</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium text-white">Connect Wallet</p>
                <p>Make sure your wallet is connected to Somnia testnet</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium text-white">Claim Tokens</p>
                <p>Click claim to receive test tokens for free</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium text-white">24h Cooldown</p>
                <p>Wait 24 hours before claiming again</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                4
              </div>
              <div>
                <p className="font-medium text-white">Start Trading</p>
                <p>Use tokens to test our DeFi protocols</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 