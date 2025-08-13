'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Code, 
  BookOpen, 
  Zap, 
  Shield, 
  Users, 
  Globe,
  Palette,
  Gamepad2,
  Star,
  ArrowRight,
  Copy,
  CheckCircle,
  ExternalLink
} from 'lucide-react'

const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    description: 'Quick start guide for integrating with SOLR metaverse asset routing'
  },
  {
    id: 'smart-contracts',
    title: 'Smart Contracts',
    icon: Code,
    description: 'Complete contract ecosystem for virtual asset management and routing'
  },
  {
    id: 'somnia-protocols',
    title: 'Somnia Protocols',
    icon: Globe,
    description: 'Integration with SOM0 and SOM1 protocols for asset interoperability'
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    icon: Zap,
    description: 'Complete API documentation for all SOLR functions'
  },
  {
    id: 'examples',
    title: 'Code Examples',
    icon: Users,
    description: 'Real-world examples and integration patterns'
  },
  {
    id: 'security',
    title: 'Security & Best Practices',
    icon: Shield,
    description: 'Security considerations and development best practices'
  }
]

const codeExamples = {
  'basic-routing': `// Basic asset routing example
import { SolrSDK } from '@solr/metaverse-sdk';

const solr = new SolrSDK(provider);

// Route a virtual asset between metaverses
const route = await solr.routeAsset({
  assetId: 'virtual-art-123',
  fromMetaverse: 'art-gallery',
  toMetaverse: 'gaming-world',
  assetType: 'virtual-art'
});

// Execute the routing
const tx = await solr.executeRouting(route);
console.log('Asset routed successfully!');`,

  'attestation-creation': `// Create an attestation for asset authenticity
const attestation = await solr.createAttestation({
  assetId: 'gaming-item-456',
  attestationType: 'authenticity',
  value: 'verified-original',
  validUntil: Date.now() + 365 * 24 * 60 * 60 * 1000
});

console.log('Attestation created:', attestation.id);`,

  'experience-composition': `// Compose a virtual experience
const experience = await solr.composeExperience({
  name: 'Virtual Art Exhibition',
  description: 'Interactive art gallery experience',
  components: ['art-display', 'social-interaction', 'commerce-hub'],
  targetMetaverses: ['art-gallery', 'social-hub', 'commerce-mall']
});

console.log('Experience composed:', experience.id);`,

  'cross-metaverse-bridge': `// Bridge assets between different metaverses
const bridgeRequest = await solr.createBridgeRequest({
  assetId: 'virtual-land-789',
  fromChain: 'somnia-mainnet',
  toChain: 'somnia-testnet',
  destinationMetaverse: 'virtual-world-alpha'
});

// Monitor bridge status
const status = await solr.getBridgeStatus(bridgeRequest.id);
console.log('Bridge status:', status);`
}

const contractAddresses = {
  'SomniaAssetRouter': '0x...', // To be populated after deployment
  'SomniaObjectRegistry': '0x...',
  'SomniaAttestationRegistry': '0x...',
  'SomniaExperienceRegistry': '0x...',
  'SomniaMarketplaceAdapter': '0x...',
  'SomniaInteroperabilityBridge': '0x...',
  'SomniaAccessControl': '0x...',
  'SomniaFeeManager': '0x...',
  'SomniaEmergencyController': '0x...'
}

export default function DeveloperDocs() {
  const [activeSection, setActiveSection] = useState('getting-started')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = async (code: string, exampleId: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(exampleId)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4">Developer Documentation</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Integrate your metaverse applications with SOLR&apos;s comprehensive asset routing and interoperability infrastructure
          </p>
        </motion.div>

        {/* Navigation */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`p-6 rounded-xl border transition-all duration-300 text-left ${
                activeSection === section.id
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                  : 'bg-gray-800/30 border-gray-700 text-gray-300 hover:border-blue-500/30 hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <section.icon className="w-6 h-6" />
                <h3 className="font-semibold">{section.title}</h3>
              </div>
              <p className="text-sm opacity-80">{section.description}</p>
            </button>
          ))}
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* Getting Started */}
          {activeSection === 'getting-started' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-8"
            >
              <h2 className="text-3xl font-bold text-white mb-6">Getting Started with SOLR</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-blue-400 mb-4">1. Installation</h3>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                    <code className="text-green-400">npm install @solr/metaverse-sdk</code>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-blue-400 mb-4">2. Basic Setup</h3>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                    <pre className="text-sm text-gray-300">
{`import { SolrSDK } from '@solr/metaverse-sdk';

// Initialize with your provider
const solr = new SolrSDK({
  rpcUrl: 'https://testnet-rpc.somnia.network',
  chainId: 50312,
  contracts: contractAddresses
});`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-blue-400 mb-4">3. Quick Start Example</h3>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                    <pre className="text-sm text-gray-300">
{`// Route a virtual asset
const route = await solr.routeAsset({
  assetId: 'my-virtual-art',
  fromMetaverse: 'art-gallery',
  toMetaverse: 'gaming-world'
});

console.log('Best route found:', route);`}
                    </pre>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Smart Contracts */}
          {activeSection === 'smart-contracts' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-8"
            >
              <h2 className="text-3xl font-bold text-white mb-6">Smart Contract Ecosystem</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {Object.entries(contractAddresses).map(([name, address]) => (
                  <div key={name} className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                    <h4 className="font-semibold text-blue-400 mb-2">{name}</h4>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm text-gray-300 flex-1">{address}</code>
                      <button 
                        onClick={() => copyToClipboard(address, name)}
                        className="p-2 hover:bg-gray-700 rounded transition-colors"
                      >
                        {copiedCode === name ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3">Core Contracts</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• <strong>SomniaAssetRouter:</strong> Main routing engine for all ecosystem operations</li>
                    <li>• <strong>SomniaObjectRegistry:</strong> Virtual object management and ownership</li>
                    <li>• <strong>SomniaAttestationRegistry:</strong> Asset authenticity verification</li>
                    <li>• <strong>SomniaExperienceRegistry:</strong> Virtual experience composition</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3">Infrastructure Contracts</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• <strong>SomniaAccessControl:</strong> Role-based permissions and security</li>
                    <li>• <strong>SomniaFeeManager:</strong> Fee collection and revenue distribution</li>
                    <li>• <strong>SomniaEmergencyController:</strong> Safety mechanisms and recovery</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Somnia Protocols */}
          {activeSection === 'somnia-protocols' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-8"
            >
              <h2 className="text-3xl font-bold text-white mb-6">Somnia Protocol Integration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Shield className="w-8 h-8 text-blue-400" />
                    <h3 className="text-xl font-semibold text-blue-300">SOM0 Protocol</h3>
                  </div>
                  <p className="text-gray-300 mb-4">
                    Asset interoperability and commerce protocols for cross-application object sharing
                  </p>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Object Protocol for virtual asset management</li>
                    <li>• Attestation Protocol for authenticity verification</li>
                    <li>• Marketplace Protocol for cross-application commerce</li>
                  </ul>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Zap className="w-8 h-8 text-purple-400" />
                    <h3 className="text-xl font-semibold text-purple-300">SOM1 Protocol</h3>
                  </div>
                  <p className="text-gray-300 mb-4">
                    Virtual world composition and component-based experience building
                  </p>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Entity-Component-System architecture</li>
                    <li>• Dynamic NFT evolution</li>
                    <li>• Composable virtual world components</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-6 border border-gray-600">
                <h3 className="text-lg font-semibold text-white mb-4">Protocol Integration Example</h3>
                <pre className="text-sm text-gray-300">
{`// Integrate with SOM0 Object Protocol
const objectRegistry = await solr.getContract('SomniaObjectRegistry');

// Register a virtual object
await objectRegistry.registerVirtualObject(
  'my-virtual-art',
  'ipfs://metadata.json',
  'virtual-art'
);

// Create an attestation via SOM0
const attestationRegistry = await solr.getContract('SomniaAttestationRegistry');
await attestationRegistry.createAttestation(
  'my-virtual-art',
  'authenticity',
  'verified-original'
);`}
                </pre>
              </div>
            </motion.div>
          )}

          {/* API Reference */}
          {activeSection === 'api-reference' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-8"
            >
              <h2 className="text-3xl font-bold text-white mb-6">API Reference</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-blue-400 mb-4">Asset Routing</h3>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                    <pre className="text-sm text-gray-300">
{`solr.routeAsset(options: RouteAssetOptions): Promise<Route>

interface RouteAssetOptions {
  assetId: string;
  fromMetaverse: string;
  toMetaverse: string;
  assetType?: string;
  amount?: number;
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-blue-400 mb-4">Attestation Management</h3>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                    <pre className="text-sm text-gray-300">
{`solr.createAttestation(options: CreateAttestationOptions): Promise<Attestation>

interface CreateAttestationOptions {
  assetId: string;
  attestationType: string;
  value: string;
  validUntil: number;
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-blue-400 mb-4">Experience Composition</h3>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                    <pre className="text-sm text-gray-300">
{`solr.composeExperience(options: ComposeExperienceOptions): Promise<Experience>

interface ComposeExperienceOptions {
  name: string;
  description: string;
  components: string[];
  targetMetaverses: string[];
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Code Examples */}
          {activeSection === 'examples' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-8"
            >
              <h2 className="text-3xl font-bold text-white mb-6">Code Examples</h2>
              
              <div className="space-y-8">
                {Object.entries(codeExamples).map(([exampleId, code]) => (
                  <div key={exampleId} className="bg-gray-900 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between p-4 border-b border-gray-600">
                      <h3 className="text-lg font-semibold text-blue-400 capitalize">
                        {exampleId.replace('-', ' ')}
                      </h3>
                      <button 
                        onClick={() => copyToClipboard(code, exampleId)}
                        className="flex items-center space-x-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                      >
                        {copiedCode === exampleId ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-green-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                      <code>{code}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-8"
            >
              <h2 className="text-3xl font-bold text-white mb-6">Security & Best Practices</h2>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-red-300 mb-4">Security Considerations</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Always verify contract addresses before interaction</li>
                      <li>• Implement proper access control in your applications</li>
                      <li>• Use secure random number generation for critical operations</li>
                      <li>• Regularly audit your integration code</li>
                    </ul>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-green-300 mb-4">Best Practices</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Implement proper error handling and fallbacks</li>
                      <li>• Use event listeners for transaction monitoring</li>
                      <li>• Test thoroughly on testnet before mainnet</li>
                      <li>• Follow the principle of least privilege</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-6 border border-gray-600">
                  <h3 className="text-lg font-semibold text-white mb-4">Security Checklist</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      'Verify contract addresses',
                      'Implement access controls',
                      'Use secure random generation',
                      'Handle errors gracefully',
                      'Monitor transactions',
                      'Test on testnet',
                      'Audit integration code',
                      'Follow security guidelines'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Build?</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Start integrating with SOLR today and unlock the full potential of cross-metaverse asset routing and interoperability
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary px-8 py-3">
              <Code className="w-5 h-5 mr-2" />
              View GitHub Repository
            </button>
            <button className="btn-secondary px-8 py-3">
              <ExternalLink className="w-5 h-5 mr-2" />
              Join Developer Community
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 