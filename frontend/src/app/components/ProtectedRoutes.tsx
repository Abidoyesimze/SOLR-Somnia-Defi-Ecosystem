'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAccount } from 'wagmi'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isConnected, isConnecting } = useAccount()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // If still connecting, do nothing
    if (isConnecting) return

    // If on home page, always allow access
    if (pathname === '/') {
      setIsAuthorized(true)
      return
    }

    // If not connected and not on home page, redirect to home
    if (!isConnected) {
      router.push('/')
      return
    }

    // If connected, allow access to any route
    setIsAuthorized(true)
  }, [isConnected, isConnecting, pathname, router])

  // Show loading state while checking auth status
  if ((pathname !== '/' && isConnecting) || (!isConnected && pathname !== '/')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return isAuthorized ? <>{children}</> : null
}