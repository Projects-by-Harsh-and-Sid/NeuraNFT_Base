// src/WalletContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [tronWebState, setTronWebState] = useState({
    installed: false,
    loggedIn: false,
  });
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [coinbaseWallet, setCoinbaseWallet] = useState(null);
  const [provider, setProvider] = useState(null);

// src/WalletContext.js
// const checkTronWebState = () => {
//   if (window.tronWeb) {
//     setTronWebState((prevState) => ({
//       ...prevState,
//       installed: true,
//     }));
//   } else {
//     setTronWebState({
//       installed: false,
//       loggedIn: false,
//     });
//   }
// };


// // src/WalletContext.js
// useEffect(() => {
//   checkTronWebState();
//   const interval = setInterval(checkTronWebState, 5000);
//   return () => clearInterval(interval);
// }, []);

useEffect(() => {
  const initializeCoinbaseWallet = () => {
    const wallet = new CoinbaseWalletSDK({
      appName: 'My Crypto App',
      appLogoUrl: 'https://example.com/logo.png',
      darkMode: false
    });

    const ethereum = wallet.makeWeb3Provider('https://base-sepolia-rpc.publicnode.com', 84532);

    setCoinbaseWallet(wallet);
    setProvider(ethereum);
    setTronWebState((prevState) => ({
      ...prevState,
      installed: true,
    }));
  };

  initializeCoinbaseWallet();
}, []);

const updateBalance = async (userAddress, currentProvider) => {
  try {
    const balanceInWei = await currentProvider.request({
      method: 'eth_getBalance',
      params: [userAddress, 'latest']
    });
    
    // Convert balance from Wei to Ether
    const balanceInEth = parseInt(balanceInWei, 16) / 1e18;
    
    // Set balance with 6 decimal places
    setBalance(balanceInEth.toFixed(6));
  } catch (error) {
    console.error('Error fetching balance:', error);
    setBalance('Error');
  }
};



  const connectWallet = async () => {
    if (!provider) {
      alert('Coinbase Wallet is not initialized.');
      return;
    }
    
    try {
      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      });

      const userAddress = accounts[0];
      setAddress(userAddress);
      
      console.log('User address:', userAddress);
      
      // const balanceInSun = await window.tronWeb.trx.getBalance(userAddress);
      // const balanceInTRX = window.tronWeb.fromSun(balanceInSun);
      // setBalance(parseFloat(balanceInTRX).toFixed(3));

      await updateBalance(userAddress, provider);

      setTronWebState({
        installed: true,
        loggedIn: true,
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const disconnectWallet = () => {
    setTronWebState({
      installed: true,
      loggedIn: false,
    });
    setAddress(null);
    setBalance(null);
  };

  const value = {
    tronWebState,
    address,
    balance,
    connectWallet,
    disconnectWallet,
    provider
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};