import { Inter } from 'next/font/google'
import { Providers } from './provider'
import { Toaster } from 'react-hot-toast'
import "./globals.css";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SOLR - Somnia Asset & Experience Router',
  description: 'Route virtual assets and experiences across Somnia\'s SOM0 and SOM1 protocols. Enable cross-metaverse interoperability and composable virtual worlds.',
  keywords: 'Somnia, Virtual Assets, Metaverse, Interoperability, SOM0, SOM1, Asset Routing, Virtual Worlds',
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
