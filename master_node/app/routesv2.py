from app import app

from flask import request, jsonify


import requests
import PyPDF2  # For handling PDFs
import tempfile
from app.module.embeddings import get_embeddings, get_documents
import unicodedata

from app.module.helper_functions import generate_api_key, allowed_file, api_key_required, generate_jwt_token, token_required


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