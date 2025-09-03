'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
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
  BookOpen,
  Lock,
  Vote,
  Coins,
  FileText,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

const navigation = [
  { name: 'Trade', href: '/trade', icon: TrendingUp },
  { name: 'Lend', href: '/lend', icon: Wallet },
  { name: 'Stake', href: '/stake', icon: Lock },
  { name: 'Governance', href: '/governance', icon: Vote },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Faucet', href: '/faucet', icon: Coins },
  // { name: 'Test', href: '/test', icon: AlertCircle },
  // { name: 'Docs', href: '/docs', icon: FileText },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  return (
    <header className="bg-slate-950/95 backdrop-blur-lg border-b border-slate-800/50 sticky top-0 z-50 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center space-x-3 group relative"
          title="Go to Home"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
            <Globe className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">SOLR</h1>
            <p className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors duration-300">Somnia DeFi Ecosystem</p>
          </div>
          <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:w-full transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center space-x-2 transition-all duration-200 relative text-sm font-medium ${
                pathname === item.href 
                  ? 'text-white' 
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="group-hover:text-blue-300">{item.name}</span>
              <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ${
                pathname === item.href ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></div>
            </Link>
          ))}
        </nav>

        {/* Desktop Connect Button */}
        <div className="hidden lg:flex items-center">
          <ConnectButton 
            showBalance={false}
            chainStatus="icon"
            accountStatus={{
              smallScreen: 'avatar',
              largeScreen: 'full'
            }}
          />
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">Open main menu</span>
          {mobileMenuOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>

    {/* Mobile Navigation */}
    {mobileMenuOpen && (
      <div className="lg:hidden absolute w-full bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/50 shadow-lg">
        <div className="px-4 pt-3 pb-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-2.5 text-base font-medium rounded-lg transition-all duration-200 w-full ${
                pathname === item.href
                  ? 'text-white bg-slate-800/70'
                  : 'text-slate-200 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
          {/* Mobile Connect Button */}
          <div className="px-4 pt-2">
            <ConnectButton 
              showBalance={false}
              chainStatus="none"
              accountStatus="address"
            />
          </div>
        </div>
      </div>
    )}
  </header>
  )
}