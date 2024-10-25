import json
from web3 import Web3
import os 
from app import app
import concurrent.futures
from web3 import Web3
# from web3.middleware.geth_poa import geth_poa_middleware
from functools import lru_cache
import time

# Global constants
FILE_STORAGE_ENDPOINT = app.config['filestorage_endpoint']
CONTRACT_FOLDER = app.config['CONTRACT_FOLDER']
MAX_WORKERS = 20
MAX_RETRIES = 3
BATCH_SIZE = 50

# Optimized Web3 connection
# w3 = Web3(Web3.HTTPProvider("https://base-sepolia-rpc.publicnode.com",
#     request_kwargs={
#         'timeout': 30,
#         'headers': {
#             'Content-Type': 'application/json',
#             'keep-alive': 'timeout=10, max=1000'
#         }
#     }
# ))

w3 = Web3(Web3.HTTPProvider("https://quick-greatest-gadget.base-sepolia.quiknode.pro/e3a2ca7bc26b0e2ea14d4c85a29716930958d908",
    request_kwargs={
        'timeout': 30,
        'headers': {
            'Content-Type': 'application/json',
            'keep-alive': 'timeout=10, max=1000'
        }
    }
))



# w3.middleware_onion.inject(geth_poa_middleware, layer=0)

# Contract initialization with lazy loading
@lru_cache(maxsize=None)
def load_contract_json(contract_name):
    with open(os.path.join(CONTRACT_FOLDER, f'contracts/{contract_name}.json')) as f:
        return json.load(f)

@lru_cache(maxsize=None)
def load_addresses():
    with open(os.path.join(CONTRACT_FOLDER, 'contractAddresses/base_addresses.json')) as f:
        return json.load(f)

# Initialize contracts with retry mechanism
def initialize_contracts():
    collection_json = load_contract_json('CollectionContract')
    nft_json = load_contract_json('NFTContract')
    NFTAccessControl_json = load_contract_json('NFTAccessControl')
    NFTMetadata_json = load_contract_json('NFTMetadata')
    address_json = load_addresses()

    return {
        'collection': w3.eth.contract(address=address_json["CollectionContract"], abi=collection_json["abi"]),
        'nft': w3.eth.contract(address=address_json["NFTContract"], abi=nft_json["abi"]),
        'metadata': w3.eth.contract(address=address_json["NFTMetadata"], abi=NFTMetadata_json["abi"]),
        'access': w3.eth.contract(address=address_json["NFTAccessControl"], abi=NFTAccessControl_json["abi"])
    }

# Global contracts instance
contracts = initialize_contracts()

# Retry decorator
def with_retry(max_retries=MAX_RETRIES):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_retries - 1:
                        print(f"Error in {func.__name__}: {str(e)}")
                        return None
                    time.sleep(2 ** attempt)  # Exponential backoff
            return None
        return wrapper
    return decorator



############################################################################################################
######################## Collection Contract Functions ####################################################
############################################################################################################

@with_retry()
def getAllCollections():
    total_collections = contracts['collection'].functions.getAllCollections().call({'gas': 2000000})
    
    def process_collection(collection_data, index):
        return {
            "id": index,
            "name": collection_data[0],
            "contextWindow": collection_data[1],
            "model": collection_data[2],
            "image": collection_data[3],
            "description": collection_data[4],
            "creator": collection_data[5],
            "date": collection_data[6],
            "owner": collection_data[7],
            "collectionaddress": f"#{index}",
        }
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        all_collections = list(executor.map(
            lambda x: process_collection(x[1], x[0] + 1),
            enumerate(total_collections)
        ))
    
    return all_collections


def getAllCollections_by_address(address):
    try:
        all_collections = getAllCollections()
        return [collection for collection in all_collections if collection['owner'] == address]
    except Exception as e:
        print(f"Error getting collections for address {address}: {str(e)}")
        return None


@with_retry()
def get_collection_details_by_id(collection_id):
    def fetch_collection_data():
        return (
            contracts['collection'].functions.getCollectionMetadata(collection_id).call(),
            contracts['collection'].functions.getCollectionNFTCount(collection_id).call(),
            contracts['collection'].functions.getCollectionOwner(collection_id).call(),
            contracts['collection'].functions.getCollectionUniqueHolders(collection_id).call()
        )
    
    metadata, nft_count, owner, unique_holders = fetch_collection_data()
    
    return {
        "id": collection_id,
        "name": metadata[0],
        "contextWindow": metadata[1],
        "baseModel": metadata[2],
        "image": metadata[3],
        "description": metadata[4],
        "creator": metadata[5],
        "dateCreated": metadata[6],
        "owner": owner,
        "collectionaddress": f"#{collection_id}",
        "noOfNFTs": nft_count,
        "uniqueHolders": unique_holders,
        "model": metadata[2],
        "noOfServers": 5
    }
############################################################################################################
########################      NFT Contract Functions    ####################################################
############################################################################################################



@with_retry()
def all_nft_information(nft_id, collection_id):
    def fetch_nft_data():
        nft_info = contracts['nft'].functions.getNFTInfo(collection_id, nft_id).call()
        try:
            metadata = contracts['metadata'].functions.getMetadata(collection_id, nft_id).call()
        except Exception:
            metadata = [f"{FILE_STORAGE_ENDPOINT}/image/default.jpg", "None", "None", "", "", "Metadata not available"]
        return nft_info, metadata
    
    nft_info, metadata = fetch_nft_data()
    
    return {
        "id": nft_id,
        "collectionId": collection_id,
        "levelOfOwnership": nft_info[0],
        "name": nft_info[1],
        "creator": nft_info[2],
        "creationDate": nft_info[3],
        "owner": nft_info[4],
        "image": metadata[0],
        "baseModel": metadata[1],
        "data": metadata[2],
        "rag": metadata[3],
        "fineTuneData": metadata[4],
        "description": metadata[5]
    }

@with_retry()
def all_nft_of_a_collection(collection_id):
    nft_ids = contracts['nft'].functions.getCollectionNFTs(collection_id).call()
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        nfts = list(filter(None, executor.map(
            lambda nft_id: all_nft_information(nft_id, collection_id),
            nft_ids
        )))
    
    return sorted(nfts, key=lambda x: x['id'])

@with_retry()
def all_access_levels_of_a_collection_nft(collection_id, nft_id):
    users_access = contracts['access'].functions.getAllUsersAccessForNFT(collection_id, nft_id).call()
    
    return [{"user": access[0], "accessLevel": access[1]} for access in users_access]

@with_retry()
def all_nfts_own_or_have_access_by_user(user_address):
    user_access_entries = contracts['access'].functions.getAllAccessForUser(user_address).call()
    
    def fetch_nft_with_access(entry):
        collection_id, nft_id, access_level = entry
        nft_info = all_nft_information(nft_id, collection_id)
        if nft_info:
            nft_info['accessLevel'] = access_level
            return nft_info
        return None
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        nfts = list(filter(None, executor.map(fetch_nft_with_access, user_access_entries)))
    
    return sorted(nfts, key=lambda x: x["collectionId"]*10**7+x['id'])


############################################################################################################################
################################################## Compound Functions ######################################################
############################################################################################################################


def nft_of_a_collection_with_access(collection_id, nft_id):
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        future_nft = executor.submit(all_nft_information, nft_id, collection_id)
        future_collection = executor.submit(get_collection_details_by_id, collection_id)
        future_access = executor.submit(all_access_levels_of_a_collection_nft, collection_id, nft_id)
        
        nft_information = future_nft.result()
        collection_info = future_collection.result()
        access_levels = future_access.result()
    
    if not all([nft_information, collection_info, access_levels]):
        return None
        
    # nft_information.update({
    #     'accessList': access_levels,
    #     'model': nft_information['baseModel'],
    #     'collection': collection_info['name'],
    #     'tokenId': nft_information['id'],
    #     'tokenStandard': 'NRC-101',
    #     'tokenStandardFullform': 'Neura Request for Comments 101',
    #     'chain': 'Base-Sepolia',
    #     'attributes': [
    #         {'trait_type': 'MMLU', 'value': '78.5'},
    #         {'trait_type': 'Context Window', 'value': collection_info['contextWindow']},
    #         {'trait_type': 'Model', 'value': nft_information['model']},
    #         {'trait_type': 'Total Access', 'value': len(access_levels)},
    #     ]
    # })
    
    nft_information['accessList'] = access_levels
    nft_information["model"] = nft_information["baseModel"]
    
    nft_information["collection"] = collection_info["name"]
    
    attributes = [
        
        {"trait_type": "MMLU", "value": "78.5"},
        {"trait_type": "Context Window", "value": collection_info["contextWindow"]},
        {"trait_type": "Model", "value": nft_information["model"]},
        {"trait_type": "Total Access", "value": len(access_levels)},
    ]
    
    nft_information["tokenId"] = nft_information["id"]
    nft_information["tokenStandard"] = "NRC-101"
    nft_information["tokenStandardFullform"] = "Neura Request for Comments 101"
    nft_information["chain"] = "Base-Sepolia"
    nft_information["attributes"] = attributes
    
    
    
    return nft_information

@with_retry()
def all_nfts():
    total_collections = contracts['collection'].functions.getAllCollections().call()
    all_nfts_list = []
    
    def process_collection(collection_id):
        nfts = all_nft_of_a_collection(collection_id)
        if not nfts:
            return []
        return [nft_of_a_collection_with_access(collection_id, nft['id']) for nft in nfts]
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        for nfts in executor.map(process_collection, range(1, len(total_collections) + 1)):
            all_nfts_list.extend(filter(None, nfts))
    
    return all_nfts_list