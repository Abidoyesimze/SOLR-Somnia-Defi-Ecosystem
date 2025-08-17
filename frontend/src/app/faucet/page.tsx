import Header from '../components/Header'
import TokenFaucet from '../components/TokenFaucet'

export default function FaucetPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900">
      <Header />
      <div className="pt-20">
        <TokenFaucet />
      </div>
    </div>
  )
} 