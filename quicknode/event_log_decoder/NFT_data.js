const { Web3 } = require('web3');
const path = require('path');
const fs = require('fs');

class NFTContractEventDecoder {
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
        const abiPath = path.join(__dirname, './NFTContract.json');
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
            case 'NFTCreated':
                eventInfo = {
                    operation: 'Create NFT',
                    collection_id: parseInt(event.returnValues.collectionId),
                    token_id: parseInt(event.returnValues.tokenId),
                    name: event.returnValues.name,
                    creator: event.returnValues.creator,
                    status: 'Success',
                    reason: 'NFT created successfully'
                };
                break;

            case 'NFTBurned':
                eventInfo = {
                    operation: 'Burn NFT',
                    collection_id: parseInt(event.returnValues.collectionId),
                    token_id: parseInt(event.returnValues.tokenId),
                    status: 'Success',
                    reason: 'NFT burned successfully'
                };
                break;

            case 'Transfer':
                const from = event.returnValues.from;
                const to = event.returnValues.to;
                let operation, reason;

                if (from === '0x0000000000000000000000000000000000000000') {
                    operation = 'Mint';
                    reason = 'NFT minted successfully';
                } else if (to === '0x0000000000000000000000000000000000000000') {
                    operation = 'Burn';
                    reason = 'NFT burned successfully';
                } else {
                    operation = 'Transfer';
                    reason = 'NFT transferred successfully';
                }

                eventInfo = {
                    operation: operation,
                    collection_id: parseInt(event.returnValues.collectionId),
                    token_id: parseInt(event.returnValues.tokenId),
                    from_address: from,
                    to_address: to,
                    status: 'Success',
                    reason: reason
                };
                break;

            case 'Approval':
                eventInfo = {
                    operation: 'Approval',
                    collection_id: parseInt(event.returnValues.collectionId),
                    token_id: parseInt(event.returnValues.tokenId),
                    owner: event.returnValues.owner,
                    approved: event.returnValues.approved,
                    status: 'Success',
                    reason: 'NFT approval granted'
                };
                break;

            case 'ApprovalForAll':
                eventInfo = {
                    operation: 'ApprovalForAll',
                    owner: event.returnValues.owner,
                    operator: event.returnValues.operator,
                    approved: event.returnValues.approved,
                    status: 'Success',
                    reason: event.returnValues.approved ? 
                        'Operator approved for all NFTs' : 
                        'Operator approval revoked for all NFTs'
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
            console.log(`Fetching NFT events from block ${fromBlock} to ${toBlock}...`);
            
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

    // Get events for a specific NFT
    async getNFTEvents(collectionId, tokenId, fromBlock, toBlock) {
        const allEvents = await this.getFormattedEvents(fromBlock, toBlock);
        return allEvents.filter(event => 
            event.collection_id === parseInt(collectionId) &&
            event.token_id === parseInt(tokenId)
        );
    }

    // Get events for a specific address (as creator, owner, or operator)
    async getAddressEvents(address, fromBlock, toBlock) {
        const allEvents = await this.getFormattedEvents(fromBlock, toBlock);
        return allEvents.filter(event => 
            event.creator?.toLowerCase() === address.toLowerCase() ||
            event.from_address?.toLowerCase() === address.toLowerCase() ||
            event.to_address?.toLowerCase() === address.toLowerCase() ||
            event.owner?.toLowerCase() === address.toLowerCase() ||
            event.operator?.toLowerCase() === address.toLowerCase()
        );
    }

    // Get NFT info
    async getNFTInfo(collectionId, tokenId) {
        try {
            const info = await this.contract.methods.getNFTInfo(collectionId, tokenId).call();
            return {
                levelOfOwnership: parseInt(info.levelOfOwnership),
                name: info.name,
                creator: info.creator,
                creationDate: new Date(parseInt(info.creationDate) * 1000).toISOString().replace('T', ' ').slice(0, 19),
                owner: info.owner
            };
        } catch (error) {
            console.error(`Error fetching NFT info for collection ${collectionId}, token ${tokenId}:`, error);
            throw error;
        }
    }

    // Get collection NFT count
    async getCollectionNFTCount(collectionId) {
        try {
            return await this.contract.methods.getCollectionNFTCount(collectionId).call();
        } catch (error) {
            console.error(`Error fetching NFT count for collection ${collectionId}:`, error);
            throw error;
        }
    }

    // Get all NFTs in a collection
    async getCollectionNFTs(collectionId) {
        try {
            return await this.contract.methods.getCollectionNFTs(collectionId).call();
        } catch (error) {
            console.error(`Error fetching NFTs for collection ${collectionId}:`, error);
            throw error;
        }
    }
}

module.exports = NFTContractEventDecoder;