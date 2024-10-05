

## Basic ENV setup

go to `wsl` and conda env 

```bash
conda activate tron_neuranft
```


get test tokens https://shasta.tronex.io/
generate address on tronlink


## Creating and Deploying Applications on the Tron Blockchain
To deploy a simple "Hello World" application on the Tron blockchain using TronBox, follow these steps:

### Prerequisites
1. **Node.js & npm**: Make sure you have Node.js installed as well as npm, which comes bundled with Node.js.
2. **TronBox**: Install TronBox globally using the following command:
    ```bash
    npm install -g tronbox
    ```
3. **TronLink Wallet**: Install the TronLink extension in your browser and set up a Tron account. You'll need TRX to deploy a contract (get some TRX from a faucet if you are using the testnet).

4. **Tron Quickstart or Shasta Testnet**: You need a network to deploy the smart contract on. You can use Tron Quickstart for a local environment or Shasta, which is the Tron public testnet.

### Step 1: Set Up a TronBox Project
1. Create a new directory for your project:
    ```bash
    mkdir HelloWorldTron && cd HelloWorldTron
    ```
2. Initialize a new TronBox project:
    ```bash
    tronbox init
    ```
3. This command will create the following structure:

    ```
    HelloWorldTron/
    ├── contracts/
    │   └── Migrations.sol
    ├── migrations/
    │   └── 1_initial_migration.js
    ├── tronbox-config.js
    └── package.json
    ```

### Step 2: Create the "Hello World" Smart Contract
1. Inside the `contracts` folder, create a new Solidity file called `HelloWorld.sol`:
    ```bash
    touch contracts/HelloWorld.sol
    ```

2. Add the following code to `HelloWorld.sol`:
    ```solidity
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.6;

    contract HelloWorld {
        string public message;

        constructor() public {
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

### Step 3: Create Migration Script
1. Create a new migration script to deploy the contract in the `migrations` folder:
    ```bash
    touch migrations/2_deploy_helloworld.js
    ```

2. Add the following deployment code to `2_deploy_helloworld.js`:
    ```javascript
    const HelloWorld = artifacts.require("HelloWorld");

    module.exports = function(deployer) {
        deployer.deploy(HelloWorld);
    };
    ```

### Step 4: Configure `tronbox-config.js`
1. Open `tronbox-config.js` and add network configurations for deployment. Add the following configuration for Shasta testnet and Tron Quickstart:

    ```javascript
    module.exports = {
        networks: {
            // Configuration for Shasta Testnet
            shasta: {
                privateKey: 'YOUR_PRIVATE_KEY_HERE', // Add your private key here (TronLink private key)
                userFeePercentage: 30,
                feeLimit: 1000000000,
                fullHost: "https://api.shasta.trongrid.io",
                network_id: "*"
            },
            // Configuration for Tron Quickstart (Local Development)
            development: {
                privateKey: 'YOUR_PRIVATE_KEY_HERE', // Add your private key here
                userFeePercentage: 30,
                feeLimit: 1000000000,
                fullHost: "http://127.0.0.1:9090",
                network_id: "*"
            }
        }
    };
    ```

> **Note**: Replace `'YOUR_PRIVATE_KEY_HERE'` with your TronLink wallet private key.

### Step 5: Compile the Smart Contract
1. Compile the `HelloWorld.sol` contract by running:
    ```bash
    tronbox compile
    ```
2. This command will generate the necessary ABI and bytecode.
3. All the abis and bytecodes will be stored in the `build` folder under the contract name.
4. when you migrate the contract, the contract will be deployed to the network and the address will be stored in the `build` folder `json` file as well. It is under `networks -> network id -> address`.

### Step 6: Deploy the Smart Contract
1. To deploy the contract, use the following command:
    ```bash
    
    tronbox migrate --network shasta

    # if using .env to store private key
    source .env && tronbox migrate --network shasta
    ```
   Or if you want to deploy it locally using Tron Quickstart:
    ```bash
    tronbox migrate --network development
    ```

2. After deployment, you will see an address where the contract has been deployed.

### Step 7: Interact with the Smart Contract

To interact with the smart contract, you can use the TronBox console or TronWeb. Here's how to do it using the TronBox console:

**Note**:
> when pasting the code in the console, make sure to paste as `one line`  in vscode terminal
> or you can use the `.editor` command in the console to paste multiline code and `ctrl + d` to run the code

1. **TronBox Console**: Use the TronBox console to interact with the contract.

    ```bash
    tronbox console --network shasta
    ```

2. **Get the Contract Instance**:
    ```javascript
    HelloWorld.deployed().then(instance => {
      // Store the instance in a variable for further use
      global.contractInstance = instance;
      console.log("Contract instance obtained and stored in global.contractInstance");
    }).catch(error => {
      console.error("Error getting contract instance:", error);
    });
    ```

3. **Call the `getMessage` function**:
    ```javascript
    global.contractInstance.getMessage().then(message => {
      console.log("Current message:", message);
    }).catch(error => {
      console.error("Error getting message:", error);
    });
    ```

4. **Call the `setMessage` function**:
    ```javascript
    global.contractInstance.setMessage("Hello Tron").then(() => {
      console.log("Message set to 'Hello Tron'");
      // Get the new message
      return global.contractInstance.getMessage();
    }).then(newMessage => {
      console.log("New message:", newMessage);
    }).catch(error => {
      console.error("Error setting or getting message:", error);
    });
    ```

Note: The `global.contractInstance` is used to store the contract instance across multiple commands in the console. This allows you to interact with the contract without having to redeploy it for each command.

If you want to chain these operations together, you can do so like this:

```javascript
HelloWorld.deployed().then(instance => {
  return instance.getMessage();
}).then(message => {
  console.log("Initial message:", message);
  return HelloWorld.deployed();
}).then(instance => {
  return instance.setMessage("Hello Tron");
}).then(() => {
  return HelloWorld.deployed();
}).then(instance => {
  return instance.getMessage();
}).then(newMessage => {
  console.log("New message:", newMessage);
}).catch(error => {
  console.error("An error occurred:", error);
});
```

This chain of operations will:
1. Get the deployed contract
2. Call `getMessage` and log the initial message
3. Set a new message to "Hello Tron"
4. Call `getMessage` again and log the new message

Remember to replace `HelloWorld` with your actual contract name if it's different. Also, make sure your contract is deployed to the network you're connecting to before trying to interact with it.

### Step 8: Testing the Smart Contract
To write automated tests for the smart contract, you can use Mocha and Chai (which are already included in the TronBox setup).

1. Create a test file inside the `test` folder:
    ```bash
    mkdir test && touch test/helloworld.js
    ```

2. Add the following test code to `test/helloworld.js`:

    ```javascript
    const HelloWorld = artifacts.require("HelloWorld");

    contract("HelloWorld", accounts => {
        it("should deploy the contract and return 'Hello World'", async () => {
            let instance = await HelloWorld.deployed();
            let message = await instance.getMessage();
            assert.equal(message, "Hello World", "The initial message should be 'Hello World'");
        });

        it("should set a new message", async () => {
            let instance = await HelloWorld.deployed();
            await instance.setMessage("Hello Tron");
            let newMessage = await instance.getMessage();
            assert.equal(newMessage, "Hello Tron", "The new message should be 'Hello Tron'");
        });
    });
    ```

3. Run the tests using:
    ```bash
    tronbox test --network shasta
    ```

### Summary
- **Smart Contract**: Created a simple smart contract with functions to set and get a message.
- **Compile**: Used `tronbox compile` to generate the ABI and bytecode.
- **Deploy**: Deployed using `tronbox migrate`.
- **Interact**: Used `tronbox console` or JavaScript to interact with the contract.
- **Test**: Wrote and executed tests using Mocha and Chai.

This is a basic example of deploying a "Hello World" application on the Tron blockchain using TronBox. It helps you understand the fundamental workflow of developing, deploying, and testing smart contracts on Tron.