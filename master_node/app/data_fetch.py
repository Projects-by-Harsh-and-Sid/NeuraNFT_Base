
from app import app

from flask import request, jsonify, send_from_directory

from app import blockchain_code

from werkzeug.utils import secure_filename


import random
import string

import json

import os

CHAT_URL = app.config['CHAT_URL']
MASTER_API_KEY = app.config['MASTER_API_KEY']
UPLOAD_FOLDER = app.config['UPLOAD_FOLDER']



# UPLOAD_FOLDER = 'image'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def generate_random_string(length=10):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return 'No image file in the request', 400
    
    file = request.files['image']
    if file.filename == '':
        return 'No selected file', 400
    
    if file:
        # Get the file extension
        _, ext = os.path.splitext(file.filename)
        # Generate a random filename
        random_filename = f"{generate_random_string()}{ext}"
        # Secure the filename
        filename = secure_filename(random_filename)
        # Save the file
        file.save(os.path.join(app.config['UPLOAD_FOLDER'],"images" ,filename))
        return filename, 200
    
@app.route('/upload_image_url', methods=['POST'])
def upload_image_url():
    if 'image' not in request.files:
        return 'No image file in the request', 400
    
    file = request.files['image']
    if file.filename == '':
        return 'No selected file', 400
    
    if file:
        # Get the file extension
        _, ext = os.path.splitext(file.filename)
        # Generate a random filename
        random_filename = f"{generate_random_string()}{ext}"
        # Secure the filename
        filename = secure_filename(random_filename)
        # Save the file
        file.save(os.path.join(app.config['UPLOAD_FOLDER'],"images" ,filename))
        return f"http://localhost:5500/image/{filename}", 200

@app.route('/image/<filename>')
def get_image(filename):
    
    path_to_file = os.path.join(app.config['UPLOAD_FOLDER'],"images")
    print("filename, UPLOAD_FOLDER", filename, UPLOAD_FOLDER)
    return send_from_directory(path_to_file, filename)



############################################################################################################
################################## Collection Functions ####################################################
############################################################################################################

@app.route('/get_all_collections', methods=['GET'])
def get_all_collections():
    
    # curl -X GET http://localhost:5500/get_all_collections
    
    # path = os.path.join(app.config['UPLOAD_FOLDER'], "temp", "all_collections.json")
    
    # if not os.path.exists(path):
    #     return jsonify({'error': 'No collections found'}), 404
    
    # with open(path, 'r') as f:
    #     collections = json.load(f)
    
    
    return blockchain_code.getAllCollections()
    
    
    # return jsonify(collections), 200


@app.route('/get_popular_collections', methods=['GET'])
def get_popular_collections():
    
    # curl -X GET http://localhost:5500/get_popular_collections
    path = os.path.join(app.config['UPLOAD_FOLDER'], "temp", "all_popular_collections.json")
    
    if not os.path.exists(path):
        return jsonify({'error': 'No collections found'}), 404
    
    with open(path, 'r') as f:
        collections = json.load(f)
        
    return jsonify( collections), 200


@app.route('/get_collections_by_address', methods=['GET'])
def get_collections_by_address():
    address = request.args.get('address') 
    if not address:
        return jsonify({'error': 'Address parameter is required'}), 400

    collections_path = os.path.join(app.config['UPLOAD_FOLDER'], "temp", "all_collections.json")
    
    if not os.path.exists(collections_path):
        return jsonify({'error': 'Collections data not found'}), 404
    
    with open(collections_path, 'r') as f:
        all_collections = json.load(f)
    
    my_collections = [collection for collection in all_collections['collections'] if collection['creator'] == address]
    # print("my_collections", my_collections)
    return jsonify({'myCollections': my_collections}), 200


@app.route('/get_collection_by_id', methods=['GET'])
def get_collection_by_id():
    
    collection_id = request.args.get('collection_id')
    if not collection_id:
        return jsonify({'error': 'Collection ID parameter is required'}), 400

    # collections_path = os.path.join(app.config['UPLOAD_FOLDER'], "temp", "all_collections.json")
    
    # if not os.path.exists(collections_path):
    #     return jsonify({'error': 'Collections data not found'}), 404
    
    # with open(collections_path, 'r') as f:
    #     all_collections = json.load(f)
    # my_collection = [collection for collection in all_collections['collections'] if collection['id'] == int(collection_id)]
    
    
    return blockchain_code.get_collection_details_by_id(int(collection_id))
    
        
    # return jsonify({'myCollections': my_collection}), 200




############################################################################################################
######################################### NFT Functions ####################################################
############################################################################################################

@app.route('/get_all_nfts', methods=['GET'])
def get_all_nfts():
    collection_path = os.path.join(UPLOAD_FOLDER, "temp", "all_nft.json")
    if not os.path.exists(collection_path):
        return jsonify({'error': 'Collection not found'}), 404
    
    with open(collection_path, 'r') as f:
        nfts = json.load(f)
    
    return jsonify(nfts), 200




@app.route('/get_nfts_by_address', methods=['GET'])
def get_nfts_by_address():
    address = request.args.get('address') 
    if not address:
        return jsonify({'error': 'Address parameter is required'}), 400

    nfts_path = os.path.join(app.config['UPLOAD_FOLDER'], "temp", "all_nft.json")
    
    if not os.path.exists(nfts_path):
        return jsonify({'error': 'NFTs data not found'}), 404
    
    with open(nfts_path, 'r') as f:
        all_nfts = json.load(f)
    
    my_nfts = [nft for nft in all_nfts['nfts'] if nft['owner'] == address]
    # print("my_nfts", my_nfts)
    return jsonify({'myNFTs': my_nfts}), 200


@app.route('/get_nfts_by_collection', methods=['GET'])
def get_nfts_by_collection():

    collecton_id = request.args.get('collection_id')
    if not collecton_id:
        return jsonify({'error': 'Collection ID parameter is required'}), 400
    
    all_nfts = blockchain_code.all_nft_of_a_collection(int(collecton_id))
    
    return all_nfts, 200

    # collection_address = request.args.get('collection_address')
    # if not collection_address:
    #     return jsonify({'error': 'Collection address parameter is required'}), 400

    # nfts_path = os.path.join(app.config['UPLOAD_FOLDER'], "temp", "all_nft.json")
    
    # if not os.path.exists(nfts_path):
    #     return jsonify({'error': 'NFTs data not found'}), 404
    
    # with open(nfts_path, 'r') as f:
    #     all_nfts = json.load(f)
    
    # collection_nfts = [nft for nft in all_nfts['nfts'] if nft['collectionaddress'] == collection_address]
    
    # return jsonify({'myNFTs': collection_nfts}), 200



@app.route('/get_nft_by_collectionid_nft_id', methods=['GET'])
def get_nft_data_by_collectionID_nftID():
    nft_id          = request.args.get('nft_id')
    collection_id   = request.args.get('collection_id')
        
    if not nft_id or not collection_id:
        return jsonify({'error': 'Both NFT ID and Collection address parameters are required'}), 400

    nft = blockchain_code.nft_of_a_collection_with_access(int(collection_id), int(nft_id))
    
    return nft, 200




@app.route('/get_compounded_nft_by_collectionid_nft_id', methods=['GET'])
def get_nft_data_compounded():
    nft_id          = request.args.get('nft_id')
    collection_id   = request.args.get('collection_id')
        
    if not nft_id or not collection_id:
        return jsonify({'error': 'Both NFT ID and Collection address parameters are required'}), 400

    nft = blockchain_code.nft_of_a_collection_with_access(int(collection_id), int(nft_id))
    
    return nft, 200

    # nfts_path = os.path.join(app.config['UPLOAD_FOLDER'], "temp", "all_nft.json")
    
    # if not os.path.exists(nfts_path):
    #     return jsonify({'error': 'NFTs data not found'}), 404
    
    # with open(nfts_path, 'r') as f:
    #     all_nfts = json.load(f)
    
    # particular_nft = [nft for nft in all_nfts['nfts'] if nft['id'] == int(nft_id) and nft['collectionaddress'] == collection_address]
    
    # return jsonify({'myNFTs': particular_nft}), 200