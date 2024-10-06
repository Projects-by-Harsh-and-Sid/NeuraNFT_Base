# Tron Node Deployment with Docker

This README guides you through the process of deploying a local Tron node using Docker, setting up a custom public key with a specified amount of TRX at genesis, and accessing the network and its dashboard.

## Prerequisites

- Docker installed on your system
- Basic knowledge of command-line operations

## Deploying the Tron Node

1. Pull the Tron Quickstart Docker image:

```bash
docker pull trontools/quickstart
```

2. Run the container with custom configuration:

```bash
docker run -it \
-p 9090:9090 \
--rm \
--name tron \
-e "accounts=1" \
-e "defaultBalance=10000000000000" \
-e "useDefaultPrivateKey=true" \
trontools/quickstart
```

This command:
- Maps port 9090 from the container to your host
- Sets up 1 account
- Sets the default balance to 100,000,000,000 TRX (adjust as needed)
- Uses the default private key for the account

## Custom Public Key and TRX Balance

The default private key in Tron Quickstart is:

```
0000000000000000000000000000000000000000000000000000000000000001
```

The corresponding public address will be generated and funded with the specified `defaultBalance`.

To use a custom private key:

1. Generate a new private key (you can use Tron's wallet software or a trusted key generator)
2. Replace the `useDefaultPrivateKey=true` with `privateKey=YOUR_PRIVATE_KEY` in the docker run command



```bash
docker run -it \
-p 9090:9090 \
--rm \
--name tron \
-e "accounts=1" \
-e "defaultBalance=100000000" \
-e "privateKey=YOUR_PRIVATE_KEY" \
trontools/quickstart
```



## Accessing the Network

### HTTP API

Use `http://127.0.0.1:9090` as the base URL for API calls.

### View Accounts

```bash
curl http://127.0.0.1:9090/admin/accounts
```

### Using TronWeb in Your Application

```javascript
const TronWeb = require('tronweb');
const tronWeb = new TronWeb({
  fullHost: 'http://127.0.0.1:9090',
  privateKey: 'your_private_key_here'
});
```

## Accessing the Dashboard

Tron Quickstart doesn't provide a built-in dashboard, but you can use third-party tools or build your own using the exposed API endpoints.

For basic information:

1. Account List: `http://127.0.0.1:9090/admin/accounts`
2. Node Information: `http://127.0.0.1:9090/wallet/getnodeinfo`
3. Block Information: `http://127.0.0.1:9090/wallet/getblock`

## Important Notes

- This setup is for development and testing purposes only.
- The `--rm` flag ensures the container is removed after stopping, which is important for maintaining a clean state between runs.
- You can adjust the `defaultBalance` to any value you need for your testing environment.
- Remember that this is a private network and not connected to the main Tron network.

## Troubleshooting

If you encounter any issues:

1. Ensure Docker is running correctly on your system.
2. Check if the port 9090 is not being used by another application.
3. Verify that you have the latest version of the trontools/quickstart image.

For more detailed information, refer to the [Tron Quickstart documentation](https://github.com/TRON-US/docker-tron-quickstart).