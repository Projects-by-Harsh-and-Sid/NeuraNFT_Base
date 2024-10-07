# Use OpenJDK 8 as the base image
FROM openjdk:8-jdk

# Install required packages
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    unzip \
    git \
    python3 \
    python3-pip \
    python3-venv \
    nodejs \
    npm \
    jq \
    gettext

# Set up JAVA_HOME
ENV JAVA_HOME=/usr/local/openjdk-8

# Create working directory
RUN mkdir /tron
WORKDIR /tron

# Download FullNode.jar
RUN wget https://github.com/tronprotocol/java-tron/releases/download/GreatVoyage-v4.7.6/FullNode.jar

# Set up Python virtual environment and install dependencies
RUN python3 -m venv /tron/venv
ENV PATH="/tron/venv/bin:$PATH"
RUN pip install --upgrade pip && pip install tronpy

# Install tronweb locally in /tron
RUN npm install tronweb

# Copy configuration files and scripts
COPY start_tron.sh /tron/
COPY generate_sr_account.py /tron/
COPY generate_accounts.py /tron/
COPY private_net_config.conf.template /tron/
COPY modify_parameters.js /tron/

# Expose necessary ports
EXPOSE 9090 8090 50051

# Set environment variables
ENV accounts=20 \
    defaultBalance=10000000000000 \
    formatJson=false

# Start the TRON node and generate accounts
CMD ["/bin/bash", "start_tron.sh"]
