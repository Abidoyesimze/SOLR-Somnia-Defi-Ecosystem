require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
    ],
  },

  networks: {
    hardhat: {
      chainId: 31337,
      gas: 12000000,
      blockGasLimit: 12000000,
      allowUnlimitedContractSize: true,
      timeout: 1800000,
    },

    // ✅ Somnia Shannon Testnet Configuration (updated RPC)
    somniaTestnet: {
      url: process.env.SOMNIA_TESTNET_RPC || "https://dream-rpc.somnia.network/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: 2100000,
      gasPrice: 8000000000,
      timeout: 60000,
      chainId: 50312,
    },

    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      timeout: 60000,
    },
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    gasPrice: 20,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    showTimeSpent: true,
    showMethodSig: true,
    maxMethodDiff: 10,
  },

  etherscan: {
    apiKey: {
      somniaTestnet: process.env.SOMNIA_API_KEY || "dummy",
    },
    customChains: [
      {
        network: "somniaTestnet",
        chainId: 50312,
        urls: {
          apiURL: "https://shannon-explorer.somnia.network/api",
          browserURL: "https://shannon-explorer.somnia.network/"
        }
      }
    ]
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    deploy: "./deploy",
  },

  mocha: {
    timeout: 300000,
    slow: 10000,
    bail: false,
  },
};
