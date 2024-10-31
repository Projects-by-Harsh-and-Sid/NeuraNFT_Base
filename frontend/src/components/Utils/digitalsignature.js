import ethers from 'ethers';

async function verifySignature(message, signature, expectedAddress) {
    // Prepare the message hash (EIP-191 standard)
    const messageHash = ethers.utils.hashMessage(message);
    
    // Recover the address from the signature
    const recoveredAddress = ethers.utils.recoverAddress(messageHash, signature);
    
    // Compare the recovered address with the expected address
    if (recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()) {
        console.log("Signature is valid.");
        return true;
    } else {
        console.log("Signature verification failed.");
        return false;
    }
}

// // Example usage
// (async () => {
//     // The original message that was signed
//     const message = '{"nft_id": "123", "collection_id": "456", "access_level": "premium"}';
    
//     // The signature obtained from the wallet (as a hexadecimal string)
//     const signature = "0x..."; // Replace with the actual signature
    
//     // The expected address of the signer
//     const expectedAddress = "0x..."; // Replace with the signer's Ethereum address
    
//     const isValid = await verifySignature(message, signature, expectedAddress);
    
//     if (isValid) {
//         // Parse the message to extract data
//         const data = JSON.parse(message);
//         const nft_id = data.nft_id;
//         const collection_id = data.collection_id;
//         const access_level = data.access_level;
        
//         // Verify the user's access level (implement your logic here)
//         const user_access_level = getUserAccessLevel(); // Define this function 
//         if (user_access_level === access_level) {
//             console.log("User has the required access level.");
//         } else {
//             console.log("User does not have the required access level.");
//         }
//     }
// })();
