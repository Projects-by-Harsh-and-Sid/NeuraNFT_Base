# NeuraNFT

NeuraNFT is a pioneering platform built on the Tron blockchain that aims to tokenize intelligence. It enables the creation of NFTs representing AI models and data, with a sophisticated permission management system for granular control over access and usage rights. By addressing key challenges in the current AI ecosystem, NeuraNFT seeks to create a more equitable, secure, and innovative environment for AI development and deployment.

## Table of Contents

- [Documentation](#documentation)
- [Key Features](#key-features)
- [Problem Statement](#problem-statement)
- [Architecture](#architecture)
- [Technologies Used](#technologies-used)
- [Smart Contracts](#smart-contracts)
- [Future Developments](#future-developments)

## Documentation

We have detailed documentation available in the `/smart_contracts/` directory to help you understand and work with the NeuraNFT smart contracts:

1. [Overview](/smart_contracts/01_overview.md): Provides a general overview of the NeuraNFT smart contract system and its components.

2. [Compiling Smart Contracts](/smart_contracts/02_compiling_smart_contracts.md): Explains the process of compiling the smart contracts and outlines the project structure.

3. [Migration](/smart_contracts/03_migration.md): Details the deployment script and process, including updates to the Solidity version 0.8.7.

4. [Testing on CLI](/smart_contracts/04_testing_on_cli.md): Guides you through testing the smart contracts using the command-line interface.

5. [Code Testing](/smart_contracts/05_code_testing.md): Covers the code testing process and best practices for ensuring contract reliability.

6. [Build Data Use in React WebApp](/smart_contracts/06_build_data_use_in_react_webapp.md): Explains how to integrate the compiled contract data into a React web application.

For Information about the HPC node setup, please refer to the `/hpc_node/` document:

1. [HPC Node Setup](/hpc_node/hpc_node.md): Provides a detailed guide on setting up the HPC nodes for the NeuraNFT platform.

These documents provide comprehensive guidance on working with the NeuraNFT smart contracts, from compilation to testing and integration with the frontend.


## Key Features

1. **NFT Creation for AI Models and Data**: Tokenize AI models and datasets as unique digital assets.
2. **Granular Permission Management**: Fine-tuned access control for different levels of data and model usage.
3. **Secure, Encrypted Data Storage**: Utilizes BTFS (BitTorrent File System) for decentralized and secure storage.
4. **Controlled Access to Models and Data**: Smart contract-based access control ensures only authorized users can interact with the assets.
5. **Secure Model Deployment and Inference**: Enables secure deployment and use of AI models without compromising intellectual property.
6. **AI Marketplace**: A decentralized marketplace for buying, selling, and leasing AI models and datasets.

## Problem Statement

NeuraNFT addresses several key challenges in the current AI ecosystem:

- Lack of control and fair compensation for data owners
- Difficulties for independent creators in monetizing their innovations
- Limited data control and high costs for end users
- Corporate hesitation to use centrally deployed models due to data privacy concerns
- IP infringement risks for model owners when hosting on client servers
- Limited true ownership and transferability of AI assets
- Inefficient resource management for personalized AI

## Architecture

NeuraNFT's architecture is designed with security, scalability, and user control at its forefront. It consists of several key components:

### Smart Contracts
- **MasterAccessControl**: Manages overall access rights across the platform.
- **NFTAccessControl**: Handles granular permissions for individual NFTs.
- **NFTMetadata**: Stores and manages metadata for NFTs.
- **NFTContract**: Implements core NFT functionality (minting, transferring, etc.).
- **CollectionContract**: Manages collections of NFTs.

### BTFS (BitTorrent File System)
Used for secure, decentralized storage of encrypted data and RAG (Retrieval-Augmented Generation) models.

### Balancer Nodes
Responsible for verifying access requests, ensuring only authorized parties can interact with the models and data.

### Frontend
- Provides user interface for interacting with the platform.
- Handles message signing for verification purposes.

### Backend
- Manages signature verification.
- Performs permission checks.
- Handles data decryption and model deployment.

### Operational Flow
1. User creates an NFT representing their AI model or dataset.
2. Owner grants varying levels of permissions to other users.
3. Data is encrypted and stored on BTFS.
4. For access requests, a balancer node sends a verification message.
5. Frontend signs the message and sends it to the backend.
6. Backend verifies the signature and checks permissions.
7. If permissions match, data is decrypted or model is deployed for inference.

## Technologies Used

- **Tron Blockchain**: Foundation of the decentralized system.
- **Smart Contracts (Solidity)**: Implements core logic for NFTs and permissions.
- **BTFS (BitTorrent File System)**: Decentralized storage for encrypted data and models.
- **React**: Powers the frontend user interface.
- **Python**: Drives backend operations.
- **Python Encryption Libraries**: Ensure data security throughout the system.

## Smart Contracts

The following smart contracts have been deployed on the Shasta testnet:

- MasterAccessControl: [TPbvJsUGhCHGmqxvKHFoheXRLXq64jiX58](https://shasta.tronscan.org/#/address/TPbvJsUGhCHGmqxvKHFoheXRLXq64jiX58)
- NFTAccessControl: [TNsS3gDQ8f21jUc3u43C8TydgBJuv1E9BS](https://shasta.tronscan.org/#/address/TNsS3gDQ8f21jUc3u43C8TydgBJuv1E9BS)
- NFTMetadata: [TV4YumwT2x6h6LhyNXwo1xZAG6yRDRL9oe](https://shasta.tronscan.org/#/address/TV4YumwT2x6h6LhyNXwo1xZAG6yRDRL9oe)
- NFTContract: [TAc8weMCEvi4WGq5LbXUGYMMWLWXK9HvKA](https://shasta.tronscan.org/#/address/TAc8weMCEvi4WGq5LbXUGYMMWLWXK9HvKA)
- CollectionContract: [TKcJXQ32KMZhwZCccb6XQ51VJ79Yna4JhX](https://shasta.tronscan.org/#/address/TKcJXQ32KMZhwZCccb6XQ51VJ79Yna4JhX)

## Future Developments

1. **Smart Contract Optimization**: Refine contracts for better performance and lower fees.
2. **Advanced NFT Functionalities**: Implement model combination and fractional ownership features.
3. **Robust Marketplace Development**: Create a comprehensive marketplace with advanced search and discovery features.
4. **Governance Mechanisms**: Introduce decentralized governance for community-driven decision-making.
5. **Expanded Compute Network**: Develop a more efficient decentralized compute network for model deployment.
6. **AI-to-AI Interaction Protocols**: Enable secure interactions between AI models within the ecosystem.
7. **Cross-chain Interoperability**: Explore integration with other blockchain networks.
8. **Industry Partnerships**: Establish partnerships with AI researchers, companies, and institutions.

## Architecture Diagram

```mermaid
graph LR
    UI[User Interface]
    TW[Tron Wallet]

    UI --> TW
    UI --"User Actions"-->BS
    TW --"Sign & Execute Contracts"-->SC

    subgraph "User Interaction Layer"
        UI --"UI Webpage"--- UI
        TW --"NFT Creation & Metadata Update"--- TW
    end

    subgraph "Backend Services"
        direction TB
        BS[Backend System]
        UV[User Verification]
        AC[Access Check]
        ED[Data Encryption/Decryption]
        MI[Model Interface]
        API[Other APIs]
        BS --> UV
        BS --> AC
        BS --> ED
        BS --> MI
        BS --> API
    end

    BS --"Data Storage/Retrieval"-->BTFS
    BS --"Compute Tasks"-->HPC
    AC --"Verify Permissions"-->SC

    BTFS[BTFS Storage]

    subgraph "HPC Nodes"
        HPC[High-Performance Computing]
        SN1[Node 1: Model Training]
        SN2[Node 2: Inference]
        SN3[Node 3: Fine-tuning]
        HPC --> SN1
        HPC --> SN2
        HPC --> SN3
    end

    subgraph "Tron Network Smart Contracts"
        SC[Smart Contracts]
        NFT[NFT Contract]
        ACC[Access Control Contract]
        MD[Metadata Contract]
        CC[Collection Contract]
        MAC[Master Access Control]
        SC --> NFT
        SC --> ACC
        SC --> MD
        SC --> CC
        SC --> MAC
        NFT --"ownerOf()"-->NFT
        ACC --"checkAccess()"-->MAC
        MD --"getMetadata()"-->MD
        CC --"getCollectionInfo()"-->CC
        MAC --"hasAccess()"-->MAC
    end

    classDef default fill:#f0f0f0,stroke:#333,stroke-width:2px,color:#000;
    classDef tron fill:#ffd700,stroke:#333,stroke-width:2px,color:#000;
    classDef computing fill:#87cefa,stroke:#333,stroke-width:2px,color:#000;
    classDef storage fill:#90EE90,stroke:#333,stroke-width:2px,color:#000;
    classDef backend fill:#ff6347,stroke:#333,stroke-width:2px,color:#000;
    classDef user fill:#c8a2c8,stroke:#333,stroke-width:2px,color:#000;

    class SC,NFT,ACC,MD,CC,MAC tron;
    class HPC,SN1,SN2,SN3 computing;
    class BTFS storage;
    class BS,UV,AC,ED,MI,API backend;
    class UI,TW user;
```