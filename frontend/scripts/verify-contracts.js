const { ethers } = require('ethers');

// Contract addresses from deployment
const CONTRACTS = {
  AMM: '0xD1c15525a977e590dE0178a598C9BE0B5788851B',
  GOVERNANCE: '0x1f8E2fA22951F4a9a387af9675880716dbEdB345',
  LENDING: '0x412D57f6cb2dAbF7C9d694AcB78b1c52d6140f56',
  STAKING: '0xcd593658F4A1ceDb941efe7991c5Ff5AA5899F23'
};

// RPC URL
const RPC_URL = 'https://dream-rpc.somnia.network/';

async function verifyContracts() {
  console.log('🔍 Verifying deployed contracts on Somnia Testnet...\n');
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  for (const [name, address] of Object.entries(CONTRACTS)) {
    try {
      console.log(`📋 Checking ${name} contract...`);
      
      // Check if contract exists
      const code = await provider.getCode(address);
      if (code === '0x') {
        console.log(`❌ ${name}: No contract found at ${address}`);
        continue;
      }
      
      console.log(`✅ ${name}: Contract exists (${code.length} bytes)`);
      
      // Try to get basic info
      try {
        const contract = new ethers.Contract(address, ['function name() view returns (string)'], provider);
        const contractName = await contract.name();
        console.log(`   📝 Name: ${contractName}`);
      } catch (e) {
        console.log(`   📝 Name: Not available`);
      }
      
      // Check balance
      const balance = await provider.getBalance(address);
      console.log(`   💰 Balance: ${ethers.formatEther(balance)} SOM`);
      
    } catch (error) {
      console.log(`❌ ${name}: Error - ${error.message}`);
    }
    console.log('');
  }
  
  console.log('🎯 Contract verification complete!');
}

verifyContracts().catch(console.error); 