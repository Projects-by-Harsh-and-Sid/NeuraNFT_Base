

const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');

// Read the private key from a .secret file
const privateKey = "0x308e9e7a679fd4b5f00c2d19f408a178a89feba1b4c6e3846b6a606fdcbb8976";

module.exports = {
  networks: {
    // Configuration for local Ganache node
    development: {
      host: "127.0.0.1",     // Localhost
      port: 7545,            // Standard Ganache port
      network_id: "*",       // Match any network id
    },
    
    // Configuration for using private key with Ganache
    ganache: {
      provider: () => new HDWalletProvider(privateKey, `http://127.0.0.1:7545`),
      network_id: "*",
      gas: 5500000,
    },
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.19",    // Fetch exact version from solc-bin
    }
  },
};