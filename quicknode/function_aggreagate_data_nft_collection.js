// nftCollectionAggregator.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

class NFTCollectionAggregator {
    constructor() {
        this.pool = new pg.Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: 'access_log_database',
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT || 5432
        });
    }

    async getAggregatedData(collectionId = null, nftId = null) {
        const client = await this.pool.connect();
        try {
            let aggregatedData = {};

            if (collectionId && nftId) {
                // Get specific NFT data within collection
                aggregatedData = await this.getNFTSpecificData(client, collectionId, nftId);
            } else if (collectionId) {
                // Get collection-wide data
                aggregatedData = await this.getCollectionData(client, collectionId);
            } else {
                // Get platform-wide data
                aggregatedData = await this.getPlatformData(client);
            }

            return aggregatedData;

        } catch (error) {
            console.error('Error getting aggregated data:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Get data for a specific NFT
    async getNFTSpecificData(client, collectionId, nftId) {
        const queries = {
            // Basic NFT info
            nftInfo: `
                SELECT 
                    n.*,
                    c.name as collection_name,
                    c.creator_address as collection_creator
                FROM nfts n
                JOIN collections c ON n.collectionid = c.collectionid
                WHERE n.nftid = $1 AND n.collectionid = $2
            `,

            // Access statistics
            accessStats: `
                SELECT 
                    COUNT(*) as total_accesses,
                    COUNT(DISTINCT user_address) as unique_users,
                    COUNT(CASE WHEN status = 'Success' THEN 1 END) as successful_accesses,
                    MAX(timestamp) as last_access,
                    MODE() WITHIN GROUP (ORDER BY access_request) as most_requested_access
                FROM access_logs
                WHERE nftid = $1 AND collectionid = $2
            `,

            // User interactions
            userInteractions: `
                SELECT 
                    user_address,
                    COUNT(*) as access_count,
                    MAX(timestamp) as last_interaction,
                    array_agg(DISTINCT access_request) as requested_access_types
                FROM access_logs
                WHERE nftid = $1 AND collectionid = $2
                GROUP BY user_address
                ORDER BY access_count DESC
                LIMIT 10
            `,

            // Access level distribution
            accessLevels: `
                SELECT 
                    current_level,
                    COUNT(*) as level_count,
                    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
                FROM access_logs
                WHERE nftid = $1 AND collectionid = $2
                GROUP BY current_level
                ORDER BY level_count DESC
            `
        };

        const [nftInfo, accessStats, userInteractions, accessLevels] = await Promise.all([
            client.query(queries.nftInfo, [nftId, collectionId]),
            client.query(queries.accessStats, [nftId, collectionId]),
            client.query(queries.userInteractions, [nftId, collectionId]),
            client.query(queries.accessLevels, [nftId, collectionId])
        ]);

        return {
            nftInfo: nftInfo.rows[0],
            accessStatistics: accessStats.rows[0],
            topUsers: userInteractions.rows,
            accessLevelDistribution: accessLevels.rows,
            metadata: {
                timestamp: new Date(),
                nftId,
                collectionId
            }
        };
    }

    // Get collection-wide data
    async getCollectionData(client, collectionId) {
        const queries = {
            // Collection info
            collectionInfo: `
                SELECT *
                FROM collections
                WHERE collectionid = $1
            `,

            // NFT statistics
            nftStats: `
                SELECT 
                    COUNT(*) as total_nfts,
                    COUNT(DISTINCT owner_address) as unique_owners,
                    MAX(timestamp) as latest_nft_created
                FROM nfts
                WHERE collectionid = $1
            `,

            // Access patterns
            accessPatterns: `
                SELECT 
                    DATE_TRUNC('day', timestamp) as date,
                    COUNT(*) as access_count,
                    COUNT(DISTINCT nftid) as nfts_accessed,
                    COUNT(DISTINCT user_address) as unique_users
                FROM access_logs
                WHERE collectionid = $1
                GROUP BY DATE_TRUNC('day', timestamp)
                ORDER BY date DESC
                LIMIT 30
            `,

            // Top NFTs by access
            topNFTs: `
                SELECT 
                    nftid,
                    COUNT(*) as access_count,
                    COUNT(DISTINCT user_address) as unique_users,
                    MAX(timestamp) as last_access
                FROM access_logs
                WHERE collectionid = $1
                GROUP BY nftid
                ORDER BY access_count DESC
                LIMIT 10
            `
        };

        const [collectionInfo, nftStats, accessPatterns, topNFTs] = await Promise.all([
            client.query(queries.collectionInfo, [collectionId]),
            client.query(queries.nftStats, [collectionId]),
            client.query(queries.accessPatterns, [collectionId]),
            client.query(queries.topNFTs, [collectionId])
        ]);

        return {
            collectionInfo: collectionInfo.rows[0],
            statistics: nftStats.rows[0],
            dailyAccessPatterns: accessPatterns.rows,
            topPerformingNFTs: topNFTs.rows,
            metadata: {
                timestamp: new Date(),
                collectionId
            }
        };
    }

    // Get platform-wide statistics
    async getPlatformData(client) {
        const queries = {
            // Overall platform statistics
            platformStats: `
                SELECT 
                    (SELECT COUNT(*) FROM collections) as total_collections,
                    (SELECT COUNT(*) FROM nfts) as total_nfts,
                    (SELECT COUNT(DISTINCT user_address) FROM access_logs) as total_users,
                    (SELECT COUNT(*) FROM access_logs) as total_accesses
            `,

            // Top collections
            topCollections: `
                SELECT 
                    c.collectionid,
                    c.name,
                    COUNT(DISTINCT n.nftid) as nft_count,
                    COUNT(DISTINCT al.user_address) as user_count,
                    COUNT(al.*) as access_count
                FROM collections c
                LEFT JOIN nfts n ON c.collectionid = n.collectionid
                LEFT JOIN access_logs al ON c.collectionid = al.collectionid
                GROUP BY c.collectionid, c.name
                ORDER BY access_count DESC
                LIMIT 10
            `,

            // Recent activity
            recentActivity: `
                SELECT 
                    al.*,
                    c.name as collection_name
                FROM access_logs al
                JOIN collections c ON al.collectionid = c.collectionid
                ORDER BY al.timestamp DESC
                LIMIT 20
            `
        };

        const [platformStats, topCollections, recentActivity] = await Promise.all([
            client.query(queries.platformStats),
            client.query(queries.topCollections),
            client.query(queries.recentActivity)
        ]);

        return {
            platformStatistics: platformStats.rows[0],
            topCollections: topCollections.rows,
            recentActivity: recentActivity.rows,
            metadata: {
                timestamp: new Date()
            }
        };
    }
}


export default NFTCollectionAggregator;