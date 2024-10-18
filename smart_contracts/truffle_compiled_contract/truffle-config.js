

const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');

// Read the private key from a .secret file
// const privateKey = "0xb99052926180cf5daff5b20633add14f33655b4711ede3c3d4ddb40751dc4311";

const keyData = JSON.parse(fs.readFileSync('key.json', 'utf8'));
const privateKey = keyData.privateKey;




module.exports = {
  networks: {
    // Configuration for local Ganache node
    development: {
      host: "127.0.0.1",     // Localhost
      port: 7545,            // Standard Ganache port
      network_id: "*",       // Match any network id
    },


    // base: {
    //   host: "base-sepolia-rpc.publicnode.com",     // Localhost
    //   port: 443,            // Standard Ganache port
    //   network_id: "*",       // Match any network id
    // },
    
    base: {
      provider: () => new HDWalletProvider(privateKey, "https://base-sepolia-rpc.publicnode.com"),
      network_id: 84532, // Base Sepolia chain ID
      gas: 5000000,
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