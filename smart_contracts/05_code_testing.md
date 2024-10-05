# Code Testing for Tron Smart Contracts

This guide provides detailed information on how to write and run test scripts for your Tron smart contracts using TronBox and Mocha.

## Setting Up the Test Environment

TronBox uses Mocha as its testing framework. Here's how to set up your testing environment:

1. Create a `test` directory in your project root if it doesn't exist already.
2. Create test files with a `.js` extension in the `test` directory.

## Writing Test Scripts

Here's a basic structure for a test file:

```javascript
const YourContract = artifacts.require("YourContract");

contract("YourContract", accounts => {
  let instance;

  before(async () => {
    instance = await YourContract.deployed();
  });

  it("should do something", async () => {
    // Your test code here
  });
});
```

## Test Structure

- `contract()`: This function is provided by TronBox. It's similar to Mocha's `describe()`, but it provides a clean room for each contract.
- `before()`: This hook runs before all tests in the block.
- `it()`: This is where you write individual test cases.

## Writing Assertions

TronBox integrates Chai for assertions. Here are some examples:

```javascript
const assert = require("chai").assert;

it("should initialize with correct value", async () => {
  let value = await instance.getValue();
  assert.equal(value, 0, "Initial value should be 0");
});

it("should set the value correctly", async () => {
  await instance.setValue(42);
  let value = await instance.getValue();
  assert.equal(value, 42, "Value should be 42 after setValue");
});
```

## Testing Events

To test events emitted by your contract:

```javascript
it("should emit ValueChanged event", async () => {
  let result = await instance.setValue(100);
  assert.equal(result.logs.length, 1, "should have emitted one event");
  assert.equal(result.logs[0].event, "ValueChanged", "should be the ValueChanged event");
  assert.equal(result.logs[0].args.newValue.toNumber(), 100, "should log the new value");
});
```

## Testing Reverts

To test functions that should revert under certain conditions:

```javascript
const truffleAssert = require('truffle-assertions');

it("should revert when unauthorized", async () => {
  await truffleAssert.reverts(
    instance.restrictedFunction({ from: accounts[1] }),
    "Only owner can call this function"
  );
});
```

## Running Tests

To run your tests:

```bash
tronbox test
```

To run a specific test file:

```bash
tronbox test ./test/your_test_file.js
```

## Best Practices

1. **Isolation**: Each test should be independent. Use `beforeEach()` to reset the contract state if necessary.

2. **Coverage**: Aim to test all functions and edge cases in your contract.

3. **Gas Usage**: Test the gas usage of your functions:

   ```javascript
   it("should use less than 100000 gas", async () => {
     let tx = await instance.yourFunction();
     assert.isBelow(tx.receipt.energy_usage, 100000);
   });
   ```

4. **Meaningful Descriptions**: Use clear, meaningful descriptions for your test cases.

5. **Mock External Calls**: If your contract interacts with other contracts, consider mocking these interactions in your tests.

## Advanced Testing Techniques

### Time Manipulation

TronBox allows you to manipulate the blockchain time in your tests:

```javascript
const { time } = require("@openzeppelin/test-helpers");

it("should allow withdrawal after time passes", async () => {
  await instance.deposit({ value: web3.utils.toWei("1", "ether") });
  await time.increase(time.duration.days(1));
  await instance.withdraw();
  // Assert the withdrawal was successful
});
```

### Testing with Different Accounts

Use the `accounts` array provided by TronBox to test your contract with different addresses:

```javascript
it("should allow only owner to withdraw", async () => {
  await truffleAssert.passes(
    instance.withdraw({ from: accounts[0] }) // assumes accounts[0] is the owner
  );
  await truffleAssert.reverts(
    instance.withdraw({ from: accounts[1] })
  );
});
```

### Snapshot and Revert

For complex tests, you can use snapshot and revert to reset the state:

```javascript
const { takeSnapshot, revertToSnapshot } = require("@openzeppelin/test-helpers/src/snapshot");

let snapshotId;

beforeEach(async () => {
  snapshotId = await takeSnapshot();
});

afterEach(async () => {
  await revertToSnapshot(snapshotId);
});
```

By following these guidelines and using TronBox's testing capabilities effectively, you can ensure your Tron smart contracts are thoroughly tested and behave as expected under various conditions.