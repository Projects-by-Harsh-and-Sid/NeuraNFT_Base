const { Web3 } = require('web3');

class MasterAccessEventDecoder {
    constructor() {
        this.web3 = new Web3();
        
        // Event signatures
        this.eventSignatures = {
            // AccessGranted(address,address)
            '0x9f520b3bfc56d06f7065d10b4683b3f57ac8895d5026cd176dee95ce1454cb8d': 'AccessGranted'
        };

        // Known contract addresses and their names
        this.contractAddresses = {
            '0x536446035ef24cb011a3b55f0627df2fad083f67': 'CollectionContract',
            '0x13846e6fde06853f6cc822a58f97adbebf1e6afd': 'NFTMetadata',
            '0x2c6993608197b40ae0d0d1042829541067ac761e': 'NFTAccessControl',
            '0xead39c0363378b3100cb8c89820f71353136ebd0': 'MasterAccessControl',
            ' 0x596522432614C2ee07284A964077B9974D6744e5' : 'MigrationCntract'
            // Add more contract addresses as needed
        };
    }

    getContractName(address) {
        return this.contractAddresses[address.toLowerCase()] || 'Unknown Contract';
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
            masterContract: this.getContractName(event.address),
            timestamp: await this.getBlockTimestamp(parseInt(event.blockNumber, 16))
        };

        let decodedEvent;
        switch (eventType) {
            case 'AccessGranted':
                decodedEvent = this.decodeAccessGranted(event, baseInfo);
                break;
            default:
                return null;
        }

        return decodedEvent;
    }

    decodeAccessGranted(event, baseInfo) {
        const targetContract = '0x' + event.topics[1].slice(26);
        const caller = '0x' + event.topics[2].slice(26);

        return {
            ...baseInfo,
            operation: 'Grant Access',
            targetContractAddress: targetContract,
            targetContractName: this.getContractName(targetContract),
            callerAddress: caller,
            status: 'Success',
            reason: `Access granted to ${this.getContractName(targetContract)}`,
            summary: `Access Granted: ${caller} granted access to ${this.getContractName(targetContract)} (${targetContract})`
        };
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
          "address": "0xead39c0363378b3100cb8c89820f71353136ebd0",
          "blockHash": "0xab698f2c4ce799597d394843ce7f82ce7a3b1cc5cdb2aab52ee1ea889d23ed5f",
          "blockNumber": "0x102666d",
          "data": "0x",
          "logIndex": "0x0",
          "removed": false,
          "topics": [
            "0x9f520b3bfc56d06f7065d10b4683b3f57ac8895d5026cd176dee95ce1454cb8d",
            "0x000000000000000000000000ac537d070acfa1f0c6df29a87b5d63c26fff6dce",
            "0x000000000000000000000000536446035ef24cb011a3b55f0627df2fad083f67"
          ],
          "transactionHash": "0x53965de4267983fb4419e860017d3c2006fbb3546676d36a01a3d1496312a154",
          "transactionIndex": "0x1"
        }
      ];

    const decoder = new MasterAccessEventDecoder();
    decoder.decodeEvents(exampleEvents).then(decodedEvents => {
        console.log(JSON.stringify(decodedEvents, null, 2));
    });
}

// Decode the example events
decodeExampleEvents();

// Export the decoder
module.exports = MasterAccessEventDecoder;