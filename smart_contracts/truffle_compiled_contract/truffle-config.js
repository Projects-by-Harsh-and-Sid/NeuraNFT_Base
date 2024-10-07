

const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');

// Read the private key from a .secret file
const privateKey = "0xbbd842bb31ccd0bbf8a9f864188425f4b2a94c42786efaf0100a398788123d0f";

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