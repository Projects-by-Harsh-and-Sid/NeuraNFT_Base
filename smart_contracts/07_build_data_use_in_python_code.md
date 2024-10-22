# Using Ethereum Smart Contract Build Data in Python Code

This guide provides detailed information on how to use the build data from your Ethereum smart contracts in Python code, useful for building backend services, scripts, or bots.

## Prerequisites

- Python 3.7 or higher
- `web3.py` library
- Compiled Ethereum smart contract

## Initial Setup

### 1. Install Dependencies
```bash
# Install Web3.py
pip install web3

# Install additional utilities
pip install python-dotenv eth-account
```

### 2. Load Contract Data
```python
import json
import os
from web3 import Web3
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Load contract build data
def load_contract(contract_name):
    with open(f'build/contracts/{contract_name}.json', 'r') as file:
        contract_data = json.load(file)
    return contract_data['abi'], contract_data['networks']['5']['address']  # 5 for Goerli
```

## Web3 Connection Setup

### 1. Basic Setup
```python
from web3 import Web3
from web3.middleware import geth_poa_middleware

def get_web3():
    # Infura connection
    infura_url = f"https://goerli.infura.io/v3/{os.getenv('INFURA_PROJECT_ID')}"
    w3 = Web3(Web3.HTTPProvider(infura_url))
    
    # Add PoA middleware for testnets
    w3.middleware_onion.inject(geth_poa_middleware, layer=0)
    
    return w3

def get_contract(w3, abi, address):
    return w3.eth.contract(address=address, abi=abi)
```

### 2. Account Management
```python
from eth_account import Account
import secrets

def create_account():
    # Generate a private key
    private_key = "0x" + secrets.token_hex(32)
    account = Account.from_key(private_key)
    return account

def load_account(w3):
    private_key = os.getenv('ETH_PRIVATE_KEY')
    account = Account.from_key(private_key)
    return account
```

## Contract Interaction

### 1. Basic Contract Class
```python
class EthereumContract:
    def __init__(self, w3, abi, address):
        self.w3 = w3
        self.contract = w3.eth.contract(address=address, abi=abi)
        self.account = load_account(w3)

    def call_function(self, func_name, *args):
        """Call a view function"""
        function = getattr(self.contract.functions, func_name)
        return function(*args).call()

    def send_transaction(self, func_name, *args):
        """Send a transaction"""
        function = getattr(self.contract.functions, func_name)
        
        # Get nonce
        nonce = self.w3.eth.get_transaction_count(self.account.address)
        
        # Build transaction
        transaction = function(*args).build_transaction({
            'from': self.account.address,
            'nonce': nonce,
            'gas': 2000000,
            'gasPrice': self.w3.eth.gas_price
        })
        
        # Sign and send transaction
        signed_txn = self.w3.eth.account.sign_transaction(
            transaction, self.account.key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        
        # Wait for transaction receipt
        return self.w3.eth.wait_for_transaction_receipt(tx_hash)
```

### 2. Example Implementation
```python
class TokenContract(EthereumContract):
    def get_balance(self, address):
        balance = self.call_function('balanceOf', address)
        return self.w3.from_wei(balance, 'ether')

    def transfer(self, to_address, amount):
        amount_wei = self.w3.to_wei(amount, 'ether')
        return self.send_transaction('transfer', to_address, amount_wei)

    def get_events(self, event_name, from_block=0):
        event = getattr(self.contract.events, event_name)
        return event.get_logs(fromBlock=from_block)
```

## Advanced Features

### 1. Event Handling
```python
class EventListener:
    def __init__(self, contract):
        self.contract = contract
        self.w3 = contract.w3

    async def listen_to_events(self, event_name, callback):
        event_filter = self.contract.events[event_name].create_filter(fromBlock='latest')
        while True:
            for event in event_filter.get_new_entries():
                await callback(event)
            await asyncio.sleep(2)  # Poll every 2 seconds

    def get_past_events(self, event_name, from_block, to_block='latest'):
        event = getattr(self.contract.events, event_name)
        return event.get_logs(fromBlock=from_block, toBlock=to_block)
```

### 2. Transaction Management
```python
class TransactionManager:
    def __init__(self, w3, account):
        self.w3 = w3
        self.account = account

    def estimate_gas(self, transaction):
        return self.w3.eth.estimate_gas(transaction)

    def get_gas_price(self):
        return self.w3.eth.gas_price

    async def wait_for_transaction(self, tx_hash, timeout=120):
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                receipt = self.w3.eth.get_transaction_receipt(tx_hash)
                if receipt:
                    return receipt
            except Exception:
                pass
            await asyncio.sleep(1)
        raise TimeoutError("Transaction not mined within timeout period")
```

## Complete Example

```python
import asyncio
from web3 import Web3
from eth_account import Account
import os
from dotenv import load_dotenv

class EthereumApp:
    def __init__(self):
        load_dotenv()
        self.w3 = self.setup_web3()
        self.account = self.setup_account()
        self.contract = self.setup_contract()

    def setup_web3(self):
        infura_url = f"https://mainnet.infura.io/v3/{os.getenv('INFURA_PROJECT_ID')}"
        w3 = Web3(Web3.HTTPProvider(infura_url))
        w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        return w3

    def setup_account(self):
        private_key = os.getenv('ETH_PRIVATE_KEY')
        return Account.from_key(private_key)

    def setup_contract(self):
        abi, address = self.load_contract('YourContract')
        return self.w3.eth.contract(address=address, abi=abi)

    async def main(self):
        try:
            # Get current value
            value = await self.contract.functions.getValue().call()
            print(f"Current value: {value}")

            # Set new value
            tx_hash = await self.set_value(42)
            receipt = await self.wait_for_transaction(tx_hash)
            print(f"Transaction mined: {receipt.transactionHash.hex()}")

            # Listen for events
            await self.listen_for_events()

        except Exception as e:
            print(f"Error: {e}")

    async def set_value(self, new_value):
        nonce = self.w3.eth.get_transaction_count(self.account.address)
        
        transaction = self.contract.functions.setValue(new_value).build_transaction({
            'from': self.account.address,
            'nonce': nonce,
            'gas': 2000000,
            'gasPrice': self.w3.eth.gas_price
        })
        
        signed_txn = self.account.sign_transaction(transaction)
        return self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)

    async def wait_for_transaction(self, tx_hash):
        while True:
            try:
                receipt = self.w3.eth.get_transaction_receipt(tx_hash)
                if receipt:
                    return receipt
            except Exception:
                pass
            await asyncio.sleep(1)

    async def listen_for_events(self):
        event_filter = self.contract.events.ValueChanged.create_filter(fromBlock='latest')
        while True:
            for event in event_filter.get_new_entries():
                print(f"New value set: {event['args']['value']}")
            await asyncio.sleep(2)

if __name__ == "__main__":
    app = EthereumApp()
    asyncio.run(app.main())
```

## Best Practices

### 1. Environment Configuration
```python
# .env file
INFURA_PROJECT_ID=your_infura_project_id
ETH_PRIVATE_KEY=your_private_key
CONTRACT_ADDRESS=your_contract_address
```

### 2. Error Handling
```python
def handle_transaction_error(error):
    if 'insufficient funds' in str(error):
        raise ValueError("Insufficient funds for gas")
    if 'nonce too low' in str(error):
        raise ValueError("Nonce too low - transaction already processed")
    raise error
```

### 3. Gas Management
```python
def estimate_gas_with_buffer(w3, transaction, buffer=1.2):
    estimated_gas = w3.eth.estimate_gas(transaction)
    return int(estimated_gas * buffer)
```

### 4. Logging
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)
```

By following these patterns and best practices, you can create robust Python applications that interact with Ethereum smart contracts effectively and reliably.