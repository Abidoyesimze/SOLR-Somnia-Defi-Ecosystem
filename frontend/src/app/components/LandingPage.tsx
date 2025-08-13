'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Zap, 
  Shield, 
  TrendingUp, 
  ArrowRight, 
  BarChart3, 
  Code, 
  Users, 
  CheckCircle,
  ExternalLink,
  Github,
  Twitter,
  MessageSquare
} from 'lucide-react'
import Header from './Header'
import Footer from './Footer'
import { formatNumber, formatCurrency } from '../lib/utils/format'
import { PROTOCOLS } from '../lib/constants'

const LandingPage = () => {
  const [stats, setStats] = useState({
    totalVolume: 0,
    totalSavings: 0,
    protocolCount: 0,
    dailyTxns: 0
  })

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
    // Animate stats
    const animateStats = () => {
      const targets = {
        totalVolume: 2400000,
        totalSavings: 12800,
        protocolCount: 8,
        dailyTxns: 1250
      }
      
      Object.keys(targets).forEach(key => {
        let current = 0
        const target = targets[key as keyof typeof targets]
        const increment = target / 50
        
        const timer = setInterval(() => {
          current += increment
          if (current >= target) {
            current = target
            clearInterval(timer)
          }
          setStats(prev => ({ ...prev, [key]: Math.floor(current) }))
        }, 50)
      })
    }
    
    setTimeout(animateStats, 1000)
  }, [])

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-gray-900" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            className="text-center mb-16"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              variants={fadeInUp}
            >
              The <span className="gradient-text">Universal</span><br />
              Asset Router for<br />
              <span className="gradient-text">Somnia</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              Route virtual assets and experiences across Somnia's SOM0 and SOM1 protocols. 
              Enable cross-metaverse interoperability and composable virtual worlds.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={fadeInUp}
            >
              <Link href="/swap" className="btn-primary">
                Start Trading
              </Link>
              <button 
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary"
              >
                See Demo
              </button>
            </motion.div>
          </motion.div>
          
          {/* Live Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div className="stat-card text-center" variants={fadeInUp}>
              <div className="text-3xl font-bold gradient-text mb-2">
                ${formatNumber(stats.totalVolume / 1000000, 1)}M
              </div>
              <div className="text-gray-400 text-sm">Total Volume Routed</div>
            </motion.div>
            
            <motion.div className="stat-card text-center" variants={fadeInUp}>
              <div className="text-3xl font-bold gradient-text mb-2">
                ${formatNumber(stats.totalSavings / 1000, 1)}K
              </div>
              <div className="text-gray-400 text-sm">User Savings</div>
            </motion.div>
            
            <motion.div className="stat-card text-center" variants={fadeInUp}>
              <div className="text-3xl font-bold gradient-text mb-2">
                {stats.protocolCount}
              </div>
              <div className="text-gray-400 text-sm">Integrated Protocols</div>
            </motion.div>
            
            <motion.div className="stat-card text-center" variants={fadeInUp}>
              <div className="text-3xl font-bold gradient-text mb-2">
                {formatNumber(stats.dailyTxns)}
              </div>
              <div className="text-gray-400 text-sm">Daily Transactions</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo" className="py-20 px-4 bg-gray-800/20">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">See SOLR in Action</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Watch how SOLR finds the best route across multiple DEXs to save you money on every trade
            </p>
          </motion.div>
          
          {/* Route Comparison */}
          <motion.div 
            className="grid md:grid-cols-2 gap-12 items-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-6">Trade: 1000 WSOM → USDC</h3>
                
                {/* Direct Route */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400">Direct Swap (UniswapV2)</span>
                    <span className="text-red-400 flex items-center">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                      Not Optimal
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                      W
                    </div>
                    <div className="flex-1 h-0.5 bg-gray-600 rounded relative">
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-gray-600 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent"></div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      U
                    </div>
                  </div>
                  <div className="text-right mt-2 text-gray-300">
                    Output: <span className="text-red-400">1,847 USDC</span>
                  </div>
                </div>
                
                {/* SOLR Route */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400">SOLR Best Route</span>
                    <span className="text-green-400 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      +2.3% Better
                    </span>
                  </div>
                  <div className="route-path">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      W
                    </div>
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded relative">
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-purple-500 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent"></div>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      E
                    </div>
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded relative">
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-purple-500 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent"></div>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      U
                    </div>
                  </div>
                  <div className="text-right mt-2 space-y-1">
                    <div className="text-gray-300">Output: <span className="text-green-400">1,890 USDC</span></div>
                    <div className="text-green-400 text-sm">+43 USDC saved ({formatCurrency(43)})</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Animated Router Visualization */}
            <div className="relative">
              <motion.div 
                className="w-64 h-64 mx-auto bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl flex items-center justify-center border border-blue-600/30"
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                    <span className="text-2xl font-bold">S</span>
                    <motion.div 
                      className="absolute inset-0 border-2 border-blue-400/50 rounded-2xl"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <div className="text-xl font-semibold">SOLR Router</div>
                  <motion.div 
                    className="text-gray-400 text-sm"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Finding best path...
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Pulse Effects */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div 
                  className="w-64 h-64 border-2 border-blue-500/30 rounded-3xl"
                  animate={{ scale: [0.8, 1.2], opacity: [1, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link href="/swap" className="inline-flex items-center space-x-2 btn-primary">
              <span>Try It Yourself</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Choose SOLR?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              The most advanced liquidity aggregation protocol built for Somnia&apos;s high-speed infrastructure
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div className="feature-card group" variants={fadeInUp}>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Lightning Fast</h3>
              <p className="text-gray-300 leading-relaxed">
                Sub-second route calculation and instant settlement leveraging Somnia&apos;s high-speed infrastructure. No waiting, just trading.
              </p>
            </motion.div>
            
            <motion.div className="feature-card group" variants={fadeInUp}>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Best Prices Always</h3>
              <p className="text-gray-300 leading-relaxed">
                Our smart routing algorithm finds optimal paths across all DEXs to guarantee you the best possible price on every trade.
              </p>
            </motion.div>
            
            <motion.div className="feature-card group" variants={fadeInUp}>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Fully On-Chain</h3>
              <p className="text-gray-300 leading-relaxed">
                No centralized components, no off-chain dependencies. Everything runs on Somnia for maximum security and decentralization.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Protocol Integration Section */}
      <section className="py-20 px-4 bg-gray-800/20">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Somnia Protocols</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              SOLR integrates with Somnia's core protocols for seamless asset routing and virtual world composition
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {PROTOCOLS.map((protocol, index) => (
              <motion.div
                key={protocol.name}
                className={`${protocol.color} rounded-xl p-6 text-white`}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl mb-4">{protocol.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{protocol.name}</h3>
                <p className="text-sm opacity-90 mb-4">{protocol.description}</p>
                <div className="space-y-2">
                  {protocol.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    protocol.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}>
                    {protocol.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="grid md:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Built for Developers</h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Integrate SOLR into your dApp with just a few lines of code. 
                Give your users access to the best liquidity across all of Somnia.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  'One function call for best route',
                  'Revenue sharing for integrations',
                  'React hooks and SDKs ready',
                  'Comprehensive documentation'
                ].map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span>{feature}</span>
                  </motion.div>
                ))}
              </div>
              
              <Link href="/developers" className="inline-flex items-center space-x-2 btn-primary">
                <Code className="w-5 h-5" />
                <span>View Documentation</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-400 text-sm ml-2">integration-example.js</span>
              </div>
              <pre className="text-sm text-gray-300 overflow-x-auto">
                <code>{`import { SolrSDK } from '@solr/sdk';

const solr = new SolrSDK(provider);

// Get best route
const route = await solr.getBestRoute(
  'WSOM', 'USDC', '1000'
);

// Execute swap
const tx = await solr.executeSwap(
  route, 
  { slippage: 0.5 }
);

console.log(\`Saved: \${route.savings} USDC\`);`}</code>
              </pre>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ecosystem Impact Section */}
      <section className="py-20 px-4 bg-gray-800/20">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Ecosystem Impact</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              SOLR is more than a DEX aggregator - it&apos;s the liquidity infrastructure that powers Somnia&apos;s DeFi ecosystem
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div className="text-center" variants={fadeInUp}>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Better for Users</h3>
              <p className="text-gray-300">
                Always get the best price with lowest slippage. Save money on every trade through intelligent routing.
              </p>
            </motion.div>
            
            <motion.div className="text-center" variants={fadeInUp}>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Better for Protocols</h3>
              <p className="text-gray-300">
                Increase your protocol&apos;s volume and fees through SOLR integration. Revenue sharing model benefits everyone.
              </p>
            </motion.div>
            
            <motion.div className="text-center" variants={fadeInUp}>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Better for Somnia</h3>
              <p className="text-gray-300">
                Unified liquidity layer reduces fragmentation and creates network effects that benefit the entire ecosystem.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to <span className="gradient-text">Route</span> Smarter?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join the future of DeFi on Somnia. Get better prices, save on fees, 
              and experience lightning-fast swaps.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/swap" className="btn-primary text-lg px-8 py-4">
                Launch SOLR App
              </Link>
              <Link href="/analytics" className="btn-secondary text-lg px-8 py-4">
                View Analytics
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default LandingPage