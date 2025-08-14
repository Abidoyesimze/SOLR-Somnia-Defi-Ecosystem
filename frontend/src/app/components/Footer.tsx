'use client'

import { Globe, RefreshCw, TrendingUp, Wallet, Users, BarChart3, BookOpen, Github, Twitter, MessageSquare } from 'lucide-react'

const navigation = {
  product: [
    { name: 'Trade', href: '/trade', icon: RefreshCw },
    { name: 'Lend', href: '/lend', icon: TrendingUp },
    { name: 'Stake', href: '/stake', icon: Wallet },
    { name: 'Governance', href: '/governance', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ],
  protocols: [
    { name: 'SomniaAMM', href: '/protocols/amm', description: 'Automated Market Maker' },
    { name: 'SomniaLending', href: '/protocols/lending', description: 'Lending & Borrowing' },
    { name: 'SomniaStaking', href: '/protocols/staking', description: 'Staking & Rewards' },
    { name: 'SomniaGovernance', href: '/protocols/governance', description: 'Community Governance' },
  ],
  community: [
    { name: 'Documentation', href: '/docs', icon: BookOpen },
    { name: 'GitHub', href: 'https://github.com', icon: Github },
    { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
    { name: 'Discord', href: 'https://discord.gg', icon: MessageSquare },
  ]
}

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">SOLR</h3>
                <p className="text-sm text-slate-400">Somnia DeFi Ecosystem</p>
              </div>
            </div>
            <p className="text-slate-300 mb-6 max-w-md">
              The complete DeFi ecosystem for Somnia Network. Trade, lend, stake, and govern 
              with the first comprehensive DeFi platform built from the ground up.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm border border-emerald-500/30">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>Secure Trading</span>
              </div>
              <div className="flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm border border-blue-500/30">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Fast Execution</span>
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {navigation.product.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="group flex items-center space-x-2 text-slate-300 hover:text-white transition-all duration-200"
                  >
                    <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    <span className="group-hover:text-blue-300 transition-colors duration-200">{item.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Protocols */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase mb-4">
              Protocols
            </h3>
            <ul className="space-y-3">
              {navigation.protocols.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="group text-slate-300 hover:text-white transition-all duration-200"
                  >
                    <div className="font-medium group-hover:text-blue-300 transition-colors duration-200">{item.name}</div>
                    <div className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-200">{item.description}</div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-slate-800/50">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-slate-400 text-sm">
              © 2024 SOLR - Somnia DeFi Ecosystem. All rights reserved.
            </div>
            <div className="flex space-x-6">
              {navigation.community.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="group text-slate-400 hover:text-white transition-all duration-200 p-2 hover:bg-slate-800/50 rounded-lg"
                  title={item.name}
                >
                  <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 