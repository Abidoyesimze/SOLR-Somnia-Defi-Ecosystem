import { useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'

export const useWallet = () => {
  const [isConnecting, setIsConnecting] = useState(false)
  const { address, isConnected, status } = useAccount()
  const { connect, connectors, error } = useConnect()
  const { disconnect } = useDisconnect()

  const connectWallet = async (connectorType: 'injected' | 'walletConnect') => {
    try {
      setIsConnecting(true)
      
      if (connectorType === 'injected') {
        // MetaMask or other injected wallets
        await connect({ connector: injected() })
      } else if (connectorType === 'walletConnect') {
        // WalletConnect
        await connect({ connector: walletConnect({ projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default' }) })
      }
    } catch (err) {
      console.error('Failed to connect wallet:', err)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    disconnect()
  }

  return {
    address,
    isConnected,
    isConnecting,
    status,
    connectWallet,
    disconnectWallet,
    error
  }
} 