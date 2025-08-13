'use client'

import { motion } from 'framer-motion'
import { 
  Globe, 
  Shield, 
  Zap, 
  Users, 
  BarChart3, 
  Lock,
  Palette,
  Gamepad2,
  Store,
  ArrowRightLeft,
  CheckCircle,
  Star
} from 'lucide-react'
import { PROTOCOLS } from '../lib/constants'
import Footer from './Footer'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
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

const features = [
  {
    icon: Globe,
    title: 'Cross-Metaverse Routing',
    description: 'Seamlessly route virtual assets between different Somnia metaverses and applications'
  },
  {
    icon: Shield,
    title: 'Authenticity Verification',
    description: 'Create and verify attestations for virtual asset provenance and authenticity'
  },
  {
    icon: Zap,
    title: 'Instant Asset Transfer',
    description: 'Move virtual objects and experiences across protocols with atomic execution'
  },
  {
    icon: Users,
    title: 'Unified Marketplace',
    description: 'Trade virtual assets in a single, cross-application marketplace'
  },
  {
    icon: BarChart3,
    title: 'Experience Composition',
    description: 'Compose and manage virtual experiences using modular components'
  },
  {
    icon: Lock,
    title: 'Secure Ownership',
    description: 'Maintain secure ownership and transfer of virtual assets across metaverses'
  }
]

const useCases = [
  {
    icon: Palette,
    title: 'Virtual Art Galleries',
    description: 'Display and trade digital art across multiple Somnia metaverses'
  },
  {
    icon: Gamepad2,
    title: 'Gaming Assets',
    description: 'Use gaming items and characters across different virtual worlds'
  },
  {
    icon: Store,
    title: 'Virtual Commerce',
    description: 'Create shops and marketplaces that span multiple metaverses'
  },
  {
    icon: ArrowRightLeft,
    title: 'Cross-World Travel',
    description: 'Bridge assets and experiences between different virtual environments'
  }
]

const stats = [
  { label: 'Smart Contracts', value: '9', description: 'Complete ecosystem' },
  { label: 'Protocols', value: '2', description: 'SOM0 & SOM1' },
  { label: 'Asset Types', value: '∞', description: 'Unlimited possibilities' },
  { label: 'Metaverses', value: 'Cross-Platform', description: 'Universal routing' }
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2" />
              Somnia Native Protocol
            </div>
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            variants={fadeInUp}
          >
            The <span className="gradient-text">Universal</span><br />
            Asset Router for<br />
            <span className="gradient-text">Somnia Metaverse</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            variants={fadeInUp}
          >
            Route virtual assets and experiences across Somnia's SOM0 and SOM1 protocols. 
            Enable cross-metaverse interoperability, composable virtual worlds, and unified commerce.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={fadeInUp}
          >
            <button className="btn-primary text-lg px-8 py-4">
              Start Routing Assets
            </button>
            <button className="btn-secondary text-lg px-8 py-4">
              View Documentation
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                variants={fadeInUp}
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-blue-300 mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-400">
                  {stat.description}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6">Metaverse Infrastructure</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              SOLR provides the foundational infrastructure for seamless metaverse interoperability, 
              enabling virtual assets to move freely across different Somnia applications and worlds.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-blue-500/50 transition-all duration-300 group"
                variants={fadeInUp}
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-4 group-hover:bg-blue-500/30 transition-colors">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Somnia Protocols Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6">Somnia Protocols</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              SOLR integrates with Somnia's core protocols for seamless asset routing and virtual world composition
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {PROTOCOLS.map((protocol, index) => (
              <motion.div
                key={protocol.name}
                className={`${protocol.color} rounded-xl p-8 text-white`}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-5xl mb-6">{protocol.icon}</div>
                <h3 className="text-2xl font-semibold mb-3">{protocol.name}</h3>
                <p className="text-lg opacity-90 mb-6">{protocol.description}</p>
                <div className="space-y-3 mb-6">
                  {protocol.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3 text-sm">
                      <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6">Real-World Applications</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover how SOLR enables new possibilities in virtual asset management and cross-metaverse experiences
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-blue-500/50 transition-all duration-300 group"
                variants={fadeInUp}
              >
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-4 group-hover:bg-purple-500/30 transition-colors">
                  <useCase.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{useCase.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{useCase.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Build the Future of Metaverse?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join the revolution in cross-metaverse asset routing and experience composition on Somnia
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary text-lg px-8 py-4">
                Get Started Now
              </button>
              <button className="btn-secondary text-lg px-8 py-4">
                Join Community
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}