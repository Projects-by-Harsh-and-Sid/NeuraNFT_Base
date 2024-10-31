    // metadataChecker.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

class MetadataChecker {
    constructor() {
        this.pool = new pg.Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: 'access_log_database',
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT || 5432
        });
    }

    // Main function to check metadata and notify
    async checkAndNotifyEmptyMetadata() {
        try {
            // Get NFTs with empty metadata
            const emptyMetadataNFTs = await this.findEmptyMetadataNFTs();

            if (emptyMetadataNFTs.length > 0) {
                // Send notifications
                await this.sendNotifications(emptyMetadataNFTs);
                console.log(`Found ${emptyMetadataNFTs.length} NFTs with empty metadata`);
            } else {
                console.log('No NFTs with empty metadata found');
            }

            return emptyMetadataNFTs;

        } catch (error) {
            console.error('Error in checkAndNotifyEmptyMetadata:', error);
            throw error;
        }
    }

    // Find NFTs with empty metadata
    async findEmptyMetadataNFTs() {
        const client = await this.pool.connect();
        try {
            const query = `
                SELECT 
                    n.nftid,
                    n.collectionid,
                    n.owner_address,
                    n.timestamp as creation_time,
                    CASE 
                        WHEN m.image IS NULL OR m.image = '' THEN 'Missing Image'
                        WHEN m.baseModel IS NULL OR m.baseModel = '' THEN 'Missing Base Model'
                        WHEN m.data IS NULL OR m.data = '' THEN 'Missing Data'
                        WHEN m.rag IS NULL OR m.rag = '' THEN 'Missing RAG'
                        WHEN m.fineTuneData IS NULL OR m.fineTuneData = '' THEN 'Missing Fine Tune Data'
                        WHEN m.description IS NULL OR m.description = '' THEN 'Missing Description'
                    END as missing_fields
                FROM nfts n
                LEFT JOIN metadata m ON n.nftid = m.nftid AND n.collectionid = m.collectionid
                WHERE 
                    m.image IS NULL OR m.image = '' OR
                    m.baseModel IS NULL OR m.baseModel = '' OR
                    m.data IS NULL OR m.data = '' OR
                    m.rag IS NULL OR m.rag = '' OR
                    m.fineTuneData IS NULL OR m.fineTuneData = '' OR
                    m.description IS NULL OR m.description = ''
                ORDER BY n.timestamp DESC;
            `;

            const result = await client.query(query);
            return result.rows;

        } catch (error) {
            console.error('Error finding empty metadata NFTs:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Send notifications for empty metadata
    async sendNotifications(emptyMetadataNFTs) {
        try {
            // Group NFTs by owner for consolidated notifications
            const nftsByOwner = this.groupNFTsByOwner(emptyMetadataNFTs);

            // Process each owner's notifications
            for (const [ownerAddress, nfts] of Object.entries(nftsByOwner)) {
                // Simulate sending notification to another service
                console.log('\n=== Notification Service Simulation ===');
                console.log(`To: ${ownerAddress}`);
                console.log('Subject: Missing NFT Metadata Alert');
                console.log('Message: The following NFTs have incomplete metadata:');
                
                nfts.forEach(nft => {
                    console.log(`- NFT ID: ${nft.nftid}, Collection ID: ${nft.collectionid}`);
                    console.log(`  Missing: ${nft.missing_fields}`);
                    console.log(`  Created: ${nft.creation_time}`);
                });
                
                console.log('=====================================\n');
            }

            // Log notification stats
            console.log(`Notifications sent to ${Object.keys(nftsByOwner).length} owners`);
            
        } catch (error) {
            console.error('Error sending notifications:', error);
            throw error;
        }
    }

    // Helper function to group NFTs by owner
    groupNFTsByOwner(nfts) {
        return nfts.reduce((grouped, nft) => {
            if (!grouped[nft.owner_address]) {
                grouped[nft.owner_address] = [];
            }
            grouped[nft.owner_address].push(nft);
            return grouped;
        }, {});
    }

    // Run periodic check
    async startPeriodicCheck(intervalMinutes = 60) {
        console.log(`Starting periodic metadata check every ${intervalMinutes} minutes`);
        
        // Initial check
        await this.checkAndNotifyEmptyMetadata();

        // Set up interval
        setInterval(async () => {
            await this.checkAndNotifyEmptyMetadata();
        }, intervalMinutes * 60 * 1000);
    }
}


export default MetadataChecker;