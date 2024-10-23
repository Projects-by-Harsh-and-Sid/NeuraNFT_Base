from app import app

from flask import request, jsonify, render_template


import requests
import PyPDF2  # For handling PDFs
import tempfile
from app.module.embeddings import get_embeddings, get_documents
import unicodedata

from app.module.helper_functions import generate_api_key, allowed_file, api_key_required, generate_jwt_token, token_required

from app import blockchain_code


from app.data_fetch import generate_random_string

import os

CHAT_URL = app.config['CHAT_URL']
MASTER_API_KEY = app.config['MASTER_API_KEY']
UPLOAD_FOLDER = app.config['UPLOAD_FOLDER']

FILE_STORAGE_ENDPOINT = app.config['filestorage_endpoint']
DATA_FOLDER = os.path.join(UPLOAD_FOLDER,"data")

#  to be replace by reddis or on chain session management storage
api_keys            = app.config['API_KEYS'] 
chat_sessions       = app.config['CHAT_SESSIONS']


@app.route("/")
def index():
    return render_template("index.html")



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



def sanitize_text(text):
    # return ''.join(ch for ch in text if unicodedata.category(ch)[0] != 'C')
    return ''.join(ch  if ord(ch) < 128 else " " for ch in text)

@app.route('/convertpdfToLink', methods=['POST'])
def convert_pdf_to_link():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part provided'}), 400

    file = request.files['file']
    
    if file and allowed_file(file.filename):
        try:
            text = convert_pdf_to_text(file)
            text = sanitize_text(text)
            
            
            random_filename = f"{generate_random_string()}.data"
            
            # store the text in a file and return the file path
            with open(os.path.join(DATA_FOLDER,random_filename), 'w') as f:
                f.write(text)
            
            data_url = f"{FILE_STORAGE_ENDPOINT}/data/{random_filename}"
            
            return data_url, 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Invalid file type. Only PDF files are allowed for this endpoint.'}), 400
    

@app.route('/data', methods=['GET'])
@app.route('/data/<datafile>', methods=['GET'])
def get_data(datafile="default.data"):


    path_to_file = os.path.join(app.config['UPLOAD_FOLDER'],"data")
    if not os.path.exists(os.path.join(path_to_file, datafile)):
        return "No data found"
    
    print("filename, UPLOAD_FOLDER", datafile, UPLOAD_FOLDER)
    
    
    with open(os.path.join(path_to_file, datafile), 'r') as f:
        data = f.read()
    
    return jsonify({"data": data}), 200


def check_access(access_list, signed_message):
# TODO : Implement this function to check if the messenge is signed by the owner of the access_list and the timestam in the message     
    
    for access in access_list:
        if access['signature'] == signed_message:
            return True
    return False



def check_urk_format(url):
    from urllib.parse import urlparse
    parsed_url = urlparse(url)
    return bool(parsed_url.scheme and parsed_url.netloc)
    



@app.route('/generate_key', methods=['POST','GET'])
def generate_key():
    
    collection_id = 1
    nft_id = 1
    if request.method == 'POST':
        
        info_dict = request.get_json()
        
        if not info_dict or 'collection_id' not in info_dict or 'nft_id' not in info_dict:
            return jsonify({'error': 'collection_id and nft_id are required'}), 400
        
        collection_id = info_dict['collection_id']
        nft_id = info_dict['nft_id']
    
    # for testing
    if request.method == 'GET':
        collection_id =(request.args.get('collection_id'))
        nft_id = request.args.get('nft_id')
    
    # signed_message = info_dict['signed_message']
    
    nft = blockchain_code.nft_of_a_collection_with_access(int(collection_id), int(nft_id))
    
    data_link = nft['data']
    access_list = nft['accessList']
    
    
    
    #To Do do
    # check access
    # check_access(access_list, signed_message)
    
    #check if data_link is in uel format or not
    
    
    
    
    if not check_urk_format(data_link) :
        data_link = f"{FILE_STORAGE_ENDPOINT}/data/default.data"

    data = requests.get(data_link).json()
    
    
    # also get rag data etc
    
    if not data or 'data' not in data:
        return jsonify({'error': 'AI_Data and baseModel are required'}), 400

    
    # Prepare the content for the temporary file
    content_main    = f"AI_Data: {data['data']}\n"
    
    
    
    
    ###############################################################################################
    # data gather now prepare the data for the AI model
    ##############################################################################################
    
    
    optional_content = " "
    
    # model_to_use= data['baseModel']

    # Add optional fields if they exist
    optional_fields = [
        'creator', 'collection', 'description',
        'name', 'owner', 'tokenStandard', 'tokenStandardFullform', 'chain'
    ]
    
    additional_content = []
    for field in optional_fields:
        if field in nft:
            additional_content.append(f"{field}: {nft[field]}")
    
    if additional_content:
        optional_content += "Additional Data: " + ", ".join(additional_content) + "\n"


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

