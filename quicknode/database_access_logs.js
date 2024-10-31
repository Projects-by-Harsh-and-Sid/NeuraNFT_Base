const { Pool } = require('pg');

const NFTAccessEventDecoder = require('./event_log_decoder//NFT_Access_Control.js');
// import dotenv from 'dotenv';

// dotenv.config();

class NFTAccessStreamHandler {
    constructor() {
        this.pool = new Pool({
            user: process.env.POSTGRES_USER || 'neuranft',
            host: process.env.POSTGRES_HOST || 'localhost',
            database: process.env.POSTGRES_DB || 'neuranft_db',
            password: process.env.POSTGRES_PASSWORD || 'neuranft_password',
            port: process.env.POSTGRES_PORT || 5432,
        });
        
        this.accessDecoder = new NFTAccessEventDecoder();
    }

    async initialize() {
        const client = await this.pool.connect();
        try {
            await client.query(`
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
                    timestamp TIMESTAMP NOT NULL,
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
            `);
            console.log('Database table initialized successfully');
        } catch (error) {
            console.error('Error initializing table:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async handleStream(payload) {
        try {
            const decodedEvents = await this.accessDecoder.decodeEvents(Array.isArray(payload) ? payload : [payload]);
            console.log('Decoded Events:', decodedEvents);

            const results = [];
            for (const decodedEvent of decodedEvents) {
                if (decodedEvent.type !== 'AccessRequested') {
                    const result = await this.handleAccessEvent(decodedEvent);
                    results.push(result);
                }
            }

            return results;
        } catch (error) {
            console.error('Error handling stream:', error);
            throw error;
        }
    }

    async handleAccessEvent(decodedEvent) {
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
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (transaction_hash, log_index) 
            DO UPDATE SET
                status = EXCLUDED.status,
                reason = EXCLUDED.reason,
                timestamp = EXCLUDED.timestamp
            RETURNING *`;

        const values = [
            decodedEvent.collectionId,
            decodedEvent.nftId || decodedEvent.nftId,
            decodedEvent.userAddress || decodedEvent.requesterAddress,
            decodedEvent.accessLevel || decodedEvent.requestedLevel,
            decodedEvent.operation,
            decodedEvent.status,
            decodedEvent.reason,
            decodedEvent.blockNumber,
            decodedEvent.blockHash,
            decodedEvent.transactionHash,
            decodedEvent.transactionIndex,
            decodedEvent.logIndex,
            decodedEvent.timestamp,
            decodedEvent.summary
        ];

        const result = await this.pool.query(query, values);
        console.log('Access Event Recorded:', result.rows[0]);
        return result.rows[0];
    }

    // Utility method to get recent access events for a specific NFT
    async getNFTAccessHistory(collectionId, nftId, limit = 10) {
        const query = `
            SELECT * FROM nft_access_events 
            WHERE collection_id = $1 AND nft_id = $2 
            ORDER BY timestamp DESC 
            LIMIT $3`;
            
        const result = await this.pool.query(query, [collectionId, nftId, limit]);
        return result.rows;
    }

    // Utility method to get pending access requests
    async getPendingRequests() {
        const query = `
            SELECT * FROM nft_access_events 
            WHERE status = 'Pending' 
            ORDER BY timestamp DESC`;
            
        const result = await this.pool.query(query);
        return result.rows;
    }
}

// Example usage
async function main() {
    try {
        const streamHandler = new NFTAccessStreamHandler();
        await streamHandler.initialize();

        // Example NFT Access events from your code
        const accessEvents = [
            {
                "address": "0x2c6993608197b40ae0d0d1042829541067ac761e",
                "blockHash": "0x365c4f9483eea112d4871fe9dac0ba3169ae804f26cd38b34407c388c43045d1",
                "blockNumber": "0x1026997",
                "data": "0x0000000000000000000000000000000000000000000000000000000000000001",
                "logIndex": "0x29",
                "removed": false,
                "topics": [
                    "0xd5422307db29d9fcf76206ee945905c864bf3bf5118ab875bc2c9523e59866e9",
                    "0x0000000000000000000000000000000000000000000000000000000000000001",
                    "0x0000000000000000000000000000000000000000000000000000000000000007",
                    "0x000000000000000000000000cb6d7cdca0563575b6b734fa4f3e9d6ac7542912"
                ],
                "transactionHash": "0xcf1f4291e0c66863e9e55c1f260cb9ddab2106d580f09abfcb331f447ca1023b",
                "transactionIndex": "0x16"
            }
        ];

        const result = await streamHandler.handleStream(accessEvents);
        console.log('Stream handling result:', result);

        // Example of getting access history
        const history = await streamHandler.getNFTAccessHistory(1, 7);
        console.log('Access history:', history);
    } catch (error) {
        console.error('Error in main:', error);
    }
}


main().catch(console.error);
// const streamHandler = new NFTAccessStreamHandler();

// streamHandler.initialize().then(() => {
//     console.log('Initialized successfully');
// }).catch(console.error);

// // Export the handler class
// export default NFTAccessStreamHandler;

// // Run the example if this file is executed directly
// if (require.main === module) {
//     main().catch(console.error);
// }