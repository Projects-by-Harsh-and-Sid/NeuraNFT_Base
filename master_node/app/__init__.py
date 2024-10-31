
import os
from flask import Flask, request, jsonify
from app.config import init_config 

from flask_cors import CORS

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER       = 'uploads'
CONTRACT_FOLDER     = 'contract_data_folder'
ALLOWED_EXTENSIONS  = {'txt', 'pdf', 'doc', 'docx'}

SECRET_KEY          = os.environ.get('JWT_SECRET_KEY', 'chatwithme')
MASTER_API_KEY      = os.environ.get('MASTER_API_KEY', '1234567890')

temp_file_path      = os.path.join(os.path.dirname(__file__), 'temp')


config              = init_config()
app.config.update(config)



app.config['UPLOAD_FOLDER']     = os.path.join(os.path.dirname(__file__), UPLOAD_FOLDER)
app.config['SECRET_KEY']        = SECRET_KEY
app.config['MASTER_API_KEY']    = MASTER_API_KEY
app.config['ALLOWED_EXTENSIONS']= ALLOWED_EXTENSIONS
app.config['API_KEYS']          = {}
app.config['CHAT_SESSIONS']     = {}
app.config['TEMP_FILE_PATH']    = temp_file_path
app.config['CONTRACT_FOLDER']   = os.path.join(os.path.dirname(__file__), CONTRACT_FOLDER)





# app.config["Load_balancer_Endpoints"] = {
#     "hpcEndpoint": "https://base.backend.neuranft.com",
#     "hpcEndpointPort": "443",
# }

# app.config["filestorage_endpoint"] = "https://base.backend.neuranft.com"



# from app import routes
from app import data_fetch
from app import routesv2
from app import chat_routes