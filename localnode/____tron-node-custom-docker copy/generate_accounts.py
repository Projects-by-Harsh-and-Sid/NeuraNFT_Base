import os
import json
from tronpy import Tron
from tronpy.keys import PrivateKey

def generate_accounts(num_accounts, default_balance):
    client = Tron(network='private')
    accounts = []

    for _ in range(num_accounts):
        private_key = PrivateKey.random()
        public_key = private_key.public_key
        address = private_key.public_key.to_base58check_address()

        account = {
            'address': address,
            'privateKey': private_key.hex(),
            'balance': default_balance
        }
        accounts.append(account)

        # Note: Funding accounts on a private network might require additional setup

    return accounts

if __name__ == '__main__':
    num_accounts = int(os.environ.get('accounts', 20))
    default_balance = int(os.environ.get('defaultBalance', 100000))
    format_json = os.environ.get('formatJson', 'false').lower() == 'true'

    accounts = generate_accounts(num_accounts, default_balance)
    
    if format_json:
        print(json.dumps(accounts, indent=2))
    else:
        print(json.dumps(accounts))

    # Save accounts to a file
    with open('/tron/accounts.json', 'w') as f:
        json.dump(accounts, f, indent=2 if format_json else None)