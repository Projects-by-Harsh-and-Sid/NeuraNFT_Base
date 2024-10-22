# Code Testing for Ethereum Smart Contracts

This guide provides detailed information on how to write and run test scripts for your Ethereum smart contracts using Truffle and Mocha.

## Setting Up the Test Environment

### 1. Basic Setup
```bash
# Install dependencies
npm install --save-dev chai
npm install --save-dev @openzeppelin/test-helpers
npm install --save-dev eth-gas-reporter
npm install --save-dev solidity-coverage
```

### 2. Configure Truffle
```javascript
// truffle-config.js
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    }
  },
  mocha: {
    timeout: 100000,
    reporter: 'eth-gas-reporter',
    reporterOptions: {
      currency: 'USD',
      gasPrice: 21
    }
  },
  plugins: ["solidity-coverage"]
};
```

## Writing Test Scripts

### Basic Test Structure
```javascript
const YourContract = artifacts.require("YourContract");
const { expect } = require('chai');
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

contract("YourContract", function(accounts) {
  const [owner, user1, user2] = accounts;
  let instance;

  beforeEach(async function() {
    instance = await YourContract.new();
  });

  describe("initialization", function() {
    it("should set the correct owner", async function() {
      expect(await instance.owner()).to.equal(owner);
    });
  });
});
```

### Testing Different Aspects

#### 1. Testing State Variables
```javascript
it("should initialize with correct values", async function() {
  const value = await instance.someValue();
  expect(value).to.be.bignumber.equal(new BN('0'));
});
```

#### 2. Testing Transactions
```javascript
it("should update state correctly", async function() {
  const newValue = new BN('42');
  const tx = await instance.setValue(newValue, { from: owner });
  
  // Check new state
  const value = await instance.someValue();
  expect(value).to.be.bignumber.equal(newValue);
  
  // Check gas usage
  expect(tx.receipt.gasUsed).to.be.below(100000);
});
```

#### 3. Testing Events
```javascript
it("should emit ValueSet event", async function() {
  const newValue = new BN('42');
  const receipt = await instance.setValue(newValue, { from: owner });
  
  expectEvent(receipt, 'ValueSet', {
    value: newValue,
    setter: owner
  });
});
```

#### 4. Testing Reverts
```javascript
it("should revert when unauthorized", async function() {
  await expectRevert(
    instance.restrictedFunction({ from: user1 }),
    "Ownable: caller is not the owner"
  );
});
```

#### 5. Testing ETH Transfers
```javascript
it("should handle ETH correctly", async function() {
  const amount = web3.utils.toWei('1', 'ether');
  
  // Send ETH
  await instance.deposit({ from: user1, value: amount });
  
  // Check balance
  const balance = await web3.eth.getBalance(instance.address);
  expect(balance).to.be.bignumber.equal(new BN(amount));
  
  // Check withdrawal
  await instance.withdraw(amount, { from: owner });
  const newBalance = await web3.eth.getBalance(instance.address);
  expect(newBalance).to.be.bignumber.equal(new BN('0'));
});
```

## Advanced Testing Techniques

### 1. Time Manipulation
```javascript
const { time } = require('@openzeppelin/test-helpers');

it("should respect time locks", async function() {
  // Set up time-dependent state
  await instance.lock({ from: user1, value: web3.utils.toWei('1', 'ether') });
  
  // Advance time
  await time.increase(time.duration.days(1));
  
  // Check after time passed
  const canWithdraw = await instance.canWithdraw(user1);
  expect(canWithdraw).to.be.true;
});
```

### 2. Snapshot Testing
```javascript
const { snapshot, revert } = require('./helpers/snapshot');

describe("with snapshots", function() {
  let snapshotId;

  beforeEach(async function() {
    snapshotId = await snapshot();
  });

  afterEach(async function() {
    await revert(snapshotId);
  });

  it("should revert to initial state", async function() {
    // Test that modifies state
    await instance.setValue(42);
    // State will be reverted after test
  });
});
```

### 3. Gas Usage Testing
```javascript
const { balance, BN } = require('@openzeppelin/test-helpers');

it("should optimize gas usage", async function() {
  const tracker = await balance.tracker(user1);
  
  // Perform transaction
  const tx = await instance.complexFunction({ from: user1 });
  
  // Check gas usage
  const cost = await tracker.delta();
  expect(cost.abs()).to.be.bignumber.below(new BN(web3.utils.toWei('0.01', 'ether')));
});
```

### 4. Testing Complex Scenarios
```javascript
describe("complex interactions", function() {
  it("should handle multiple users correctly", async function() {
    // Setup initial state
    await instance.register({ from: user1 });
    await instance.register({ from: user2 });
    
    // User 1 performs action
    await instance.stake(web3.utils.toWei('1', 'ether'), { from: user1 });
    
    // User 2 performs action
    await instance.stake(web3.utils.toWei('2', 'ether'), { from: user2 });
    
    // Check final state
    const totalStaked = await instance.totalStaked();
    expect(totalStaked).to.be.bignumber.equal(
      new BN(web3.utils.toWei('3', 'ether'))
    );
  });
});
```

## Best Practices

### 1. Test Organization
```javascript
contract("YourContract", function() {
  describe("Core functionality", function() {
    // Basic functions tests
  });

  describe("Access control", function() {
    // Permission tests
  });

  describe("Edge cases", function() {
    // Boundary conditions
  });

  describe("Integration", function() {
    // Multi-step operations
  });
});
```

### 2. Error Handling
```javascript
it("should handle errors gracefully", async function() {
  try {
    await instance.riskyFunction();
    expect.fail("Should have thrown error");
  } catch (error) {
    expect(error.message).to.include("specific error message");
  }
});
```

### 3. Testing Modifiers
```javascript
describe("modifiers", function() {
  it("should enforce onlyOwner", async function() {
    await expectRevert(
      instance.ownerFunction({ from: user1 }),
      "Ownable: caller is not the owner"
    );
  });
});
```

### 4. Testing State Transitions
```javascript
it("should transition states correctly", async function() {
  expect(await instance.currentState()).to.be.bignumber.equal(new BN('0'));
  
  await instance.nextState();
  expect(await instance.currentState()).to.be.bignumber.equal(new BN('1'));
  
  await instance.nextState();
  expect(await instance.currentState()).to.be.bignumber.equal(new BN('2'));
});
```

By following these testing patterns and best practices, you can ensure your Ethereum smart contracts are thoroughly tested and behave as expected under various conditions.