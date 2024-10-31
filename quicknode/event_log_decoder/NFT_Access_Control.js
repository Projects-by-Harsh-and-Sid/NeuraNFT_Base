const { Web3 } = require('web3');

class NFTAccessEventDecoder {
    constructor() {
        this.web3 = new Web3();
        
        // Event signatures
        this.eventSignatures = {
            // AccessGranted(uint256,uint256,address,uint256)
            '0xd5422307db29d9fcf76206ee945905c864bf3bf5118ab875bc2c9523e59866e9': 'AccessGranted',
            // AccessRequested(address,uint256,uint256)
            '0x9c22416d2351a8fd56706bdcaba7a6a4a245104ea90834907b9f503a5de96c43': 'AccessRequested'
        };
        
        // Access level mappings
        this.accessLevels = {
            '0': 'None (0)',
            '1': 'UseModel (1)',
            '2': 'Resale (2)',
            '3': 'CreateReplica (3)',
            '4': 'ViewAndDownload (4)',
            '5': 'EditData (5)',
            '6': 'AbsoluteOwnership (6)'
        };
    }

    async decodeEvents(events) {
        const decodedEvents = [];
        for (const event of events) {
            const decoded = await this.decodeEvent(event);
            if (decoded) decodedEvents.push(decoded);
        }
        return decodedEvents;
    }

    async decodeEvent(event) {
        const eventType = this.eventSignatures[event.topics[0]];
        if (!eventType) return null;

        const baseInfo = {
            type: eventType,
            blockNumber: parseInt(event.blockNumber, 16),
            blockHash: event.blockHash,
            transactionHash: event.transactionHash,
            transactionIndex: parseInt(event.transactionIndex, 16),
            logIndex: parseInt(event.logIndex, 16),
            contractAddress: event.address,
            timestamp: await this.getBlockTimestamp(parseInt(event.blockNumber, 16))
        };

        let decodedEvent;
        switch (eventType) {
            case 'AccessGranted':
                decodedEvent = this.decodeAccessGranted(event, baseInfo);
                break;
            case 'AccessRequested':
                decodedEvent = this.decodeAccessRequested(event, baseInfo);
                break;
            default:
                return null;
        }

        return decodedEvent;
    }

    decodeAccessGranted(event, baseInfo) {
        return {
            ...baseInfo,
            collectionId: parseInt(event.topics[1], 16),
            nftId: parseInt(event.topics[2], 16),
            userAddress: '0x' + event.topics[3].slice(26),
            accessLevel: this.decodeAccessLevel(parseInt(event.data, 16)),
            operation: 'Grant Access Request',
            status: 'Success',
            reason: 'Access is granted',
            summary: `Access Granted: Collection ${parseInt(event.topics[1], 16)}, NFT ${parseInt(event.topics[2], 16)}, Level ${this.decodeAccessLevel(parseInt(event.data, 16))}`
        };
    }

    decodeAccessRequested(event, baseInfo) {
        return {
            ...baseInfo,
            requesterAddress: '0x' + event.topics[1].slice(26),
            collectionId: parseInt(event.topics[2], 16),
            nftId: parseInt(event.topics[3], 16),
            requestedLevel: this.decodeAccessLevel(parseInt(event.data, 16)),
            operation: 'Request Access',
            status: 'Pending',
            reason: 'Access request submitted',
            summary: `Access Requested: Collection ${parseInt(event.topics[2], 16)}, NFT ${parseInt(event.topics[3], 16)}, Level ${this.decodeAccessLevel(parseInt(event.data, 16))}`
        };
    }

    decodeAccessLevel(level) {
        return this.accessLevels[level.toString()] || 'Unknown';
    }

    async getBlockTimestamp(blockNumber) {
        try {
            const block = await this.web3.eth.getBlock(blockNumber);
            if (!block) {
                return new Date().toISOString().replace('T', ' ').slice(0, 19);
            }
            const date = new Date(parseInt(block.timestamp) * 1000);
            return date.toISOString().replace('T', ' ').slice(0, 19);
        } catch (error) {
            console.error(`Error getting timestamp for block ${blockNumber}:`, error);
            return new Date().toISOString().replace('T', ' ').slice(0, 19);
        }
    }
}

// Example usage
function decodeExampleEvents() {
    const exampleEvents = [
        {
            "address": "0x2c6993608197b40ae0d0d1042829541067ac761e",
            "blockHash": "0x365c4f9483eea112d4871fe9dac0ba3169ae804f26cd38b34407c388c43045d1",
            "blockNumber": "0x1026997",
            "data": "0x0000000000000000000000000000000000000000000000000000000000000001",
            "logIndex": "0x29",
            "removed": false,
            "topics": [
                "0xd5422307db29d9fcf76206ee945905c864bf3bf5118ab875bc2c9523e59866e9",
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x0000000000000000000000000000000000000000000000000000000000000007",
                "0x000000000000000000000000cb6d7cdca0563575b6b734fa4f3e9d6ac7542912"
            ],
            "transactionHash": "0xcf1f4291e0c66863e9e55c1f260cb9ddab2106d580f09abfcb331f447ca1023b",
            "transactionIndex": "0x16"
        },
        {
            "address": "0x2c6993608197b40ae0d0d1042829541067ac761e",
            "blockHash": "0x365c4f9483eea112d4871fe9dac0ba3169ae804f26cd38b34407c388c43045d1",
            "blockNumber": "0x1026997",
            "data": "0x0000000000000000000000000000000000000000000000000000000000000001",
            "logIndex": "0x2a",
            "removed": false,
            "topics": [
                "0x9c22416d2351a8fd56706bdcaba7a6a4a245104ea90834907b9f503a5de96c43",
                "0x000000000000000000000000cb6d7cdca0563575b6b734fa4f3e9d6ac7542912",
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x0000000000000000000000000000000000000000000000000000000000000007"
            ],
            "transactionHash": "0xcf1f4291e0c66863e9e55c1f260cb9ddab2106d580f09abfcb331f447ca1023b",
            "transactionIndex": "0x16"
        }
    ];

    const decoder = new NFTAccessEventDecoder();
    decoder.decodeEvents(exampleEvents).then(decodedEvents => {
        console.log(JSON.stringify(decodedEvents, null, 2));
    });
}

// Run the example

decodeExampleEvents();

// Export the decoder
module.exports = NFTAccessEventDecoder;