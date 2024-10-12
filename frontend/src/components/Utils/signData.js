import constract_address_data from './shasta_addresses.json' 


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
            shouldPollResponse: true
        });

        console.log('NFT created successfully:', transaction);
        return transaction;
    } catch (error) {
        console.error('Error creating NFT:', error);
        throw error;
    }
}

// Function to create metadata for an NFT
async function createNFTMetadata(collectionId, nftId, metadata) {
    if (typeof window.tronWeb === 'undefined') {
        throw new Error('TronLink is not installed or not connected');
    }

    try {
        const contractAddress = constract_address_data.NFTMetadata;
        const contract = await window.tronWeb.contract().at(contractAddress);

        const transaction = await contract.createMetadata(
            collectionId,
            nftId,
            metadata
        ).send({
            feeLimit: 1000000000,
            callValue: 0,
            shouldPollResponse: true
        });

        console.log('Metadata created successfully:', transaction);
        return transaction;
    } catch (error) {
        console.error('Error creating metadata:', error);
        throw error;
    }
}


function extractNFTIdFromTransaction(transaction) {
    // Check if the transaction object has a 'receipt' property
    if (transaction && transaction.receipt && transaction.receipt.result === 'SUCCESS') {
        // Look for events in the transaction logs
        const logs = transaction.log;
        if (logs && logs.length > 0) {
            for (const log of logs) {
                // Assuming the event name is 'NFTCreated'
                if (log.name === 'NFTCreated') {
                    // The NFT ID should be one of the indexed parameters
                    // Typically, it would be the second parameter (index 1)
                    if (log.data && log.data.length > 1) {
                        return parseInt(log.data[1], 16); // Convert hex to integer
                    }
                }
            }
        }
        
        // If we couldn't find the ID in the logs, try to get it from the return value
        if (transaction.ret && transaction.ret.length > 0) {
            const returnValue = transaction.ret[0];
            if (returnValue && returnValue.contractRet === 'SUCCESS') {
                // The NFT ID might be in the return value
                // You may need to decode this based on your contract's specific implementation
                return parseInt(returnValue.result, 16); // Convert hex to integer
            }
        }
    }
    
    // If we couldn't find the NFT ID, return null or throw an error
    console.error('Could not extract NFT ID from transaction');
    return null;
}



// Export the functions so they can be imported in other files
// export { buildTransactionJson, signJsonData, performTransaction, handleTransaction };
export { signJsonData, createCollection, createNFT, createNFTMetadata, extractNFTIdFromTransaction };