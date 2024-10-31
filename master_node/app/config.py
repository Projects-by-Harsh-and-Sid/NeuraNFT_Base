from dotenv import load_dotenv
import os
from pathlib import Path


def init_config():
    # Try to load .env file from the same directory as the application
    
    use_default_enc = int(os.getenv("DEFAULT_ENV", 1))
    
    if use_default_enc==1:
        env_path = Path('.') / '.env'
        # env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
        
        print("Using default .env file ", env_path)
        
        load_dotenv(dotenv_path=env_path)
        
        print("HPC Endpoint: ", os.getenv("HPC_ENDPOINT", "NOT FOUND"))
        
        load_dotenv(dotenv_path=env_path)

    # Default configuration
    default_config = {
        "CHAT_URL"              : "http://localhost:8000/query",
        "HPC_ENDPOINT"          : "http://localhost",
        "HPC_ENDPOINT_PORT"     : "6010",
        "FILESTORAGE_ENDPOINT"  : "http://localhost:6010",
        "LOCAL_ENV"             : "1",
        "local_data_endpoint"   : "http://localhost:5500",   
        "BASE_NODE_RPC_ENDPOINT": "https://base-sepolia-rpc.publicnode.com"
    }

    # Get configuration from environment variables with fallback to defaults
    config = {
        "CHAT_URL": os.getenv("CHAT_URL", default_config["CHAT_URL"]),
        "Load_balancer_Endpoints": 
            {
                "hpcEndpoint"       : os.getenv("HPC_ENDPOINT", default_config["HPC_ENDPOINT"]),
                "hpcEndpointPort"   : os.getenv("HPC_ENDPOINT_PORT", default_config["HPC_ENDPOINT_PORT"]),
            },
        "filestorage_endpoint"  : os.getenv("FILESTORAGE_ENDPOINT", default_config["FILESTORAGE_ENDPOINT"]),
        "LOCAL_ENV"             : os.getenv("LOCAL_ENV", default_config["LOCAL_ENV"]),
        "local_data_endpoint"   : os.getenv("LOCAL_DATA_ENDPOINT", default_config["local_data_endpoint"]),
        "BASE_NODE_RPC_ENDPOINT": os.getenv("BASE_NODE_RPC_ENDPOINT", default_config["BASE_NODE_RPC_ENDPOINT"]),
    }
    
    return config
