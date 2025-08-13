'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Code, Download, BookOpen, Zap, Shield, TrendingUp } from 'lucide-react'

const DeveloperDocs = () => {
  const [activeTab, setActiveTab] = useState('getting-started')

  const tabs = [
    { id: 'getting-started', label: 'Getting Started', icon: BookOpen },
    { id: 'api', label: 'API Reference', icon: Code },
    { id: 'sdk', label: 'SDK', icon: Download },
    { id: 'examples', label: 'Examples', icon: Zap }
  ]

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <motion.div 
        className="text-center mb-16"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Developer Documentation
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Integrate SOLR into your applications with our comprehensive API, SDK, and examples.
        </p>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.2 }}
      >
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <Zap className="w-12 h-12 text-blue-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">High Performance</h3>
          <p className="text-gray-400">Sub-second response times with our optimized routing engine.</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <Shield className="w-12 h-12 text-green-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
          <p className="text-gray-400">Built with security best practices and extensive testing.</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <TrendingUp className="w-12 h-12 text-purple-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Always Up-to-Date</h3>
          <p className="text-gray-400">Real-time price feeds and liquidity updates.</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex border-b border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        <div className="p-8">
          {activeTab === 'getting-started' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
              <div className="space-y-4 text-gray-300">
                <p>Welcome to SOLR! Here&apos;s how to get started:</p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Install the SOLR SDK</li>
                  <li>Configure your API keys</li>
                  <li>Make your first swap request</li>
                  <li>Integrate into your application</li>
                </ol>
                <div className="bg-gray-900 p-4 rounded-lg mt-6">
                  <pre className="text-sm text-green-400">
{`npm install @solr/sdk

import { SolrSDK } from '@solr/sdk';

const solr = new SolrSDK({
  apiKey: 'your-api-key'
});`}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'api' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-4">API Reference</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Get Quote</h3>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <pre className="text-sm text-green-400">
{`GET /api/v1/quote
?fromToken=WSOM&toToken=USDC&amount=1000000000000000000`}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Execute Swap</h3>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <pre className="text-sm text-green-400">
{`POST /api/v1/swap
{
  "fromToken": "WSOM",
  "toToken": "USDC", 
  "amount": "1000000000000000000",
  "slippage": 0.5
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'sdk' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-4">SDK</h2>
              <div className="space-y-4 text-gray-300">
                <p>Our official SDK provides a simple interface to all SOLR functionality:</p>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <pre className="text-sm text-green-400">
{`// Initialize SDK
const solr = new SolrSDK({
  apiKey: 'your-api-key',
  network: 'somnia-testnet'
});

// Get quote
const quote = await solr.getQuote({
  fromToken: 'WSOM',
  toToken: 'USDC',
  amount: '1000000000000000000'
});

// Execute swap
const swap = await solr.executeSwap({
  quoteId: quote.id,
  walletAddress: '0x...'
});`}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'examples' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-4">Examples</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">React Hook Example</h3>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <pre className="text-sm text-green-400">
{`import { useSolrSwap } from '@solr/react';

function SwapComponent() {
  const { swap, isLoading, error } = useSolrSwap();
  
  const handleSwap = async () => {
    await swap({
      fromToken: 'WSOM',
      toToken: 'USDC',
      amount: '1000000000000000000'
    });
  };
  
  return (
    <button onClick={handleSwap} disabled={isLoading}>
      {isLoading ? 'Swapping...' : 'Swap WSOM to USDC'}
    </button>
  );
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DeveloperDocs 