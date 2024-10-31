// const { Pool } = require('pg');

// const NFTAccessEventDecoder = require('./event_log_decoder//NFT_Access_Control.js');

const { Pool } = require('pg');
const MasterAccessEventDecoder = require('./event_log_decoder/Master_Access_Control.js');
// import dotenv from 'dotenv';

// dotenv.config();

class MasterAccessStreamHandler {
    constructor() {
        this.pool = new Pool({
            user: process.env.POSTGRES_USER || 'neuranft',
            host: process.env.POSTGRES_HOST || 'localhost',
            database: process.env.POSTGRES_DB || 'neuranft_db',
            password: process.env.POSTGRES_PASSWORD || 'neuranft_password',
            port: process.env.POSTGRES_PORT || 5432,
        });
        
        this.accessDecoder = new MasterAccessEventDecoder();
    }

    async initialize() {
        const client = await this.pool.connect();
        try {
            await client.query(`
                -- Operation type enum
                DO $$ BEGIN
                    CREATE TYPE master_operation AS ENUM (
                        'Grant Access',
                        'Revoke Access'
                    );
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;

                -- Create main master access logs table
                CREATE TABLE IF NOT EXISTS master_access_logs (
                    id SERIAL PRIMARY KEY,
                    contract_address VARCHAR(42) NOT NULL,
                    target_contract_address VARCHAR(42) NOT NULL,
                    target_contract_name VARCHAR(100),
                    caller_address VARCHAR(42) NOT NULL,
                    operation master_operation NOT NULL,
                    status VARCHAR(20) NOT NULL,
                    reason TEXT,
                    block_number BIGINT NOT NULL,
                    block_hash VARCHAR(66) NOT NULL,
                    transaction_hash VARCHAR(66) NOT NULL,
                    transaction_index INTEGER,
                    log_index INTEGER,
                    timestamp TIMESTAMP NOT NULL,
                    summary TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    
                    -- Constraints
                    CONSTRAINT unique_master_access_tx 
                    UNIQUE (transaction_hash, log_index)
                );

                -- Create indexes
                CREATE INDEX IF NOT EXISTS idx_master_contract 
                ON master_access_logs(contract_address);
                
                CREATE INDEX IF NOT EXISTS idx_master_target_contract 
                ON master_access_logs(target_contract_address);
                
                CREATE INDEX IF NOT EXISTS idx_master_caller 
                ON master_access_logs(caller_address);
                
                CREATE INDEX IF NOT EXISTS idx_master_timestamp 
                ON master_access_logs(timestamp);
                
                CREATE INDEX IF NOT EXISTS idx_master_status 
                ON master_access_logs(status);

                -- Create view for recent access grants
                CREATE OR REPLACE VIEW recent_master_access_grants AS
                SELECT 
                    contract_address,
                    target_contract_name,
                    caller_address,
                    operation,
                    status,
                    timestamp,
                    summary
                FROM master_access_logs
                WHERE operation = 'Grant Access'
                ORDER BY timestamp DESC
                LIMIT 100;
            `);
            console.log('Database schema initialized successfully');
        } catch (error) {
            console.error('Error initializing schema:', error);
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
                const result = await this.recordAccessEvent(decodedEvent);
                results.push(result);
            }

            return results;
        } catch (error) {
            console.error('Error handling stream:', error);
            throw error;
        }
    }

    async recordAccessEvent(decodedEvent) {
        const query = `
            INSERT INTO master_access_logs (
                contract_address,
                target_contract_address,
                target_contract_name,
                caller_address,
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
                timestamp = EXCLUDED.timestamp,
                summary = EXCLUDED.summary
            RETURNING *`;

        const values = [
            decodedEvent.contractAddress.toLowerCase(),
            decodedEvent.targetContractAddress.toLowerCase(),
            decodedEvent.targetContractName,
            decodedEvent.callerAddress.toLowerCase(),
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
        console.log('Master Access Event Recorded:', result.rows[0]);
        return result.rows[0];
    }

    // Utility function to get access history for a contract
    async getContractAccessHistory(contractAddress, limit = 10) {
        const query = `
            SELECT * FROM master_access_logs 
            WHERE target_contract_address = $1 
            ORDER BY timestamp DESC 
            LIMIT $2`;
            
        const result = await this.pool.query(query, [contractAddress.toLowerCase(), limit]);
        return result.rows;
    }

    // Utility function to get all granted access for a caller
    async getCallerAccessGrants(callerAddress) {
        const query = `
            SELECT 
                target_contract_address,
                target_contract_name,
                operation,
                status,
                timestamp,
                summary
            FROM master_access_logs 
            WHERE caller_address = $1 
                AND operation = 'Grant Access'
                AND status = 'Success'
            ORDER BY timestamp DESC`;
            
        const result = await this.pool.query(query, [callerAddress.toLowerCase()]);
        return result.rows;
    }
}

// Example usage
async function main() {
    try {
        const streamHandler = new MasterAccessStreamHandler();
        await streamHandler.initialize();

        // Example event from your code
        const masterAccessEvent = {
            "address": "0xead39c0363378b3100cb8c89820f71353136ebd0",
            "blockHash": "0xab698f2c4ce799597d394843ce7f82ce7a3b1cc5cdb2aab52ee1ea889d23ed5f",
            "blockNumber": "0x102666d",
            "data": "0x",
            "logIndex": "0x0",
            "removed": false,
            "topics": [
                "0x9f520b3bfc56d06f7065d10b4683b3f57ac8895d5026cd176dee95ce1454cb8d",
                "0x000000000000000000000000ac537d070acfa1f0c6df29a87b5d63c26fff6dce",
                "0x000000000000000000000000536446035ef24cb011a3b55f0627df2fad083f67"
            ],
            "transactionHash": "0x53965de4267983fb4419e860017d3c2006fbb3546676d36a01a3d1496312a154",
            "transactionIndex": "0x1"
        };

        const result = await streamHandler.handleStream(masterAccessEvent);
        console.log('Stream handling result:', result);

        // Example of getting access history
        const history = await streamHandler.getContractAccessHistory(
            "0x536446035ef24cb011a3b55f0627df2fad083f67"
        );
        console.log('Access history:', history);
    } catch (error) {
        console.error('Error in main:', error);
    }
}

main().catch(console.error);

// // Export the handler class
// export default MasterAccessStreamHandler;

// // Run the example if this file is executed directly
// if (require.main === module) {
//     main().catch(console.error);
// }