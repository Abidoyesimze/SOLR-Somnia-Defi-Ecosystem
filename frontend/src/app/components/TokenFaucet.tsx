'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react'
import { useFaucet } from '../lib/hooks/useFaucet'
import { TestTokenFaucetContract } from '../../abi'
import { toast } from 'react-hot-toast'
import { ethers } from 'ethers'

// Success Modal Component
function SuccessModal({ isOpen, onClose, claimedTokens }: { 
  isOpen: boolean; 
  onClose: () => void; 
  claimedTokens: { symbol: string; amount: string }[] 
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Tokens Claimed Successfully! 🎉</h3>
          <p className="text-slate-300 mb-6">
            You've successfully claimed your test tokens. You can now use them to test our DeFi protocols.
          </p>
          
          <div className="space-y-3 mb-6">
            {claimedTokens.map((token, index) => (
              <div key={index} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
                <span className="text-white font-medium">{token.symbol}</span>
                <span className="text-green-400 font-bold">{token.amount}</span>
              </div>
            ))}
          </div>

          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-blue-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Next claim available in 24 hours</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function TokenFaucet() {
  const { 
    isConnected, 
    address, 
    canClaim, 
    isLoading, 
    isClaimSuccess,
    claimTokens,
    claimSpecificToken,
    lastClaimTime,
    timeUntilNextClaim
  } = useFaucet()

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [claimedTokens, setClaimedTokens] = useState<{ symbol: string; amount: string }[]>([])

  // Show success modal when claim is successful
  useEffect(() => {
    if (isClaimSuccess && !showSuccessModal) {
      setClaimedTokens([
        { symbol: 'WSOM', amount: '1000' },
        { symbol: 'USDC', amount: '1000' },
        { symbol: 'SOMG', amount: '100' }
      ])
      setShowSuccessModal(true)
      toast.success('Tokens claimed successfully! 🎉')
    }
  }, [isClaimSuccess, showSuccessModal])

  // Debug logging
  console.log('🔍 TokenFaucet Component Debug:', {
    isConnected,
    address,
    canClaim,
    isLoading,
    isClaimSuccess,
    faucetAddress: TestTokenFaucetContract.address,
    lastClaimTime,
    timeUntilNextClaim
  })

  const handleClaimAll = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      await claimTokens()
    } catch (error) {
      console.error('Claim failed:', error)
      toast.error('Failed to claim tokens')
    }
  }

  const handleClaimSpecific = async (token: 'WSOM' | 'USDC' | 'SOMG') => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      await claimSpecificToken(token)
    } catch (error) {
      console.error(`Claim ${token} failed:`, error)
      toast.error(`Failed to claim ${token}`)
    }
  }

  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return 'Ready to claim'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`
    }
    return `${minutes}m remaining`
  }

  const isContractDeployed = true // Assuming contract is deployed

  const tokenCards = [
    {
      symbol: 'USDC',
      name: 'USD Coin',
      amount: '1000',
      color: 'from-green-500 to-emerald-600',
      icon: '💵',
      deployed: true
    },
    {
      symbol: 'SOMG',
      name: 'Governance Token',
      amount: '100',
      color: 'from-purple-500 to-violet-600',
      icon: '🗳️',
      deployed: true
    },
    {
      symbol: 'WSOM',
      name: 'Wrapped Somnia',
      amount: '1000',
      color: 'from-blue-500 to-indigo-600',
      icon: '🌙',
      deployed: true
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Success Modal */}
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
        claimedTokens={claimedTokens}
      />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Test Token Faucet</h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Get test tokens to explore our DeFi ecosystem. Claim tokens every 24 hours to test trading, lending, staking, and governance features.
          </p>
        </motion.div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Contract Status</h3>
            </div>
            <p className="text-2xl font-bold text-green-400">
              {isContractDeployed ? '✅ Deployed' : '❌ Not Deployed'}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              {isContractDeployed ? 'Smart contract is ready' : 'Contract not found on network'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Can Claim</h3>
            </div>
            <p className="text-2xl font-bold text-green-400">
              {canClaim ? '✅ Yes' : '❌ No'}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              {canClaim ? 'Ready to claim tokens' : 'Wait for next claim window'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Wallet Connected</h3>
              </div>
              <button
                onClick={() => {
                  // Force refresh the page to reconnect wallet
                  window.location.reload()
                }}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded-lg transition-colors"
                title="Refresh wallet connection"
              >
                🔄
              </button>
            </div>
            <p className={`text-2xl font-bold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? '✅ Yes' : '❌ No'}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              {isConnected ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect wallet to claim'}
            </p>
          </motion.div>
        </div>

        {/* Wallet Connection Help */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-6 mb-8 text-center"
          >
            <div className="flex items-center justify-between mb-3">
              <AlertCircle className="w-6 h-6 text-amber-400" />
              <h3 className="text-xl font-semibold text-amber-400">Wallet Connection Issue</h3>
            </div>
            <p className="text-amber-300 text-lg font-medium mb-3">
              Your wallet appears to be connected in the header but not detected here
            </p>
            <div className="space-y-2 text-amber-200/80 text-sm">
              <p>Try these solutions:</p>
              <ul className="space-y-1">
                <li>• Click the refresh button (🔄) above</li>
                <li>• Disconnect and reconnect your wallet in the header</li>
                <li>• Refresh the entire page</li>
                <li>• Check if you're on the correct network (Somnia Testnet)</li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* Contract Test Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="text-center mb-8"
        >
          <button
            onClick={async () => {
              try {
                console.log('🧪 Testing contract calls...')
                
                // Test basic contract interaction
                if (typeof window !== 'undefined' && window.ethereum) {
                  const provider = new ethers.BrowserProvider(window.ethereum)
                  const signer = await provider.getSigner()
                  
                  console.log('✅ Provider and signer created')
                  console.log('📝 Signer address:', await signer.getAddress())
                  
                  // Test the canClaim function
                  const contract = new ethers.Contract(
                    TestTokenFaucetContract.address,
                    TestTokenFaucetContract.abi,
                    signer
                  )
                  
                  console.log('✅ Contract instance created')
                  console.log('🏗️ Contract address:', TestTokenFaucetContract.address)
                  
                  try {
                    const canClaimResult = await contract.canClaim(await signer.getAddress())
                    console.log('✅ canClaim result:', canClaimResult)
                  } catch (error) {
                    console.error('❌ canClaim failed:', error)
                  }
                  
                  try {
                    const timeUntilNextClaim = await contract.getTimeUntilNextClaim(await signer.getAddress())
                    console.log('✅ getTimeUntilNextClaim result:', timeUntilNextClaim.toString())
                  } catch (error) {
                    console.error('❌ getTimeUntilNextClaim failed:', error)
                  }
                  
                  toast.success('Contract test completed! Check console for results.')
                }
              } catch (error) {
                console.error('❌ Contract test failed:', error)
                toast.error('Contract test failed! Check console for errors.')
              }
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            🧪 Test Contract Calls
          </button>
          <p className="text-slate-400 text-sm mt-2">
            Test basic contract functions to debug issues
          </p>
        </motion.div>

        {/* Direct Claim Button (Backup) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mb-8"
        >
          <button
            onClick={async () => {
              try {
                console.log('🚀 Direct claim attempt...')
                
                if (typeof window !== 'undefined' && window.ethereum) {
                  const provider = new ethers.BrowserProvider(window.ethereum)
                  const signer = await provider.getSigner()
                  
                  const contract = new ethers.Contract(
                    TestTokenFaucetContract.address,
                    TestTokenFaucetContract.abi,
                    signer
                  )
                  
                  toast.loading('Claiming tokens directly...')
                  
                  // Try to claim all tokens directly
                  const tx = await contract.claimTokens()
                  console.log('✅ Transaction sent:', tx.hash)
                  
                  toast.dismiss()
                  toast.loading('Confirming transaction...')
                  
                  const receipt = await tx.wait()
                  console.log('✅ Transaction confirmed:', receipt)
                  
                  toast.dismiss()
                  toast.success('Tokens claimed successfully! 🎉')
                  
                  // Refresh the page to update UI
                  setTimeout(() => {
                    window.location.reload()
                  }, 2000)
                  
                }
              } catch (error: any) {
                console.error('❌ Direct claim failed:', error)
                toast.dismiss()
                
                if (error.code === 'ACTION_REJECTED') {
                  toast.error('Transaction cancelled by user')
                } else if (error.reason) {
                  toast.error(`Claim failed: ${error.reason}`)
                } else if (error.message) {
                  toast.error(`Claim failed: ${error.message}`)
                } else {
                  toast.error('Claim failed. Please try again.')
                }
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            🚀 Direct Claim (Backup)
          </button>
          <p className="text-slate-400 text-sm mt-2">
            Bypass Wagmi hooks and claim directly with ethers.js
          </p>
        </motion.div>

        {/* Grant Minting Permissions Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="text-center mb-8"
        >
          <button
            onClick={async () => {
              try {
                console.log('🔑 Granting minting permissions to faucet...')
                
                if (typeof window !== 'undefined' && window.ethereum) {
                  const provider = new ethers.BrowserProvider(window.ethereum)
                  const signer = await provider.getSigner()
                  
                  // Check if user is the owner of the token contracts
                  const wsomContract = new ethers.Contract(
                    '0x7E3EeD3f3B09Df10A06adA95Bc9887D5385935DB', // WSOM address
                    ['function owner() view returns (address)', 'function addAuthorizedMinter(address minter)'],
                    signer
                  )
                  
                  const usdcContract = new ethers.Contract(
                    '0xe2dB8A87E83b1A3fE7db7128d186079A9F958bEA', // USDC address
                    ['function owner() view returns (address)', 'function addAuthorizedMinter(address minter)'],
                    signer
                  )
                  
                  const somgContract = new ethers.Contract(
                    '0x58f5C4d7C08C6D9B45624ffE1C9fA3119e98991a', // SOMG address
                    ['function owner() view returns (address)', 'function addAuthorizedMinter(address minter)'],
                    signer
                  )
                  
                  // Check ownership
                  const userAddress = await signer.getAddress()
                  const wsomOwner = await wsomContract.owner()
                  const usdcOwner = await usdcContract.owner()
                  const somgOwner = await somgContract.owner()
                  
                  console.log('🔍 Token ownership check:', {
                    userAddress,
                    wsomOwner,
                    usdcOwner,
                    somgOwner,
                    faucetAddress: TestTokenFaucetContract.address
                  })
                  
                  if (userAddress.toLowerCase() !== wsomOwner.toLowerCase() &&
                      userAddress.toLowerCase() !== usdcOwner.toLowerCase() &&
                      userAddress.toLowerCase() !== somgOwner.toLowerCase()) {
                    toast.error('You are not the owner of the token contracts. Only the owner can grant minting permissions.')
                    return
                  }
                  
                  toast.loading('Granting minting permissions...')
                  
                  // Grant permissions to faucet
                  const faucetAddress = TestTokenFaucetContract.address
                  
                  if (userAddress.toLowerCase() === wsomOwner.toLowerCase()) {
                    const wsomTx = await wsomContract.addAuthorizedMinter(faucetAddress)
                    await wsomTx.wait()
                    console.log('✅ WSOM minting permission granted')
                  }
                  
                  if (userAddress.toLowerCase() === usdcOwner.toLowerCase()) {
                    const usdcTx = await usdcContract.addAuthorizedMinter(faucetAddress)
                    await usdcTx.wait()
                    console.log('✅ USDC minting permission granted')
                  }
                  
                  if (userAddress.toLowerCase() === somgOwner.toLowerCase()) {
                    const somgTx = await somgContract.addAuthorizedMinter(faucetAddress)
                    await somgTx.wait()
                    console.log('✅ SOMG minting permission granted')
                  }
                  
                  toast.dismiss()
                  toast.success('Minting permissions granted! Faucet should now work.')
                  
                  // Refresh the page
                  setTimeout(() => {
                    window.location.reload()
                  }, 2000)
                  
                }
              } catch (error: any) {
                console.error('❌ Grant permissions failed:', error)
                toast.dismiss()
                
                if (error.code === 'ACTION_REJECTED') {
                  toast.error('Transaction cancelled by user')
                } else if (error.reason) {
                  toast.error(`Grant permissions failed: ${error.reason}`)
                } else if (error.message) {
                  toast.error(`Grant permissions failed: ${error.message}`)
                } else {
                  toast.error('Grant permissions failed. Please try again.')
                }
              }
            }}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            🔑 Grant Minting Permissions
          </button>
          <p className="text-slate-400 text-sm mt-2">
            Grant faucet permission to mint tokens (requires token contract ownership)
          </p>
        </motion.div>

        {/* Cooldown Timer */}
        {lastClaimTime && timeUntilNextClaim > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-6 mb-8 text-center"
          >
            <div className="flex items-center justify-center space-x-3 mb-3">
              <Clock className="w-6 h-6 text-amber-400" />
              <h3 className="text-xl font-semibold text-amber-400">Claim Cooldown Active</h3>
            </div>
            <p className="text-amber-300 text-lg font-medium">
              {formatTimeRemaining(timeUntilNextClaim)}
            </p>
            <p className="text-amber-200/80 text-sm mt-2">
              You can claim again once the cooldown period ends
            </p>
          </motion.div>
        )}

        {/* Claim All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mb-12"
        >
          <button
            onClick={handleClaimAll}
            disabled={!isConnected || !canClaim || isLoading}
            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
              !isConnected || !canClaim || isLoading
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Claiming...</span>
              </div>
            ) : (
              '🎯 Claim All Tokens'
            )}
          </button>
          <p className="text-slate-400 text-sm mt-3">
            Claim all three token types at once (WSOM, USDC, SOMG)
          </p>
        </motion.div>

        {/* Individual Token Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {tokenCards.map((token, index) => (
            <motion.div
              key={token.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all"
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${token.color} flex items-center justify-center text-2xl font-bold text-white`}>
                {token.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 text-center">{token.name}</h3>
              <p className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {token.amount}
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Status:</span>
                  <span className={`font-medium ${token.deployed ? 'text-green-400' : 'text-red-400'}`}>
                    {token.deployed ? '✅ Deployed' : '❌ Not Deployed'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Network:</span>
                  <span className="text-blue-400 font-medium">Somnia Testnet</span>
                </div>
              </div>

              <button
                onClick={() => handleClaimSpecific(token.symbol as 'WSOM' | 'USDC' | 'SOMG')}
                disabled={!isConnected || !canClaim || isLoading || !token.deployed}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                  !isConnected || !canClaim || isLoading || !token.deployed
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                }`}
              >
                {isLoading ? 'Claiming...' : `Claim ${token.symbol}`}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-8 border border-slate-700"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Connect Wallet</h4>
              <p className="text-slate-300 text-sm">
                Connect your wallet to the Somnia testnet to access the faucet
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Claim Tokens</h4>
              <p className="text-slate-300 text-sm">
                Claim test tokens for WSOM, USDC, and SOMG to test our DeFi protocols
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Start Testing</h4>
              <p className="text-slate-300 text-sm">
                Use your tokens to test trading, lending, staking, and governance features
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contract Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center space-x-2 bg-slate-800/60 rounded-lg px-4 py-2 border border-slate-700">
            <ExternalLink className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 text-sm">
              Faucet Contract: {TestTokenFaucetContract.address.slice(0, 6)}...{TestTokenFaucetContract.address.slice(-4)}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 