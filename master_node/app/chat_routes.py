from app import app

from flask import request, jsonify
from app.module.helper_functions import generate_api_key, allowed_file, api_key_required, generate_jwt_token, token_required
from app.module.embeddings import get_embeddings, get_documents


import tempfile

import requests


CHAT_URL = app.config['CHAT_URL']
MASTER_API_KEY = app.config['MASTER_API_KEY']
UPLOAD_FOLDER = app.config['UPLOAD_FOLDER']


#  to be replace by reddis or on chain session management storage
api_keys            = app.config['API_KEYS'] 
chat_sessions       = app.config['CHAT_SESSIONS']
temp_folder         = app.config['TEMP_FILE_PATH']

@app.route('/start_chat', methods=['POST'])
@api_key_required
def start_chat():
    api_key = request.headers.get('X-API-Key')
    jwt_token = generate_jwt_token(api_key)

    return jsonify({
        'jwt_token': jwt_token,
        'url': CHAT_URL
    }), 200

@app.route('/chat', methods=['POST'])
@token_required
def chat(api_key):
    data = request.json
    query = data.get('query', '')
    url = data.get('url', '')

    session_data = api_keys[api_key]
    embeddings = session_data['embeddings']
    documents = session_data['documents']

    result = make_request(query, embeddings, documents, url)
    return jsonify(result)

def make_request(query, embeddings, documents, url):
    data = {
        'query': query,
        'embeddings': embeddings,
        'document': documents
    }

    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        response_data = response.json()
        return {
            'query': query,
            'answer': response_data.get('answer', 'No answer provided')
        }
    except requests.RequestException as e:
        return {
            'query': query,
            'answer': f"An error occurred: {str(e)}"
        }
        

@app.route('/test_model', methods=['POST'])
def test_data_model():
    
    # return jsonify("test_data_model"), 200

    data = request.get_json()
    
    if not data or 'AI_Data' not in data or 'baseModel' not in data or 'test query' not in data:
        return jsonify({'error': 'AI_Data and baseModel are required'}), 400

    # Prepare the content for the temporary file
    content_main    = f"AI_Data: {data['AI_Data']}\n"
    
    optional_content = " "
    
    model_to_use= data['baseModel']

    # Add optional fields if they exist
    optional_fields = [
        'collection owner', 'collection name', 'collection description',
        'nft name', 'nft description', 'nft owner'
    ]
    
    additional_content = []
    for field in optional_fields:
        if field in data:
            additional_content.append(f"{field}: {data[field]}")
    
    if additional_content:
        optional_content += "Additional Data: " + ", ".join(additional_content) + "\n"



    embeddings = get_embeddings([optional_content, content_main])
    documents = get_documents([optional_content, content_main])
 
    request_data = make_request (data['test query'], embeddings, documents, CHAT_URL)
    
    

    return jsonify(str(request_data["answer"])), 200

