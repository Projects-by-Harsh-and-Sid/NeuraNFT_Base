#!/bin/bash

# Generate SR account
SR_ACCOUNT=$(python3 generate_sr_account.py)
SR_ADDRESS=$(echo $SR_ACCOUNT | jq -r '.address')
SR_PRIVATE_KEY=$(echo $SR_ACCOUNT | jq -r '.privateKey')

# Export variables for placeholder replacement
export SR_ADDRESS
export SR_PRIVATE_KEY

# Replace placeholders in the template to create the actual config file
# envsubst < private_net_config.conf.template > private_net_config.conf

# Replace placeholders in the template
sed -e "s|{{SR_ADDRESS}}|$SR_ADDRESS|g" -e "s|{{SR_PRIVATE_KEY}}|$SR_PRIVATE_KEY|g" private_net_config.conf.template > private_net_config.conf


# Start TRON FullNode with --witness flag
java -jar FullNode.jar --witness -c private_net_config.conf &

# Wait for the node to start
sleep 30

# Generate other accounts
python3 generate_accounts.py

# Export SR private key for use in modify_parameters.js
export SR_PRIVATE_KEY=$SR_PRIVATE_KEY

# Modify chain parameters
node modify_parameters.js

# Keep the container running
tail -f /dev/null
