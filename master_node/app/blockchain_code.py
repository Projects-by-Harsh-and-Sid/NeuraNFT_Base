import json
from tronpy import Tron
from tronpy.providers import HTTPProvider
from tronpy.keys import PrivateKey
import os 
from app import app

import concurrent.futures

client = Tron(network="shasta")


contract_folder = app.config['CONTRACT_FOLDER']


try:
    # Check connection by getting the latest block number
    latest_block = client.get_latest_block_number()
    print(f"Successfully connected to the TRON node at shasta")
    print(f"Latest block number: {latest_block}")
except Exception as e:
    print(f"Connection to TRON node failed. Error: {str(e)}")
    print("Please check the URL and try again.")
    

    
# # get private data from ..\neuranft-contract\.env
# with open(os.path.join(contract_folder,".env"), 'r') as f:
#     data = f.readlines()
#     for line in data:
#         if 'PRIVATE_KEY_SHASTA' in line:
#             private_key = line.split('=')[1].strip()
            

#collection json
with open(os.path.join(contract_folder,r'contracts\CollectionContract.json')) as f:
    collection_json = json.load(f)

with open(os.path.join(contract_folder,r'contracts\NFTContract.json')) as f:
    nft_json = json.load(f)

with open(os.path.join(contract_folder,r'contracts\NFTAccessControl.json')) as f:
    NFTAccessControl_json = json.load(f)

with open(os.path.join(contract_folder,r'contracts\NFTMetadata.json')) as f:
    NFTMetadata_json = json.load(f)
    
with open(os.path.join(contract_folder,r'contractAddresses\shasta_addresses.json')) as f:
    address_json= json.load(f)
    
    
collection_contract         = client.get_contract(address_json["CollectionContract"])
nft_contract                = client.get_contract(address_json["NFTContract"])
nft_metadata_contract       = client.get_contract(address_json["NFTMetadata"])
nft_access_control_contract = client.get_contract(address_json["NFTAccessControl"])

collection_contract.abi         = collection_json["abi"]
nft_contract.abi                = nft_json["abi"]
nft_metadata_contract.abi       = NFTMetadata_json["abi"]
nft_access_control_contract.abi = NFTAccessControl_json["abi"]


############################################################################################################
######################## Collection Contract Functions ####################################################
############################################################################################################

def getAllCollections():
    try:
        
        total_collections = collection_contract.functions.getAllCollections()
        
        all_collections = []
        counter = 1
        for collection_data in total_collections:
            # collection_data = collection_contract.functions.getCollectionMetadata(i)
            i = counter
            counter += 1
            formatted_collection = {
                "id": i,
                "name": collection_data[0],
                "contextWindow": collection_data[1],
                "model": collection_data[2],
                "image": collection_data[3],
                "description": collection_data[4],
                "creator": collection_data[5],
                "date": collection_data[6],
                "owner": collection_data[7],
                "collectionaddress": f"#{i}",
                # "noOfNFTs": collection_contract.functions.getCollectionNFTCount(i)
            }
            all_collections.append(formatted_collection)

        return all_collections
    
    except Exception as e:
        print(f"Error getting all collections: {str(e)}")
        return None

def getAllCollections_by_address(address):
    try:
        all_collections = getAllCollections()
        return [collection for collection in all_collections if collection['owner'] == address]
    except Exception as e:
        print(f"Error getting collections for address {address}: {str(e)}")
        return None

def get_collection_details_by_id(collection_id):
    try:
        metadata = collection_contract.functions.getCollectionMetadata(collection_id)
        nft_count = collection_contract.functions.getCollectionNFTCount(collection_id)
        owner = collection_contract.functions.getCollectionOwner(collection_id)
        unique_holders = collection_contract.functions.getCollectionUniqueHolders(collection_id)

        collection_details = {
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

        return collection_details
    except Exception as e:
        print(f"Error getting details for collection ID {collection_id}: {str(e)}")
        return None


############################################################################################################
########################      NFT Contract Functions    ####################################################
############################################################################################################



def all_nft_information(nft_id, collection_id):
    try:
        nft_info = nft_contract.functions.getNFTInfo(collection_id, nft_id)
        metadata = nft_metadata_contract.functions.getMetadata(collection_id, nft_id)
        
        # return {
        #     "id": nft_id,
        #     "collectionId": collection_id,
        #     "levelOfOwnership": nft_info[0],
        #     "name": nft_info[1],
        #     "creator": nft_info[2],
        #     "creationDate": nft_info[3],
        #     "owner": nft_info[4],
        #     "metadata": {
        #         "image": metadata[0],
        #         "baseModel": metadata[1],
        #         "data": metadata[2],
        #         "rag": metadata[3],
        #         "fineTuneData": metadata[4],
        #         "description": metadata[5]
        #     }
        # }
        
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
    except Exception as e:
        print(f"Error getting information for NFT ID {nft_id} in collection {collection_id}: {e}")
        return None

def all_nft_of_a_collection(collection_id):
    try:
        nft_count = nft_contract.functions.getCollectionNFTCount(collection_id)
        nft_ids = nft_contract.functions.getCollectionNFTs(collection_id)
        
        # nfts = []
        # for nft_id in nft_ids:
        #     nft_info = all_nft_information(nft_id, collection_id)
        #     if nft_info:
        #         nfts.append(nft_info)
        
        def fetch_nft_info(nft_id, collection_id):
            return all_nft_information(nft_id, collection_id)
        
        nfts = []
        max_workers = 20
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = [executor.submit(fetch_nft_info, nft_id, collection_id) for nft_id in nft_ids]
            for future in concurrent.futures.as_completed(futures):
                nft_info = future.result()
                if nft_info:
                    nfts.append(nft_info)
        
        nfts.sort(key=lambda x: x['id'])
        
        
        return nfts
    except Exception as e:
        print(f"Error getting NFTs for collection {collection_id}: {e}")
        return None

def all_access_levels_of_a_collection_nft(collection_id, nft_id):
    try:
        users_access = nft_access_control_contract.functions.getAllUsersAccessForNFT(collection_id, nft_id)
        
        access_levels = []
        for user_access in users_access:
            access_levels.append({
                "user": user_access[0],
                "accessLevel": user_access[1]
            })
        
        return access_levels
    except Exception as e:
        print(f"Error getting access levels for NFT ID {nft_id} in collection {collection_id}: {e}")
        return None

def all_nfts_own_or_have_access_by_user(user_address):
    try:
        user_access_entries = nft_access_control_contract.functions.getAllAccessForUser(user_address)
        
        
        def fetch_nft_info(nft_id, collection_id, access_level):
            nft_info = all_nft_information(nft_id, collection_id)
            
            if nft_info:
                nft_info['accessLevel'] = access_level
                return nft_info
            return None
        
        nfts = []
        
        max_workers = 20        
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = [executor.submit(fetch_nft_info, nft_id, collection_id, access_level) for ( collection_id, nft_id, access_level) in user_access_entries]
            for future in concurrent.futures.as_completed(futures):
                nft_info = future.result()
                if nft_info:
                    nfts.append(nft_info)
            
        
        nfts.sort(key=lambda x: x["collectionId"]*10**7+x['id'] )
        
        return nfts
    
    except Exception as e:
        print(f"Error getting NFTs for user {user_address}: {e}")
        return None



############################################################################################################################
################################################## Compound Functions ######################################################
############################################################################################################################


def nft_of_a_collection_with_access(collection_id, nft_id):
    
    nft_information = all_nft_information(nft_id, collection_id)
    collection_info = get_collection_details_by_id(collection_id)
    access_levels   = all_access_levels_of_a_collection_nft(collection_id, nft_id)
    
    nft_information['accessList'] = access_levels
    nft_information["model"] = nft_information["baseModel"]
    
    nft_information["collection"] = collection_info["name"]
    
    attributes = [
        
        {"trait_type": "Collection", "value": collection_info["name"]},
        {"trait_type": "Context Window", "value": collection_info["contextWindow"]},
        {"trait_type": "Model", "value": nft_information["model"]},
        {"trait_type": "Total Access", "value": len(access_levels)},
    ]
    
    nft_information["tokenId"] = nft_information["id"]
    nft_information["tokenStandard"] = "NRC-101"
    nft_information["tokenStandardFullform"] = "Neura Request for Comments 101"
    nft_information["chain"] = "Tron"
    nft_information["attributes"] = attributes
    
    return nft_information


def all_nfts():
    
    
    total_collections = collection_contract.functions.getAllCollections()
    
    all_nfts = []
    
    for collection_id in range(1, len(total_collections)+1):
        nfts = all_nft_of_a_collection(collection_id)
        for nft in nfts:
            nft_info = nft_of_a_collection_with_access(collection_id, nft["id"])
            all_nfts.append(nft_info)