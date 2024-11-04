const { ethers } = require('ethers');

module.exports = async function (context, req) {
  try {
    const { message, signature, expectedAddress } = req.body;

    // Hash the message
    const messageHash = ethers.utils.hashMessage(message);

    // Recover the address from the signature
    const recoveredAddress = ethers.utils.recoverAddress(messageHash, signature);

    // Compare addresses
    const isValid = recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();

    context.res = {
      status: 200,
      body: { isValid, recoveredAddress }
    };
  } catch (error) {
    context.res = {
      status: 400,
      body: { error: error.message }
    };
  }
};


