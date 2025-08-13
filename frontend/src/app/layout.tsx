import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SOLR - Somnia Asset & Experience Router',
  description: 'Route virtual assets and experiences across Somnia\'s SOM0 and SOM1 protocols. Enable cross-metaverse interoperability and composable virtual worlds.',
  keywords: 'Somnia, Virtual Assets, Metaverse, Interoperability, SOM0, SOM1, Asset Routing, Virtual Worlds, Cross-Metaverse, Virtual Experiences',
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
