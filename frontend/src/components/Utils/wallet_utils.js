
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import Web3 from 'web3';

const BASE_SEPOLIA_CHAIN_ID = '0x14A34'; // 84532 in hex
const BASE_SEPOLIA_RPC = 'https://base-sepolia-rpc.publicnode.com';

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

async function ensureBaseSepolia() {
  const web3 = getWeb3();
  
  try {
    // Get current chain ID
    const chainId = await web3.eth.getChainId();
    const currentChainHex = '0x' + chainId.toString(16);
    
    // If already on Base Sepolia, return early
    if (currentChainHex.toLowerCase() === BASE_SEPOLIA_CHAIN_ID.toLowerCase()) {
      return true;
    }

    // Need to switch networks
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_SEPOLIA_CHAIN_ID }],
      });
      return true;
    } catch (switchError) {
      // This error code means the chain is not added to the wallet
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: BASE_SEPOLIA_CHAIN_ID,
              chainName: 'Base Sepolia',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: [BASE_SEPOLIA_RPC],
              blockExplorerUrls: ['https://sepolia.basescan.org']
            }]
          });
          return true;
        } catch (addError) {
          console.error('Error adding Base Sepolia chain:', addError);
          throw new Error('Failed to add Base Sepolia network to wallet');
        }
      }
      throw switchError;
    }
  } catch (error) {
    console.error('Error ensuring Base Sepolia chain:', error);
    throw error;
  }
}

// Modify your existing functions to use the chain checker
const withChainCheck = (fn) => {
    return async (...args) => {
      await ensureBaseSepolia();
      return fn(...args);
    };
  };


  export {withChainCheck, ensureBaseSepolia };