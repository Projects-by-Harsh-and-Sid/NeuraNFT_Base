// signData.js
export async function signJsonData(jsonData) {
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
  