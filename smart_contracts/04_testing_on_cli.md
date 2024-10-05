# Testing Tron Smart Contracts on CLI

This guide provides detailed information on how to interact with your deployed Tron smart contracts using the TronBox console.

## Accessing the TronBox Console

To start interacting with your contracts, you first need to access the TronBox console:

```bash
tronbox console --network shasta
```

This command starts an interactive JavaScript environment connected to the Shasta testnet. You can replace `shasta` with any other network defined in your `tronbox.js` file.

**Note**:
> when pasting the code in the console, make sure to paste as `one line`  in vscode terminal
> or you can use the `.editor` command in the console to paste multiline code and `ctrl + d` to run the code



## Getting Contract Instances

Once in the console, you can get an instance of your deployed contract:

```javascript
YourContract.deployed().then(instance => {
  // You can now use 'instance' to interact with your contract
  console.log("Contract instance obtained")
})
```

Replace `YourContract` with the actual name of your contract.

## Calling Contract Functions

### View Functions

For functions that don't modify the contract state (view functions):

```javascript
YourContract.deployed().then(instance => {
  return instance.yourViewFunction()
}).then(result => {
  console.log(result.toString())
}).catch(error => {
  console.error('Error:', error)
})
```

### Transaction Functions

For functions that modify the contract state:

```javascript
YourContract.deployed().then(instance => {
  return instance.yourFunction(param1, param2, { from: TronWeb.address.fromPrivateKey('your_private_key') })
}).then(result => {
  console.log(result)
}).catch(error => {
  console.error('Error:', error)
})
```

Note: Replace `'your_private_key'` with your actual private key.

## Working with BigNumber

TronBox returns big numbers as BigNumber objects. To work with these:

```javascript
YourContract.deployed().then(instance => {
  return instance.getBigNumber()
}).then(bigNum => {
  console.log(bigNum.toString())
}).catch(error => {
  console.error('Error:', error)
})
```

## Handling Events

To listen for events emitted by your contract:

```javascript
YourContract.deployed().then(instance => {
  return instance.YourEvent()
}).then(event => {
  event.watch((err, result) => {
    if (err) console.error('Error on event', err)
    else console.log('Event result:', result)
  })
}).catch(error => {
  console.error('Error:', error)
})
```

To get past events:

```javascript
YourContract.deployed().then(instance => {
  return instance.getPastEvents('YourEvent', {
    fromBlock: 0,
    toBlock: 'latest'
  })
}).then(pastEvents => {
  console.log(pastEvents)
}).catch(error => {
  console.error('Error:', error)
})
```

## Sending TRX

To send TRX to an address:

```javascript
tronWeb.trx.sendTransaction('recipient_address', 1000000).then(result => { // 1 TRX = 1,000,000 SUN
  console.log(result)
}).catch(error => {
  console.error('Error:', error)
})
```

## Checking Account Balance

To check the balance of an account:

```javascript
tronWeb.trx.getBalance('address').then(balance => {
  console.log(balance)
}).catch(error => {
  console.error('Error:', error)
})
```

## Error Handling

When interacting with contracts, always use `.catch()` to handle potential errors:

```javascript
YourContract.deployed().then(instance => {
  return instance.yourFunction()
}).then(result => {
  console.log(result)
}).catch(error => {
  console.error('Error:', error)
})
```

## Best Practices

1. **Chain promises**: Use `.then()` to chain multiple operations for cleaner code.

2. **Check transaction status**: After sending a transaction, check its status to ensure it was successful.

   ```javascript
   YourContract.deployed().then(instance => {
     return instance.yourFunction()
   }).then(tx => {
     return tronWeb.trx.getTransaction(tx.txid)
   }).then(txInfo => {
     console.log(txInfo.ret[0].contractRet) // Should be 'SUCCESS'
   }).catch(error => {
     console.error('Error:', error)
   })
   ```

3. **Gas management**: Be aware of the energy consumption of your transactions. You can set a fee limit when calling functions:

   ```javascript
   YourContract.deployed().then(instance => {
     return instance.yourFunction({ feeLimit: 1000000 })
   }).then(result => {
     console.log(result)
   }).catch(error => {
     console.error('Error:', error)
   })
   ```

4. **Keep private keys secure**: Never hardcode private keys in your scripts. Use environment variables or secure key management solutions.

5. **Use the latest TronBox version**: Keep your TronBox updated to benefit from the latest features and bug fixes.

   ```bash
   npm update -g tronbox
   ```

By following these guidelines and using the TronBox console effectively, you can thoroughly test and interact with your Tron smart contracts, ensuring they function as expected before deploying to the mainnet.