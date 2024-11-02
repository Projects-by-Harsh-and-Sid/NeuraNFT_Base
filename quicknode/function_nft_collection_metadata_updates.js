const { Pool } = require('pg');
const CollectionDataDecoder = require('./event_log_decoder/Collection_data.js');
const NFTEventDecoder = require('./event_log_decoder/NFT_data.js');
const NFTMetadataDecoder = require('./event_log_decoder/NFT_metadata.js');

// Initialize PostgreSQL connection
const pool = new Pool({
    user: process.env.POSTGRES_USER || 'neuranft',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'neuranft_db',
    password: process.env.POSTGRES_PASSWORD || 'neuranft_password',
    port: process.env.POSTGRES_PORT || 5432,
});

// Initialize decoders
const collectionDecoder = new CollectionDataDecoder();
const nftDecoder = new NFTEventDecoder();
const metadataDecoder = new NFTMetadataDecoder();

// Create database tables
async function initializeTables() {
    const client = await pool.connect();
    try {
        await client.query(`
            -- Collections table
            CREATE TABLE IF NOT EXISTS collections (
                id SERIAL PRIMARY KEY,
                collection_id BIGINT NOT NULL,
                name VARCHAR(255),
                base_model VARCHAR(255),
                creator_address VARCHAR(42),
                block_number BIGINT,
                block_hash VARCHAR(66),
                transaction_hash VARCHAR(66),
                transaction_index INTEGER,
                log_index INTEGER,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(collection_id)
            );

            -- NFTs table
            CREATE TABLE IF NOT EXISTS nfts (
                id SERIAL PRIMARY KEY,
                collection_id BIGINT NOT NULL,
                token_id BIGINT NOT NULL,
                name VARCHAR(255),
                creator_address VARCHAR(42),
                owner_address VARCHAR(42),
                block_number BIGINT,
                block_hash VARCHAR(66),
                transaction_hash VARCHAR(66),
                transaction_index INTEGER,
                log_index INTEGER,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(collection_id, token_id)
            );

            -- NFT Metadata table
            CREATE TABLE IF NOT EXISTS nft_metadata (
                id SERIAL PRIMARY KEY,
                collection_id BIGINT NOT NULL,
                nft_id BIGINT NOT NULL,
                image_url TEXT,
                base_model VARCHAR(255),
                description TEXT,
                block_number BIGINT,
                block_hash VARCHAR(66),
                transaction_hash VARCHAR(66),
                transaction_index INTEGER,
                log_index INTEGER,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(collection_id, nft_id)
            );

            -- Create indexes
            CREATE INDEX IF NOT EXISTS idx_collections_collection_id ON collections(collection_id);
            CREATE INDEX IF NOT EXISTS idx_nfts_collection_token ON nfts(collection_id, token_id);
            CREATE INDEX IF NOT EXISTS idx_metadata_collection_nft ON nft_metadata(collection_id, nft_id);
        `);
        console.log('Database tables initialized successfully');
    } catch (error) {
        console.error('Error initializing tables:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Quicknode function to handle streams
exports.handleQuicknodeStream = async function (params) {
    try {

        const contract_address = params.data[0].address;

        const collection_address = "0x536446035eF24cb011a3B55f0627df2Fad083F67";
        const nft_address = "0xAc537d070AcfA1F0C6df29a87b5d63c26Fff6DcE";
        const metadata_address = "0x13846e6fDe06853f6CC822A58f97AdbEbF1e6AFd";


        let result;
        switch (contract_address) {
            case collection_address:
                result = await handleCollectionStream(params.data);
                break;
            case nft_address:
                result = await handleNFTStream(params.data);
                break;
            case metadata_address:
                result = await handleMetadataStream(params.data);
                break;
            default:
                throw new Error(`Unknown stream ID: ${streamId}`);
        }

        // response.json({ success: true, data: result });
    } catch (error) {
        console.error('Stream handling error:', error);
        // response.status(500).json({ success: false, error: error.message });
    }
}

// Handle Collection stream
async function handleCollectionStream(payload) {
    const decodedEvent = collectionDecoder.decodeEvent(payload);
    
    const query = `
        INSERT INTO collections (
            collection_id, name, base_model, creator_address,
            block_number, block_hash, transaction_hash, 
            transaction_index, log_index
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (collection_id) 
        DO UPDATE SET
            name = EXCLUDED.name,
            base_model = EXCLUDED.base_model,
            transaction_hash = EXCLUDED.transaction_hash,
            block_number = EXCLUDED.block_number,
            timestamp = CURRENT_TIMESTAMP
        RETURNING *`;

    const values = [
        decodedEvent.collectionId,
        decodedEvent.baseInfo?.name || '',
        decodedEvent.baseModel,
        decodedEvent.address,
        decodedEvent.blockNumber,
        decodedEvent.blockHash,
        decodedEvent.transactionHash,
        decodedEvent.transactionIndex,
        decodedEvent.logIndex
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
}

// Handle NFT stream
async function handleNFTStream(payload) {
    console.log('Payload:', payload);
    const decodedEvents = nftDecoder.decodeEvents(payload);
    console.log('Decoded Events:', decodedEvents);

    for (const decodedEvent of decodedEvents) {
        if (decodedEvent.type === 'NFTCreated') {
            const query = `
                INSERT INTO nfts (
                    collection_id, token_id, name, creator_address, owner_address,
                    block_number, block_hash, transaction_hash, 
                    transaction_index, log_index
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (collection_id, token_id) 
                DO UPDATE SET
                    name = EXCLUDED.name,
                    owner_address = EXCLUDED.owner_address,
                    transaction_hash = EXCLUDED.transaction_hash,
                    block_number = EXCLUDED.block_number,
                    timestamp = CURRENT_TIMESTAMP
                RETURNING *`;

            const values = [
                decodedEvent.collectionId,
                decodedEvent.tokenId,
                decodedEvent.name,
                decodedEvent.creator,
                decodedEvent.owner || decodedEvent.creator,
                decodedEvent.blockNumber,
                decodedEvent.blockHash,
                decodedEvent.transactionHash,
                decodedEvent.transactionIndex,
                decodedEvent.logIndex
            ];

            console.log('Query Values:', values);

            const result = await pool.query(query, values);
            console.log('Query Result:', result.rows[0]);
        } else {
            console.log('Skipping event type:', decodedEvent.type);
        }
    }
}

// Handle Metadata stream
async function handleMetadataStream(payload) {
    const decodedEvent = metadataDecoder.decodeMetadataEvent(payload);

    const query = `
        INSERT INTO nft_metadata (
            collection_id, nft_id, image_url, base_model, description,
            block_number, block_hash, transaction_hash, 
            transaction_index, log_index
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (collection_id, nft_id) 
        DO UPDATE SET
            image_url = EXCLUDED.image_url,
            base_model = EXCLUDED.base_model,
            description = EXCLUDED.description,
            transaction_hash = EXCLUDED.transaction_hash,
            block_number = EXCLUDED.block_number,
            timestamp = CURRENT_TIMESTAMP
        RETURNING *`;

    const values = [
        decodedEvent.collectionId,
        decodedEvent.nftId,
        decodedEvent.metadata.image,
        decodedEvent.metadata.baseModel,
        decodedEvent.metadata.description,
        decodedEvent.blockNumber,
        decodedEvent.blockHash,
        decodedEvent.transactionHash,
        decodedEvent.transactionIndex,
        decodedEvent.logIndex
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
}



// Example payload for testing

// Collection event
const collectionEvent = {
    "address": "0x536446035ef24cb011a3b55f0627df2fad083f67",
    "blockHash": "0x92fbfc5ef13c2ba48cd705dde158f4363895460297ee5299642c73694fa1ba02",
    "blockNumber": "0x10268f8",
    "data": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000094c6c616d6120332e310000000000000000000000000000000000000000000000",
    "logIndex": "0x8",
    "removed": false,
    "topics": [
      "0xb0b7b214963f2e16da9cf6ed5851757dfed306875edf1d59e030881102ef24ef",
      "0x0000000000000000000000000000000000000000000000000000000000000014",
      "0x00000000000000000000000043adac5516f8e2d3d2bd31276bec343547ee6612"
    ],
    "transactionHash": "0x3d417250bd9c0467163546968453287a27002d57d1160a0cf9d0052b98e8f4af",
    "transactionIndex": "0x7"
  };

// NFT event

const nftEvent =   [
    {
      "address": "0xac537d070acfa1f0c6df29a87b5d63c26fff6dce",
      "blockHash": "0xd84ddb681e7b498d181137cf4dec0ac1921a51bb2fdb15ac803bc2b053df2b6e",
      "blockNumber": "0x1026912",
      "data": "0x000000000000000000000000000000000000000000000000000000000000004000000000000000000000000043adac5516f8e2d3d2bd31276bec343547ee6612000000000000000000000000000000000000000000000000000000000000000f436f676e6974697665204c6c616d610000000000000000000000000000000000",
      "logIndex": "0x2f",
      "removed": false,
      "topics": [
        "0x70c783e7a8d1b78c0efffba9d45d314bfe7a85f6388c8e9a32536a97949a0f2a",
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        "0x0000000000000000000000000000000000000000000000000000000000000001"
      ],
      "transactionHash": "0x62d67cc95a1313583d5ec244fa873df44eff812cbdc1504b80eae419d9bcae82",
      "transactionIndex": "0x13"
    },
    {
      "address": "0xac537d070acfa1f0c6df29a87b5d63c26fff6dce",
      "blockHash": "0xd84ddb681e7b498d181137cf4dec0ac1921a51bb2fdb15ac803bc2b053df2b6e",
      "blockNumber": "0x1026912",
      "data": "0x0000000000000000000000000000000000000000000000000000000000000001",
      "logIndex": "0x30",
      "removed": false,
      "topics": [
        "0x9ed053bb818ff08b8353cd46f78db1f0799f31c9e4458fdb425c10eccd2efc44",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x00000000000000000000000043adac5516f8e2d3d2bd31276bec343547ee6612",
        "0x0000000000000000000000000000000000000000000000000000000000000001"
      ],
      "transactionHash": "0x62d67cc95a1313583d5ec244fa873df44eff812cbdc1504b80eae419d9bcae82",
      "transactionIndex": "0x13"
    }
  ];

// Metadata event

const metadataEvent = {
    "address": "0x13846e6fde06853f6cc822a58f97adbebf1e6afd",
    "blockHash": "0x53c1c72be3905dd2600fa4069bc9cc9409535e06e091fc9aff267d7de640dd03",
    "blockNumber": "0x1026966",
    "data": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000002200000000000000000000000000000000000000000000000000000000000000280000000000000000000000000000000000000000000000000000000000000003268747470733a2f2f626173652e6261636b656e642e6e657572616e66742e636f6d2f696d6167652f74656d7031332e706e67000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000094c6c616d6120332e310000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002668747470733a2f2f626173652e6261636b656e642e6e657572616e66742e636f6d2f646174610000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002568747470733a2f2f626173652e6261636b656e642e6e657572616e66742e636f6d2f726167000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002e68747470733a2f2f626173652e6261636b656e642e6e657572616e66742e636f6d2f66696e6554756e65446174610000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000090416e2041492d67656e657261746564206372656174696f6e2c2070617274206f66207468652072653a67656e65726174657320636f6c6c656374696f6e2e2054686973206973206120756e69717565204e46542066726f6d207468652072653a67656e65726174657320636f6c6c656374696f6e2c20666561747572696e67204c6c616d6120332e31206d6f64656c2e00000000000000000000000000000000",     
    "logIndex": "0x27",
    "removed": false,
    "topics": [
      "0x03f37875a30d73ff3ec38e4597342ebf44d54b2097441e1e23ca00a68a9ff692",
      "0x0000000000000000000000000000000000000000000000000000000000000001",
      "0x0000000000000000000000000000000000000000000000000000000000000006"
    ],
    "transactionHash": "0x5dfece9d5ba17c427f6ab6bc72d48ec73708f78970ef6dac893726410895ec10",
    "transactionIndex": "0xf"
  };


// Example usage
// 
// handleCollectionStream(collectionEvent).then(console.log);
// console.log('NFT Event:', nftEvent[0]);
handleNFTStream(nftEvent).then(console.log);
// handleMetadataStream(metadataEvent).then(console.log);
// Initialize tables when starting the application
// initializeTables().catch(console.error);