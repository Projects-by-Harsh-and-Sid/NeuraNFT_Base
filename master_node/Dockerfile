# Use the official Python image from DockerHub
FROM python:3.12-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY requirement.txt /app/requirement.txt
# Install Python dependencies from requirements.txt
RUN pip install --no-cache-dir -r /app/requirement.txt

# Expose port 5500 for the Flask app
EXPOSE 5500

# # Run the Flask application
# CMD ["python", "app.py"]
