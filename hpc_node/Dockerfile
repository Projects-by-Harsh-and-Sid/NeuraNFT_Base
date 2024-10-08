# Use the official Ollama image
FROM ollama/ollama:latest

# Set the working directory
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl

# Expose the default Ollama port
EXPOSE 11434

# Create a startup script
RUN echo '#!/bin/sh\n\
ollama serve &\n\
sleep 10\n\
ollama pull llama3.1\n\
wait' > /app/start.sh && chmod +x /app/start.sh

# Set the entrypoint to our startup script
ENTRYPOINT ["/app/start.sh"]