import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from fastapi import FastAPI
from pydantic import BaseModel
from llama_index.core import SimpleDirectoryReader
from llama_index.embeddings.langchain import LangchainEmbedding
from langchain.embeddings import HuggingFaceEmbeddings
from llama_index.llms.ollama import Ollama
from typing import List

app = FastAPI()

# Load documents and generate embeddings (you might want to do this in a separate script)
# documents = SimpleDirectoryReader('./documents').load_data()
embed_model = LangchainEmbedding(HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2"))
# texts = [doc.text for doc in documents]
# embeddings = embed_model.get_text_embedding_batch(texts)
# embeddings_array = np.array(embeddings)

# Set up the Llama model
llm = Ollama(model="llama3.1", base_url="http://ollama:11434")

def query_documents(query_text, embeddings_array,documents, top_k=3):
    query_embedding = embed_model.get_text_embedding(query_text)
    similarities = cosine_similarity([query_embedding], embeddings_array)[0]
    top_indices = similarities.argsort()[-top_k:][::-1]
    results = []
    for idx in top_indices:
        results.append({
            'text': documents[idx]['text'],
            'similarity': similarities[idx],
        })
    return results

def generate_answer(query, context):
    prompt = f"""Context information is below.
---------------------
{context}
---------------------
Given the context information and not prior knowledge, answer the query.
Query: {query}
Answer: """
    response = llm.complete(prompt)
    return response.text

class Query(BaseModel):
    query: str
    embeddings: List[List[float]]
    document: list

@app.post("/query")
async def rag_pipeline(query: Query):
    relevant_docs = query_documents(query.query,query.embeddings,query.document)
    context = "\n\n".join([doc['text'] for doc in relevant_docs])
    answer = generate_answer(query.query, context)
    return {"query": query.query, "answer": answer}