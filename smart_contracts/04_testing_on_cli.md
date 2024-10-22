# Testing Ethereum Smart Contracts on CLI

This guide provides detailed information on how to interact with your deployed Ethereum smart contracts using the Truffle console.

## Accessing the Truffle Console

Start the Truffle console connected to your desired network:

```bash
# Local development network
truffle console

# Specific network (e.g., Sepolia testnet)
truffle console --network sepolia

# Network with specific configuration
truffle console --network sepolia --verbose-rpc
```

**Note**: 
- When pasting multi-line code in the console, use the `.editor` command to enter multi-line mode
- Press Ctrl+D (Command+D on Mac) to execute the code
- Use Ctrl+C twice to exit the console

## Getting Contract Instances

### Basic Contract Instance
```javascript
// Get deployed contract
const instance = await YourContract.deployed()

// Get contract at specific address
const instance = await YourContract.at("0x1234...")

// Get all accounts
const accounts = await web3.eth.getAccounts()
```

### Contract Information
```javascript
// Get contract address
instance.address

// Get contract ABI
instance.abi

// Get contract bytecode
YourContract.bytecode
```

## Calling Contract Functions

### View Functions (No Gas Required)
```javascript
// Simple view function
const result = await instance.yourViewFunction()
console.log(result.toString())

// View function with parameters
const result = await instance.viewWithParams(param1, param2)
console.log(result)

// Multiple return values
const [value1, value2] = await instance.multipleReturns()
```

### Transaction Functions (Requires Gas)
```javascript
// Simple transaction
const tx = await instance.yourFunction(param1, param2, {
  from: accounts[0],
  gas: 200000,
  gasPrice: web3.utils.toWei('50', 'gwei')
})

// Transaction with ETH
const tx = await instance.payableFunction({
  from: accounts[0],
  value: web3.utils.toWei('1', 'ether'),
  gas: 200000
})

// Get transaction receipt
const receipt = await web3.eth.getTransactionReceipt(tx.tx)
```

## Working with BigNumbers

Web3.js returns big numbers as strings or BN objects:

```javascript
// Convert string to BN
const value = web3.utils.toBN('1000000000000000000')

// Convert BN to string
const stringValue = value.toString()

// Mathematical operations
const sum = value.add(web3.utils.toBN('1000'))
const product = value.mul(web3.utils.toBN('2'))

// Convert from/to ETH
const ethValue = web3.utils.fromWei('1000000000000000000', 'ether')
const weiValue = web3.utils.toWei('1', 'ether')
```

## Event Handling

### Listening for Events
```javascript
// Watch for events
instance.YourEvent({}, { fromBlock: 'latest' })
  .on('data', event => console.log(event))
  .on('error', error => console.error(error))

// Get past events
const events = await instance.getPastEvents('YourEvent', {
  fromBlock: 0,
  toBlock: 'latest'
})

// Get event logs with filters
const events = await instance.getPastEvents('Transfer', {
  filter: { from: accounts[0] },
  fromBlock: 0,
  toBlock: 'latest'
})
```

### Decoding Event Logs
```javascript
// Get transaction logs
const receipt = await web3.eth.getTransactionReceipt(txHash)
const eventAbi = instance.abi.find(x => x.type === 'event' && x.name === 'YourEvent')
const log = web3.eth.abi.decodeLog(
  eventAbi.inputs,
  receipt.logs[0].data,
  receipt.logs[0].topics.slice(1)
)
```

## ETH Transactions and Balances

### Sending ETH
```javascript
// Send ETH
const tx = await web3.eth.sendTransaction({
  from: accounts[0],
  to: recipient,
  value: web3.utils.toWei('1', 'ether'),
  gas: 21000
})

// Get balance
const balance = await web3.eth.getBalance(address)
console.log(web3.utils.fromWei(balance, 'ether'))
```

### Account Management
```javascript
// Create new account
const newAccount = web3.eth.accounts.create()

// Sign transaction
const signedTx = await web3.eth.accounts.signTransaction({
  to: recipient,
  value: web3.utils.toWei('1', 'ether'),
  gas: 21000
}, privateKey)
```

## Error Handling and Gas Estimation

### Error Handling
```javascript
try {
  const result = await instance.yourFunction({
    from: accounts[0],
    gas: 200000
  })
  console.log('Success:', result)
} catch (error) {
  console.error('Error:', error.message)
  // Check for specific error types
  if (error.message.includes('revert')) {
    console.log('Transaction reverted')
  }
}
```

### Gas Estimation
```javascript
// Estimate gas for function call
const gasEstimate = await instance.yourFunction.estimateGas(
  param1, 
  param2, 
  { from: accounts[0] }
)

// Get current gas price
const gasPrice = await web3.eth.getGasPrice()
```

## Best Practices

### 1. Transaction Management
```javascript
// Wait for transaction confirmation
const send = async (method, params = []) => {
  const tx = await method(...params, { from: accounts[0] })
  const receipt = await web3.eth.getTransactionReceipt(tx.tx)
  if (!receipt.status) {
    throw new Error('Transaction failed')
  }
  return receipt
}

// Usage
const receipt = await send(instance.yourFunction, [param1, param2])
```

### 2. Gas Management
```javascript
const sendWithGas = async (method, params = []) => {
  const gasEstimate = await method.estimateGas(...params, { 
    from: accounts[0] 
  })
  
  return method(...params, {
    from: accounts[0],
    gas: Math.floor(gasEstimate * 1.2), // Add 20% buffer
    gasPrice: await web3.eth.getGasPrice()
  })
}
```

### 3. Event Monitoring
```javascript
const watchEvent = (contract, eventName) => {
  return new Promise((resolve, reject) => {
    contract[eventName]()
      .on('data', event => resolve(event))
      .on('error', error => reject(error))
  })
}
```

### 4. Security Considerations

1. Never expose private keys in console
2. Use environment variables for sensitive data
3. Always check transaction receipts
4. Verify contract state after transactions
5. Monitor gas usage
6. Use latest Web3.js version

### 5. Debugging Tips

1. Use `debug_traceTransaction` for detailed transaction analysis
2. Check gas estimation before sending transactions
3. Monitor event logs for state changes
4. Use `console.log` in Solidity (requires Hardhat)
5. Keep track of nonce values

By following these guidelines and best practices, you can effectively test and interact with your Ethereum smart contracts using the Truffle console before deploying to mainnet.