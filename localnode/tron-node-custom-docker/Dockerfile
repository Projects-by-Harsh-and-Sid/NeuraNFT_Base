# Use Ubuntu 24.04 as the base image
FROM ubuntu:24.04

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Install required packages
RUN apt-get update && apt-get install -y \
    openjdk-8-jdk \
    wget \
    curl \
    unzip \
    git \
    python3-full \
    python3-pip \
    python3-venv \
    nodejs \
    npm

# Set up JAVA_HOME
ENV JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64

# Download and set up TRON FullNode
RUN mkdir /tron && cd /tron \
    && wget https://raw.githubusercontent.com/tronprotocol/tron-deployment/master/main_net_config.conf \
    && wget https://github.com/tronprotocol/java-tron/releases/download/GreatVoyage-v4.7.6/FullNode.jar



# Set up Python virtual environment and install dependencies
RUN python3 -m venv /tron/venv
ENV PATH="/tron/venv/bin:$PATH"
RUN pip install --upgrade pip && pip install tronpy

# Set up Node.js environment
RUN npm install -g tronweb

# Copy configuration files and scripts
COPY start_tron.sh /tron/
COPY generate_accounts.py /tron/
COPY private_net_config.conf /tron/


# Expose necessary ports
EXPOSE 9090 8090 50051

# Set environment variables
ENV accounts=20 \
    useDefaultPrivateKey=false \
    defaultBalance=100000 \
    formatJson=false



# Set the working directory
WORKDIR /tron

# Start the TRON node and generate accounts
CMD ["/bin/bash", "start_tron.sh"]