# Migration and Deployment on Tron

This guide provides detailed information on the migration and deployment process for Tron smart contracts, including the role of `Migrations.sol` and handling dependencies between contracts.

## Understanding Migrations

Migrations are JavaScript files that help you deploy contracts to the blockchain. They allow you to:

1. Deploy contracts in a specific order
2. Pass parameters to constructors during deployment
3. Save deployment addresses for later use
4. Handle contract dependencies

## The Role of Migrations.sol

`Migrations.sol` is a special contract that keeps track of which migrations have been applied to the blockchain. It works as follows:

1. It's usually the first contract deployed to the blockchain.
2. It stores the number of the last applied migration.
3. When you run `tronbox migrate`, it checks this number and only runs newer migrations.

Here's a simplified version of `Migrations.sol`:

```solidity
pragma solidity >=0.4.22 <0.9.0;

contract Migrations {
  address public owner;
  uint public last_completed_migration;

  constructor() public {
    owner = msg.sender;
  }

  modifier restricted() {
    require(msg.sender == owner, "This function is restricted to the contract's owner");
    _;
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

Migration files are numbered JavaScript files in the `migrations/` directory. For example:

- `1_initial_migration.js`
- `2_deploy_contract_a.js`
- `3_deploy_contract_b.js`

A typical migration file looks like this:

```javascript
const ContractA = artifacts.require("ContractA");
const ContractB = artifacts.require("ContractB");

module.exports = function(deployer) {
  deployer.deploy(ContractA).then(function() {
    return deployer.deploy(ContractB, ContractA.address);
  });
};
```

## Deployment Order and Dependencies

When contracts depend on each other, you need to deploy them in the correct order. Here's how to handle this:

1. Deploy independent contracts first.
2. For contracts that depend on others, deploy them after their dependencies and pass the necessary addresses.

Example: If ContractB needs ContractA's address in its constructor:

```javascript
const ContractA = artifacts.require("ContractA");
const ContractB = artifacts.require("ContractB");

module.exports = async function(deployer) {
  // Deploy ContractA
  await deployer.deploy(ContractA);
  
  // Get the deployed ContractA instance
  const contractAInstance = await ContractA.deployed();
  
  // Deploy ContractB, passing ContractA's address
  await deployer.deploy(ContractB, contractAInstance.address);
};
```

## Where Deployed Addresses are Stored

After deployment, the contract addresses are stored in two places:

1. **In-memory**: During the migration process, TronBox keeps the deployed addresses in memory.

2. **On-disk**: The addresses are saved to the contract's JSON file in the `build/contracts/` directory. For example, in `build/contracts/ContractA.json`:

   ```json
   {
     "networks": {
       "2": {
         "address": "TRxvxzrhQkjPyJgHsNpg5e5qveY7AvdGTZ",
         "transactionHash": "0x123..."
       }
     }
   }
   ```

   Here, `"2"` is the network ID (Shasta testnet in this case).

## Running Migrations

To run your migrations and deploy your contracts:

```bash
tronbox migrate --network shasta
```

to use the private key from the `.env` file, run the following command:

```bash
source .env && tronbox migrate --network shasta

OR

source .env

tronbox migrate --network shasta

```

the `source .env` command will load the environment variables from the `.env` file before running the `tronbox migrate --network shasta` command.



This command:

1. Checks which migrations have been run
2. Runs any new migrations
3. Updates the `Migrations.sol` contract on the blockchain
4. Saves the new contract addresses

## Best Practices

1. **Incremental Migrations**: Always add new migrations instead of modifying existing ones.
2. **Network Awareness**: Use `deployer.network` to deploy contracts differently based on the network.
3. **Gas Management**: Set appropriate `feeLimit` in your `tronbox.js` configuration.
4. **Error Handling**: Use try-catch blocks in your migration scripts to handle deployment errors gracefully.

By understanding these concepts, you can effectively manage the deployment of your Tron smart contracts, ensuring they are deployed in the correct order with all necessary dependencies.