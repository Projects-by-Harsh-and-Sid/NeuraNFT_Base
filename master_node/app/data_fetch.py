
from app import app

from flask import request, jsonify, send_from_directory

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

@app.route('/image/<filename>')
def get_image(filename):
    
    path_to_file = os.path.join(app.config['UPLOAD_FOLDER'],"images")
    print("filename, UPLOAD_FOLDER", filename, UPLOAD_FOLDER)
    return send_from_directory(path_to_file, filename)



# to complete

@app.route('/get_all_collections', methods=['GET'])
def get_all_collections():
    
    # curl -X GET http://localhost:5500/get_all_collections
    
    path = os.path.join(app.config['UPLOAD_FOLDER'], "temp", "all_collections.json")
    
    if not os.path.exists(path):
        return jsonify({'error': 'No collections found'}), 404
    
    with open(path, 'r') as f:
        collections = json.load(f)
        
    return jsonify(collections), 200


@app.route('/get_all_nfts', methods=['GET'])
def get_all_nfts():
    collection_path = os.path.join(UPLOAD_FOLDER, "temp", "all_nft.json")
    if not os.path.exists(collection_path):
        return jsonify({'error': 'Collection not found'}), 404
    
    with open(collection_path, 'r') as f:
        nfts = json.load(f)
    
    return jsonify(nfts), 200


@app.route('/get_popular_collections', methods=['GET'])
def get_popular_collections():
    
    # curl -X GET http://localhost:5500/get_popular_collections
    path = os.path.join(app.config['UPLOAD_FOLDER'], "temp", "all_popular_collections.json")
    
    if not os.path.exists(path):
        return jsonify({'error': 'No collections found'}), 404
    
    with open(path, 'r') as f:
        collections = json.load(f)
        
    return jsonify( collections), 200