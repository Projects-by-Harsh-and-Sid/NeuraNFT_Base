// src/WalletContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [tronWebState, setTronWebState] = useState({
    installed: false,
    loggedIn: false,
  });
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);

// src/WalletContext.js
const checkTronWebState = () => {
  if (window.tronWeb) {
    setTronWebState((prevState) => ({
      ...prevState,
      installed: true,
    }));
  } else {
    setTronWebState({
      installed: false,
      loggedIn: false,
    });
  }
};


// src/WalletContext.js
useEffect(() => {
  checkTronWebState();
  const interval = setInterval(checkTronWebState, 5000);
  return () => clearInterval(interval);
}, []);


  const connectWallet = async () => {
    if (!window.tronWeb) {
      alert('Please install TronLink wallet extension.');
      return;
    }

    try {
      await window.tronWeb.request({ method: 'tron_requestAccounts' });
      const userAddress = window.tronWeb.defaultAddress.base58;
      setAddress(userAddress);
      
      const balanceInSun = await window.tronWeb.trx.getBalance(userAddress);
      const balanceInTRX = window.tronWeb.fromSun(balanceInSun);
      setBalance(parseFloat(balanceInTRX).toFixed(3));

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
    disconnectWallet
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