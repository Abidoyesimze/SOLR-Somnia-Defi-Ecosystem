'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Globe, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  Shield,
  Zap,
  BarChart3,
  Lock,
  ArrowRight,
  Star,
  Rocket
} from 'lucide-react'
import { DEFI_PROTOCOLS, DEFI_CATEGORIES, TRADING_PAIRS } from '../lib/constants'
import Header from './Header'
import Footer from './Footer'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.15),transparent_60%)] z-0"></div>
        
        <motion.div 
          className="relative z-10 max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="inline-flex items-center space-x-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Star className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400" />
            <span className="text-sm sm:text-base text-blue-300 font-medium">Somnia's Premier DeFi Ecosystem</span>
          </motion.div>

          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight tracking-tight text-white"
            variants={fadeInUp}
          >
            The <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Ultimate</span><br />
            DeFi Hub for<br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Somnia Network</span>
          </motion.h1>
            
          <motion.p 
            className="text-base sm:text-lg lg:text-xl text-slate-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed"
            variants={fadeInUp}
          >
            Trade, lend, stake, and govern with cutting-edge DeFi protocols designed for Somnia's ecosystem, secured with institutional-grade technology.
          </motion.p>
            
          <motion.div 
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
            variants={fadeInUp}
          >
            <motion.button 
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg shadow-lg hover:shadow-blue-500/40 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/trade')}
            >
              <span className="flex items-center space-x-2">
                <span>Launch App</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
            <motion.button 
              className="group bg-slate-800/50 border border-slate-600 text-slate-200 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-slate-800/80 hover:border-blue-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/docs')}
            >
              View Docs
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Trading Pairs Section */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 max-w-7xl mx-auto">
        <motion.h2 
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Popular Trading Pairs
        </motion.h2>
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {TRADING_PAIRS.map((pair, index) => (
            <motion.div
              key={pair.pair}
              className="group bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 sm:p-6 hover:bg-slate-800/60 hover:border-blue-500/50 transition-all duration-300 cursor-pointer backdrop-blur-sm"
              variants={fadeInUp}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => router.push('/trade')}
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 rounded-full bg-gradient-to-r ${pair.color} flex items-center justify-center text-lg sm:text-xl font-bold text-white group-hover:scale-110 transition-transform duration-300`}>
                {pair.token0}/{pair.token1}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white text-center mb-3 group-hover:text-blue-300 transition-colors">{pair.pair}</h3>
              <div className="space-y-2 text-xs sm:text-sm text-slate-300">
                <div className="flex justify-between">
                  <span>Liquidity:</span>
                  <span className="text-emerald-400 font-medium">{pair.liquidity}</span>
                </div>
                <div className="flex justify-between">
                  <span>24h Volume:</span>
                  <span className="text-blue-400 font-medium">{pair.volume24h}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fee:</span>
                  <span className="text-purple-400 font-medium">{pair.fee}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Why Choose SOLR Section */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 bg-slate-800/20">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">Why Choose SOLR?</h2>
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto">The leading DeFi platform built for Somnia Network's future</p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Shield,
                title: "Enterprise-Grade Security",
                description: "Audited contracts with multi-layer protection",
                color: "from-emerald-500 to-teal-500",
                bgColor: "bg-emerald-500/10",
                borderColor: "border-emerald-500/30",
                route: "/docs"
              },
              {
                icon: Zap,
                title: "Blazing Fast",
                description: "Sub-second transactions on Somnia",
                color: "from-blue-500 to-cyan-500",
                bgColor: "bg-blue-500/10",
                borderColor: "border-blue-500/30",
                route: "/trade"
              },
              {
                icon: TrendingUp,
                title: "Optimized Yields",
                description: "Maximize returns with smart strategies",
                color: "from-purple-500 to-pink-500",
                bgColor: "bg-purple-500/10",
                borderColor: "border-purple-500/30",
                route: "/stake"
              },
              {
                icon: Users,
                title: "Community Governance",
                description: "Shape the platform with your vote",
                color: "from-orange-500 to-red-500",
                bgColor: "bg-orange-500/10",
                borderColor: "border-orange-500/30",
                route: "/governance"
              },
              {
                icon: Globe,
                title: "Multi-Chain Ready",
                description: "Built for cross-chain DeFi expansion",
                color: "from-indigo-500 to-purple-500",
                bgColor: "bg-indigo-500/10",
                borderColor: "border-indigo-500/30",
                route: "/docs"
              },
              {
                icon: BarChart3,
                title: "Live Analytics",
                description: "Real-time insights for smarter decisions",
                color: "from-green-500 to-emerald-500",
                bgColor: "bg-green-500/10",
                borderColor: "border-green-500/30",
                route: "/analytics"
              }
            ].map((feature, index) => (
              <motion.div 
                key={feature.title}
                className={`group ${feature.bgColor} ${feature.borderColor} border rounded-2xl p-6 sm:p-8 cursor-pointer backdrop-blur-sm shadow-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300`}
                variants={fadeInUp}
                whileHover={{ y: -8, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(feature.route)}
              >
                <motion.div 
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </motion.div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors">{feature.title}</h3>
                <p className="text-sm sm:text-base text-slate-300 group-hover:text-slate-200 transition-colors">{feature.description}</p>
                <motion.div 
                  className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ x: -10 }}
                  whileHover={{ x: 0 }}
                >
                  <ArrowRight className="w-5 h-5 text-blue-400" />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { label: "Total Value Locked", value: "$2.4M", change: "+12.5%", icon: Lock, color: "from-blue-500 to-indigo-500", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30" },
              { label: "24h Trading Volume", value: "$847K", change: "+8.2%", icon: TrendingUp, color: "from-emerald-500 to-teal-500", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/30" },
              { label: "Active Users", value: "1,247", change: "+15.3%", icon: Users, color: "from-purple-500 to-pink-500", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/30" },
              { label: "Total Transactions", value: "89.2K", change: "+23.1%", icon: BarChart3, color: "from-orange-500 to-red-500", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/30" }
            ].map((stat) => (
              <motion.div 
                key={stat.label}
                className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-4 sm:p-6 group cursor-pointer backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300`}
                variants={fadeInUp}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/analytics')}
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <motion.div 
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </motion.div>
                  <motion.span 
                    className="text-xs sm:text-sm font-medium text-emerald-400"
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {stat.change}
                  </motion.span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">{stat.value}</div>
                <div className="text-xs sm:text-sm text-slate-400 group-hover:text-slate-300 transition-colors">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* DeFi Categories Section */}
      <section className="px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">Complete DeFi Infrastructure</h2>
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto">From trading to advanced yield strategies, SOLR has it all</p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {DEFI_CATEGORIES.map((category, index) => (
              <motion.div 
                key={category.name}
                className="group bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:border-blue-500/50 hover:bg-slate-800/60 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg"
                variants={fadeInUp}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => router.push(category.route)}
              >
                <motion.div 
                  className="text-3xl sm:text-4xl mb-4 group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: 5 }}
                >
                  {category.icon}
                </motion.div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors">{category.name}</h3>
                <p className="text-sm sm:text-base text-slate-300 group-hover:text-slate-200 transition-colors">{category.description}</p>
                <motion.div 
                  className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ x: -10 }}
                  whileHover={{ x: 0 }}
                >
                  <ArrowRight className="w-5 h-5 text-blue-400" />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Protocols Section */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 bg-slate-800/20">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">Our DeFi Protocols</h2>
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto">Four integrated protocols for a seamless DeFi experience</p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {Object.values(DEFI_PROTOCOLS).map((protocol, index) => (
              <motion.div 
                key={protocol.name}
                className="group bg-slate-800/40 rounded-xl p-6 sm:p-8 cursor-pointer border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/60 transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-lg"
                variants={fadeInUp}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  switch(protocol.name) {
                    case 'Automated Market Maker': router.push('/trade'); break;
                    case 'Lending Protocol': router.push('/lend'); break;
                    case 'Staking Protocol': router.push('/stake'); break;
                    case 'Governance Protocol': router.push('/governance'); break;
                    default: router.push('/docs');
                  }
                }}
              >
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
                </div>
                <div className="relative z-10">
                  <motion.div 
                    className="text-4xl sm:text-5xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: 5 }}
                  >
                    {protocol.icon}
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors">{protocol.name}</h3>
                  <p className="text-sm sm:text-base text-slate-300 group-hover:text-slate-200 transition-colors">{protocol.description}</p>
                  <motion.div 
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 bg-gradient-to-b from-slate-800/30 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="mb-6 sm:mb-8"
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Rocket className="w-16 h-16 sm:w-20 sm:h-20 text-blue-400 mx-auto mb-4 sm:mb-6" />
            </motion.div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">Start Your DeFi Journey</h2>
            <p className="text-base sm:text-lg text-slate-300 mb-6 sm:mb-8 max-w-2xl mx-auto">Join Somnia's leading DeFi platform. Trade, earn, and govern with confidence.</p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
              variants={fadeInUp}
            >
              <motion.button 
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg shadow-lg hover:shadow-blue-500/40 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/trade')}
              >
                <span className="flex items-center space-x-2">
                  <span>Launch App</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
              <motion.button 
                className="group bg-slate-800/50 border border-slate-600 text-slate-200 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-slate-800/80 hover:border-blue-500/50 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/docs')}
              >
                Read Docs
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
      
      {/* Floating Action Button */}
      <motion.div 
        className="fixed bottom-6 sm:bottom-8 right-4 sm:right-8 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <motion.button 
          className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-xl hover:shadow-blue-500/50 flex items-center justify-center text-white"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 rotate-[-90deg]" />
          </motion.div>
        </motion.button>
      </motion.div>
      
      {/* Background Floating Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400/20 rounded-full"
            animate={{
              x: [0, 50, 0],
              y: [0, -50, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 6 + i * 1.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
            style={{
              left: `${15 + i * 20}%`,
              top: `${25 + i * 15}%`,
            }}
          />
        ))}
      </div>
    </div>
  )
}