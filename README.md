# NeuraNFT

NeuraNFT is a pioneering platform built on the Tron blockchain that aims to tokenize intelligence. It enables the creation of NFTs representing AI models and data, with a sophisticated permission management system for granular control over access and usage rights. By addressing key challenges in the current AI ecosystem, NeuraNFT seeks to create a more equitable, secure, and innovative environment for AI development and deployment.

## Table of Contents

- [NeuraNFT](#neuranft)
  - [Table of Contents](#table-of-contents)
  - [Documentation](#documentation)
  - [Key Features](#key-features)
  - [Problem Statement](#problem-statement)
  - [Architecture](#architecture)
    - [Smart Contracts](#smart-contracts)
    - [BTFS (BitTorrent File System)](#btfs-bittorrent-file-system)
    - [Balancer Nodes](#balancer-nodes)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [Operational Flow](#operational-flow)
  - [Technologies Used](#technologies-used)
  - [Smart Contracts](#smart-contracts-1)
  - [Future Developments](#future-developments)
  - [Architecture Diagram](#architecture-diagram)
- [Migration Output](#migration-output)

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

- MasterAccessControl: [0x52AD5a6D11a1D68736894F4eab33CCD594E1db5A](https://sepolia.basescan.org/address/0x52AD5a6D11a1D68736894F4eab33CCD594E1db5A)
- NFTAccessControl: [0xf9179350E92092F283dC34B5E99F53BfF96effbf](https://sepolia.basescan.org/address/0xf9179350E92092F283dC34B5E99F53BfF96effbf)
- NFTMetadata: [0x62B5C46B0eCDda777B98d3ca5100DCa4d0532026](https://sepolia.basescan.org/address/0x62B5C46B0eCDda777B98d3ca5100DCa4d0532026)
- NFTContract: [0x112bC2e4d638839162686B8EAb2F1161562BDbAB](https://sepolia.basescan.org/address/0x112bC2e4d638839162686B8EAb2F1161562BDbAB)
- CollectionContract: [0xc367B82Aed2625e0e592283954E6079B01f0cD48](https://sepolia.basescan.org/address/0xc367b82aed2625e0e592283954e6079b01f0cd48)

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
    TW[Base Wallet]

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

    subgraph "Base Network Smart Contracts"
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
    classDef Base fill:#ffd700,stroke:#333,stroke-width:2px,color:#000;
    classDef computing fill:#87cefa,stroke:#333,stroke-width:2px,color:#000;
    classDef storage fill:#90EE90,stroke:#333,stroke-width:2px,color:#000;
    classDef backend fill:#ff6347,stroke:#333,stroke-width:2px,color:#000;
    classDef user fill:#c8a2c8,stroke:#333,stroke-width:2px,color:#000;

    class SC,NFT,ACC,MD,CC,MAC Base;
    class HPC,SN1,SN2,SN3 computing;
    class BTFS storage;
    class BS,UV,AC,ED,MI,API backend;
    class UI,TW user;
```

### Smart Contract Architecture
> Kindly open the image in a new tab to see in detial
![Smart Contract Architecture](https://raw.githubusercontent.com/Projects-by-Harsh-and-Sid/NeuraNFT_Base/refs/heads/main/smart_contracts/smartContractFlow-white.svg?token=GHSAT0AAAAAACVLNDR6PMXCJJLL6R7VZZBSZYFBSBA? "Smart Contract Architecture")

# Migration Output
```shell

❯ truffle migrate --network base --reset

Compiling your contracts...
===========================
> Compiling .\contracts\CollectionContract.sol
> Compiling .\contracts\MasterAccessControl.sol
> Compiling .\contracts\Migrations.sol
> Compiling .\contracts\NFTAccessControl.sol
> Compiling .\contracts\NFTContract.sol
> Compiling .\contracts\NFTMetadata.sol
> Artifacts written to F:\Projects\03 Hackathon\NeuraNFT Hackathons\Base hackathon\NeuraNFT_Base\smart_contracts\truffle_compiled_contract\build\contracts
> Compiled successfully using:
   - solc: 0.8.19+commit.7dd6d404.Emscripten.clang


Starting migrations...
======================
> Network name:    'base'
> Network id:      84532
> Block gas limit: 60000000 (0x3938700)


1_initial_migration.js
======================

   Replacing 'Migrations'
   ----------------------
   > transaction hash:    0xed5323590392a907c14c14dbcbc8563c4668d2525301e9cfc2d691ef880c1e05
   > Blocks: 2            Seconds: 4
   > contract address:    0x8439be0d2BF79485831471a24223D88E21613D50
   > block number:        16746771
   > block timestamp:     1729261830
   > account:             0x43ADAc5516f8E2D3d2BD31276BeC343547ee6612
   > balance:             0.097383119699514622
   > gas used:            250212 (0x3d164)
   > gas price:           2.500610524 gwei
   > value sent:          0 ETH
   > total cost:          0.000625682760431088 ETH

   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:     0.000625682760431088 ETH


2_deploy_master_access_control.js
=================================

   Deploying 'MasterAccessControl'
   -------------------------------
   > transaction hash:    0xd01184efb45d69b687059ec505356d654d625d6b98686cc18797668a95d3bbb5
   > Blocks: 2            Seconds: 4
   > contract address:    0x52AD5a6D11a1D68736894F4eab33CCD594E1db5A
   > block number:        16746779
   > block timestamp:     1729261846
   > account:             0x43ADAc5516f8E2D3d2BD31276BeC343547ee6612
   > balance:             0.095883231191535678
   > gas used:            553822 (0x8735e)
   > gas price:           2.500614434 gwei
   > value sent:          0 ETH
   > total cost:          0.001384895287066748 ETH

MasterAccessControl deployed at: 0x52AD5a6D11a1D68736894F4eab33CCD594E1db5A
Addresses saved to base_addresses.json
   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:     0.001384895287066748 ETH


3_deploy_nft_access_control.js
==============================

   Deploying 'NFTAccessControl'
   ----------------------------
   > transaction hash:    0x05307c72660dee5a53787f8515a57ccf16c40f335fa89e883044c599dfdd3fe1
   > Blocks: 2            Seconds: 4
   > contract address:    0xf9179350E92092F283dC34B5E99F53BfF96effbf
   > block number:        16746786
   > block timestamp:     1729261860
   > account:             0x43ADAc5516f8E2D3d2BD31276BeC343547ee6612
   > balance:             0.089755565879314336
   > gas used:            2421337 (0x24f259)
   > gas price:           2.500615893 gwei
   > value sent:          0 ETH
   > total cost:          0.006054833784508941 ETH

NFTAccessControl deployed at: 0xf9179350E92092F283dC34B5E99F53BfF96effbf
Granted access to NFTAccessControl in MasterAccessControl
Addresses saved to base_addresses.json
   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:     0.006054833784508941 ETH


4_deploy_nft_metadata.js
========================

   Deploying 'NFTMetadata'
   -----------------------
   > transaction hash:    0xe7a0abf64eb68a8d27fb4ae8a56f92ec4f5c7d68c3ceb706d1ddd6c635839aa0
   > Blocks: 2            Seconds: 4
   > contract address:    0x62B5C46B0eCDda777B98d3ca5100DCa4d0532026
   > block number:        16746798
   > block timestamp:     1729261884
   > account:             0x43ADAc5516f8E2D3d2BD31276BeC343547ee6612
   > balance:             0.085315345654359792
   > gas used:            1697697 (0x19e7a1)
   > gas price:           2.500617558 gwei
   > value sent:          0 ETH
   > total cost:          0.004245290926363926 ETH

NFTMetadata deployed at: 0x62B5C46B0eCDda777B98d3ca5100DCa4d0532026
Granted access to NFTMetadata in MasterAccessControl
Granted access to NFTMetadata in NFTAccessControl
Addresses saved to base_addresses.json
   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:     0.004245290926363926 ETH


5_deploy_nft_contract.js
========================

   Deploying 'NFTContract'
   -----------------------
   > transaction hash:    0xdc5b9275491f047500f35126f235f6c37d68869cc0cd6b7d203daca5d7cc9e00
   > Blocks: 2            Seconds: 4
   > contract address:    0x112bC2e4d638839162686B8EAb2F1161562BDbAB
   > block number:        16746812
   > block timestamp:     1729261912
   > account:             0x43ADAc5516f8E2D3d2BD31276BeC343547ee6612
   > balance:             0.076284277023009844
   > gas used:            3307161 (0x327699)
   > gas price:           2.500638826 gwei
   > value sent:          0 ETH
   > total cost:          0.008270015200432986 ETH

NFTContract deployed at: 0x112bC2e4d638839162686B8EAb2F1161562BDbAB
Granted access to NFTContract in MasterAccessControl
Granted access of NFTAccessControl to NFTContract in MasterAccessControl
Granted access of NFTMetadata to NFTContract in MasterAccessControl
Granted access to NFTContract in NFTAccessControl
Granted access to NFTContract in NFTMetadata
Addresses saved to base_addresses.json
   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:     0.008270015200432986 ETH


6_deploy_collection_contract.js
===============================

   Deploying 'CollectionContract'
   ------------------------------
   > transaction hash:    0xd538eaef475f266985b4fffb7dca493b2ac8bbf71b0f34d8a4d13254731a70a7
   > Blocks: 3            Seconds: 4
   > contract address:    0xc367B82Aed2625e0e592283954E6079B01f0cD48
   > block number:        16746832
   > block timestamp:     1729261952
   > account:             0x43ADAc5516f8E2D3d2BD31276BeC343547ee6612
   > balance:             0.070279539672854803
   > gas used:            1987550 (0x1e53de)
   > gas price:           2.50064705 gwei
   > value sent:          0 ETH
   > total cost:          0.0049701610442275 ETH

CollectionContract deployed at: 0xc367B82Aed2625e0e592283954E6079B01f0cD48
Granted access to CollectionContract in MasterAccessControl
Granted access to CollectionContract in NFTContract
Addresses saved to base_addresses.json
All contracts deployed and set up successfully
   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:     0.0049701610442275 ETH

Summary
=======
> Total deployments:   6
> Final cost:          0.025550879003031189 ETH

```
