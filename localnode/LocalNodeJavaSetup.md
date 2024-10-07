To set up a Tron local node for development purposes, follow these steps:

## Prerequisites

Before starting, ensure you have the following installed:
- Java Development Kit (JDK) 8 or later
- Git

## Setting Up the Tron Private Network

1. Create a directory for your Tron node:

```bash
mkdir ~/tron-node
cd ~/tron-node
```

2. Download the FullNode.jar file:

You can either compile the source code or download a pre-built release from the official Tron GitHub repository[2].

`https://github.com/tronprotocol/java-tron/releases/`


```bash

wget https://github.com/tronprotocol/java-tron/releases/download/<version>/java-tron-<version>.tar.gz


wget https://github.com/tronprotocol/java-tron/releases/download/<version>/java-tron-<version>.tar.gz


```


3. Download the configuration file:

```bash
wget https://raw.githubusercontent.com/tronprotocol/TronDeployment/master/private_net_config.conf
```

4. Edit the configuration file:

Open `private_net_config.conf` in a text editor and make the following changes:
- Replace the existing entry in `genesis.block.witnesses` with your address
- Replace the existing entry in `seed.node ip.list` with your IP list
- Set `needSyncCheck` to `false` for the first Super Node start
- Set `p2pversion` to 61[2]

## Starting the Node

5. Run the FullNode:

```bash
java -jar FullNode.jar -c private_net_config.conf
```

This command starts your local Tron node using the configuration file you just edited[2].

## Additional Configuration (Optional)

6. If you want to set up a SolidityNode on the same host:

```bash
wget https://raw.githubusercontent.com/tronprotocol/TronDeployment/master/deploy_tron.sh -O deploy_tron.sh
bash deploy_tron.sh --app SolidityNode --trust-node 127.0.0.1:50051
```

Replace `127.0.0.1:50051` with the appropriate IP and port of your FullNode[2].

## Interacting with Your Local Node

7. To interact with your local node, you can use the `wallet-cli` tool:

```bash
java -jar wallet-cli.jar
```

This will open an interactive command-line interface where you can execute commands to interact with your local Tron node[4].

## Important Notes

- Ensure that your firewall allows incoming UDP traffic on port 18888 for the FullNode[2].
- For development purposes, it's recommended to use a private network configuration to avoid conflicts with the main network.
- Remember to regularly update your node software to stay compatible with the latest protocol changes.

By following these steps, you should have a local Tron node running for development purposes. This setup allows you to test smart contracts, develop dApps, and experiment with the Tron blockchain in a controlled environment without interacting with the main network.

Citations:
[1] https://dev.to/axatbhardwaj/tron-private-network-setup-complete-guide-2022-2pa2
[2] https://tronprotocol.github.io/documentation-en/developers/deployment/
[3] https://nownodes.io/blog/how-to-run-a-tron-full-node-easy-way/
[4] https://tronprotocol.github.io/documentation-en/getting_started/getting_started_with_javatron/
[5] https://docs.ton.org/participate/run-nodes/nodes-troubleshooting
[6] https://trondao.org/developers/resources/get-started/