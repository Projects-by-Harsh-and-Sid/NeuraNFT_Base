#!/bin/bash

# Start TRON FullNode
java -jar FullNode.jar -c private_net_config.conf &

# Wait for the node to start
sleep 30

# Generate accounts
python3 generate_accounts.py

# Keep the container running
tail -f /dev/null