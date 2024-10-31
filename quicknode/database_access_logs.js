import pg from 'pg';
import dotenv from 'dotenv';
import {NFTAccessControlEventDecoder} from './event_log_decoder/NFT_Access_Control.js';

dotenv.config();


// call the decoder for event logs



// Database configuration
const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'access_log_database',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432
});

class AccessLogPusher {
    // Push a single log entry
    async pushLog(logData) {
        try {
            // Va
            const Decodedlog = this.decodeEventLogData(logData);
            this.validateLogData(Decodedlog);

            const query = `
                INSERT INTO access_logs (
                    nftid,
                    collectionid,
                    user_address,
                    owner_address,
                    operation,
                    access_request,
                    current_level,
                    status,
                    reason,
                    timestamp
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *
            `;

            const values = [
                logData.nftid,
                logData.collectionid,
                logData.user_address.toLowerCase(),  // Normalize addresses to lowercase
                logData.owner_address.toLowerCase(),
                logData.operation,
                logData.access_request,
                logData.current_level,
                logData.status,
                logData.reason,
                logData.timestamp || new Date()
            ];

            const result = await pool.query(query, values);
            console.log('Successfully pushed log:', result.rows[0]);
            return result.rows[0];

        } catch (error) {
            console.error('Error pushing log:', error);
            throw error;
        }
    }

    // Push multiple log entries in a single transaction
    async pushBatchLogs(logsArray) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const results = [];
            for (const logData of logsArray) {
                this.validateLogData(logData);
                
                const query = `
                    INSERT INTO access_logs (
                        nftid,
                        collectionid,
                        user_address,
                        owner_address,
                        operation,
                        access_request,
                        current_level,
                        status,
                        reason,
                        timestamp
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    RETURNING *
                `;

                const values = [
                    logData.nftid,
                    logData.collectionid,
                    logData.user_address.toLowerCase(),
                    logData.owner_address.toLowerCase(),
                    logData.operation,
                    logData.access_request,
                    logData.current_level,
                    logData.status,
                    logData.reason,
                    logData.timestamp || new Date()
                ];

                const result = await client.query(query, values);
                results.push(result.rows[0]);
            }

            await client.query('COMMIT');
            console.log(`Successfully pushed ${results.length} logs`);
            return results;

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error pushing batch logs:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    decodeEventLogData(logData) { 
        try {
            const decoder = new NFTAccessControlEventDecoder();
            const decodedData = decoder.decodeEventLogData(logData);
            return decodedData;
        } catch (error) {
            console.error('Error decoding event log data:', error);
            throw new Error('Failed to decode event log data');
        }

    }

    // Validate log data
    validateLogData(logData) {
        const requiredFields = [
            'nftid',
            'collectionid',
            'user_address',
            'owner_address',
            'operation',
            'access_request',
            'current_level',
            'status'
        ];

        for (const field of requiredFields) {
            if (logData[field] === undefined || logData[field] === null) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Validate address format
        const addressRegex = /^0x[a-fA-F0-9]{40}$/;
        if (!addressRegex.test(logData.user_address) || !addressRegex.test(logData.owner_address)) {
            throw new Error('Invalid address format');
        }

        // Validate IDs are positive integers
        if (!Number.isInteger(logData.nftid) || logData.nftid <= 0 ||
            !Number.isInteger(logData.collectionid) || logData.collectionid <= 0) {
            throw new Error('Invalid ID format');
        }
    }
}