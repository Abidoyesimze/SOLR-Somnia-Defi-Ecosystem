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
import { DEFI_PROTOCOLS, DEFI_CATEGORIES } from '../lib/constants'
import Header from './Header'
import Footer from './Footer'

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

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900">
      <Header />
      
      {/* Hero Section */}
      <section className="relative px-6 py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        
        <motion.div 
          className="relative z-10 max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-6 py-3 mb-8">
              <Star className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 font-medium">First Complete DeFi Ecosystem on Somnia</span>
            </div>
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            The <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Complete</span><br />
            DeFi Ecosystem for<br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Somnia Network</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            Trade, lend, stake, and govern on Somnia&apos;s first comprehensive DeFi platform. 
            Built from the ground up for the Somnia ecosystem with institutional-grade security.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <motion.button 
              className="btn-primary px-8 py-4 text-lg"
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
              className="btn-secondary px-8 py-4 text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/docs')}
            >
              View Documentation
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Interactive Feature Cards Section */}
      <section className="px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Why Choose SOLR?
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Built for the future of decentralized finance on Somnia Network
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Shield,
                title: "Institutional Security",
                description: "Multi-layer security with formal verification and audits",
                color: "from-emerald-500 to-teal-500",
                bgColor: "bg-emerald-500/10",
                borderColor: "border-emerald-500/30",
                route: "/docs"
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Sub-second transaction finality on Somnia Network",
                color: "from-blue-500 to-cyan-500",
                bgColor: "bg-blue-500/10",
                borderColor: "border-blue-500/30",
                route: "/trade"
              },
              {
                icon: TrendingUp,
                title: "Maximum Yield",
                description: "Optimized strategies for the best APY opportunities",
                color: "from-purple-500 to-pink-500",
                bgColor: "bg-purple-500/10",
                borderColor: "border-purple-500/30",
                route: "/stake"
              },
              {
                icon: Users,
                title: "Community Driven",
                description: "Governance by token holders, for token holders",
                color: "from-orange-500 to-red-500",
                bgColor: "bg-orange-500/10",
                borderColor: "border-orange-500/30",
                route: "/governance"
              },
              {
                icon: Globe,
                title: "Cross-Chain Ready",
                description: "Future-ready for multi-chain DeFi operations",
                color: "from-indigo-500 to-purple-500",
                bgColor: "bg-indigo-500/10",
                borderColor: "border-indigo-500/30",
                route: "/docs"
              },
              {
                icon: BarChart3,
                title: "Real-Time Analytics",
                description: "Live data and insights for informed decisions",
                color: "from-green-500 to-emerald-500",
                bgColor: "bg-green-500/10",
                borderColor: "border-green-500/30",
                route: "/analytics"
              }
            ].map((feature, index) => (
              <motion.div 
                key={feature.title}
                className={`group ${feature.bgColor} ${feature.borderColor} border rounded-2xl p-8 cursor-pointer backdrop-blur-sm`}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  y: -12, 
                  scale: 1.05,
                  rotateY: 5,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(feature.route)}
              >
                <motion.div 
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-300 group-hover:text-slate-200 transition-colors">
                  {feature.description}
                </p>
                <motion.div 
                  className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ x: -20 }}
                  whileHover={{ x: 0 }}
                >
                  <ArrowRight className={`w-5 h-5 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`} />
                </motion.div>
                
                {/* Click Indicator */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Animated Stats Cards */}
      <section className="px-6 py-16 bg-slate-800/20">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { 
                label: "Total Value Locked", 
                value: "$2.4M", 
                change: "+12.5%", 
                icon: Lock, 
                color: "from-blue-500 to-indigo-500",
                bgColor: "bg-blue-500/10",
                borderColor: "border-blue-500/30"
              },
              { 
                label: "24h Trading Volume", 
                value: "$847K", 
                change: "+8.2%", 
                icon: TrendingUp, 
                color: "from-emerald-500 to-teal-500",
                bgColor: "bg-emerald-500/10",
                borderColor: "border-emerald-500/30"
              },
              { 
                label: "Active Users", 
                value: "1,247", 
                change: "+15.3%", 
                icon: Users, 
                color: "from-purple-500 to-pink-500",
                bgColor: "bg-purple-500/10",
                borderColor: "border-purple-500/30"
              },
              { 
                label: "Total Transactions", 
                value: "89.2K", 
                change: "+23.1%", 
                icon: BarChart3, 
                color: "from-orange-500 to-red-500",
                bgColor: "bg-orange-500/10",
                borderColor: "border-orange-500/30"
              }
            ].map((stat) => (
              <motion.div 
                key={stat.label}
                className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-6 group cursor-pointer backdrop-blur-sm`}
                variants={fadeInUp}
                transition={{ delay: 0.1 }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/analytics')}
              >
                <div className="flex items-center justify-between mb-4">
                  <motion.div 
                    className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <motion.span 
                    className="text-sm font-medium text-emerald-400"
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {stat.change}
                  </motion.span>
                </div>
                <div className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                  {stat.value}
                </div>
                <div className="text-slate-400 group-hover:text-slate-300 transition-colors text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { label: 'Total Value Locked', value: '$0', icon: Lock, color: 'text-blue-400' },
              { label: '24h Trading Volume', value: '$0', icon: TrendingUp, color: 'text-emerald-400' },
              { label: 'Active Users', value: '0', icon: Users, color: 'text-purple-400' },
              { label: 'Total Transactions', value: '0', icon: BarChart3, color: 'text-amber-400' }
            ].map((stat) => (
              <motion.div 
                key={stat.label}
                className="text-center group"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className={`${stat.color} mb-4 flex justify-center`}
                  whileHover={{ y: [-5, 5, -5] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                >
                  <stat.icon className="w-12 h-12 group-hover:scale-110 transition-transform duration-300" />
                </motion.div>
                <div className="text-3xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">{stat.value}</div>
                <div className="text-slate-400 group-hover:text-slate-300 transition-colors">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24 bg-slate-800/20">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Complete DeFi Infrastructure
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Everything you need for DeFi on Somnia - from basic trading to advanced yield strategies
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {DEFI_CATEGORIES.map((category) => (
              <motion.div 
                key={category.id}
                className="group bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8 hover:border-blue-500/50 hover:bg-slate-800/60 transition-all duration-300 cursor-pointer"
                variants={fadeInUp}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => router.push(category.route)}
              >
                <motion.div 
                  className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: 5 }}
                >
                  {category.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors">{category.name}</h3>
                <p className="text-slate-300 group-hover:text-slate-200 transition-colors">{category.description}</p>
                <motion.div 
                  className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ x: -20 }}
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
      <section className="px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              DeFi Protocols
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Four core protocols working together to create a complete DeFi ecosystem
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {DEFI_PROTOCOLS.map((protocol, index) => (
              <motion.div 
                key={protocol.name}
                className={`${protocol.color} rounded-xl p-8 text-white group cursor-pointer relative overflow-hidden`}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  // Navigate based on protocol name
                  switch(protocol.name) {
                    case 'SomniaAMM':
                      router.push('/trade')
                      break
                    case 'SomniaLending':
                      router.push('/lend')
                      break
                    case 'SomniaStaking':
                      router.push('/stake')
                      break
                    case 'SomniaGovernance':
                      router.push('/governance')
                      break
                    default:
                      router.push('/docs')
                  }
                }}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                </div>
                
                <div className="relative z-10">
                  <motion.div 
                    className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: 5 }}
                  >
                    {protocol.icon}
                  </motion.div>
                  <h3 className="text-2xl font-semibold mb-3">{protocol.name}</h3>
                  <p className="text-lg opacity-90 mb-6">{protocol.description}</p>
                  <div className="space-y-3 mb-6">
                    {protocol.features.map((feature, featureIndex) => (
                      <motion.div 
                        key={featureIndex} 
                        className="flex items-center space-x-3 text-sm"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: featureIndex * 0.1 }}
                      >
                        <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      protocol.status === 'active' ? 'bg-green-500/20 text-green-200' : 'bg-yellow-500/20 text-yellow-200'
                    }`}>
                      {protocol.status}
                    </span>
                    <span className="text-sm opacity-75">{protocol.type}</span>
                  </div>
                  
                  {/* Hover Action */}
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
      <section className="px-6 py-24 bg-slate-800/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <Rocket className="w-20 h-20 text-blue-400 mx-auto mb-6" />
            </motion.div>
            
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Start Your DeFi Journey?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Join the first comprehensive DeFi ecosystem on Somnia Network. 
              Trade, earn, and govern with the best protocols.
            </p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.button 
                className="btn-primary px-8 py-4 text-lg"
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
                className="btn-secondary px-8 py-4 text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/docs')}
              >
                Read Documentation
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
      
      {/* Floating Action Button */}
      <motion.div 
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        <motion.button 
          className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-2xl shadow-blue-500/50 flex items-center justify-center text-white"
          whileHover={{ 
            scale: 1.1,
            boxShadow: "0 0 30px rgba(59, 130, 246, 0.6)"
          }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ArrowRight className="w-6 h-6 rotate-[-90deg]" />
          </motion.div>
        </motion.button>
      </motion.div>
      
      {/* Background Floating Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
          />
        ))}
      </div>
    </div>
  )
}