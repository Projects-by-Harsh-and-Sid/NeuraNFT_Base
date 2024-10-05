# Tron Blockchain Overview and Setup

## What is Tron?

Tron is a decentralized, open-source blockchain platform that aims to create a global entertainment system for the cost-effective sharing of digital content. It uses a Delegated Proof of Stake (DPoS) consensus mechanism and supports smart contracts.

## Setting Up Your Development Environment

### 1. Install Anaconda

Anaconda is a distribution of Python and R programming languages for scientific computing that aims to simplify package management and deployment.

1. Download Anaconda from [https://www.anaconda.com/products/distribution](https://www.anaconda.com/products/distribution)
2. Follow the installation instructions for your operating system.

### 2. Create a Tron Development Environment

Open your terminal or Anaconda prompt and run:

```bash
conda create -n tron_dev python=3.8
conda activate tron_dev
```

### 3. Install Required Packages

With your `tron_dev` environment activated, install the following packages:

```bash
pip install tronapi tronbox
npm install -g tronbox
npm install -g tronweb
```

### 4. Install Additional Tools

- **Node.js and npm**: Download and install from [nodejs.org](https://nodejs.org/)
- **TronLink**: Browser extension for interacting with Tron dApps. [Download here](https://www.tronlink.org/)

### 5. Set Up TronBox

TronBox is a development framework for Tron, similar to Truffle for Ethereum.

1. Install TronBox globally:
   ```bash
   npm install -g tronbox
   ```
2. Create a new TronBox project:
   ```bash
   mkdir my_tron_project
   cd my_tron_project
   tronbox init
   ```

### 6. Configure TronBox

Edit the `tronbox.js` file in your project root to include network configurations:

```javascript
module.exports = {
  networks: {
    development: {
      privateKey: 'your_private_key_here',
      userFeePercentage: 30,
      feeLimit: 1000000000,
      fullHost: 'http://127.0.0.1:9090',
      network_id: '*'
    },
    shasta: {
      privateKey: 'your_private_key_here',
      userFeePercentage: 50,
      feeLimit: 1000000000,
      fullHost: 'https://api.shasta.trongrid.io',
      network_id: '2'
    }
  }
};
```

Replace `'your_private_key_here'` with your actual private key from TronLink.

### 7. Using .env file

you can store your private key in a `.env` file and use it in the `tronbox.js` file.

```bash
touch .env
```

Add your private key to the `.env` file:

```bash
export SHASTA_PRIVATE_KEY=your_private_key_here
```

Then modify the `tronbox.js` file to use the private key from the `.env` file:

```javascript
require('dotenv').config();

module.exports = {
  networks: {
    shasta: {
      privateKey: process.env.SHASTA_PRIVATE_KEY,
      userFeePercentage: 50,
      feeLimit: 1000000000,
      fullHost: 'https://api.shasta.trongrid.io',
      network_id: '2'
    }
  }
};
```

to use the private key from the `.env` file, run the following command:

```bash
source .env && tronbox migrate --network shasta
```

the `source .env` command will load the environment variables from the `.env` file before running the `tronbox migrate --network shasta` command.


### 8. Get Testnet TRX

To deploy contracts and interact with the Shasta testnet, you'll need some test TRX:

1. Create a wallet using TronLink
2. Visit the [Shasta Testnet Faucet](https://www.trongrid.io/shasta/)
3. Enter your wallet address and request test TRX

You're now ready to start developing on the Tron blockchain!