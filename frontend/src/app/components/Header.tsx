'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { 
  Menu, 
  X, 
  Globe, 
  RefreshCw, 
  TrendingUp, 
  Wallet, 
  BarChart3, 
  Users, 
  BookOpen 
} from 'lucide-react'

const navigation = [
  { name: 'Trade', href: '/trade', icon: RefreshCw },
  { name: 'Lend', href: '/lend', icon: TrendingUp },
  { name: 'Stake', href: '/stake', icon: Wallet },
  { name: 'Governance', href: '/governance', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Documentation', href: '/docs', icon: BookOpen }
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Clickable to go home */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group relative"
            onClick={() => router.push('/')}
            title="Go to Home"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
              <Globe className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">SOLR</h1>
              <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-300">Somnia DeFi Ecosystem</p>
            </div>
            
            {/* Hover indicator */}
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:w-full transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className="group flex items-center space-x-2 text-slate-300 hover:text-white transition-all duration-200 relative"
              >
                <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="group-hover:text-blue-300 transition-colors duration-200">{item.name}</span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:w-full transition-all duration-300"></div>
              </button>
            ))}
          </nav>

          {/* Connect Wallet */}
          <div className="flex items-center space-x-4">
            <ConnectButton />
            
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-900/95 border-t border-slate-800/50 backdrop-blur-md">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.href)
                  setMobileMenuOpen(false)
                }}
                className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-md transition-all duration-200 w-full text-left"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}