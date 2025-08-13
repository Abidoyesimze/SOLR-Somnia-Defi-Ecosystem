'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Menu, 
  X, 
  ExternalLink, 
  BarChart3, 
  Code, 
  Zap,
  ChevronDown,
  Wifi,
  WifiOff
} from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

// Custom ConnectButton wrapper for better styling
const CustomConnectButton = () => {
  const { isConnected } = useAccount()
  
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="btn-primary"
                  >
                    Connect Wallet
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                  >
                    Wrong network
                  </button>
                )
              }

              return (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-200"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-sm text-gray-300">{chain.name}</span>
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-600 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                  >
                    {account.displayName}
                  </button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'Swap', href: '/swap', icon: Zap },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Developer', href: '/developer', icon: Code },
  ]

  const networks = [
    {
      name: 'Somnia Testnet',
      chainId: 50312,
      status: 'connected',
      rpc: 'https://testnet-rpc.somnia.network',
      explorer: 'https://testnet-explorer.somnia.network'
    }
  ]

  const currentNetwork = networks[0] // For now, only Somnia Testnet

  return (
    <motion.nav 
      className="fixed top-0 w-full z-50 bg-gray-900/90 backdrop-blur-xl border-b border-gray-800"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div 
              className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="text-white font-bold text-sm">S</span>
            </motion.div>
            <span className="text-xl font-semibold group-hover:text-blue-400 transition-colors">
              SOLR
            </span>
            <span className="text-xs bg-blue-600 text-blue-100 px-2 py-1 rounded-full">
              Beta
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`nav-link flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' 
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
          
          {/* Network & Wallet Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Network Selector */}
            <div className="relative">
              <button
                onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 transition-all duration-200"
              >
                <div className={`w-2 h-2 rounded-full ${
                  currentNetwork.status === 'connected' ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span className="text-sm text-gray-300">{currentNetwork.name}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              
              <AnimatePresence>
                {isNetworkDropdownOpen && (
                  <motion.div 
                    className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {networks.map((network) => (
                      <div key={network.chainId} className="p-4 hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{network.name}</span>
                          <div className="flex items-center space-x-1">
                            {network.status === 'connected' ? (
                              <Wifi className="w-4 h-4 text-green-400" />
                            ) : (
                              <WifiOff className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 space-y-1">
                          <div>Chain ID: {network.chainId}</div>
                          <div className="flex items-center space-x-2">
                            <span>Explorer</span>
                            <ExternalLink className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Gas Tracker */}
            <div className="text-sm text-gray-400 hidden lg:block">
              Gas: <span className="text-green-400">~0.001 SOM</span>
            </div>
            
            {/* Wallet Connection */}
            <CustomConnectButton />
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="md:hidden bg-gray-800 border-t border-gray-700"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation */}
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' 
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
              
              {/* Mobile Network Info */}
              <div className="px-4 py-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${
                    currentNetwork.status === 'connected' ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                  <span className="text-sm font-medium">{currentNetwork.name}</span>
                </div>
                <div className="text-xs text-gray-400">
                  Gas: <span className="text-green-400">~0.001 SOM</span>
                </div>
              </div>
              
              {/* Mobile Wallet Connection */}
              <CustomConnectButton />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Click outside to close dropdowns */}
      {(isNetworkDropdownOpen || isMobileMenuOpen) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsNetworkDropdownOpen(false)
            setIsMobileMenuOpen(false)
          }}
        />
      )}
    </motion.nav>
  )
}

export default Header