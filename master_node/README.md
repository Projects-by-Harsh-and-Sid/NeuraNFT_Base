# Flask-based Chat API with Document Embeddings

This project provides a Flask-based API for document embedding and chat functionality. It allows users to upload documents, generate embeddings, and interact with a chat system based on those embeddings.

## Prerequisites

Before you begin, ensure you have met the following requirements:

* You have a working Python environment (3.7+)
* You have Conda installed on your system

## Setting Up the Environment

1. Create a new Conda environment:

   ```
   conda create -n chat-api python=3.8
   ```

2. Activate the environment:

   ```
   conda activate chat-api
   ```

3. Install the required packages:

   ```
   pip install -r requirements.txt
   ```

## Configuration

Set the following environment variables or update them in the script:

- `JWT_SECRET_KEY`: Secret key for JWT token generation (default: 'chatwithme')
- `CHAT_URL`: URL for the chat service (default: 'http://localhost:8000/query')
- `MASTER_API_KEY`: Master API key for authentication (default: '1234567890')

## Running the Application

To run the application, execute:

```
python flask_server_docker.py
```

The server will start on port 5996 with SSL enabled. Make sure you have the `certificate.crt` and `private.key` files in the same directory.

## API Endpoints

- `/get_temp_api_key` (POST): Get a temporary API key
- `/api/start_chat` (POST): Start a chat session
- `/api/chat` (POST): Send a chat message
- `/make_embedding` (POST): Generate embeddings for uploaded documents
- `/start_chat` (POST): Initiate a chat session
- `/chat` (POST): Send a chat message (alternative endpoint)

## Security

This application uses JWT for authentication and HTTPS for secure communication. Ensure to keep your secret keys and SSL certificates secure.

## embeddings.py

The `embeddings.py` file contains functions for generating embeddings from documents and converting document objects to dictionaries.

### Functions

1. `get_embeddings(directory)`: Generates embeddings for documents in the specified directory.
2. `document_to_dict(doc)`: Converts a Document object to a dictionary.
3. `get_documents(directory)`: Loads documents from a directory and converts them to a list of dictionaries.

## API Testing (api_test.ipynb)

The `api_test.ipynb` Jupyter notebook demonstrates how to interact with the API endpoints. Here's a breakdown of the notebook:

1. **Initiating a chat session**:
   - Makes a POST request to the `/api/start_chat` endpoint with an API key.
   - Retrieves a JWT token and model URL from the response.

2. **Sending a chat message**:
   - Uses the JWT token to authenticate a POST request to the `/api/chat` endpoint.
   - Sends a query and receives a response from the chat model.

### Example Usage

```python
import requests

# Start chat session
api_key = "your_api_key_here"
start_chat_url = "https://your-api-url.com/api/start_chat"
response = requests.post(start_chat_url, headers={"X-API-Key": api_key})
jwt_token = response.json()["jwt_token"]
model_url = response.json()["url"]

# Send chat message
chat_url = "https://your-api-url.com/api/chat"
query = "Your question here"
response = requests.post(
    chat_url,
    headers={"Authorization": jwt_token},
    json={"query": query, "url": model_url}
)

print(response.json()["query"])
print(response.json()["answer"])
```

## Note

This is a development server. For production deployment, consider using a production-grade WSGI server and implement proper security measures.


