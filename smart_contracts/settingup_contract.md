
# Developing and Deploying a Test Smart Contract on TRON

This README provides step-by-step instructions for developing and deploying a test smart contract on the TRON network.

## Table of Contents
- [Developing and Deploying a Test Smart Contract on TRON](#developing-and-deploying-a-test-smart-contract-on-tron)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Setting Up the Development Environment](#setting-up-the-development-environment)
  - [Creating a New Project](#creating-a-new-project)
  - [Writing Your Smart Contract](#writing-your-smart-contract)
  - [Configuring Deployment](#configuring-deployment)
  - [Compiling Your Contract](#compiling-your-contract)
  - [Deploying to the Testnet](#deploying-to-the-testnet)
  - [Interacting with Your Contract](#interacting-with-your-contract)

## Prerequisites

Before you begin, ensure you have the following:
- Basic knowledge of Solidity and smart contract development
- A computer with internet connection
- A TRON wallet with some test TRX (you can get these from a faucet)

## Setting Up the Development Environment

1. Install Node.js and npm:
   Download and install from [nodejs.org](https://nodejs.org/)

2. Install TronBox:
   ```
   npm install -g tronbox
   ```

## Creating a New Project

1. Create a new directory for your project:
   ```
   mkdir neuranft-contract
   cd neuranft-contract
   ```

2. Initialize a new TronBox project:
   ```
   tronbox init
   ```

3. Install dependencies:
   ```
   npm install
   ```

## Writing Your Smart Contract

1. Navigate to the `contracts` folder in your project.

2. Create a new Solidity file, e.g., `MyContract.sol`:
   ```solidity
   pragma solidity ^0.5.0;

   contract MyContract {
       string public message;

       constructor(string memory initialMessage) public {
           message = initialMessage;
       }

       function setMessage(string memory newMessage) public {
           message = newMessage;
       }
   }
   ```

## Configuring Deployment

1. Open `tronbox.js` in your project root.

2. Add the Shasta testnet configuration:
   ```javascript
   module.exports = {
     networks: {
       development: {
         // For trontools/quickstart docker image
         privateKey: 'da146374a75310b9666e834ee4ad0866d6f4035967bfc76217c5a495fff9f0d0',
         userFeePercentage: 30,
         feeLimit: 100000000,
         fullHost: 'http://127.0.0.1:9090',
         network_id: '9'
       },
       shasta: {
         privateKey: 'your_private_key_here',
         userFeePercentage: 50,
         feeLimit: 1000000000,
         fullHost: 'https://api.shasta.trongrid.io',
         network_id: '2'
       }
     }
   };
   ```
   Replace `'your_private_key_here'` with your actual private key.

## Compiling Your Contract

1. Compile your contract:
   ```
   tronbox compile
   ```

## Deploying to the Testnet

1. Deploy your contract to the Shasta testnet:
   ```
   tronbox migrate --network shasta
   ```

2. Note the contract address from the console output.

## Interacting with Your Contract

1. Use TronWeb in a JavaScript environment to interact with your contract:

   ```javascript
   const TronWeb = require('tronweb');

   const tronWeb = new TronWeb({
     fullHost: 'https://api.shasta.trongrid.io',
     privateKey: 'your_private_key_here'
   });

   const contractAddress = 'your_contract_address_here';

   async function interactWithContract() {
     const contract = await tronWeb.contract().at(contractAddress);
     
     // Call a function
     const currentMessage = await contract.message().call();
     console.log('Current message:', currentMessage);

     // Send a transaction
     await contract.setMessage('New message').send();
     
     // Check the updated message
     const newMessage = await contract.message().call();
     console.log('Updated message:', newMessage);
   }

   interactWithContract();
   ```

   Replace `'your_private_key_here'` and `'your_contract_address_here'` with your actual values.

Remember to always test thoroughly on the testnet before considering deployment to the main TRON network. Happy coding!