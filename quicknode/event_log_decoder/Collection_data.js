const { Web3 } = require('web3');
const path = require('path');
const fs = require('fs');

class CollectionContractEventDecoder {
    constructor(providerUrl, contractAddress) {
        // Initialize Web3 with increased timeout and retry options
        const provider = new Web3.providers.HttpProvider(providerUrl, {
            timeout: 30000,
            reconnect: {
                auto: true,
                delay: 5000,
                maxAttempts: 5,
                onTimeout: true
            }
        });
        
        this.web3 = new Web3(provider);
        
        // Load ABI from file
        const abiPath = '../../smart_contracts/truffle_compiled_contract/build/contracts/CollectionContract.json';
        if (!fs.existsSync(abiPath)) {
            throw new Error('ABI file not found at: ' + abiPath);
        }
        
        const rawdata = fs.readFileSync(abiPath);
        const contractData = JSON.parse(rawdata);
        
        if (!contractData.abi) {
            throw new Error('ABI not found in contract data');
        }
        
        this.contract = new this.web3.eth.Contract(contractData.abi, contractAddress);
    }

    // Format timestamp
    async getBlockTimestamp(blockNumber) {
        try {
            const block = await this.web3.eth.getBlock(blockNumber);
            if (!block) {
                throw new Error(`Block ${blockNumber} not found`);
            }
            const date = new Date(Number(block.timestamp) * 1000);
            return date.toISOString().replace('T', ' ').slice(0, 19);
        } catch (error) {
            console.error(`Error getting timestamp for block ${blockNumber}:`, error);
            return new Date().toISOString().replace('T', ' ').slice(0, 19);
        }
    }

    async formatEvent(event) {
        const timestamp = await this.getBlockTimestamp(event.blockNumber);
        const baseFormat = {
            transaction_hash: event.transactionHash,
            block_number: event.blockNumber,
            timestamp: timestamp
        };

        let eventInfo;
        switch(event.event) {
            case 'CollectionCreated':
                eventInfo = {
                    operation: 'Create Collection',
                    collection_id: parseInt(event.returnValues.collectionId),
                    creator_address: event.returnValues.creator,
                    base_model: event.returnValues.baseModel,
                    status: 'Success',
                    reason: 'Collection created successfully'
                };
                break;

            case 'CollectionUpdated':
                eventInfo = {
                    operation: 'Update Collection',
                    collection_id: parseInt(event.returnValues.collectionId),
                    updater_address: event.returnValues.updater,
                    status: 'Success',
                    reason: 'Collection metadata updated'
                };
                break;

            case 'CollectionTransferred':
                eventInfo = {
                    operation: 'Transfer Collection',
                    collection_id: parseInt(event.returnValues.collectionId),
                    previous_owner: event.returnValues.previousOwner,
                    new_owner: event.returnValues.newOwner,
                    status: 'Success',
                    reason: 'Collection ownership transferred'
                };
                break;

            default:
                eventInfo = {
                    operation: 'Unknown Operation',
                    status: 'Unknown',
                    reason: `Unrecognized event type: ${event.event}`
                };
        }

        return {
            ...baseFormat,
            ...eventInfo
        };
    }

    async getFormattedEvents(fromBlock, toBlock) {
        try {
            console.log(`Fetching collection events from block ${fromBlock} to ${toBlock}...`);
            
            const events = await this.contract.getPastEvents('allEvents', {
                fromBlock,
                toBlock
            });

            console.log(`Found ${events.length} total events`);

            const formattedEvents = await Promise.all(
                events.map(async (event) => {
                    try {
                        return await this.formatEvent(event);
                    } catch (error) {
                        console.error('Error formatting event:', error);
                        return null;
                    }
                })
            );

            return formattedEvents
                .filter(event => event !== null)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        } catch (error) {
            console.error('Error fetching events:', error);
            throw new Error(`Failed to fetch events: ${error.message}`);
        }
    }

    // Get events for a specific collection
    async getCollectionEvents(collectionId, fromBlock, toBlock) {
        const allEvents = await this.getFormattedEvents(fromBlock, toBlock);
        return allEvents.filter(event => 
            event.collection_id === parseInt(collectionId)
        );
    }

    // Get events for a specific creator/owner
    async getCreatorEvents(creatorAddress, fromBlock, toBlock) {
        const allEvents = await this.getFormattedEvents(fromBlock, toBlock);
        return allEvents.filter(event => 
            event.creator_address?.toLowerCase() === creatorAddress.toLowerCase() ||
            event.previous_owner?.toLowerCase() === creatorAddress.toLowerCase() ||
            event.new_owner?.toLowerCase() === creatorAddress.toLowerCase()
        );
    }

    // Get metadata for a collection
    async getCollectionMetadata(collectionId) {
        try {
            const metadata = await this.contract.methods.getCollectionMetadata(collectionId).call();
            return {
                name: metadata.name,
                contextWindow: parseInt(metadata.contextWindow),
                baseModel: metadata.baseModel,
                image: metadata.image,
                description: metadata.description,
                creator: metadata.creator,
                dateCreated: new Date(parseInt(metadata.dateCreated) * 1000).toISOString().replace('T', ' ').slice(0, 19),
                owner: metadata.owner
            };
        } catch (error) {
            console.error(`Error fetching metadata for collection ${collectionId}:`, error);
            throw error;
        }
    }

    // Get total collections
    async getTotalCollections() {
        try {
            return await this.contract.methods.getTotalCollections().call();
        } catch (error) {
            console.error('Error fetching total collections:', error);
            throw error;
        }
    }
}

module.exports = CollectionContractEventDecoder;