# Migration and Deployment on Ethereum

This guide provides detailed information on the migration and deployment process for Ethereum smart contracts, including the role of `Migrations.sol` and handling dependencies between contracts.

## Understanding Migrations

Migrations are JavaScript files that help you deploy contracts to the Ethereum blockchain. They allow you to:

1. Deploy contracts in a specific order
2. Pass parameters to constructors during deployment
3. Save deployment addresses for later use
4. Handle contract dependencies
5. Manage network-specific deployments

## The Role of Migrations.sol

`Migrations.sol` is a special contract that keeps track of which migrations have been run on the blockchain:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Migrations {
  address public owner;
  uint public last_completed_migration;

  modifier restricted() {
    require(msg.sender == owner, "This function is restricted to the contract's owner");
    _;
  }

  constructor() {
    owner = msg.sender;
  }

  function setCompleted(uint completed) public restricted {
    last_completed_migration = completed;
  }

  function upgrade(address new_address) public restricted {
    Migrations upgraded = Migrations(new_address);
    upgraded.setCompleted(last_completed_migration);
  }
}
```

## Migration Files

Migration files are numbered JavaScript files in the `migrations/` directory:

```javascript
// 1_initial_migration.js
const Migrations = artifacts.require("Migrations");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};

// 2_deploy_contracts.js
const TokenContract = artifacts.require("TokenContract");
const VaultContract = artifacts.require("VaultContract");

module.exports = async function(deployer, network, accounts) {
  // Access to network and accounts array
  const initialSupply = web3.utils.toWei('1000000', 'ether');
  
  await deployer.deploy(TokenContract, initialSupply);
  await deployer.deploy(VaultContract, TokenContract.address);
};
```

## Handling Contract Dependencies

When contracts depend on each other, manage deployment order carefully:

```javascript
const Token = artifacts.require("Token");
const Vault = artifacts.require("Vault");
const Staking = artifacts.require("Staking");

module.exports = async function(deployer, network, accounts) {
  try {
    // Deploy Token first
    await deployer.deploy(Token);
    const tokenInstance = await Token.deployed();

    // Deploy Vault with Token address
    await deployer.deploy(Vault, tokenInstance.address);
    const vaultInstance = await Vault.deployed();

    // Deploy Staking with both addresses
    await deployer.deploy(Staking, tokenInstance.address, vaultInstance.address);

    // Optional: Setup additional configurations
    if (network !== 'mainnet') {
      const stakingInstance = await Staking.deployed();
      await tokenInstance.transfer(
        stakingInstance.address, 
        web3.utils.toWei('100000', 'ether')
      );
    }
  } catch (error) {
    console.error('Error in migration:', error);
    throw error;
  }
};
```

## Deployment Configuration

Configure deployment settings in `truffle-config.js`:

```javascript
require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 6721975
    },
    sepolia: {
      provider: () => new HDWalletProvider(
        process.env.MNEMONIC,
        `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
      ),
      network_id: 11155111,
      gas: 5500000,
      gasPrice: 20000000000,  // 20 gwei
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    mainnet: {
      provider: () => new HDWalletProvider(
        process.env.MAINNET_MNEMONIC,
        `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
      ),
      network_id: 1,
      gas: 5500000,
      gasPrice: 'auto',
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: false
    }
  },
  compilers: {
    solc: {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};
```

## Deployment Storage

Deployment information is stored in:

1. **Contract Artifacts**: `build/contracts/[ContractName].json`:
```json
{
  "networks": {
    "11155111": {
      "address": "0x1234...",
      "transactionHash": "0x5678...",
      "links": {},
      "events": {},
      "blockNumber": 3104236
    }
  }
}
```

2. **Environment Variables**: `.env` file:
```plaintext
MNEMONIC=your twelve word mnemonic phrase here
INFURA_PROJECT_ID=your_infura_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Running Migrations

Basic migration commands:

```bash
# Development network
truffle migrate

# Specific network
truffle migrate --network sepolia

# Reset migrations
truffle migrate --reset

# Run specific migration
truffle migrate -f 2 --to 3

# Verbose output
truffle migrate --verbose-rpc
```

## Contract Verification

After deployment, verify your contracts on Etherscan:

1. Install truffle-plugin-verify:
```bash
npm install -D truffle-plugin-verify
```

2. Add to truffle-config.js:
```javascript
plugins: ['truffle-plugin-verify'],
api_keys: {
  etherscan: process.env.ETHERSCAN_API_KEY
}
```

3. Verify:
```bash
truffle run verify ContractName --network sepolia
```

## Best Practices

### 1. Migration Structure
```javascript
module.exports = async function(deployer, network, accounts) {
  try {
    // Save deployed addresses
    const deployedAddresses = {};
    
    // Deploy and track
    await deployer.deploy(Contract);
    deployedAddresses.contract = Contract.address;
    
    // Log deployments
    console.log('Deployed addresses:', deployedAddresses);
    
    // Network-specific actions
    if (network === 'development') {
      // Development setup
    }
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};
```

### 2. Gas Management
- Use `gasPrice: 'auto'` for mainnet
- Set appropriate gas limits
- Consider using `eth-gas-reporter`

### 3. Security Considerations
- Use timelock mechanisms for mainnet deployments
- Implement pause functionality
- Test thoroughly on testnets
- Use multisig wallets for mainnet deployments

### 4. Error Handling
- Implement proper revert messages
- Use try-catch blocks
- Log deployment steps
- Implement deployment scripts idempotently

## Advanced Deployment Patterns

### 1. Proxy Patterns
```javascript
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

module.exports = async function(deployer) {
  const instance = await deployProxy(Box, [42], { deployer });
  console.log('Deployed', instance.address);
};
```

### 2. Factory Pattern
```javascript
const Factory = artifacts.require('Factory');
const Implementation = artifacts.require('Implementation');

module.exports = async function(deployer) {
  await deployer.deploy(Implementation);
  await deployer.deploy(Factory, Implementation.address);
};
```

By following these guidelines and best practices, you can effectively manage the deployment of your Ethereum smart contracts across different networks while maintaining security and efficiency.