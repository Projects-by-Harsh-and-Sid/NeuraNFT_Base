// masterAccessLogHandler.js
import pg from 'pg';
import dotenv from 'dotenv';
import { MasterAccessControlEventDecoder } from './event_log_decoder/Master_Access_Control.js';

dotenv.config();

// Database configuration
const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'access_log_database',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432
});

class MasterAccessLogPusher {
    constructor() {
        this.decoder = new MasterAccessControlEventDecoder();
    }

    // Push single master access log
    async pushLog(eventLog) {
        try {
            // First decode the event log
            const decodedLog = this.decodeEventLog(eventLog);
            
            // Validate decoded data
            this.validateLogData(decodedLog);

            // Insert into database
            const query = `
                INSERT INTO master_access_logs (
                    contract_address,
                    caller_address,
                    event_type,
                    access_granted,
                    timestamp,
                    transaction_hash,
                    block_number,
                    event_data
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `;

            const values = [
                decodedLog.contractAddress.toLowerCase(),
                decodedLog.callerAddress.toLowerCase(),
                decodedLog.eventType,
                decodedLog.accessGranted,
                decodedLog.timestamp || new Date(),
                decodedLog.transactionHash,
                decodedLog.blockNumber,
                JSON.stringify(decodedLog.eventData)
            ];

            const result = await pool.query(query, values);
            console.log('Successfully pushed master access log:', result.rows[0]);
            return result.rows[0];

        } catch (error) {
            console.error('Error pushing master access log:', error);
            throw error;
        }
    }

    // Push multiple logs in a transaction
    async pushBatchLogs(eventLogs) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const results = [];
            for (const eventLog of eventLogs) {
                const decodedLog = this.decodeEventLog(eventLog);
                this.validateLogData(decodedLog);

                const query = `
                    INSERT INTO master_access_logs (
                        contract_address,
                        caller_address,
                        event_type,
                        access_granted,
                        timestamp,
                        transaction_hash,
                        block_number,
                        event_data
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING *
                `;

                const values = [
                    decodedLog.contractAddress.toLowerCase(),
                    decodedLog.callerAddress.toLowerCase(),
                    decodedLog.eventType,
                    decodedLog.accessGranted,
                    decodedLog.timestamp || new Date(),
                    decodedLog.transactionHash,
                    decodedLog.blockNumber,
                    JSON.stringify(decodedLog.eventData)
                ];

                const result = await client.query(query, values);
                results.push(result.rows[0]);
            }

            await client.query('COMMIT');
            console.log(`Successfully pushed ${results.length} master access logs`);
            return results;

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error pushing batch master access logs:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Decode event log
    decodeEventLog(eventLog) {
        try {
            return this.decoder.decodeEventLog(eventLog);
        } catch (error) {
            console.error('Error decoding master access event log:', error);
            throw new Error('Failed to decode master access event log');
        }
    }

    // Validate decoded log data
    validateLogData(logData) {
        const requiredFields = [
            'contractAddress',
            'callerAddress',
            'eventType',
            'accessGranted',
            'transactionHash',
            'blockNumber'
        ];

        for (const field of requiredFields) {
            if (logData[field] === undefined || logData[field] === null) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Validate address format
        const addressRegex = /^0x[a-fA-F0-9]{40}$/;
        if (!addressRegex.test(logData.contractAddress) || !addressRegex.test(logData.callerAddress)) {
            throw new Error('Invalid address format');
        }

        // Validate transaction hash format
        const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
        if (!txHashRegex.test(logData.transactionHash)) {
            throw new Error('Invalid transaction hash format');
        }

        // Validate block number
        if (!Number.isInteger(logData.blockNumber) || logData.blockNumber < 0) {
            throw new Error('Invalid block number');
        }
    }

    // Helper function to create database schema
    async createSchema() {
        const client = await pool.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS master_access_logs (
                    id SERIAL PRIMARY KEY,
                    contract_address VARCHAR(42) NOT NULL,
                    caller_address VARCHAR(42) NOT NULL,
                    event_type VARCHAR(50) NOT NULL,
                    access_granted BOOLEAN NOT NULL,
                    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    transaction_hash VARCHAR(66) NOT NULL,
                    block_number BIGINT NOT NULL,
                    event_data JSONB,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );

                CREATE INDEX IF NOT EXISTS idx_master_access_contract 
                ON master_access_logs(contract_address);
                
                CREATE INDEX IF NOT EXISTS idx_master_access_caller 
                ON master_access_logs(caller_address);
                
                CREATE INDEX IF NOT EXISTS idx_master_access_timestamp 
                ON master_access_logs(timestamp);
                
                CREATE INDEX IF NOT EXISTS idx_master_access_tx 
                ON master_access_logs(transaction_hash);
            `);
            console.log('Master access logs schema created successfully');
        } catch (error) {
            console.error('Error creating schema:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}
