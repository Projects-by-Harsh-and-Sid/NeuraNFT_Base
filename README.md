# NeuraNFT_Tron


for windows use wsl



### Basic Setup

```
conda create -n tron_neuranft python=3.12

conda activate tron_neuranft

```

### Update node

```
conda update -n base -c defaults conda
```

### Install node
```
conda install conda-forge::nodejs

conda install -c "conda-forge/label/main/linux-64" nodejs==22.9.0=hf235a45_0
```
# Get path and version of node
```
node -v

npm config get prefix
```

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