
from app import app

from flask import request, jsonify


import PyPDF2  # For handling PDFs

from app.module.embeddings import get_embeddings, get_documents

from app.module.helper_functions import generate_api_key, allowed_file, api_key_required, generate_jwt_token, token_required

import os

CHAT_URL = app.config['CHAT_URL']
MASTER_API_KEY = app.config['MASTER_API_KEY']
UPLOAD_FOLDER = app.config['UPLOAD_FOLDER']


#  to be replace by reddis or on chain session management storage
api_keys            = app.config['API_KEYS'] 
chat_sessions       = app.config['CHAT_SESSIONS']
temp_folder         = app.config['TEMP_FILE_PATH']


########################## converting PDF to text ##########################

def convert_pdf_to_text(file):
    try:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        raise Exception(f"Error processing PDF: {str(e)}")

@app.route('/convert_pdf', methods=['POST'])
def convert_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part provided'}), 400

    file = request.files['file']
    
    if file and allowed_file(file.filename):
        try:
            text = convert_pdf_to_text(file)
            return jsonify({'text': text}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Invalid file type. Only PDF files are allowed for this endpoint.'}), 400



############################ generating API Key ############################




# # Modified /generate_key to accept text string instead of file data
# @app.route('/generate_key', methods=['POST'])
# def generate_key():
    
    
#     data    = request.get_json()
    
#     if not data or 'text' not in data:
#         return jsonify({'error': 'No text data provided'}), 400

#     text_content = data['text']

#     with tempfile.NamedTemporaryFile(mode='w+', delete=False, suffix='.txt') as temp_file:
#         temp_file.write(text_content)
#         temp_file_path = temp_file.name

#     try:
#         embeddings = get_embeddings(temp_file_path)
#         documents = get_documents(temp_file_path)
#     finally:
#         os.unlink(temp_file_path)

#     api_key = generate_api_key()
#     api_keys[api_key] = {
#         'embeddings': embeddings,
#         'documents': documents
#     }

#     return jsonify({'api_key': api_key}), 200



@app.route('/generate_key', methods=['POST'])
def generate_key():
    
    data = request.get_json()
    
    if not data or 'AI_Data' not in data or 'baseModel' not in data:
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

    # content += "\n"  # Add a newline before the main AI_Data content

    
    # # check of temp folder exists
    # if not os.path.exists(temp_folder):
    #     os.makedirs(temp_folder)
    
    # # Create a random temporary file to store the content
    # file_name = "temp_file_" + str(os.urandom(24).hex()) + '.txt'
    # temp_file_path = os.path.join(temp_folder, file_name)

    # # Create the temporary file
  
    # with  open(temp_file_path, 'w') as temp_file:
    #     temp_file.write(content)

    # try:
    #     embeddings = get_embeddings(temp_file_path)
    #     documents = get_documents(temp_file_path)
    # finally:
    #     os.unlink(temp_file_path)

    embeddings = get_embeddings([optional_content, content_main])
    documents = get_documents([optional_content, content_main])
 
    # print("embeddings", embeddings)
    # print("documents", documents)

    api_key = generate_api_key()
    api_keys[api_key] = {
        'embeddings': embeddings,
        'documents': documents
    }
    

    return jsonify({'apiKey': api_key,
                    "hpcEndpoint": app.config["Load_balancer_Endpoints"]["hpcEndpoint"],
                    "hpcEndpointPort": app.config["Load_balancer_Endpoints"]["hpcEndpointPort"]
                    }), 200












