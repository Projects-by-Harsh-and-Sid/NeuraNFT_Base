const TronWeb = require('tronweb');

// Initialize TronWeb (replace with your actual configuration)
const tronWeb = new TronWeb({
    fullHost: 'https://api.nileex.io', // Use appropriate network
    privateKey: 'your_private_key_here'
});

// Function to build the JSON file
function buildTransactionJson(params) {
    return {
        // Add your specific JSON structure here
        // For example:
        amount: params.amount,
        recipient: params.recipient,
        timestamp: Date.now(),
        // Add more fields as needed
    };
}

// Function to sign JSON data
async function signJsonData(jsonData) {
    if (typeof window.tronWeb === 'undefined') {
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

// Function to perform the transaction
async function performTransaction(params) {
    try {
        // Build the transaction JSON
        const transactionJson = buildTransactionJson(params);

        // Sign the JSON data
        const signatureData = await signJsonData(transactionJson);
        if (!signatureData) {
            throw new Error('Failed to sign transaction data');
        }

        // Load the contract (replace with your contract's address and ABI)
        const contractAddress = 'TYour_Contract_Address';
        const contract = await tronWeb.contract().at(contractAddress);

        // Call the contract method (replace 'yourMethodName' with the actual method name)
        const result = await contract.yourMethodName(transactionJson, signatureData).send({
            feeLimit: 100000000
        });

        console.log('Transaction successful:', result);
        return result;
    } catch (error) {
        console.error('Error performing transaction:', error);
        throw error;
    }
}

// Example usage
async function main() {
    try {
        const transactionParams = {
            amount: 100,
            recipient: 'TRecipient_Address',
            // Add more parameters as needed
        };

        const result = await performTransaction(transactionParams);
        console.log('Transaction completed:', result);
    } catch (error) {
        console.error('Transaction failed:', error);
    }
}

main();