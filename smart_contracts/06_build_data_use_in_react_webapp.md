# Using Tron Smart Contract Build Data in a React Web App

This guide provides detailed information on how to use the build data from your Tron smart contracts in a React web application.

## Prerequisites

- A compiled Tron smart contract
- React development environment set up
- TronWeb library

## Setting Up TronWeb

First, install TronWeb in your React project:

```bash
npm install tronweb
```

Then, initialize TronWeb in your React app:

```javascript
import TronWeb from 'tronweb';

const tronWeb = new TronWeb({
  fullHost: 'https://api.shasta.trongrid.io',
  headers: { "TRON-PRO-API-KEY": 'your-api-key-here' },
  privateKey: 'your-private-key-here' // Optional, needed for signing transactions
});
```

## Importing Contract ABI and Address

After compiling your contract with TronBox, you'll find the build data in the `build/contracts/` directory. Import this data into your React app:

```javascript
import ContractBuild from './build/contracts/YourContract.json';

const contractAddress = ContractBuild.networks['2'].address; // '2' is the network ID for Shasta testnet
const contractABI = ContractBuild.abi;
```

## Creating a Contract Instance

Use the ABI and address to create a contract instance:

```javascript
const contract = await tronWeb.contract(contractABI, contractAddress);
```

## Calling Contract Functions

### View Functions

For functions that don't modify the contract state:

```javascript
const result = await contract.yourViewFunction().call();
console.log(result);
```

### Transaction Functions

For functions that modify the contract state:

```javascript
const result = await contract.yourFunction(param1, param2).send({
  feeLimit: 100000000,
  callValue: 0,
  shouldPollResponse: true
});
console.log(result);
```

## Handling Events

To listen for events emitted by your contract:

```javascript
contract.YourEvent().watch((err, event) => {
  if(err) return console.error('Error with "YourEvent" event:', err);
  console.log('YourEvent: ', event.result);
});
```

## Example React Component

Here's an example of a React component that interacts with a Tron smart contract:

```jsx
import React, { useState, useEffect } from 'react';
import TronWeb from 'tronweb';
import ContractBuild from './build/contracts/YourContract.json';

const ContractInteraction = () => {
  const [tronWeb, setTronWeb] = useState(null);
  const [contract, setContract] = useState(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    const initTronWeb = async () => {
      // Initialize TronWeb
      const tronWebInstance = new TronWeb({
        fullHost: 'https://api.shasta.trongrid.io',
        headers: { "TRON-PRO-API-KEY": 'your-api-key-here' },
      });

      setTronWeb(tronWebInstance);

      // Initialize contract
      const contractAddress = ContractBuild.networks['2'].address;
      const contractInstance = await tronWebInstance.contract(ContractBuild.abi, contractAddress);
      setContract(contractInstance);
    };

    initTronWeb();
  }, []);

  const getValue = async () => {
    if (contract) {
      const result = await contract.getValue().call();
      setValue(result.toString());
    }
  };

  const setValue = async (newValue) => {
    if (contract) {
      await contract.setValue(newValue).send({
        feeLimit: 100000000,
        callValue: 0,
        shouldPollResponse: true
      });
      getValue(); // Refresh the value
    }
  };

  return (
    <div>
      <h1>Contract Interaction</h1>
      <p>Current Value: {value}</p>
      <button onClick={getValue}>Get Value</button>
      <input type="text" onChange={(e) => setValue(e.target.value)} />
      <button onClick={() => setValue(value)}>Set Value</button>
    </div>
  );
};

export default ContractInteraction;
```

## Best Practices

1. **Error Handling**: Always wrap your contract interactions in try-catch blocks to handle potential errors gracefully.

2. **Loading States**: Use React state to manage loading states during contract interactions.

3. **Wallet Connection**: Implement a way for users to connect their TronLink wallet to your dApp.

4. **Network Check**: Ensure your app is connected to the correct network (mainnet or testnet).

5. **Gas Estimation**: For complex transactions, estimate the energy cost before sending the transaction.

6. **Event Handling**: Implement proper event listeners to update your UI in response to contract events.

7. **Security**: Never expose private keys in your frontend code. Use secure key management practices.

## Connecting to TronLink Wallet

To interact with a user's TronLink wallet:

```javascript
useEffect(() => {
  const connectWallet = async () => {
    if (window.tronWeb && window.tronWeb.ready) {
      setTronWeb(window.tronWeb);
    } else {
      const timer = setInterval(() => {
        if (window.tronWeb && window.tronWeb.ready) {
          clearInterval(timer);
          setTronWeb(window.tronWeb);
        }
      }, 1000);
    }
  };

  connectWallet();
}, []);
```

This code checks for the presence of TronLink and connects to it when available.

By following these guidelines and best practices, you can effectively integrate your Tron smart contracts into a React web application, creating powerful and interactive decentralized applications.