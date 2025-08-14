import Header from '../components/Header'

// Mock governance data
const mockProposals = [
  {
    id: 1,
    title: 'Increase AMM Trading Fee to 0.4%',
    description: 'Proposal to increase the trading fee from 0.3% to 0.4% to improve protocol revenue and sustainability.',
    proposer: '0x1234...5678',
    forVotes: '1,250,000',
    againstVotes: '450,000',
    startTime: '2024-01-15',
    endTime: '2024-01-22',
    state: 'Active',
    quorum: '2,000,000',
    executed: false
  },
  {
    id: 2,
    title: 'Add USDT as Supported Token',
    description: 'Proposal to add USDT as a supported token in the lending protocol to increase market diversity.',
    proposer: '0x8765...4321',
    forVotes: '2,100,000',
    againstVotes: '150,000',
    startTime: '2024-01-10',
    endTime: '2024-01-17',
    state: 'Executed',
    quorum: '2,000,000',
    executed: true
  },
  {
    id: 3,
    title: 'Update Staking Reward Distribution',
    description: 'Proposal to adjust the staking reward distribution to better incentivize long-term stakers.',
    proposer: '0x9876...5432',
    forVotes: '800,000',
    againstVotes: '1,200,000',
    startTime: '2024-01-05',
    endTime: '2024-01-12',
    state: 'Defeated',
    quorum: '2,000,000',
    executed: false
  }
]

export default function GovernancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Community Governance
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Participate in Somnia&apos;s DeFi ecosystem governance. Vote on proposals and shape the future of the protocol.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Proposals List */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Active Proposals</h2>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Create Proposal
                </button>
              </div>
              
              <div className="space-y-4">
                {mockProposals.map((proposal) => (
                  <div key={proposal.id} className="bg-gray-700/30 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{proposal.title}</h3>
                        <p className="text-gray-300 text-sm mb-3">{proposal.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span>Proposed by: {proposal.proposer}</span>
                          <span>Started: {proposal.startTime}</span>
                          <span>Ends: {proposal.endTime}</span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        proposal.state === 'Active' ? 'bg-green-500/20 text-green-300' :
                        proposal.state === 'Executed' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {proposal.state}
                      </div>
                    </div>
                    
                    {/* Voting Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>For: {proposal.forVotes} SOMG</span>
                        <span>Against: {proposal.againstVotes} SOMG</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: '65%' }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Quorum: {proposal.quorum} SOMG required
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex space-x-3">
                      {proposal.state === 'Active' ? (
                        <>
                          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                            Vote For
                          </button>
                          <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                            Vote Against
                          </button>
                        </>
                      ) : proposal.state === 'Executed' ? (
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                          View Execution
                        </button>
                      ) : (
                        <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                          View Results
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Voting Power */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Your Voting Power</h3>
              <div className="text-center py-6">
                <div className="text-4xl font-bold text-blue-400 mb-2">25,000</div>
                <div className="text-gray-400 mb-4">SOMG Tokens</div>
                <div className="text-sm text-gray-300">
                  Locked until: Dec 31, 2024
                </div>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                Lock More Tokens
              </button>
            </div>

            {/* Governance Stats */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Governance Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Proposals</span>
                  <span className="text-white font-medium">15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Proposals</span>
                  <span className="text-white font-medium">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Voters</span>
                  <span className="text-white font-medium">892</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Participation</span>
                  <span className="text-white font-medium">67.3%</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                  Create Proposal
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                  Delegate Votes
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                  View History
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { action: 'Proposal #15 created', time: '2 hours ago', type: 'proposal' },
                  { action: 'Vote cast on #14', time: '5 hours ago', type: 'vote' },
                  { action: 'Proposal #13 executed', time: '1 day ago', type: 'execution' },
                  { action: 'New delegate registered', time: '2 days ago', type: 'delegate' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-gray-700/30 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'proposal' ? 'bg-blue-400' :
                      activity.type === 'vote' ? 'bg-green-400' :
                      activity.type === 'execution' ? 'bg-purple-400' :
                      'bg-yellow-400'
                    }`}></div>
                    <div className="flex-1">
                      <div className="text-sm text-white">{activity.action}</div>
                      <div className="text-xs text-gray-400">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 