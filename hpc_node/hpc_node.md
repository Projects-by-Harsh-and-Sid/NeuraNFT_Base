## Table of Contents
1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Components](#components)
4. [Setup and Installation](#setup-and-installation)
5. [Usage](#usage)
6. [API Reference](#api-reference)
7. [Configuration](#configuration)
8. [Performance Considerations](#performance-considerations)
9. [Troubleshooting](#troubleshooting)


## Overview

This project implements a containerized Retrieval-Augmented Generation (RAG) pipeline using the LLAMA3 language model. It combines document embedding, semantic search, and natural language generation to answer queries based on a given set of documents. The system is designed to be scalable and easily deployable using Docker.

Key features:
- Utilizes LLAMA3, a state-of-the-art language model
- Implements a RAG pipeline for improved question answering
- Uses FastAPI for a high-performance web API
- Containerized with Docker for easy deployment and scaling

## Project Structure

```
.
├── docker-compose.yaml
├── Dockerfile
├── Dockerfile.rag
├── main.py
├── requirements.txt
├── start.sh
└── documents/
    └── [document files]
```

- `docker-compose.yaml`: Defines and configures the services (Ollama and RAG service).
- `Dockerfile`: Defines the Docker image for the Ollama service.
- `Dockerfile.rag`: Defines the Docker image for the RAG service.
- `main.py`: Contains the FastAPI application and RAG pipeline logic.
- `requirements.txt`: Lists all Python dependencies.
- `start.sh`: Shell script to initialize Ollama and pull the LLAMA3 model.
- `documents/`: Directory containing the documents to be processed (not included in the repository).

## Components

### 1. FastAPI Application
- Handles incoming HTTP requests
- Coordinates the RAG pipeline
- Provides API endpoints for querying the system

### 2. Ollama
- Runs the LLAMA3 language model
- Provides an API for text generation

### 3. Document Embedding
- Uses HuggingFace's sentence transformers (specifically "sentence-transformers/all-MiniLM-L6-v2")
- Generates dense vector representations of documents and queries

### 4. RAG Pipeline
- Retrieves relevant documents based on query similarity
- Generates answers using the LLAMA3 model and retrieved context

## Setup and Installation

1. Prerequisites:
   - Docker
   - Docker Compose
   - Git

2. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

3. (Optional) Place your documents in the `documents/` directory.

4. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

This command will:
- Build the Docker images for both services
- Start the Ollama service and pull the LLAMA3 model
- Start the RAG service with the FastAPI application

## Usage

Once the services are up and running, you can interact with the RAG pipeline through the FastAPI endpoint.

### Making a Query

Send a POST request to `http://localhost:8000/query` with the following JSON body:

```json
{
  "query": "Your question here",
  "embeddings": [[0.1, 0.2, ..., 0.5], ...],
  "document": [
    {"text": "Document 1 content", "metadata": {...}},
    {"text": "Document 2 content", "metadata": {...}},
    ...
  ]
}
```

- `query`: The question you want to ask.
- `embeddings`: Pre-computed document embeddings. Each embedding should be a list of floats.
- `document`: A list of document objects, each containing the text and any relevant metadata.

### Example using curl:

```bash
curl -X POST "http://localhost:8000/query" \
     -H "Content-Type: application/json" \
     -d '{"query": "What is LLAMA3?", "embeddings": [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]], "document": [{"text": "LLAMA3 is a large language model.", "metadata": {}}, {"text": "It was developed by Meta.", "metadata": {}}]}'
```

## API Reference

### POST /query

Processes a query using the RAG pipeline.

Request body:
- `query` (string, required): The question to be answered.
- `embeddings` (array of arrays of floats, required): Pre-computed document embeddings.
- `document` (array of objects, required): List of document objects, each containing:
  - `text` (string, required): The document text.
  - `metadata` (object, optional): Any additional metadata for the document.

Response:
- `query` (string): The original query.
- `answer` (string): The generated answer.

## Configuration

### Environment Variables

- `OLLAMA_BASE_URL`: URL for the Ollama service (default: "http://ollama:11434")
- `LLAMA_MODEL`: LLAMA model to use (default: "llama3.1")
- `TOP_K`: Number of top similar documents to retrieve (default: 3)

These can be set in the `docker-compose.yaml` file.

## Performance Considerations

- The performance of the RAG pipeline heavily depends on the size and complexity of the LLAMA3 model used.
- For large document sets, consider pre-computing and storing embeddings to reduce query time.
- Adjust the `TOP_K` parameter to balance between accuracy and speed.

## Troubleshooting

1. **Ollama service fails to start**: 
   - Ensure you have sufficient system resources, especially if using the 70B parameter version of LLAMA3.
   - Check Ollama logs: `docker-compose logs ollama`

2. **RAG service cannot connect to Ollama**:
   - Verify that the Ollama service is running: `docker-compose ps`
   - Check if the `OLLAMA_BASE_URL` is correctly set in the `docker-compose.yaml` file.

3. **Out of memory errors**:
   - Consider using a smaller LLAMA3 model or increasing the available memory for Docker.
