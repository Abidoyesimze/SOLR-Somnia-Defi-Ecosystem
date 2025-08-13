'use client'

import { motion } from 'framer-motion'
import { 
  Globe, 
  Github, 
  Twitter, 
  MessageSquare, 
  BookOpen,
  Shield,
  Zap
} from 'lucide-react'

const footerLinks = {
  product: [
    { name: 'Asset Router', href: '/router' },
    { name: 'Metaverses', href: '/metaverses' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Documentation', href: '/docs' }
  ],
  protocols: [
    { name: 'SOM0 Protocol', href: 'https://docs.somnia.network/ecosystem/protocols/som0' },
    { name: 'SOM1 Protocol', href: 'https://docs.somnia.network/ecosystem/protocols/som1' },
    { name: 'Somnia Network', href: 'https://somnia.network' },
    { name: 'Developer Docs', href: 'https://docs.somnia.network' }
  ],
  community: [
    { name: 'Discord', href: '#', icon: MessageSquare },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'GitHub', href: '#', icon: Github },
    { name: 'Blog', href: '#', icon: BookOpen }
  ]
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <motion.div 
              className="flex items-center space-x-3 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">SOLR</h3>
                <p className="text-sm text-gray-400">Somnia Asset & Experience Router</p>
              </div>
            </motion.div>
            
            <motion.p 
              className="text-gray-300 mb-6 max-w-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              The universal bridge for virtual assets and experiences across Somnia&apos;s metaverse ecosystem. 
              Enable cross-application interoperability and composable virtual worlds.
            </motion.p>

            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Secure Routing</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Zap className="w-4 h-4 text-blue-400" />
                <span>Fast Execution</span>
              </div>
            </motion.div>
          </div>

          {/* Product Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Protocol Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Protocols
            </h4>
            <ul className="space-y-3">
              {footerLinks.protocols.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div 
          className="border-t border-gray-800 mt-12 pt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © 2025 SOLR - Somnia Asset & Experience Router. All rights reserved.
            </div>
            
            <div className="flex items-center space-x-6">
              {footerLinks.community.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  title={link.name}
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div 
          className="mt-8 pt-6 border-t border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">
              Built on Somnia Testnet (Chain ID: 50312)
            </p>
            <p className="text-xs text-gray-500">
              Powered by SOM0 & SOM1 protocols for cross-metaverse interoperability
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  )
} 