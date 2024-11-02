// dbService.js
const express = require('express');
const { Pool } = require('pg');
// require('dotenv').config();

const app = express();
app.use(express.json());

// Initialize PostgreSQL connection
const pool = new Pool({
    user: process.env.POSTGRES_USER || 'neuranft',
    host: process.env.POSTGRES_HOST || 'test.postgres.neuranft.com',
    database: process.env.POSTGRES_DB || 'neuranft_db',
    password: process.env.POSTGRES_PASSWORD || 'neuranft_password',
    port: process.env.POSTGRES_PORT || 5432,
});

// Initialize database tables
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

            const accessControlTableQuery = `
        -- Create enum for access operations
        DO $$ BEGIN
            CREATE TYPE access_operation AS ENUM (
                'Request Access',
                'Grant Access Request'
            );
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        -- Create enum for access status
        DO $$ BEGIN
            CREATE TYPE access_status AS ENUM (
                'Pending',
                'Success',
                'Failed'
            );
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        -- NFT Access Control Events table
        CREATE TABLE IF NOT EXISTS nft_access_events (
            id SERIAL PRIMARY KEY,
            collection_id BIGINT NOT NULL,
            nft_id BIGINT NOT NULL,
            user_address VARCHAR(42) NOT NULL,
            access_level VARCHAR(50) NOT NULL,
            operation access_operation NOT NULL,
            status access_status NOT NULL,
            reason TEXT,
            block_number BIGINT,
            block_hash VARCHAR(66),
            transaction_hash VARCHAR(66) NOT NULL,
            transaction_index INTEGER,
            log_index INTEGER,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            summary TEXT,
            
            -- Constraints
            CONSTRAINT unique_access_event UNIQUE (transaction_hash, log_index)
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_access_collection_nft 
        ON nft_access_events(collection_id, nft_id);
        
        CREATE INDEX IF NOT EXISTS idx_access_user 
        ON nft_access_events(user_address);
        
        CREATE INDEX IF NOT EXISTS idx_access_timestamp 
        ON nft_access_events(timestamp);
        
        CREATE INDEX IF NOT EXISTS idx_access_status 
        ON nft_access_events(status);
    `;

    // Add this to your initializeTables function
    await client.query(accessControlTableQuery);
        console.log('Database tables initialized successfully');
    } catch (error) {
        console.error('Error initializing tables:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Collection route
app.post('/api/collections', async (req, res) => {
    try {
        const decodedEvent = req.body;
        console.log('RECEIVED COLLECTION EVENT');
        console.log('Decoded event:', decodedEvent);
        
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
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error handling collection data:', error);
        res.status(500).json({ error: error.message });
    }
});

// NFT route
app.post('/api/nfts', async (req, res) => {
    try {
        const { events } = req.body;
        const results = [];

        for (const decodedEvent of events) {
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

                const result = await pool.query(query, values);
                results.push(result.rows[0]);
            }
        }
        
        res.json(results);
    } catch (error) {
        console.error('Error handling NFT data:', error);
        res.status(500).json({ error: error.message });
    }
});

// Metadata route
app.post('/api/metadata', async (req, res) => {
    try {
        const decodedEvent = req.body;

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
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error handling metadata:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/access-control', async (req, res) => {

    console.log('RECEIVED ACCESS CONTROL EVENT');
    // console.log('Decoded event:', req.body);


    try {
        const { events } = req.body;
        // console.log('Received access control events:', events);
        const results = [];
        const event = events[0];
        console.log('Decoded event:', event);
        const query = `
        INSERT INTO nft_access_events (
            collection_id,
            nft_id,
            user_address,
            access_level,
            operation,
            status,
            reason,
            block_number,
            block_hash,
            transaction_hash,
            transaction_index,
            log_index,
            timestamp,
            summary
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), $13)
        ON CONFLICT (transaction_hash, log_index) 
        DO UPDATE SET
            status = EXCLUDED.status,
            reason = EXCLUDED.reason,
            summary = EXCLUDED.summary,
            timestamp = NOW()
        RETURNING *`;
    
    const values = [
        event.collectionId,
        event.nftId,
        event.userAddress,
        event.accessLevel,
        event.operation,
        event.status,
        event.reason,
        event.blockNumber,
        event.blockHash,
        event.transactionHash,
        event.transactionIndex,
        event.logIndex,
        event.summary
    ];

        const result = await pool.query(query, values);
        results.push(result.rows[0]);
        
        
        res.json(results);
    } catch (error) {
        console.error('Error handling access control event:', error);
        res.status(500).json({ error: error.message });
    }
});

// Initialize tables and start server
const PORT = process.env.PORT || 5431;

async function startServer() {
    try {
        await initializeTables();
        app.listen(PORT, () => {
            console.log(`Database service running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();