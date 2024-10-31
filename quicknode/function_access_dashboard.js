import pg from 'pg';
import express from 'express';
import cors from 'cors';

// Database connection
const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'access_log_database',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

const app = express();
app.use(cors());
app.use(express.json());

// Main route to get access logs
app.get('/api/dashboard/logs', async (req, res) => {
    try {
        // Get query parameters for filtering
        const { page = 1, limit = 50, collectionid, nftid, status } = req.query;
        const offset = (page - 1) * limit;

        // Build query based on filters
        let query = 'SELECT * FROM access_logs';
        const queryParams = [];
        const conditions = [];

        // Add filters if they exist
        if (collectionid) {
            conditions.push(`collectionid = $${queryParams.length + 1}`);
            queryParams.push(collectionid);
        }
        if (nftid) {
            conditions.push(`nftid = $${queryParams.length + 1}`);
            queryParams.push(nftid);
        }
        if (status) {
            conditions.push(`status = $${queryParams.length + 1}`);
            queryParams.push(status);
        }

        // Add WHERE clause if there are any conditions
        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        // Add pagination
        query += ` ORDER BY timestamp DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
        queryParams.push(limit, offset);

        // Execute query
        const result = await pool.query(query, queryParams);

        // Send response
        res.json({
            success: true,
            data: result.rows,
            page: parseInt(page),
            limit: parseInt(limit),
            total: result.rowCount
        });

    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch logs' 
        });
    }
});