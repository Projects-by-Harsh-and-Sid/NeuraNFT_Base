# Using Tron Smart Contract Build Data in Python Code

This guide provides detailed information on how to use the build data from your Tron smart contracts in Python code. This is particularly useful for building backend services, scripts, or bots that interact with your deployed smart contracts.

## Prerequisites

- Python 3.6 or higher
- `tronpy` library
- Compiled Tron smart contract

## Setting Up the Environment

First, install the `tronpy` library:

```bash
pip install tronpy
```

## Importing Contract ABI and Address

After compiling your contract with TronBox, you'll find the build data in the `build/contracts/` directory. In your Python script, import this data:

```python
import json

# Load the contract build data
with open('build/contracts/YourContract.json', 'r') as file:
    contract_data = json.load(file)

# Extract ABI and address
contract_abi = contract_data['abi']
contract_address = contract_data['networks']['2']['address']  # '2' is the network ID for Shasta testnet
```

## Connecting to Tron Network

Use `tronpy` to connect to the Tron network:

```python
from tronpy import Tron
from tronpy.providers import HTTPProvider

# Connect to Shasta testnet
client = Tron(HTTPProvider('https://api.shasta.trongrid.io'))
```

## Creating a Contract Instance

Use the ABI and address to create a contract instance:

```python
contract = client.get_contract(contract_address)
```

## Calling Contract Functions

### View Functions

For functions that don't modify the contract state:

```python
result = contract.functions.yourViewFunction()
print(result)
```

### Transaction Functions

For functions that modify the contract state, you'll need a private key to sign the transaction:

```python
from tronpy.keys import PrivateKey

private_key = PrivateKey(bytes.fromhex('your_private_key_here'))

txn = (
    contract.functions.yourFunction(param1, param2)
    .with_owner(private_key.public_key.to_address())
    .fee_limit(100_000_000)
    .build()
    .sign(private_key)
)

result = client.broadcast(txn)
print(result)
```

## Handling Events

To get past events emitted by your contract:

```python
events = contract.events.YourEvent.get_logs(from_block=0, to_block='latest')
for event in events:
    print(event)
```

## Example Python Script

Here's an example of a Python script that interacts with a Tron smart contract:

```python
import json
from tronpy import Tron
from tronpy.keys import PrivateKey
from tronpy.providers import HTTPProvider

# Load contract data
with open('build/contracts/YourContract.json', 'r') as file:
    contract_data = json.load(file)

contract_abi = contract_data['abi']
contract_address = contract_data['networks']['2']['address']

# Connect to Shasta testnet
client = Tron(HTTPProvider('https://api.shasta.trongrid.io'))

# Get contract instance
contract = client.get_contract(contract_address)

# Call a view function
def get_value():
    return contract.functions.getValue()

# Call a transaction function
def set_value(new_value):
    private_key = PrivateKey(bytes.fromhex('your_private_key_here'))
    txn = (
        contract.functions.setValue(new_value)
        .with_owner(private_key.public_key.to_address())
        .fee_limit(100_000_000)
        .build()
        .sign(private_key)
    )
    result = client.broadcast(txn)
    return result

# Main execution
if __name__ == "__main__":
    print("Current value:", get_value())
    
    new_value = 42
    set_value(new_value)
    print(f"Value set to {new_value}")
    
    print("New value:", get_value())
```

## Best Practices

1. **Error Handling**: Use try-except blocks to handle potential errors gracefully.

   ```python
   try:
       result = contract.functions.yourFunction()
   except Exception as e:
       print(f"An error occurred: {e}")
   ```

2. **Environment Variables**: Store sensitive information like private keys in environment variables.

   ```python
   import os
   private_key = PrivateKey(bytes.fromhex(os.getenv('TRON_PRIVATE_KEY')))
   ```

3. **Gas Estimation**: For complex transactions, estimate the energy cost before sending the transaction.

   ```python
   estimated_energy = contract.functions.yourFunction().estimateEnergy()
   print(f"Estimated energy: {estimated_energy}")
   ```

4. **Asynchronous Operations**: For better performance in applications handling multiple requests, consider using asynchronous libraries like `asyncio` and `aiohttp`.

5. **Logging**: Implement proper logging for easier debugging and monitoring.

   ```python
   import logging
   logging.basicConfig(level=logging.INFO)
   logger = logging.getLogger(__name__)

   logger.info("Calling contract function")
   ```

6. **Network Check**: Ensure your script is connected to the correct network (mainnet or testnet).

   ```python
   network = client.get_chain_parameters()['chain_id']
   print(f"Connected to network: {network}")
   ```

7. **Batch Requests**: If you need to make multiple calls, consider using batch requests to improve efficiency.

   ```python
   with client.batch_call():
       result1 = contract.functions.function1()
       result2 = contract.functions.function2()
   print(result1, result2)
   ```

By following these guidelines and best practices, you can effectively interact with your Tron smart contracts using Python, enabling you to build powerful backend services, automated scripts, or bots that leverage the capabilities of your smart contracts.