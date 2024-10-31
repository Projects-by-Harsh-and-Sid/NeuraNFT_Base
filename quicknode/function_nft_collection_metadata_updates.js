// streamHandler.js
import { Pool } from 'pg';
import { CollectionEventDecoder } from './decoders/CollectionEventDecoder.js';
import { NFTEventDecoder } from './decoders/NFTEventDecoder.js';
import { NFTMetadataEventDecoder } from './decoders/NFTMetadataEventDecoder.js';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// Initialize decoders
const collectionDecoder = new CollectionEventDecoder();
const nftDecoder = new NFTEventDecoder();
const metadataDecoder = new NFTMetadataEventDecoder();

async function main(request, context) {
    const streamData = request.body;
    const streamId = request.headers['x-stream-id'];

    try {
        // Route handling based on stream ID
        switch(streamId) {
            case 'collection_update':
                return await handleCollectionStream(streamData);
            case 'nft_update':
                return await handleNFTStream(streamData);
            case 'nft_metadata_update':
                return await handleMetadataStream(streamData);
            default:
                throw new Error(`Unknown stream ID: ${streamId}`);
        }
    } catch (error) {
        console.error(`Error processing stream ${streamId}:`, error);
        return { success: false, error: error.message };
    }
}

async function handleCollectionStream(data) {
    try {
        // Decode the collection event data
        const decodedData = collectionDecoder.decode(data);
        
        const query = `
            INSERT INTO collection_updates (
                collection_id,
                name,
                creator_address,
                owner_address,
                context_window,
                base_model,
                image,
                description,
                transaction_hash,
                block_number,
                update_type,
                timestamp
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `;

        const values = [
            decodedData.collectionId,
            decodedData.name,
            decodedData.creatorAddress.toLowerCase(),
            decodedData.ownerAddress.toLowerCase(),
            decodedData.contextWindow,
            decodedData.baseModel,
            decodedData.image,
            decodedData.description,
            decodedData.transactionHash,
            decodedData.blockNumber,
            decodedData.updateType,
            new Date()
        ];

        const result = await pool.query(query, values);
        console.log('Collection update stored:', result.rows[0]);
        return { success: true, data: result.rows[0] };

    } catch (error) {
        console.error('Error handling collection stream:', error);
        return { success: false, error: error.message };
    }
}

async function handleNFTStream(data) {
    try {
        // Decode the NFT event data
        const decodedData = nftDecoder.decode(data);

        const query = `
            INSERT INTO nft_updates (
                nft_id,
                collection_id,
                name,
                creator_address,
                owner_address,
                level_of_ownership,
                creation_date,
                transaction_hash,
                block_number,
                update_type,
                timestamp
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;

        const values = [
            decodedData.nftId,
            decodedData.collectionId,
            decodedData.name,
            decodedData.creatorAddress.toLowerCase(),
            decodedData.ownerAddress.toLowerCase(),
            decodedData.levelOfOwnership,
            decodedData.creationDate,
            decodedData.transactionHash,
            decodedData.blockNumber,
            decodedData.updateType,
            new Date()
        ];

        const result = await pool.query(query, values);
        console.log('NFT update stored:', result.rows[0]);
        return { success: true, data: result.rows[0] };

    } catch (error) {
        console.error('Error handling NFT stream:', error);
        return { success: false, error: error.message };
    }
}

async function handleMetadataStream(data) {
    try {
        // Decode the metadata event data
        const decodedData = metadataDecoder.decode(data);

        const query = `
            INSERT INTO nft_metadata_updates (
                nft_id,
                collection_id,
                image,
                base_model,
                data_url,
                rag_url,
                fine_tune_data_url,
                description,
                transaction_hash,
                block_number,
                update_type,
                timestamp
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `;

        const values = [
            decodedData.nftId,
            decodedData.collectionId,
            decodedData.image,
            decodedData.baseModel,
            decodedData.dataUrl,
            decodedData.ragUrl,
            decodedData.fineTuneDataUrl,
            decodedData.description,
            decodedData.transactionHash,
            decodedData.blockNumber,
            decodedData.updateType,
            new Date()
        ];

        const result = await pool.query(query, values);
        console.log('Metadata update stored:', result.rows[0]);
        return { success: true, data: result.rows[0] };

    } catch (error) {
        console.error('Error handling metadata stream:', error);
        return { success: false, error: error.message };
    }
}

// Database schema setup
async function setupDatabase() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Collection updates table
        await client.query(`
            CREATE TABLE IF NOT EXISTS collection_updates (
                id SERIAL PRIMARY KEY,
                collection_id INTEGER NOT NULL,
                name VARCHAR(255) NOT NULL,
                creator_address VARCHAR(42) NOT NULL,
                owner_address VARCHAR(42) NOT NULL,
                context_window INTEGER,
                base_model TEXT,
                image TEXT,
                description TEXT,
                transaction_hash VARCHAR(66) NOT NULL,
                block_number BIGINT NOT NULL,
                update_type VARCHAR(50) NOT NULL,
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_collection_updates_collection_id 
            ON collection_updates(collection_id);
        `);

        // NFT updates table
        await client.query(`
            CREATE TABLE IF NOT EXISTS nft_updates (
                id SERIAL PRIMARY KEY,
                nft_id INTEGER NOT NULL,
                collection_id INTEGER NOT NULL,
                name VARCHAR(255) NOT NULL,
                creator_address VARCHAR(42) NOT NULL,
                owner_address VARCHAR(42) NOT NULL,
                level_of_ownership INTEGER NOT NULL,
                creation_date TIMESTAMP WITH TIME ZONE,
                transaction_hash VARCHAR(66) NOT NULL,
                block_number BIGINT NOT NULL,
                update_type VARCHAR(50) NOT NULL,
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_nft_updates_nft_collection 
            ON nft_updates(nft_id, collection_id);
        `);

        // NFT metadata updates table
        await client.query(`
            CREATE TABLE IF NOT EXISTS nft_metadata_updates (
                id SERIAL PRIMARY KEY,
                nft_id INTEGER NOT NULL,
                collection_id INTEGER NOT NULL,
                image TEXT,
                base_model TEXT,
                data_url TEXT,
                rag_url TEXT,
                fine_tune_data_url TEXT,
                description TEXT,
                transaction_hash VARCHAR(66) NOT NULL,
                block_number BIGINT NOT NULL,
                update_type VARCHAR(50) NOT NULL,
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_metadata_updates_nft_collection 
            ON nft_metadata_updates(nft_id, collection_id);
        `);

        await client.query('COMMIT');
        console.log('Database schema setup completed');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error setting up database schema:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Initialize database on startup
setupDatabase().catch(console.error);

export { main };