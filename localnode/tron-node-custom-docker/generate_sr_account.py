import json
from tronpy.keys import PrivateKey

def generate_sr_account():
    private_key = PrivateKey.random()
    address = private_key.public_key.to_base58check_address()
    account = {
        'address': address,
        'privateKey': private_key.hex(),
    }
    return account

if __name__ == '__main__':
    account = generate_sr_account()
    print(json.dumps(account))
