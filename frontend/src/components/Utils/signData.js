import constract_address_data from './base_addresses.json' ;
import metadata_contract_data from './contracts/NFTMetadata.json';
import collection_contract_data from './contracts/CollectionContract.json';
import nft_contract_data from './contracts/NFTContract.json';
import nftaccess_control_contract_data from './contracts/NFTAccessControl.json';

import {withChainCheck, ensureBaseSepolia} from './wallet_utils';

import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import Web3 from 'web3';

import { sha3 } from 'web3-utils';

const getWeb3 = () => {
    const wallet = new CoinbaseWalletSDK({
        appName: 'NeuraNFT',
        appLogoUrl: 'https://example.com/logo.png',
        darkMode: true
      });
      
      // Create Web3 provider
      const ethereum = wallet.makeWeb3Provider('https://base-sepolia-rpc.publicnode.com', 84532);
  
    return new Web3(ethereum);
  };



// // Function to build the JSON file
// function buildTransactionJson(params) {
//     return {
//         // Add your specific JSON structure here
//         // For example:
//         amount: params.amount,
//         recipient: params.recipient,
//         timestamp: Date.now(),
//         // Add more fields as needed
//     };
// }

// Function to sign JSON data
async function signJsonData(jsonData) {
    const web3 = getWeb3();
    const accounts = await web3.eth.getAccounts();
    
    if (accounts.length === 0) {
      throw new Error('No account found. Please connect your wallet.');
    }
  
    const messageToSign = JSON.stringify(jsonData);
  
    try {
      const signature = await web3.eth.personal.sign(messageToSign, accounts[0]);
      console.log("Signature:", signature);
  
      const signerAddress = web3.eth.accounts.recover(messageToSign, signature);
      console.log("Signer Address:", signerAddress);
  
      return { signature, signerAddress };
    } catch (error) {
      console.error("Error signing or verifying message:", error);
      alert('Error signing data: ' + error.message);
      return null;
    }
  }

// // Function to perform the transaction
// async function performTransaction(params) {
//     try {
//         // Ensure TronLink is installed and connected
//         if (typeof window.tronWeb === 'undefined') {
//             throw new Error('TronLink is not installed or not connected');
//         }

//         // Build the transaction JSON
//         const transactionJson = buildTransactionJson(params);

//         // Sign the JSON data
//         const signatureData = await signJsonData(transactionJson);
//         if (!signatureData) {
//             throw new Error('Failed to sign transaction data');
//         }

//         // Load the contract (replace with your contract's address and ABI)
//         const contractAddress = 'TYour_Contract_Address';
//         const contract = await window.tronWeb.contract().at(contractAddress);

//         // Call the contract method (replace 'yourMethodName' with the actual method name)
//         const result = await contract.yourMethodName(transactionJson, signatureData).send({
//             feeLimit: 100000000
//         });

//         console.log('Transaction successful:', result);
//         return result;
//     } catch (error) {
//         console.error('Error performing transaction:', error);
//         throw error;
//     }
// }

// // Example usage (you might want to call this function from a button click or form submission)
// async function handleTransaction(transactionParams) {
//     try {
//         const result = await performTransaction(transactionParams);
//         console.log('Transaction completed:', result);
//         // Handle successful transaction (e.g., show success message to user)
//     } catch (error) {
//         console.error('Transaction failed:', error);
//         // Handle error (e.g., show error message to user)
//     }
// }

async function createCollection(name, contextWindow, baseModel, image, description) {
    const web3 = getWeb3();
    const accounts = await web3.eth.getAccounts();
  
    try {
      const contractAddress = constract_address_data.CollectionContract;
      const contract = new web3.eth.Contract(collection_contract_data.abi, contractAddress);
  
      const transaction = await contract.methods.createCollection(
        name,
        contextWindow,
        baseModel,
        image,
        description
      ).send({
        from: accounts[0],
        gas: 1000000 // Adjust as needed
      });
  
      console.log('Collection created successfully:', transaction);
      return transaction;
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  }

async function createNFT(collectionId, name, levelOfOwnership) {
    const web3 = getWeb3();
    const accounts = await web3.eth.getAccounts();


  
    try {
      const contractAddress = constract_address_data.NFTContract;
      const contract = new web3.eth.Contract(nft_contract_data.abi, contractAddress);
  
      const transaction = await contract.methods.createNFT(
        collectionId,
        name,
        levelOfOwnership
      ).send({
        from: accounts[0],
        gas: 1000000 // Adjust as needed
      });
  
      console.log('NFT created successfully:', transaction);
      return transaction;
    } catch (error) {
      console.error('Error creating NFT:', error);
      throw error;
    }
  }
// // Function to create metadata for an NFT
// async function createNFTMetadata(collectionId, nftId, metadata) {
//     if (typeof window.tronWeb === 'undefined') {
//         throw new Error('TronLink is not installed or not connected');
//     }

//     try {
//         const contractAddress = constract_address_data.NFTMetadata;
//         // const contract = await window.tronWeb.contract().at(contractAddress);

//         // contract = meatadata_contract_data.abi;
        
//         const contract = await window.tronWeb.contract(meatadata_contract_data.abi, contractAddress);

//         // contract.abi = 

//         console.log('Collection ID:', collectionId);
//         console.log('NFT ID:', nftId);
//         console.log('Metadata:', metadata);



//         const transaction = await contract.createMetadata(
//             collectionId,
//             nftId,
//             metadata
//         ).send({
//             feeLimit: 1000000000,
//             callValue: 0,
//             // shouldPollResponse: true
//             shouldPollResponse: false

//         });

//         console.log('Metadata created successfully:', transaction);
//         return transaction;
//     } catch (error) {
//         console.error('Error creating metadata:', error);
//         throw error;
//     }
// }


async function createNFTMetadata(collectionId, nftId, metadata) {
    const web3 = getWeb3();
    const accounts = await web3.eth.getAccounts();
  
    try {
      const contractAddress = constract_address_data.NFTMetadata;
      const contract = new web3.eth.Contract(metadata_contract_data.abi, contractAddress);
  
      const metadataArray = [
        metadata.image,
        metadata.baseModel,
        metadata.data,
        metadata.rag,
        metadata.fineTuneData,
        metadata.description
      ];
  
      console.log('Collection ID:', collectionId);
      console.log('NFT ID:', nftId);
      console.log('Metadata Array:', metadataArray);
  
      const transaction = await contract.methods.createMetadata(
        collectionId,
        nftId,
        metadataArray
      ).send({
        from: accounts[0],
        gas: 1000000 // Adjust as needed
      });
  
      console.log('Metadata created successfully:', transaction);
      return transaction;
    } catch (error) {
      console.error('Error creating metadata:', error);
      throw error;
    }
  }
  


// async function extractNFTIdFromTransaction(transaction) {


//     // Check if the transaction object has a 'receipt' property
//     const events = await window.tronWeb.getEventByTransactionID(transaction);
//     console.log('Events:', events);

//     let nftId;
//     events.forEach(event => {
//         if (event.name === "NFTCreated") {
//             nftId = event.result.tokenId;
//         }
//     });

//     console.log('Minted NFT ID:', nftId);

//     return nftId;

    
// }


// async function waitForNFTCreatedEvent(transactionId) {
//     return new Promise((resolve, reject) => {
//         const contractAddress = constract_address_data.NFTContract;

//         // Set up event listener
//         const eventWatcher = window.tronWeb.eventServer.contract(contractAddress);

//         const listener = eventWatcher.NFTCreated().watch((err, event) => {
//             if (err) {
//                 console.error('Error watching event:', err);
//                 reject(err);
//             } else {
//                 console.log('Event detected:', event);

//                 // Check if the event is from our transaction
//                 if (event.transaction === transactionId) {
//                     // Extract nftId from event result
//                     // const nftId = event.result.tokenId || event.result._tokenId || event.result['0'];
//                     const nftId = event.result.tokenId ;

//                     console.log('Minted NFT ID:', nftId);

//                     // Stop watching the event
//                     listener.stop();

//                     resolve(nftId);
//                 }
//             }
//         });

//         // Optional: Set a timeout to reject the promise if the event is not detected within a certain time
//         setTimeout(() => {
//             listener.stop();
//             reject(new Error('Timeout waiting for NFTCreated event'));
//         }, 60000); // 60 seconds timeout
//     });
// }


// async function extractNFTIdFromTransaction(transactionHash) {
//     const web3 = getWeb3();
//     const maxAttempts = 20;
//     const delay = 5000;
  
//     for (let attempt = 1; attempt <= maxAttempts; attempt++) {
//       try {
//         const receipt = await web3.eth.getTransactionReceipt(transactionHash);
//         console.log(`Attempt ${attempt}: Retrieved receipt:`, receipt);
  
//         if (receipt && receipt.logs) {
//           for (const log of receipt.logs) {
//             // Assuming the NFTCreated event is emitted by the contract
//             if (log.topics[0] === web3.utils.sha3('NFTCreated(uint256,uint256,address)')) {
//               const nftId = web3.utils.hexToNumber(log.topics[2]);
//               console.log('Minted NFT ID:', nftId);
//               return nftId;
//             }
//           }
//           console.log('NFTCreated event not found in logs.');
//         } else {
//           console.log('Transaction receipt not available yet.');
//         }
//       } catch (error) {
//         console.error(`Error on attempt ${attempt}:`, error);
//       }
  
//       await new Promise(resolve => setTimeout(resolve, delay));
//     }
  
//     throw new Error('Failed to retrieve NFT ID after multiple attempts');
//   }

async function extractNFTIdFromTransaction(transactionHash) {
    const web3 = getWeb3();
    const maxAttempts = 20;
    const delay = 5000;

    console.log('Transaction Hash:', transactionHash);
  
    if (!transactionHash || typeof transactionHash !== 'string' || !transactionHash.startsWith('0x') || transactionHash.length !== 66) {
      throw new Error('Invalid transaction hash format');
    }
  
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const receipt = await web3.eth.getTransactionReceipt(transactionHash);
        console.log(`Attempt ${attempt}: Retrieved receipt:`, receipt);
  
        if (receipt && receipt.logs) {
          for (const log of receipt.logs) {
            // if (log.topics[0] === sha3('NFTCreated(uint256,uint256,string,address)')) {
            if (log.topics[0] === web3.utils.sha3('NFTCreated(uint256,uint256,string,address)')) {

              const nftId = web3.utils.hexToNumber(log.topics[2]);
              console.log('Minted NFT ID:', nftId);
              return nftId;
            }
          }
          console.log('NFTCreated event not found in logs.');
        } else {
          console.log('Transaction receipt not available yet.');
        }
      } catch (error) {
        console.error(`Error on attempt ${attempt}:`, error);
        if (error.message.includes('Web3ValidatorError')) {
          throw new Error('Invalid transaction hash: ' + error.message);
        }
      }
  
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  
    throw new Error('Failed to retrieve NFT ID after multiple attempts');
  }
  


  async function UpdateAcceess(collection_id, nft_id, user, access_level) {
    const web3 = getWeb3();
    const accounts = await web3.eth.getAccounts();
  
    if (!web3.utils.isAddress(user)) {
      throw new Error('Invalid user address');
    }
  
    try {
      const contractAccess = constract_address_data.NFTAccessControl;
      const contract = new web3.eth.Contract(nftaccess_control_contract_data.abi, contractAccess);
  
      const transaction = await contract.methods.grantAccess(
        collection_id,
        nft_id,
        user,
        access_level
      ).send({
        from: accounts[0],
        gas: 1000000 // Adjust as needed
      });
  
      console.log('Access updated successfully:', transaction);
      return transaction;
    } catch (error) {
      console.error('Error updating access:', error);
      throw error;
    }
  }









  
  export const createCollectionWithChainCheck = withChainCheck(createCollection);
  export const createNFTWithChainCheck = withChainCheck(createNFT);
  export const createNFTMetadataWithChainCheck = withChainCheck(createNFTMetadata);
  export const UpdateAcceessWithChainCheck = withChainCheck(UpdateAcceess);
// Export the functions so they can be imported in other files
// export { buildTransactionJson, signJsonData, performTransaction, handleTransaction };
export { signJsonData, createCollection, createNFT, createNFTMetadata, extractNFTIdFromTransaction, UpdateAcceess };


// Base Implementation

// import constract_address_data from './base_addresses.json';
// import metadata_contract_data from './contracts/NFTMetadata.json';
// import Web3 from 'web3';

// async function signJsonData(jsonData) {
//     if (typeof window.ethereum === 'undefined') {
//         console.error("MetaMask is not installed or not connected");
//         alert('Please install or connect MetaMask');
//         return null;
//     }

//     const web3 = new Web3(window.ethereum);
//     const messageToSign = JSON.stringify(jsonData);

//     try {
//         const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//         const signature = await web3.eth.personal.sign(messageToSign, accounts[0]);
//         console.log("Signature:", signature);

//         // Optionally verify the signature
//         const signerAddress = web3.eth.accounts.recover(messageToSign, signature);
//         console.log("Signer Address:", signerAddress);

//         return { signature, signerAddress };
//     } catch (error) {
//         console.error("Error signing or verifying message:", error);
//         alert('Error signing data: ' + error.message);
//         return null;
//     }
// }

// async function createCollection(name, contextWindow, baseModel, image, description) {
//     if (typeof window.ethereum === 'undefined') {
//         throw new Error('MetaMask is not installed or not connected');
//     }

//     try {
//         const web3 = new Web3(window.ethereum);
//         const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//         const contractAddress = constract_address_data.CollectionContract;
//         const contract = new web3.eth.Contract(constract_address_data.CollectionContractABI, contractAddress);

//         const transaction = await contract.methods.createCollection(
//             name,
//             contextWindow,
//             baseModel,
//             image,
//             description
//         ).send({
//             from: accounts[0],
//             gas: 1000000
//         });

//         console.log('Collection created successfully:', transaction);
//         return transaction;
//     } catch (error) {
//         console.error('Error creating collection:', error);
//         throw error;
//     }
// }

// async function createNFT(collectionId, name, levelOfOwnership) {
//     if (typeof window.ethereum === 'undefined') {
//         throw new Error('MetaMask is not installed or not connected');
//     }

//     try {
//         const web3 = new Web3(window.ethereum);
//         const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//         const contractAddress = constract_address_data.NFTContract;
//         const contract = new web3.eth.Contract(constract_address_data.NFTContractABI, contractAddress);

//         const transaction = await contract.methods.createNFT(
//             collectionId,
//             name,
//             levelOfOwnership
//         ).send({
//             from: accounts[0],
//             gas: 1000000
//         });

//         console.log('NFT created successfully:', transaction);
//         return transaction;
//     } catch (error) {
//         console.error('Error creating NFT:', error);
//         throw error;
//     }
// }

// async function createNFTMetadata(collectionId, nftId, metadata) {
//     if (typeof window.ethereum === 'undefined') {
//         throw new Error('MetaMask is not installed or not connected');
//     }

//     try {
//         const web3 = new Web3(window.ethereum);
//         const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//         const contractAddress = constract_address_data.NFTMetadata;
//         const contract = new web3.eth.Contract(metadata_contract_data.abi, contractAddress);

//         const metadataArray = [
//             metadata.image,
//             metadata.baseModel,
//             metadata.data,
//             metadata.rag,
//             metadata.fineTuneData,
//             metadata.description
//         ];

//         console.log('Collection ID:', collectionId);
//         console.log('NFT ID:', nftId);
//         console.log('Metadata Array:', metadataArray);

//         const transaction = await contract.methods.createMetadata(
//             collectionId,
//             nftId,
//             metadataArray
//         ).send({
//             from: accounts[0],
//             gas: 1000000
//         });

//         console.log('Metadata created successfully:', transaction);
//         return transaction;
//     } catch (error) {
//         console.error('Error creating metadata:', error);
//         throw error;
//     }
// }

// async function extractNFTIdFromTransaction(transactionHash) {
//     const web3 = new Web3(window.ethereum);
//     const maxAttempts = 20;
//     const delay = 5000;

//     for (let attempt = 1; attempt <= maxAttempts; attempt++) {
//         try {
//             const receipt = await web3.eth.getTransactionReceipt(transactionHash);
//             console.log(`Attempt ${attempt}: Retrieved receipt:`, receipt);

//             if (receipt && receipt.logs) {
//                 for (const log of receipt.logs) {
//                     // Assuming the NFTCreated event is emitted by the contract
//                     if (log.topics[0] === web3.utils.sha3('NFTCreated(uint256,uint256,address)')) {
//                         const nftId = web3.utils.hexToNumber(log.topics[2]);
//                         console.log('Minted NFT ID:', nftId);
//                         return nftId;
//                     }
//                 }
//                 console.log('NFTCreated event not found in logs.');
//             } else {
//                 console.log('Transaction receipt not available yet.');
//             }
//         } catch (error) {
//             console.error(`Error on attempt ${attempt}:`, error);
//         }

//         await new Promise(resolve => setTimeout(resolve, delay));
//     }

//     throw new Error('Failed to retrieve NFT ID after multiple attempts');
// }

// async function UpdateAccess(collection_id, nft_id, user, access_level) {
//     if (typeof window.ethereum === 'undefined') {
//         throw new Error('MetaMask is not installed or not connected');
//     }

//     const web3 = new Web3(window.ethereum);
//     if (!web3.utils.isAddress(user)) {
//         throw new Error('Invalid user address');
//     }

//     try {
//         const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//         const contractAccess = constract_address_data.NFTAccessControl;
//         const contract = new web3.eth.Contract(constract_address_data.NFTAccessControlABI, contractAccess);

//         const transaction = await contract.methods.grantAccess(
//             collection_id,
//             nft_id,
//             user,
//             access_level
//         ).send({
//             from: accounts[0],
//             gas: 1000000
//         });

//         console.log('Access updated successfully:', transaction);
//         return transaction;
//     } catch (error) {
//         console.error('Error updating access:', error);
//         throw error;
//     }
// }

// export { signJsonData, createCollection, createNFT, createNFTMetadata, extractNFTIdFromTransaction, UpdateAccess };