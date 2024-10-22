# Creating and Deploying Applications on the Ethereum Blockchain

This guide walks through creating and deploying a "Hello World" smart contract on Ethereum using Truffle.

## Prerequisites

1. **Node.js & npm**: Install from [nodejs.org](https://nodejs.org/)
2. **Truffle**: Install globally:
   ```bash
   npm install -g truffle
   ```
3. **MetaMask**: Install the MetaMask browser extension and create an Ethereum wallet
4. **Ganache**: Install for local blockchain development:
   ```bash
   npm install -g ganache
   ```

## Environment Setup

### 1. Create Development Environment
```bash
# Using conda (optional)
conda create -n eth_dev python=3.8
conda activate eth_dev

# Install additional tools
npm install -g eth-gas-reporter
npm install -g solidity-coverage
```

### 2. Get Test ETH
- For Sepolia: Use [Sepolia Faucet](https://sepoliafaucet.com/)
- For Goerli: Use [Goerli Faucet](https://goerlifaucet.com/)

## Project Creation and Setup

### 1. Initialize Project
```bash
mkdir HelloWorldEth && cd HelloWorldEth
truffle init
```

This creates:
```
HelloWorldEth/
├── contracts/
│   └── Migrations.sol
├── migrations/
│   └── 1_initial_migration.js
├── test/
├── truffle-config.js
└── package.json
```

### 2. Create Smart Contract
```solidity
// contracts/HelloWorld.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract HelloWorld {
    string public message;

    constructor() {
        message = "Hello World";
    }

    function setMessage(string memory newMessage) public {
        message = newMessage;
    }

    function getMessage() public view returns (string memory) {
        return message;
    }
}
```

### 3. Create Migration Script
```javascript
// migrations/2_deploy_helloworld.js
const HelloWorld = artifacts.require("HelloWorld");

module.exports = function(deployer) {
    deployer.deploy(HelloWorld);
};
```

### 4. Configure Truffle
```javascript
// truffle-config.js
require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    sepolia: {
      provider: () => new HDWalletProvider(
        process.env.MNEMONIC,
        `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
      ),
      network_id: 11155111,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
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
  },
  plugins: ["solidity-coverage"]
};
```

### 5. Set Up Environment Variables
```bash
# .env
MNEMONIC=your twelve word mnemonic phrase here
INFURA_PROJECT_ID=your_infura_project_id
```

## Compilation and Deployment

### 1. Compile Contract
```bash
truffle compile
```

This generates:
- ABI and bytecode in `build/contracts/HelloWorld.json`
- Contract artifacts for deployment

### 2. Deploy Contract
```bash
# Local development
truffle migrate

# Sepolia testnet
truffle migrate --network sepolia
```

## Contract Interaction

### 1. Using Truffle Console
```bash
# Connect to local network
truffle console

# Connect to Sepolia
truffle console --network sepolia
```

### 2. Basic Interactions
```javascript
// Get contract instance
let instance = await HelloWorld.deployed()

// Get message
let message = await instance.getMessage()
console.log("Current message:", message)

// Set new message
await instance.setMessage("Hello Ethereum")
message = await instance.getMessage()
console.log("New message:", message)
```

### 3. Advanced Interaction Pattern
```javascript
// Promise chain pattern
HelloWorld.deployed()
  .then(instance => {
    return instance.getMessage();
  })
  .then(message => {
    console.log("Initial message:", message);
    return HelloWorld.deployed();
  })
  .then(instance => {
    return instance.setMessage("Hello Ethereum");
  })
  .then(() => {
    return HelloWorld.deployed();
  })
  .then(instance => {
    return instance.getMessage();
  })
  .then(newMessage => {
    console.log("New message:", newMessage);
  })
  .catch(error => {
    console.error("Error:", error);
  });
```

## Testing

### 1. Create Test File
```javascript
// test/HelloWorld.test.js
const HelloWorld = artifacts.require("HelloWorld");

contract("HelloWorld", accounts => {
  const [owner, user1] = accounts;
  let instance;

  beforeEach(async () => {
    instance = await HelloWorld.new();
  });

  describe("Initialization", () => {
    it("should initialize with 'Hello World'", async () => {
      const message = await instance.getMessage();
      assert.equal(message, "Hello World", "Wrong initial message");
    });
  });

  describe("Message operations", () => {
    it("should set new message", async () => {
      await instance.setMessage("Hello Ethereum");
      const message = await instance.getMessage();
      assert.equal(message, "Hello Ethereum", "Message not updated");
    });

    it("should emit event on message change", async () => {
      const result = await instance.setMessage("Hello Ethereum");
      assert.equal(result.logs.length, 1, "Should emit one event");
    });
  });
});
```

### 2. Run Tests
```bash
# Run all tests
truffle test

# Run specific test file
truffle test ./test/HelloWorld.test.js

# Run with gas reporting
truffle test --reporter eth-gas-reporter
```

## Best Practices

1. **Gas Optimization**:
   - Use string length validation
   - Consider using bytes32 for fixed-length strings
   - Implement access control for state-changing functions

2. **Security**:
   - Use SafeMath for arithmetic (though not needed for Solidity ≥0.8.0)
   - Implement access control patterns
   - Add events for state changes

3. **Testing**:
   - Test all function paths
   - Test access control
   - Test edge cases
   - Use gas reporter to optimize

4. **Development Flow**:
   - Always test locally first
   - Use testnet before mainnet
   - Verify contracts on Etherscan
   - Document contract interactions

## Extended Contract Version
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract HelloWorld {
    string public message;
    address public owner;
    
    event MessageChanged(string newMessage, address changer);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        message = "Hello World";
        owner = msg.sender;
    }
    
    function setMessage(string memory newMessage) public {
        require(bytes(newMessage).length > 0, "Empty message");
        message = newMessage;
        emit MessageChanged(newMessage, msg.sender);
    }
    
    function getMessage() public view returns (string memory) {
        return message;
    }
}
```

By following this guide, you'll have a basic understanding of developing, deploying, and testing smart contracts on Ethereum using Truffle.