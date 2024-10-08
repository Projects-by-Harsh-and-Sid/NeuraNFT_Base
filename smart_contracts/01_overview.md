Base resource https://developers.tron.network/docs/getting-start

Chrome Extension https://www.tronlink.org/

Get test token https://nileex.io/join/getJoinPage

tron documentation https://developers.tron.network/ 

youtube : https://www.youtube.com/watch?v=1z5M12tcSdQ&list=PLL5pYVd8AWtRDnTTKWzPpFcBT9nrPCQt6


# Tron Blockchain Development Guide

Welcome to the comprehensive guide for developing on the Tron blockchain. This series of README files will walk you through the entire process of setting up your environment, writing smart contracts, deploying them, and interacting with them using various tools.

## Table of Contents

1. [Overview and Setup](#tron-blockchain-overview-and-setup)
2. [Compiling Smart Contracts](02_compiling_smart_contracts.md)
3. [Migration and Deployment](03_migration.md)
4. [Testing on CLI](04_testing_on_cli.md)
5. [Code Testing](05_code_testing.md)
6. [Using Build Data in React Web App](06_build_data_use_in_react_webapp.md)
7. [Using Build Data in Python Code](07_build_data_use_in_python_code.md)

## Additional Resources

### Tron Documentation

- [Tron Developer Hub](https://developers.tron.network/)
- [TronBox Documentation](https://developers.tron.network/docs/tron-box-user-guide)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [TronWeb Documentation](https://developers.tron.network/docs/tron-web-intro)
- [Tronbox CLI Reference](https://developers.tron.network/reference/interact-with-a-contract)


### Tron Private Node Setup

- [Tron-docker-private-node-doc](https://developers.tron.network/docs/tron-private-chain)
- [Tron-docker-private-blog](https://dev.to/axatbhardwaj/tron-private-network-setup-complete-guide-2022-2pa2)
- [Java Tron Git](https://github.com/tronprotocol/java-tron)
- [Java Tron Version](https://github.com/tronprotocol/java-tron/releases/)
- [Java Tron Doceker](https://hub.docker.com/r/tronprotocol/java-tron/tags)
- [Mainnet Configuration](https://raw.githubusercontent.com/tronprotocol/tron-deployment/master/main_net_config.conf)


### Tron Docker Quickstart (Deprecated)

- [Tron-docker-quick-start-github](https://github.com/tronprotocol/docker-tron-quickstart)
- [Tron-docker-quik-start-doc](https://developers.tron.network/v3.7/docs/quickstart)
- [Tron-docker-quik-start-version](https://hub.docker.com/r/trontools/quickstart/tags)


### Tron Testnets

- [shasta testnet](https://api.shasta.trongrid.io/) -> https://api.shasta.trongrid.io/
- [nile testnet](https://api.nileex.io/) -> https://api.nileex.io/
- [Faucet Information](https://www.reddit.com/r/Tronix/comments/1fa9jtf/tron_shasta_faucet/)
- [Tron Scan](https://tronscan.org/#/)


### Tron Versions
[Tron Box](https://github.com/tronprotocol/tronbox/releases)



# Tron Blockchain Overview and Setup

<!-- Tron Overview Index -->

- [Tron Overview](#tron-overview)
- [Setting Up Your Development Environment](#setting-up-your-development-environment)
- [Tron Local Node Setup/ Quickstart](#tron-local-node-setup-quickstart)
- [Tron Docker Quickstart](#tron-docker-quickstart)


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


#### For Versioned TronBox

```bash
npm install -g tronbox@2.1.9
```

get current version of tronbox

```bash
tronbox --version
```

List of all version

`https://github.com/tronprotocol/tronbox/releases`

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


# Tron Local Node Setup/ Quickstart

## Docker Quickstart

1. Pull the Tron Docker image:

```bash
docker pull trontools/quickstart
```

for version 2.0.0:

```bash
docker pull trontools/quickstart:2.0.0
```

2. Run the container:

```bash
docker run -it -p 9090:9090 --rm --name tron trontools/quickstart
```

Optionally, you can specify the number of accounts and the default balance:

```bash
docker run -it -p 9090:9090 --rm --name tron -e "accounts=1" -e "defaultBalance=10000000000000" trontools/quickstart
```


## Quickstart options:
Use `-e` flag to pass environmental variables to the docker.
Example:
```bash
docker run -it \
  -p 9090:9090 \
  --rm \
  --name tron \
  -e "accounts=20" \
  trontools/quickstart
```

__List of options:__
* `accounts=12` sets the number of generated accounts
* `useDefaultPrivateKey=true` tells Quickstart to use the default account as `accounts[0]`
* `mnemonic=wrong bit chicken kitchen rat` uses a specified mnemonic
* `defaultBalance=100000` sets the initial balance for the generated accounts (in the example to 100,000 TRX)
* `seed=ushwe63hgeWUS` sets the seed to be used to generate the mnemonic (if none is passed)
* `hdPath=m/44'/60'/0'/0` sets a custom bit39 hdPath
* `formatJson=true` formats the output
* `preapprove=...` pre approved proposals (see below for more help)


### Getting the sample accounts generated by the quickstart

```bash
docker run -it \
  -p 9090:9090 \
  --rm \
  --name tron \
  -e "accounts=20" \
  -e "formatJson=true" \
  -e "defaultBalance=10000000000000" \
  -e "seed=ushwe63hgeXUS" \
  trontools/quickstart
  ```

### Version 2.0.0

```bash
docker run -it \
  -p 9090:9090 \
  --rm \
  --name tron \
  -e "accounts=20" \
  -e "formatJson=true" \
  -e "defaultBalance=10000000000000" \
  -e "seed=ushwe63hgeXUS" \
  trontools/quickstart:2.0.0
  ```


  `https://github.com/TRON-US/docker-tron-quickstart/tree/master`

#### Available accounts

At any moment, to see the generated accounts, run
```
curl http://127.0.0.1:9090/admin/accounts
```

If you prefer to see the addresses in hex format you can run
```
curl http://127.0.0.1:9090/admin/accounts?format=hex
```
And if you like to see both formats, you can run
```
curl http://127.0.0.1:9090/admin/accounts?format=all
```

get node info:
```
http://127.0.0.1:9090/wallet/getnodeinfo
```