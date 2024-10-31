import { Pool } from 'pg';
import { CollectionDataDecoder } from './event_log_decoder/Collection_data.js';
import { NFTEventDecoder } from   './event_log_decoder/NFT_data.js';
import { NFTMetadataDecoder } from './event_log_decoder/NFT_metadata.js';


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
export async function handleQuicknodeStream(params, response) {
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

        response.json({ success: true, data: result });
    } catch (error) {
        console.error('Stream handling error:', error);
        response.status(500).json({ success: false, error: error.message });
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
    const decodedEvent = nftDecoder.decodeEvent(payload);

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

    const result = await pool.query(query, values);
    return result.rows[0];
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

// Initialize tables when starting the application
initializeTables().catch(console.error);