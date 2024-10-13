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

These documents provide comprehensive guidance on working with the NeuraNFT smart contracts, from compilation to testing and integration with the frontend.

For Information about the HPC node setup, please refer to the `/hpc_node/` document:

1. [HPC Node Setup](/hpc_node/hpc_node.md): Provides a detailed guide on setting up the HPC nodes for the NeuraNFT platform.



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

## Smart Contracts Architecture

```mermaid
digraph G {
  graph [ratio="auto", page="100", compound=true, bgcolor="white"];
  node [style="filled", fillcolor="#2E2E38", color="#2E2E38", penwidth=3, fontcolor="#0B192C"];
  edge [color="#FFFFFF", penwidth=2, fontname="Helvetica", fontcolor="#0B192C"];

  subgraph "clusterCollectionContract" {
    graph [label="CollectionContract", color="#F3F8FF", fontcolor="#0B192C", style="rounded", bgcolor="#F3F8FF"];
    "CollectionContract.<Constructor>" [label="<Constructor>", fillcolor="#98E4FF", fontcolor="#0B192C"];
    "CollectionContract.onlyAuthorized" [label="onlyAuthorized", fillcolor="#73EC8B", fontcolor="#0B192C", shape=doubleoctagon];
    "CollectionContract.onlyCollectionOwner" [label="onlyCollectionOwner", fillcolor="#73EC8B", fontcolor="#0B192C", shape=doubleoctagon];
    "CollectionContract.createCollection" [label="createCollection", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "CollectionContract.updateCollection" [label="updateCollection", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "CollectionContract.transferCollection" [label="transferCollection", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "CollectionContract.getCollectionMetadata" [label="getCollectionMetadata", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "CollectionContract.getCollectionOwner" [label="getCollectionOwner", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "CollectionContract.getTotalCollections" [label="getTotalCollections", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "CollectionContract.getAllCollections" [label="getAllCollections", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "CollectionContract.getCollectionNFTCount" [label="getCollectionNFTCount", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "CollectionContract.getCollectionUniqueHolders" [label="getCollectionUniqueHolders", fillcolor="#FFBF78", fontcolor="#0B192C"];

    "CollectionContract.collections" [label="collections\n(mapping)", shape="rectangle", fillcolor="#76B7B2", fontcolor="#0B192C"];
    "CollectionContract.collectionOwners" [label="collectionOwners\n(mapping)", shape="rectangle", fillcolor="#76B7B2", fontcolor="#0B192C"];
    "CollectionContract.totalCollections" [label="totalCollections\n(uint256)", shape="rectangle", fillcolor="#76B7B2", fontcolor="#0B192C"];
  }

  subgraph "clusterMasterAccessControl" {
    graph [label="MasterAccessControl", color="#F3F8FF", fontcolor="#0B192C", style="rounded", bgcolor="#F3F8FF"];
    "MasterAccessControl.grantSelfAccess" [label="grantSelfAccess", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "MasterAccessControl.selfCheckAccess" [label="selfCheckAccess", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "MasterAccessControl.onlyAuthorized" [label="onlyAuthorized", fillcolor="#73EC8B", fontcolor="#0B192C", shape=doubleoctagon];
    "MasterAccessControl.<Constructor>" [label="<Constructor>", fillcolor="#98E4FF", fontcolor="#0B192C"];
    "MasterAccessControl.grantAccess" [label="grantAccess", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "MasterAccessControl.revokeAccess" [label="revokeAccess", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "MasterAccessControl.revokeSelfAccess" [label="revokeSelfAccess", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "MasterAccessControl.hasAccess" [label="hasAccess", fillcolor="#98E4FF", fontcolor="#0B192C"];

    "MasterAccessControl.accessRights" [label="accessRights\n(mapping)", shape="rectangle", fillcolor="#76B7B2", fontcolor="#0B192C"];
  }

  subgraph "clusterERC721Collection" {
    graph [label="ERC721Collection", color="#F3F8FF", fontcolor="#0B192C", style="rounded", bgcolor="#F3F8FF"];
    "ERC721Collection.balanceOf" [label="balanceOf", fillcolor="#98E4FF", fontcolor="#0B192C"];
    "ERC721Collection.balanceOfCollection" [label="balanceOfCollection", fillcolor="#98E4FF", fontcolor="#0B192C"];
    "ERC721Collection.ownerOf" [label="ownerOf", fillcolor="#98E4FF", fontcolor="#0B192C"];
    "ERC721Collection.safeTransferFrom" [label="safeTransferFrom", fillcolor="#98E4FF", fontcolor="#0B192C"];
    "ERC721Collection.transferFrom" [label="transferFrom", fillcolor="#98E4FF", fontcolor="#0B192C"];
    "ERC721Collection.approve" [label="approve", fillcolor="#98E4FF", fontcolor="#0B192C"];
    "ERC721Collection.setApprovalForAll" [label="setApprovalForAll", fillcolor="#98E4FF", fontcolor="#0B192C"];
    "ERC721Collection.getApproved" [label="getApproved", fillcolor="#98E4FF", fontcolor="#0B192C"];
    "ERC721Collection.isApprovedForAll" [label="isApprovedForAll", fillcolor="#98E4FF", fontcolor="#0B192C"];
  }

  subgraph "clusterNFTContract" {
    graph [label="NFTContract", color="#F3F8FF", fontcolor="#0B192C", style="rounded", bgcolor="#F3F8FF"];
    "NFTContract.getCollectionNFTCount" [label="getCollectionNFTCount", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "NFTContract.numberOfHolders" [label="numberOfHolders", fillcolor="#98E4FF", fontcolor="#0B192C"];
    "NFTContract.<Constructor>" [label="<Constructor>", fillcolor="#98E4FF", fontcolor="#0B192C"];
    "NFTContract.onlyAuthorized" [label="onlyAuthorized", fillcolor="#73EC8B", fontcolor="#0B192C", shape=doubleoctagon];
    "NFTContract.onlyNFTOwner" [label="onlyNFTOwner", fillcolor="#73EC8B", fontcolor="#0B192C", shape=doubleoctagon];
    "NFTContract.createNFT" [label="createNFT", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "NFTContract.burnNFT" [label="burnNFT", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "NFTContract.transferNFT" [label="transferNFT", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "NFTContract.getNFTInfo" [label="getNFTInfo", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "NFTContract.getCollectionNFTs" [label="getCollectionNFTs", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "NFTContract.balanceOf" [label="balanceOf", fillcolor="#98E4FF", fontcolor="#0B192C"];
    "NFTContract.balanceOfCollection" [label="balanceOfCollection", fillcolor="#98E4FF", fontcolor="#0B192C"];
    "NFTContract.ownerOf" [label="ownerOf", fillcolor="#98E4FF", fontcolor="#0B192C"];
    "NFTContract.safeTransferFrom" [label="safeTransferFrom", fillcolor="#98E4FF", fontcolor="#0B192C"];
    "NFTContract.transferFrom" [label="transferFrom", fillcolor="#98E4FF", fontcolor="#0B192C"];
    "NFTContract.approve" [label="approve", fillcolor="#98E4FF", fontcolor="#0B192C"];
    "NFTContract.setApprovalForAll" [label="setApprovalForAll", fillcolor="#98E4FF", fontcolor="#0B192C"];
    "NFTContract.getApproved" [label="getApproved", fillcolor="#98E4FF", fontcolor="#0B192C"];
    "NFTContract.isApprovedForAll" [label="isApprovedForAll", fillcolor="#98E4FF", fontcolor="#0B192C"];
    "NFTContract._exists" [label="_exists", fillcolor="#FF8080", fontcolor="#0B192C"];
    "NFTContract._isApprovedOrOwner" [label="_isApprovedOrOwner", fillcolor="#FF8080", fontcolor="#0B192C"];
    "NFTContract._transfer" [label="_transfer", fillcolor="#FF8080", fontcolor="#0B192C"];
    "NFTContract._checkOnERC721Received" [label="_checkOnERC721Received", fillcolor="#FF8080", fontcolor="#0B192C"];

    "NFTContract.nfts" [label="nfts\n(mapping)", shape="rectangle", fillcolor="#76B7B2", fontcolor="#0B192C"];
    "NFTContract.collectionNFTCount" [label="collectionNFTCount\n(mapping)", shape="rectangle", fillcolor="#76B7B2", fontcolor="#0B192C"];
    "NFTContract.balances" [label="balances\n(mapping)", shape="rectangle", fillcolor="#76B7B2", fontcolor="#0B192C"];
    "NFTContract.balanceCollection" [label="balanceCollection\n(mapping)", shape="rectangle", fillcolor="#76B7B2", fontcolor="#0B192C"];
    "NFTContract.tokenApprovals" [label="tokenApprovals\n(mapping)", shape="rectangle", fillcolor="#76B7B2", fontcolor="#0B192C"];
    "NFTContract.operatorApprovals" [label="operatorApprovals\n(mapping)", shape="rectangle", fillcolor="#76B7B2", fontcolor="#0B192C"];
    "NFTContract.nextTokenId" [label="nextTokenId\n(mapping)", shape="rectangle", fillcolor="#76B7B2", fontcolor="#0B192C"];
  }

  subgraph "clusterIERC721Receiver" {
    graph [label="IERC721Receiver (iface)", color="#F3F8FF", fontcolor="#0B192C", style="rounded", bgcolor="#F3F8FF"];
    "IERC721Receiver.onERC721Received" [label="onERC721Received", fillcolor="#FFBF78", fontcolor="#0B192C"];
  }

  subgraph "clusterNFTAccessControl" {
    graph [label="NFTAccessControl", color="#F3F8FF", fontcolor="#0B192C", style="rounded", bgcolor="#F3F8FF"];
    "NFTAccessControl.grantAccess" [label="grantAccess", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "NFTAccessControl.revokeAccess" [label="revokeAccess", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "NFTAccessControl.getAccessLevel" [label="getAccessLevel", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "NFTAccessControl.<Constructor>" [label="<Constructor>", fillcolor="#98E4FF", fontcolor="#0B192C"];
    "NFTAccessControl.onlyAuthorized" [label="onlyAuthorized", fillcolor="#73EC8B", fontcolor="#0B192C", shape=doubleoctagon];
    "NFTAccessControl.onlyAuthorizedOrOwner" [label="onlyAuthorizedOrOwner", fillcolor="#73EC8B", fontcolor="#0B192C", shape=doubleoctagon];
    "NFTAccessControl.maxAccessLevelCheck" [label="maxAccessLevelCheck", fillcolor="#73EC8B", fontcolor="#0B192C", shape=doubleoctagon];
    "NFTAccessControl.setMaxAccessLevel" [label="setMaxAccessLevel", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "NFTAccessControl.setDefaultAccessLevel" [label="setDefaultAccessLevel", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "NFTAccessControl._updateUserAccessList" [label="_updateUserAccessList", fillcolor="#FF8080", fontcolor="#0B192C"];
    "NFTAccessControl._updateNFTAccessList" [label="_updateNFTAccessList", fillcolor="#FF8080", fontcolor="#0B192C"];
    "NFTAccessControl._updateUserAccessListOnRevoke" [label="_updateUserAccessListOnRevoke", fillcolor="#FF8080", fontcolor="#0B192C"];
    "NFTAccessControl._updateNFTAccessListOnRevoke" [label="_updateNFTAccessListOnRevoke", fillcolor="#FF8080", fontcolor="#0B192C"];
    "NFTAccessControl.getAllAccessForUser" [label="getAllAccessForUser", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "NFTAccessControl.checkMinimumAccess" [label="checkMinimumAccess", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "NFTAccessControl.getAllUsersAccessForNFT" [label="getAllUsersAccessForNFT", fillcolor="#FFBF78", fontcolor="#0B192C"];

    "NFTAccessControl.nftAccess" [label="nftAccess\n(mapping)", shape="rectangle", fillcolor="#76B7B2", fontcolor="#0B192C"];
    "NFTAccessControl.defaultAccessLevel" [label="defaultAccessLevel\n(mapping)", shape="rectangle", fillcolor="#76B7B2", fontcolor="#0B192C"];
    "NFTAccessControl.maxAccessLevel" [label="maxAccessLevel\n(mapping)", shape="rectangle", fillcolor="#76B7B2", fontcolor="#0B192C"];
    "NFTAccessControl.userAccess" [label="userAccess\n(mapping)", shape="rectangle", fillcolor="#76B7B2", fontcolor="#0B192C"];
    "NFTAccessControl.userAccessList" [label="userAccessList\n(mapping)", shape="rectangle", fillcolor="#76B7B2", fontcolor="#0B192C"];
    "NFTAccessControl.userAccessIndex" [label="userAccessIndex\n(mapping)", shape="rectangle", fillcolor="#76B7B2", fontcolor="#0B192C"];
    "NFTAccessControl.nftAccessList" [label="nftAccessList\n(mapping)", shape="rectangle", fillcolor="#76B7B2", fontcolor="#0B192C"];
    "NFTAccessControl.nftAccessIndex" [label="nftAccessIndex\n(mapping)", shape="rectangle", fillcolor="#76B7B2", fontcolor="#0B192C"];
  }

  subgraph "clusterNFTMetadata" {
    graph [label="NFTMetadata", color="#F3F8FF", fontcolor="#0B192C", style="rounded", bgcolor="#F3F8FF"];
    "NFTMetadata.metadataExists" [label="metadataExists", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "NFTMetadata.deleteMetadata" [label="deleteMetadata", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "NFTMetadata.<Constructor>" [label="<Constructor>", fillcolor="#98E4FF", fontcolor="#0B192C"];
    "NFTMetadata.onlyAuthorized" [label="onlyAuthorized", fillcolor="#73EC8B", fontcolor="#0B192C", shape=doubleoctagon];
    "NFTMetadata.onlyAuthorizedEditData" [label="onlyAuthorizedEditData", fillcolor="#73EC8B", fontcolor="#0B192C", shape=doubleoctagon];
    "NFTMetadata.createMetadata" [label="createMetadata", fillcolor="#98E4FF", fontcolor="#0B192C"];
    "NFTMetadata.replicateNFT" [label="replicateNFT", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "NFTMetadata.updateMetadata" [label="updateMetadata", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "NFTMetadata.getMetadata" [label="getMetadata", fillcolor="#FFBF78", fontcolor="#0B192C"];
    "NFTMetadata._metadataExists" [label="_metadataExists", fillcolor="#FF8080", fontcolor="#0B192C"];

    "NFTMetadata.metadataMap" [label="metadataMap\n(mapping)", shape="rectangle", fillcolor="#76B7B2", fontcolor="#0B192C"];
    "NFTMetadata.replicaMap" [label="replicaMap\n(mapping)", shape="rectangle", fillcolor="#76B7B2", fontcolor="#0B192C"];
  }

   // ---------------------------- Function Calls ---------------------------- //

  // Edges for function calls
  "CollectionContract.<Constructor>";
  "MasterAccessControl.grantSelfAccess";
  "CollectionContract.onlyAuthorized";
  "MasterAccessControl.selfCheckAccess";
  "CollectionContract.getCollectionNFTCount";
  "NFTContract.getCollectionNFTCount";
  "CollectionContract.getCollectionUniqueHolders";
  "NFTContract.numberOfHolders";
  "MasterAccessControl.onlyAuthorized";
  "MasterAccessControl.hasAccess";
  "NFTContract.<Constructor>";
  "NFTContract.onlyAuthorized";
  "NFTContract.createNFT";
  "NFTAccessControl.grantAccess";
  "NFTContract.burnNFT";
  "NFTMetadata.metadataExists";
  "NFTMetadata.deleteMetadata";
  "NFTAccessControl.revokeAccess";
  "NFTContract.transferNFT";
  "NFTContract.safeTransferFrom";
  "NFTContract.transferFrom";
  "NFTContract._checkOnERC721Received";
  "NFTContract._isApprovedOrOwner";
  "NFTContract._transfer";
  "NFTContract.approve";
  "NFTContract.ownerOf";
  "NFTContract.isApprovedForAll";
  "NFTContract.getApproved";
  "NFTContract._exists";
  "NFTAccessControl.getAccessLevel";
  "NFTAccessControl.<Constructor>";
  "NFTAccessControl.onlyAuthorized";
  "NFTAccessControl.onlyAuthorizedOrOwner";
  "NFTAccessControl._updateUserAccessList";
  "NFTAccessControl._updateNFTAccessList";
  "NFTAccessControl._updateUserAccessListOnRevoke";
  "NFTAccessControl._updateNFTAccessListOnRevoke";
  "NFTMetadata.<Constructor>";
  "NFTMetadata.onlyAuthorized";
  "NFTMetadata.onlyAuthorizedEditData";
  "NFTAccessControl.checkMinimumAccess";
  "NFTMetadata.replicateNFT";
  "NFTMetadata._metadataExists";
  "NFTMetadata.createMetadata";
  "NFTMetadata.updateMetadata";
  "NFTMetadata.getMetadata";

  // ---------------------------- Data Variables ---------------------------- //

  "CollectionContract.collections";
  "CollectionContract.collectionOwners";
  "CollectionContract.totalCollections";
  "MasterAccessControl.accessRights";
  "NFTContract.nfts";
  "NFTContract.collectionNFTCount";
  "NFTContract.balances";
  "NFTContract.balanceCollection";
  "NFTContract.tokenApprovals";
  "NFTContract.operatorApprovals";
  "NFTContract.nextTokenId";
  "NFTAccessControl.nftAccess";
  "NFTAccessControl.defaultAccessLevel";
  "NFTAccessControl.maxAccessLevel";
  "NFTAccessControl.userAccess";
  "NFTAccessControl.userAccessList";
  "NFTAccessControl.userAccessIndex";
  "NFTAccessControl.nftAccessList";
  "NFTAccessControl.nftAccessIndex";
  "NFTMetadata.metadataMap";
  "NFTMetadata.replicaMap";

  // ---------------------------- Data Call Flow ---------------------------- //

  // CollectionContract
  "CollectionContract.createCollection" -> "CollectionContract.collections" [color="#73EC8B"];
  "CollectionContract.createCollection" -> "CollectionContract.collectionOwners" [color="#73EC8B"];
  "CollectionContract.createCollection" -> "CollectionContract.totalCollections" [color="#73EC8B"];
  "CollectionContract.collections" -> "CollectionContract.getCollectionMetadata" [color="blue"];
  "CollectionContract.collectionOwners" -> "CollectionContract.getCollectionOwner" [color="blue"];
  "CollectionContract.totalCollections" -> "CollectionContract.getTotalCollections" [color="blue"];
  "CollectionContract.collections" -> "CollectionContract.getAllCollections" [color="blue"];
  "CollectionContract.updateCollection" -> "CollectionContract.collections" [color="#73EC8B"];
  "CollectionContract.transferCollection" -> "CollectionContract.collectionOwners" [color="#73EC8B"];

  // MasterAccessControl
  "MasterAccessControl.grantAccess" -> "MasterAccessControl.accessRights" [color="#73EC8B"];
  "MasterAccessControl.revokeAccess" -> "MasterAccessControl.accessRights" [color="#73EC8B"];
  "MasterAccessControl.accessRights" -> "MasterAccessControl.hasAccess" [color="blue"];
  "MasterAccessControl.accessRights" -> "MasterAccessControl.selfCheckAccess" [color="blue"];

  // NFTContract
  "NFTContract.createNFT" -> "NFTContract.nfts" [color="#73EC8B"];
  "NFTContract.createNFT" -> "NFTContract.collectionNFTCount" [color="#73EC8B"];
  "NFTContract.createNFT" -> "NFTContract.balances" [color="#73EC8B"];
  "NFTContract.createNFT" -> "NFTContract.balanceCollection" [color="#73EC8B"];
  "NFTContract.createNFT" -> "NFTContract.nextTokenId" [color="#73EC8B"];
  "NFTContract.burnNFT" -> "NFTContract.nfts" [color="#73EC8B"];
  "NFTContract.burnNFT" -> "NFTContract.collectionNFTCount" [color="#73EC8B"];
  "NFTContract.burnNFT" -> "NFTContract.balances" [color="#73EC8B"];
  "NFTContract.burnNFT" -> "NFTContract.balanceCollection" [color="#73EC8B"];
  "NFTContract.nfts" -> "NFTContract.getNFTInfo" [color="blue"];
  "NFTContract.collectionNFTCount" -> "NFTContract.getCollectionNFTCount" [color="blue"];
  "NFTContract.balances" -> "NFTContract.balanceOf" [color="blue"];
  "NFTContract.balanceCollection" -> "NFTContract.balanceOfCollection" [color="blue"];
  "NFTContract.nfts" -> "NFTContract.ownerOf" [color="blue"];
  "NFTContract._transfer" -> "NFTContract.nfts" [color="#73EC8B"];
  "NFTContract._transfer" -> "NFTContract.balances" [color="#73EC8B"];
  "NFTContract._transfer" -> "NFTContract.balanceCollection" [color="#73EC8B"];
  "NFTContract.approve" -> "NFTContract.tokenApprovals" [color="#73EC8B"];
  "NFTContract.setApprovalForAll" -> "NFTContract.operatorApprovals" [color="#73EC8B"];
  "NFTContract.tokenApprovals" -> "NFTContract.getApproved" [color="blue"];
  "NFTContract.operatorApprovals" -> "NFTContract.isApprovedForAll" [color="blue"];

  // NFTAccessControl
  "NFTAccessControl.grantAccess" -> "NFTAccessControl.nftAccess" [color="#73EC8B"];
  "NFTAccessControl.grantAccess" -> "NFTAccessControl.userAccess" [color="#73EC8B"];
  "NFTAccessControl.revokeAccess" -> "NFTAccessControl.nftAccess" [color="#73EC8B"];
  "NFTAccessControl.revokeAccess" -> "NFTAccessControl.userAccess" [color="#73EC8B"];
  "NFTAccessControl.nftAccess" -> "NFTAccessControl.getAccessLevel" [color="blue"];
  "NFTAccessControl.defaultAccessLevel" -> "NFTAccessControl.getAccessLevel" [color="blue"];
  "NFTAccessControl.setMaxAccessLevel" -> "NFTAccessControl.maxAccessLevel" [color="#73EC8B"];
  "NFTAccessControl.setDefaultAccessLevel" -> "NFTAccessControl.defaultAccessLevel" [color="#73EC8B"];
  "NFTAccessControl.userAccessList" -> "NFTAccessControl.getAllAccessForUser" [color="blue"];
  "NFTAccessControl.nftAccess" -> "NFTAccessControl.checkMinimumAccess" [color="blue"];
  "NFTAccessControl.defaultAccessLevel" -> "NFTAccessControl.checkMinimumAccess" [color="blue"];
  "NFTAccessControl.nftAccessList" -> "NFTAccessControl.getAllUsersAccessForNFT" [color="blue"];

  // NFTMetadata
  "NFTMetadata.createMetadata" -> "NFTMetadata.metadataMap" [color="#73EC8B"];
  "NFTMetadata.replicateNFT" -> "NFTMetadata.metadataMap" [color="#73EC8B"];
  "NFTMetadata.replicateNFT" -> "NFTMetadata.replicaMap" [color="#73EC8B"];
  "NFTMetadata.updateMetadata" -> "NFTMetadata.metadataMap" [color="#73EC8B"];
  "NFTMetadata.deleteMetadata" -> "NFTMetadata.metadataMap" [color="#73EC8B"];
  "NFTMetadata.metadataMap" -> "NFTMetadata.getMetadata" [color="blue"];
  "NFTMetadata.metadataMap" -> "NFTMetadata._metadataExists" [color="blue"];
  "NFTMetadata.metadataMap" -> "NFTMetadata.metadataExists" [color="blue"];

  // ---------------------------- Function Flow ---------------------------- //

  "CollectionContract.<Constructor>" -> "MasterAccessControl.grantSelfAccess" [color="#0B192C"];
  "CollectionContract.onlyAuthorized" -> "MasterAccessControl.selfCheckAccess" [color="#0B192C"];
  "CollectionContract.getCollectionNFTCount" -> "NFTContract.getCollectionNFTCount" [color="#0B192C"];
  "CollectionContract.getCollectionUniqueHolders" -> "NFTContract.numberOfHolders" [color="#0B192C"];
  "MasterAccessControl.onlyAuthorized" -> "MasterAccessControl.hasAccess" [color="#40e7c8"];
  "NFTContract.<Constructor>" -> "MasterAccessControl.grantSelfAccess" [color="#0B192C"];
  "NFTContract.onlyAuthorized" -> "MasterAccessControl.selfCheckAccess" [color="#0B192C"];
  "NFTContract.createNFT" -> "NFTAccessControl.grantAccess" [color="#0B192C"];
  "NFTContract.burnNFT" -> "NFTMetadata.metadataExists" [color="#0B192C"];
  "NFTContract.burnNFT" -> "NFTMetadata.deleteMetadata" [color="#0B192C"];
  "NFTContract.burnNFT" -> "NFTAccessControl.revokeAccess" [color="#0B192C"];
  "NFTContract.transferNFT" -> "NFTContract.safeTransferFrom" [color="#40e7c8"];
  "NFTContract.safeTransferFrom" -> "NFTContract.transferFrom" [color="#40e7c8"];
  "NFTContract.safeTransferFrom" -> "NFTContract._checkOnERC721Received" [color="#40e7c8"];
  "NFTContract.safeTransferFrom" -> "NFTContract.safeTransferFrom" [color="#40e7c8"];
  "NFTContract.transferFrom" -> "NFTContract._isApprovedOrOwner" [color="#40e7c8"];
  "NFTContract.transferFrom" -> "NFTContract._transfer" [color="#40e7c8"];
  "NFTContract.approve" -> "NFTContract.ownerOf" [color="#40e7c8"];
  "NFTContract.approve" -> "NFTContract.isApprovedForAll" [color="#40e7c8"];
  "NFTContract.getApproved" -> "NFTContract._exists" [color="#40e7c8"];
  "NFTContract._isApprovedOrOwner" -> "NFTContract.ownerOf" [color="#40e7c8"];
  "NFTContract._isApprovedOrOwner" -> "NFTContract.getApproved" [color="#40e7c8"];
  "NFTContract._isApprovedOrOwner" -> "NFTContract.isApprovedForAll" [color="#40e7c8"];
  "NFTContract._transfer" -> "NFTContract.ownerOf" [color="#40e7c8"];
  "NFTContract._transfer" -> "NFTContract.approve" [color="#40e7c8"];
  "NFTContract._transfer" -> "NFTAccessControl.getAccessLevel" [color="#0B192C"];
  "NFTContract._transfer" -> "NFTAccessControl.revokeAccess" [color="#0B192C"];
  "NFTContract._transfer" -> "NFTAccessControl.grantAccess" [color="#0B192C"];
  "NFTAccessControl.<Constructor>" -> "MasterAccessControl.grantSelfAccess" [color="#0B192C"];
  "NFTAccessControl.onlyAuthorized" -> "MasterAccessControl.selfCheckAccess" [color="#0B192C"];
  "NFTAccessControl.onlyAuthorizedOrOwner" -> "MasterAccessControl.selfCheckAccess" [color="#0B192C"];
  "NFTAccessControl.grantAccess" -> "NFTAccessControl._updateUserAccessList" [color="#40e7c8"];
  "NFTAccessControl.grantAccess" -> "NFTAccessControl._updateNFTAccessList" [color="#40e7c8"];
  "NFTAccessControl.revokeAccess" -> "NFTAccessControl._updateUserAccessListOnRevoke" [color="#40e7c8"];
  "NFTAccessControl.revokeAccess" -> "NFTAccessControl._updateNFTAccessListOnRevoke" [color="#40e7c8"];
  "NFTMetadata.<Constructor>" -> "MasterAccessControl.grantSelfAccess" [color="#0B192C"];
  "NFTMetadata.onlyAuthorized" -> "MasterAccessControl.selfCheckAccess" [color="#0B192C"];
  "NFTMetadata.onlyAuthorizedEditData" -> "NFTAccessControl.checkMinimumAccess" [color="#0B192C"];
  "NFTMetadata.onlyAuthorizedEditData" -> "MasterAccessControl.selfCheckAccess" [color="#0B192C"];
  "NFTMetadata.replicateNFT" -> "NFTMetadata._metadataExists" [color="#40e7c8"];
  "NFTMetadata.replicateNFT" -> "NFTMetadata.createMetadata" [color="#40e7c8"];
  "NFTMetadata.updateMetadata" -> "NFTMetadata._metadataExists" [color="#40e7c8"];
  "NFTMetadata.deleteMetadata" -> "NFTMetadata._metadataExists" [color="#40e7c8"];
  "NFTMetadata.getMetadata" -> "NFTMetadata._metadataExists" [color="#40e7c8"];
  "NFTMetadata.metadataExists" -> "NFTMetadata._metadataExists" [color="#40e7c8"];





// Define ERC721Collection interface functions
"ERC721Collection.balanceOf";
"ERC721Collection.balanceOfCollection";
"ERC721Collection.ownerOf";
"ERC721Collection.safeTransferFrom";
"ERC721Collection.transferFrom";
"ERC721Collection.approve";
"ERC721Collection.setApprovalForAll";
"ERC721Collection.getApproved";
"ERC721Collection.isApprovedForAll";

// Connect ERC721Collection to NFTContract (inheritance)
"ERC721Collection.balanceOf" -> "NFTContract.balanceOf" [color="#433878", style="dashed"];
"ERC721Collection.balanceOfCollection" -> "NFTContract.balanceOfCollection" [color="#433878", style="dashed"];
"ERC721Collection.ownerOf" -> "NFTContract.ownerOf" [color="#433878", style="dashed"];
"ERC721Collection.safeTransferFrom" -> "NFTContract.safeTransferFrom" [color="#433878", style="dashed"];
"ERC721Collection.transferFrom" -> "NFTContract.transferFrom" [color="#433878", style="dashed"];
"ERC721Collection.approve" -> "NFTContract.approve" [color="#433878", style="dashed"];
"ERC721Collection.setApprovalForAll" -> "NFTContract.setApprovalForAll" [color="#433878", style="dashed"];
"ERC721Collection.getApproved" -> "NFTContract.getApproved" [color="#433878", style="dashed"];
"ERC721Collection.isApprovedForAll" -> "NFTContract.isApprovedForAll" [color="#433878", style="dashed"];






rankdir=LR
subgraph cluster_legend {
  label="Legend";
  fontsize=20;
  node [shape=plaintext, fillcolor="#EDE8DC"];
  
  legend [label=<
    <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4">
      <TR><TD COLSPAN="2"><B>Legend</B></TD></TR>
      <TR>
        <TD BGCOLOR="#98E4FF">&nbsp;&nbsp;&nbsp;</TD>
        <TD>Constructor</TD>
      </TR>
      <TR>
        <TD BGCOLOR="#73EC8B">&nbsp;&nbsp;&nbsp;</TD>
        <TD>Modifier</TD>
      </TR>
      <TR>
        <TD BGCOLOR="#FFBF78">&nbsp;&nbsp;&nbsp;</TD>
        <TD>Function</TD>
      </TR>
      <TR>
        <TD BGCOLOR="#FF8080">&nbsp;&nbsp;&nbsp;</TD>
        <TD>Internal Function</TD>
      </TR>
      <TR>
        <TD BGCOLOR="#76B7B2">&nbsp;&nbsp;&nbsp;</TD>
        <TD>Data Variable</TD>
      </TR>
    </TABLE>
  >];
}





  rankdir=LR
  node [shape=plaintext, fillcolor="#EDE8DC"]
  subgraph cluster_01 {
    label = "Legend";
  key [label=<<table border="0" cellpadding="2" cellspacing="0" cellborder="0">
    <tr><td align="right" port="i1">Internal Call</td></tr>
    <tr><td align="right" port="i2">External Call</td></tr>
    <tr><td align="right" port="i3">Write Operation</td></tr>
    <tr><td align="right" port="i4">Read Operation</td></tr>
    <tr><td align="right" port="i5">Inheritance</td></tr>
  </table>>]
  key2 [label=<<table border="0" cellpadding="2" cellspacing="0" cellborder="0">
    <tr><td port="i1">&nbsp;&nbsp;&nbsp;</td></tr>
    <tr><td port="i2">&nbsp;&nbsp;&nbsp;</td></tr>
    <tr><td port="i3">&nbsp;&nbsp;&nbsp;</td></tr>
    <tr><td port="i4">&nbsp;&nbsp;&nbsp;</td></tr>
    <tr><td port="i5">&nbsp;&nbsp;&nbsp;</td></tr>
  </table>>]
  key:i1:e -> key2:i1:w [color="#40e7c8"]
  key:i2:e -> key2:i2:w [color="#0B192C"]
  key:i3:e -> key2:i3:w [color="#73EC8B"]
  key:i4:e -> key2:i4:w [color="blue"]
  key:i5:e -> key2:i5:w [color="#FF00FF", style="dashed"]
}
}

```