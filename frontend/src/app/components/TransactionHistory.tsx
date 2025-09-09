'use client'

import { useStore } from '../lib/store'
import { CheckCircle, Clock, XCircle } from 'lucide-react'

export default function TransactionHistory() {
  const { transactions } = useStore()

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
      
      {transactions.length === 0 ? (
        <p className="text-sm text-slate-500">No recent transactions</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                {tx.status === 'pending' ? (
                  <Clock className="w-5 h-5 text-yellow-500" />
                ) : tx.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span>{tx.description}</span>
              </div>
              <span className="text-sm text-slate-400">
                {new Date(tx.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
