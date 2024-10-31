// accessDataAggregator.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();


///////////////////////////////// HAVE TO DECODE THE EVENT LOG DATA THEN PUSH IT TO THE DATABASE /////////////////////////////////


const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'access_log_database',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432
});

class AccessDataAggregator {
    async getAggregatedAccessData(nftId, collectionId) {
        const client = await pool.connect();
        try {
            // Begin transaction for consistent data
            await client.query('BEGIN');

            // Get basic statistics
            const statsQuery = `
                SELECT 
                    COUNT(*) as total_requests,
                    COUNT(DISTINCT user_address) as unique_users,
                    COUNT(CASE WHEN status = 'Success' THEN 1 END) as successful_requests,
                    COUNT(CASE WHEN status = 'Failed' THEN 1 END) as failed_requests,
                    MIN(timestamp) as first_access,
                    MAX(timestamp) as latest_access,
                    mode() WITHIN GROUP (ORDER BY current_level) as most_common_level,
                    mode() WITHIN GROUP (ORDER BY access_request) as most_requested_access
                FROM access_logs 
                WHERE nftid = $1 AND collectionid = $2
            `;

            // Get access level distribution
            const levelDistributionQuery = `
                SELECT 
                    current_level,
                    COUNT(*) as count,
                    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
                FROM access_logs 
                WHERE nftid = $1 AND collectionid = $2
                GROUP BY current_level
                ORDER BY count DESC
            `;

            // Get user access patterns
            const userPatternsQuery = `
                SELECT 
                    user_address,
                    COUNT(*) as total_requests,
                    COUNT(CASE WHEN status = 'Success' THEN 1 END) as successful_requests,
                    MAX(timestamp) as last_access,
                    array_agg(DISTINCT access_request) as requested_access_levels,
                    array_agg(DISTINCT current_level) as granted_access_levels
                FROM access_logs 
                WHERE nftid = $1 AND collectionid = $2
                GROUP BY user_address
                ORDER BY total_requests DESC
            `;

            // Get recent access history
            const recentHistoryQuery = `
                SELECT *
                FROM access_logs 
                WHERE nftid = $1 AND collectionid = $2
                ORDER BY timestamp DESC
                LIMIT 10
            `;

            // Get temporal analysis (daily activity)
            const temporalAnalysisQuery = `
                SELECT 
                    DATE_TRUNC('day', timestamp) as date,
                    COUNT(*) as requests,
                    COUNT(DISTINCT user_address) as unique_users
                FROM access_logs 
                WHERE nftid = $1 AND collectionid = $2
                GROUP BY DATE_TRUNC('day', timestamp)
                ORDER BY date DESC
                LIMIT 30
            `;

            // Execute all queries in parallel
            const [
                stats,
                levelDistribution,
                userPatterns,
                recentHistory,
                temporalAnalysis
            ] = await Promise.all([
                client.query(statsQuery, [nftId, collectionId]),
                client.query(levelDistributionQuery, [nftId, collectionId]),
                client.query(userPatternsQuery, [nftId, collectionId]),
                client.query(recentHistoryQuery, [nftId, collectionId]),
                client.query(temporalAnalysisQuery, [nftId, collectionId])
            ]);

            await client.query('COMMIT');

            // Format and return the aggregated data
            return {
                nftId,
                collectionId,
                summary: {
                    ...stats.rows[0],
                    success_rate: stats.rows[0].total_requests > 0 
                        ? (stats.rows[0].successful_requests / stats.rows[0].total_requests * 100).toFixed(2)
                        : 0
                },
                accessLevelDistribution: levelDistribution.rows,
                userAccessPatterns: userPatterns.rows.map(user => ({
                    ...user,
                    success_rate: (user.successful_requests / user.total_requests * 100).toFixed(2)
                })),
                recentActivity: recentHistory.rows,
                dailyActivity: temporalAnalysis.rows,
                metadata: {
                    generated_at: new Date(),
                    data_period: {
                        start: stats.rows[0].first_access,
                        end: stats.rows[0].latest_access
                    }
                }
            };

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error aggregating access data:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Get aggregated data for multiple NFTs in a collection
    async getCollectionAccessData(collectionId) {
        try {
            const query = `
                SELECT 
                    nftid,
                    COUNT(*) as total_requests,
                    COUNT(DISTINCT user_address) as unique_users,
                    COUNT(CASE WHEN status = 'Success' THEN 1 END) as successful_requests,
                    MAX(timestamp) as latest_access
                FROM access_logs 
                WHERE collectionid = $1
                GROUP BY nftid
                ORDER BY total_requests DESC
            `;

            const result = await pool.query(query, [collectionId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting collection access data:', error);
            throw error;
        }
    }

    // Get access history for a specific user
    async getUserAccessHistory(userAddress, nftId = null, collectionId = null) {
        try {
            let query = `
                SELECT *
                FROM access_logs 
                WHERE user_address = $1
            `;
            const params = [userAddress];

            if (nftId) {
                query += ` AND nftid = $${params.length + 1}`;
                params.push(nftId);
            }
            if (collectionId) {
                query += ` AND collectionid = $${params.length + 1}`;
                params.push(collectionId);
            }

            query += ' ORDER BY timestamp DESC';

            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Error getting user access history:', error);
            throw error;
        }
    }
}