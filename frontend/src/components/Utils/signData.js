import constract_address_data from './shasta_addresses.json' ;
import meatadata_contract_data from './contracts/NFTMetadata.json';
import tronWeb from 'tronweb';

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
async function signJsonData(jsonData) 

{
    if (typeof window.tronWeb === 'undefined') 
        {
        console.error("TronLink is not installed or not connected");
        alert('Please install or connect TronLink');
        return null;
        }

    const messageToSign = JSON.stringify(jsonData);

    try {
        const signature = await window.tronWeb.trx.signMessageV2(messageToSign);
        console.log("Signature:", signature);

        // Optionally verify the signature
        const signerAddress = await window.tronWeb.trx.verifyMessageV2(messageToSign, signature);
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
    // Check if TronLink is installed and connected
    if (typeof window.tronWeb === 'undefined') {
        throw new Error('TronLink is not installed or not connected');
    }

    try {
        // Load the CollectionContract
        const contractAddress = constract_address_data.CollectionContract; // Replace with your actual contract address
        const contract = await window.tronWeb.contract().at(contractAddress);

        // Prepare the transaction
        const transaction = await contract.createCollection(
            name,
            contextWindow,
            baseModel,
            image,
            description
        ).send({
            feeLimit: 1000000000,
            callValue: 0,
            shouldPollResponse: false
        });

        console.log('Collection created successfully:', transaction);
        return transaction;
    } catch (error) {
        console.error('Error creating collection:', error);
        throw error;
    }
}

async function createNFT(collectionId, name, levelOfOwnership) {
    if (typeof window.tronWeb === 'undefined') {
        throw new Error('TronLink is not installed or not connected');
    }

    try {
        const contractAddress = constract_address_data.NFTContract;
        const contract = await window.tronWeb.contract().at(contractAddress);

        const transaction = await contract.createNFT(
            collectionId,
            name,
            levelOfOwnership
        ).send({
            feeLimit: 1000000000,
            callValue: 0,
            // shouldPollResponse: true
            shouldPollResponse: false
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
    if (typeof window.tronWeb === 'undefined') {
        throw new Error('TronLink is not installed or not connected');
    }

    try {
        const contractAddress = constract_address_data.NFTMetadata;
        const contract = await window.tronWeb.contract(meatadata_contract_data.abi, contractAddress);

        // Convert metadata object to an array of values in the correct order
        const metadataArray = [
            metadata.image,         // image
            metadata.baseModel,     // baseModel
            metadata.data,          // data
            metadata.rag,           // rag
            metadata.fineTuneData,  // fineTuneData
            metadata.description    // description
        ];

        console.log('Collection ID:', collectionId);
        console.log('NFT ID:', nftId);
        console.log('Metadata Array:', metadataArray);

        const transaction = await contract.createMetadata(
            collectionId,
            nftId,
            metadataArray
        ).send({
            feeLimit: 1000000000,
            callValue: 0,
            shouldPollResponse: false
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


async function extractNFTIdFromTransaction(transactionId) {
    const maxAttempts = 20; // Maximum number of attempts
    const delay = 5000;     // Delay between attempts in milliseconds (3 seconds)

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            // Retrieve events associated with the transaction ID
            const events = await window.tronWeb.getEventByTransactionID(transactionId);
            console.log(`Attempt ${attempt}: Retrieved events:`, events);

            if (events && events.length > 0) {
                for (const event of events) {
                    if (event.name === 'NFTCreated') {
                        console.log('Event detected:', event);

                        // Extract nftId from event result
                        // const nftId = event.result.tokenId || event.result._tokenId || event.result['0'];
                        const nftId = event.result.tokenId;
                        
                        console.log('Minted NFT ID:', nftId);

                        if (nftId) {
                            return nftId;
                        } else {
                            console.error('NFT ID not found in event result:', event.result);
                            throw new Error('NFT ID not found in event result');
                        }
                    }
                }
                console.log('NFTCreated event not found in events.');
            } else {
                console.log('No events found for this transaction yet.');
            }
        } catch (error) {
            console.error(`Error on attempt ${attempt}:`, error);
            // Depending on the error, you may want to break the loop or continue
            // For now, we'll continue to retry
        }

        // Wait before the next attempt
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    throw new Error('Failed to retrieve NFT ID after multiple attempts');
}



async function UpdateAcceess(collection_id, nft_id,user, access_level) {
    // Check if TronLink is installed and connected
    if (typeof window.tronWeb === 'undefined') {
        throw new Error('TronLink is not installed or not connected');
    }


    // check if user id is valid tron address
    if (!window.tronWeb.isAddress(user)) {
        throw new Error('Invalid user address');
    }

    try {
        // Load the CollectionContract
        const contractAccess    = constract_address_data.NFTAccessControl; // Replace with your actual contract address
        const contract          = await window.tronWeb.contract().at(contractAccess);

        // Prepare the transaction
        const transaction = await contract.grantAccess(
            collection_id,
            nft_id,
            user,
            access_level
        ).send({
            feeLimit: 1000000000,
            callValue: 0,
            shouldPollResponse: false
        });

        console.log('Collection created successfully:', transaction);
        return transaction;
    } catch (error) {
        console.error('Error creating collection:', error);
        throw error;
    }
}


// Export the functions so they can be imported in other files
// export { buildTransactionJson, signJsonData, performTransaction, handleTransaction };
export { signJsonData, createCollection, createNFT, createNFTMetadata, extractNFTIdFromTransaction, UpdateAcceess };