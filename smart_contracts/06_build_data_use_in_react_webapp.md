# Using Ethereum Smart Contract Build Data in a React Web App

This guide provides detailed information on how to use the build data from your Ethereum smart contracts in a React web application.

## Prerequisites

- A compiled Ethereum smart contract
- React development environment
- MetaMask wallet extension

## Initial Setup

### 1. Install Dependencies
```bash
# Install Web3.js and ethers.js
npm install web3 ethers

# Install useful utilities
npm install @metamask/providers
npm install @web3-react/core @web3-react/injected-connector
```

### 2. Contract Setup
```javascript
// contractConfig.js
import ContractBuild from './build/contracts/YourContract.json';

export const CONTRACT_ADDRESS = "0x1234..."; // Your deployed contract address
export const CONTRACT_ABI = ContractBuild.abi;
```

## Web3 Provider Setup

### 1. Web3 Context Provider
```javascript
// Web3Context.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [networkId, setNetworkId] = useState(null);

  useEffect(() => {
    const initWeb3 = async () => {
      // Modern browsers with MetaMask
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        try {
          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await web3Instance.eth.getAccounts();
          const netId = await web3Instance.eth.net.getId();
          
          setWeb3(web3Instance);
          setAccount(accounts[0]);
          setNetworkId(netId);

          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts) => {
            setAccount(accounts[0]);
          });

          // Listen for network changes
          window.ethereum.on('chainChanged', (chainId) => {
            window.location.reload();
          });
        } catch (error) {
          console.error("User denied account access");
        }
      }
      // Legacy browsers or no web3 provider
      else {
        console.log('Please install MetaMask!');
      }
    };

    initWeb3();
  }, []);

  return (
    <Web3Context.Provider value={{ web3, account, networkId }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}
```

## Contract Integration

### 1. Contract Hook
```javascript
// useContract.js
import { useState, useEffect } from 'react';
import { useWeb3 } from './Web3Context';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contractConfig';

export function useContract() {
  const { web3, account } = useWeb3();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (web3) {
      const contractInstance = new web3.eth.Contract(
        CONTRACT_ABI,
        CONTRACT_ADDRESS
      );
      setContract(contractInstance);
    }
  }, [web3]);

  const callContract = async (method, ...args) => {
    if (!contract) return;
    setLoading(true);
    setError(null);
    
    try {
      const result = await method(...args).call({ from: account });
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const sendTransaction = async (method, ...args) => {
    if (!contract) return;
    setLoading(true);
    setError(null);
    
    try {
      const result = await method(...args).send({ from: account });
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { contract, loading, error, callContract, sendTransaction };
}
```

### 2. Example React Component
```javascript
// ContractInteraction.js
import React, { useState, useEffect } from 'react';
import { useWeb3 } from './Web3Context';
import { useContract } from './useContract';

function ContractInteraction() {
  const { account } = useWeb3();
  const { contract, loading, error, callContract, sendTransaction } = useContract();
  const [value, setValue] = useState('');
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    fetchBalance();
  }, [account]);

  const fetchBalance = async () => {
    try {
      const result = await callContract(contract.methods.balanceOf, account);
      setBalance(web3.utils.fromWei(result, 'ether'));
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const handleTransfer = async () => {
    try {
      await sendTransaction(
        contract.methods.transfer,
        recipient,
        web3.utils.toWei(amount, 'ether')
      );
      await fetchBalance();
    } catch (err) {
      console.error('Error transferring tokens:', err);
    }
  };

  if (!account) return <div>Please connect your wallet</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Contract Interaction</h2>
      <p>Connected Account: {account}</p>
      <p>Balance: {balance} ETH</p>
      <div>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter value"
        />
        <button onClick={handleTransfer}>Transfer</button>
      </div>
    </div>
  );
}

export default ContractInteraction;
```

## Event Handling

### 1. Event Hook
```javascript
// useContractEvents.js
import { useEffect, useState } from 'react';
import { useContract } from './useContract';

export function useContractEvents(eventName, options = {}) {
  const { contract } = useContract();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!contract) return;

    const subscription = contract.events[eventName](options)
      .on('data', (event) => {
        setEvents((prev) => [...prev, event]);
      })
      .on('error', (error) => {
        console.error(`Error in ${eventName} event:`, error);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [contract, eventName]);

  return events;
}
```

## Utility Functions

### 1. Transaction Helper
```javascript
// txHelper.js
export async function sendTransaction(contract, method, account, ...args) {
  const gas = await method(...args).estimateGas({ from: account });
  const gasPrice = await web3.eth.getGasPrice();
  
  return method(...args).send({
    from: account,
    gas: Math.floor(gas * 1.1), // Add 10% buffer
    gasPrice
  });
}
```

### 2. Network Helper
```javascript
// networkHelper.js
export const NETWORKS = {
  1: 'Ethereum Mainnet',
  3: 'Ropsten',
  4: 'Rinkeby',
  5: 'Goerli',
  42: 'Kovan'
};

export function getNetworkName(networkId) {
  return NETWORKS[networkId] || 'Unknown Network';
}
```

## Best Practices

### 1. Error Handling
```javascript
function handleError(error) {
  if (error.code === 4001) {
    return 'Transaction rejected by user';
  }
  if (error.message.includes('insufficient funds')) {
    return 'Insufficient funds for gas';
  }
  return error.message;
}
```

### 2. Transaction Monitoring
```javascript
async function monitorTransaction(txHash) {
  let receipt = null;
  while (receipt === null) {
    receipt = await web3.eth.getTransactionReceipt(txHash);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return receipt;
}
```

### 3. MetaMask Connection
```javascript
async function checkAndConnectMetaMask() {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('Please install MetaMask');
  }
  
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  } catch (error) {
    throw new Error('User rejected connection');
  }
}
```

By following these patterns and best practices, you can create robust and user-friendly dApps that interact seamlessly with Ethereum smart contracts.