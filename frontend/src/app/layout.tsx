import { Inter } from 'next/font/google'
import { Providers } from './provider'
import { Toaster } from 'react-hot-toast'
import "./globals.css";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SOLR - Somnia Universal Liquidity Router',
  description: 'Aggregate liquidity across all Somnia DEXs. Get the best prices, lowest slippage, and instant settlement.',
  keywords: 'DeFi, Somnia, Liquidity, DEX, Aggregator, Swap, Trading',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <Providers>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid #374151',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
