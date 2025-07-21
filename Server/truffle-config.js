require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    // Local development network (Ganache)
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },

    // Sepolia testnet configuration
    sepolia: {
      provider: () =>
        new HDWalletProvider(
          process.env.DEPLOYER_PRIVATE_KEY, // without the 0x prefix
          process.env.RPC_URL
        ),
      network_id: 11155111,          // Sepolia Chain ID
       gas: 3_000_000,        // 3 M gas is plenty for most contracts
  gasPrice: 1_000_000_000, // 1 gwei (Sepolia is low‑congestion)
      confirmations: 2,              // # of blocks to wait between deployments
      timeoutBlocks: 200,            // # of blocks before deployment times out
      skipDryRun: true               // Skip dry run before migrations
    },
  },

  // Project structure configuration
  contracts_directory: "./contracts/",
  contracts_build_directory: "./build/contracts/",

  // Solidity compiler configuration
  compilers: {
    solc: {
      version: "0.8.20",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        viaIR: true, // Enable Intermediate Representation (optional)
      },
    },
  },
};
