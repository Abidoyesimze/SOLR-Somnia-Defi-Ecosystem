import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SOLR - Somnia DeFi Ecosystem | Complete DeFi Platform',
  description: 'The complete DeFi ecosystem for Somnia Network. Trade, lend, stake, and govern with the first comprehensive DeFi platform built from the ground up. Features AMM DEX, lending protocols, staking rewards, and governance tokens.',
  keywords: [
    'Somnia',
    'DeFi',
    'Decentralized Finance',
    'AMM',
    'DEX',
    'Lending',
    'Staking',
    'Governance',
    'Token Trading',
    'Liquidity Pools',
    'Yield Farming',
    'Cryptocurrency',
    'Blockchain',
    'Smart Contracts',
    'Web3',
    'DeFi Protocols',
    'Automated Market Maker',
    'Lending Protocol',
    'Staking Protocol',
    'Governance Token'
  ],
  authors: [{ name: 'SOLR Team' }],
  creator: 'SOLR Team',
  publisher: 'SOLR',
  robots: 'index, follow',
  openGraph: {
    title: 'SOLR - Somnia DeFi Ecosystem',
    description: 'The complete DeFi ecosystem for Somnia Network. Trade, lend, stake, and govern with the first comprehensive DeFi platform.',
    type: 'website',
    locale: 'en_US',
    siteName: 'SOLR DeFi',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SOLR DeFi Ecosystem'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SOLR - Somnia DeFi Ecosystem',
    description: 'The complete DeFi ecosystem for Somnia Network. Trade, lend, stake, and govern with the first comprehensive DeFi platform.',
    images: ['/og-image.png']
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1F2937'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
