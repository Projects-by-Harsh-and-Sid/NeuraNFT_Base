// nftCollectionHandler.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

class NFTCollectionHandler {
    constructor() {
        this.pool = new pg.Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_DATABASE,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT || 5432
        });
    }

    // Initialize database tables
    async initializeTables() {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // Collections table
            await client.query(`
                CREATE TABLE IF NOT EXISTS collections (
                    collection_id INTEGER PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    context_window INTEGER,
                    base_model TEXT,
                    image TEXT,
                    description TEXT,
                    creator_address VARCHAR(42) NOT NULL,
                    owner_address VARCHAR(42) NOT NULL,
                    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );

                CREATE INDEX IF NOT EXISTS idx_collections_creator 
                ON collections(creator_address);
                
                CREATE INDEX IF NOT EXISTS idx_collections_owner 
                ON collections(owner_address);
            `);

            // NFTs table
            await client.query(`
                CREATE TABLE IF NOT EXISTS nfts (
                    nft_id INTEGER,
                    collection_id INTEGER,
                    name VARCHAR(255) NOT NULL,
                    level_of_ownership INTEGER NOT NULL,
                    creator_address VARCHAR(42) NOT NULL,
                    owner_address VARCHAR(42) NOT NULL,
                    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (nft_id, collection_id),
                    FOREIGN KEY (collection_id) REFERENCES collections(collection_id)
                );

                CREATE INDEX IF NOT EXISTS idx_nfts_creator 
                ON nfts(creator_address);
                
                CREATE INDEX IF NOT EXISTS idx_nfts_owner 
                ON nfts(owner_address);

                CREATE INDEX IF NOT EXISTS idx_nfts_collection 
                ON nfts(collection_id);
            `);

            // NFT metadata table
            await client.query(`
                CREATE TABLE IF NOT EXISTS nft_metadata (
                    nft_id INTEGER,
                    collection_id INTEGER,
                    image TEXT,
                    base_model TEXT,
                    data TEXT,
                    rag TEXT,
                    fine_tune_data TEXT,
                    description TEXT,
                    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (nft_id, collection_id),
                    FOREIGN KEY (nft_id, collection_id) REFERENCES nfts(nft_id, collection_id)
                );
            `);

            await client.query('COMMIT');
            console.log('Database tables initialized successfully');

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error initializing tables:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Store Collection Data
    async storeCollection(collectionData) {
        try {
            const query = `
                INSERT INTO collections (
                    collection_id, name, context_window, base_model, 
                    image, description, creator_address, owner_address
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (collection_id) 
                DO UPDATE SET
                    name = EXCLUDED.name,
                    context_window = EXCLUDED.context_window,
                    base_model = EXCLUDED.base_model,
                    image = EXCLUDED.image,
                    description = EXCLUDED.description,
                    owner_address = EXCLUDED.owner_address,
                    last_updated = CURRENT_TIMESTAMP
                RETURNING *
            `;

            const values = [
                collectionData.collectionId,
                collectionData.name,
                collectionData.contextWindow,
                collectionData.baseModel,
                collectionData.image,
                collectionData.description,
                collectionData.creatorAddress.toLowerCase(),
                collectionData.ownerAddress.toLowerCase()
            ];

            const result = await this.pool.query(query, values);
            return result.rows[0];

        } catch (error) {
            console.error('Error storing collection:', error);
            throw error;
        }
    }

    // Store NFT Data
    async storeNFT(nftData) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // Store NFT basic data
            const nftQuery = `
                INSERT INTO nfts (
                    nft_id, collection_id, name, level_of_ownership,
                    creator_address, owner_address
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (nft_id, collection_id) 
                DO UPDATE SET
                    name = EXCLUDED.name,
                    level_of_ownership = EXCLUDED.level_of_ownership,
                    owner_address = EXCLUDED.owner_address,
                    last_updated = CURRENT_TIMESTAMP
                RETURNING *
            `;

            const nftValues = [
                nftData.nftId,
                nftData.collectionId,
                nftData.name,
                nftData.levelOfOwnership,
                nftData.creatorAddress.toLowerCase(),
                nftData.ownerAddress.toLowerCase()
            ];

            const nftResult = await client.query(nftQuery, nftValues);

            // Store NFT metadata if provided
            if (nftData.metadata) {
                const metadataQuery = `
                    INSERT INTO nft_metadata (
                        nft_id, collection_id, image, base_model,
                        data, rag, fine_tune_data, description
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    ON CONFLICT (nft_id, collection_id) 
                    DO UPDATE SET
                        image = EXCLUDED.image,
                        base_model = EXCLUDED.base_model,
                        data = EXCLUDED.data,
                        rag = EXCLUDED.rag,
                        fine_tune_data = EXCLUDED.fine_tune_data,
                        description = EXCLUDED.description,
                        last_updated = CURRENT_TIMESTAMP
                `;

                const metadataValues = [
                    nftData.nftId,
                    nftData.collectionId,
                    nftData.metadata.image,
                    nftData.metadata.baseModel,
                    nftData.metadata.data,
                    nftData.metadata.rag,
                    nftData.metadata.fineTuneData,
                    nftData.metadata.description
                ];

                await client.query(metadataQuery, metadataValues);
            }

            await client.query('COMMIT');
            return nftResult.rows[0];

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error storing NFT:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Fetch Collection Data
    async fetchCollection(collectionId) {
        try {
            const query = `
                SELECT collections.*, 
                       COUNT(DISTINCT nfts.nft_id) as total_nfts,
                       COUNT(DISTINCT nfts.owner_address) as unique_owners
                FROM collections
                LEFT JOIN nfts ON collections.collection_id = nfts.collection_id
                WHERE collections.collection_id = $1
                GROUP BY collections.collection_id
            `;

            const result = await this.pool.query(query, [collectionId]);
            return result.rows[0];

        } catch (error) {
            console.error('Error fetching collection:', error);
            throw error;
        }
    }

    // Fetch NFT Data
    async fetchNFT(nftId, collectionId) {
        try {
            const query = `
                SELECT n.*, m.*
                FROM nfts n
                LEFT JOIN nft_metadata m 
                    ON n.nft_id = m.nft_id 
                    AND n.collection_id = m.collection_id
                WHERE n.nft_id = $1 AND n.collection_id = $2
            `;

            const result = await this.pool.query(query, [nftId, collectionId]);
            return result.rows[0];

        } catch (error) {
            console.error('Error fetching NFT:', error);
            throw error;
        }
    }

    // Fetch NFTs by Collection
    async fetchNFTsByCollection(collectionId) {
        try {
            const query = `
                SELECT n.*, m.*
                FROM nfts n
                LEFT JOIN nft_metadata m 
                    ON n.nft_id = m.nft_id 
                    AND n.collection_id = m.collection_id
                WHERE n.collection_id = $1
                ORDER BY n.nft_id
            `;

            const result = await this.pool.query(query, [collectionId]);
            return result.rows;

        } catch (error) {
            console.error('Error fetching NFTs by collection:', error);
            throw error;
        }
    }

    // Fetch NFTs by Owner
    async fetchNFTsByOwner(ownerAddress) {
        try {
            const query = `
                SELECT n.*, c.name as collection_name, m.*
                FROM nfts n
                JOIN collections c ON n.collection_id = c.collection_id
                LEFT JOIN nft_metadata m 
                    ON n.nft_id = m.nft_id 
                    AND n.collection_id = m.collection_id
                WHERE n.owner_address = $1
                ORDER BY n.collection_id, n.nft_id
            `;

            const result = await this.pool.query(query, [ownerAddress.toLowerCase()]);
            return result.rows;

        } catch (error) {
            console.error('Error fetching NFTs by owner:', error);
            throw error;
        }
    }
}