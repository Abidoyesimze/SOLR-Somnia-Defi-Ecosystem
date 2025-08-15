import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './provider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SOLR - Somnia DeFi Ecosystem',
  description: 'Complete DeFi ecosystem built on Somnia Network - Trade, Lend, Stake, and Govern with institutional-grade security.',
  keywords: 'DeFi, Somnia, Blockchain, Trading, Lending, Staking, Governance, AMM, DEX',
  authors: [{ name: 'SOLR Team' }],
  creator: 'SOLR Development Team',
  publisher: 'SOLR',
  robots: 'index, follow',
  openGraph: {
    title: 'SOLR - Somnia DeFi Ecosystem',
    description: 'Complete DeFi ecosystem built on Somnia Network',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SOLR - Somnia DeFi Ecosystem',
    description: 'Complete DeFi ecosystem built on Somnia Network',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1e293b',
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
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid #475569',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
