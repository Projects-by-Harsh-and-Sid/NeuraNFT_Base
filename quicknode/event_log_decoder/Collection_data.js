const { Web3 } = require('web3');

class CollectionDataDecoder {
    constructor() {
        this.web3 = new Web3();
    }

    decodeEvent(eventData) {
        // Step 1: Convert hex block number to decimal
        const blockNumber = parseInt(eventData.blockNumber, 16);
        
        // Step 2: Decode topics
        const eventSignature = eventData.topics[0];
        const collectionId = parseInt(eventData.topics[1], 16);
        const address = '0x' + eventData.topics[2].slice(26).toLowerCase();
        
        // Step 3: Decode the data field (contains the base model string)
        const decodedString = this.decodeString(eventData.data);
        
        // Step 4: Create formatted output
        const decodedEvent = {
            // Event identification
            type: this.identifyEventType(eventSignature),
            contract: eventData.address,
            
            // Block and transaction info
            blockNumber: blockNumber,
            blockHash: eventData.blockHash,
            transactionHash: eventData.transactionHash,
            transactionIndex: parseInt(eventData.transactionIndex, 16),
            logIndex: parseInt(eventData.logIndex, 16),
            
            // Decoded data
            collectionId: collectionId,
            address: address,
            baseModel: decodedString,
            
            // Raw data (for reference)
            rawTopics: eventData.topics,
            rawData: eventData.data
        };

        // Step 5: Add human-readable summary
        decodedEvent.summary = this.generateSummary(decodedEvent);
        
        return decodedEvent;
    }

    decodeString(hexData) {
        try {
            // Remove '0x' prefix if present
            const cleanHex = hexData.startsWith('0x') ? hexData.slice(2) : hexData;
            
            // First 32 bytes (64 chars) represent the offset
            // Next 32 bytes represent the string length
            const stringLength = parseInt(cleanHex.slice(64, 128), 16);
            
            // The actual string data starts after the length
            const stringHex = cleanHex.slice(128, 128 + (stringLength * 2));
            
            // Convert hex to string
            return this.web3.utils.hexToUtf8('0x' + stringHex).trim();
        } catch (error) {
            console.error('Error decoding string data:', error);
            return '';
        }
    }

    identifyEventType(eventSignature) {
        // Common event signatures (you can add more as needed)
        const signatures = {
            '0xb0b7b214963f2e16da9cf6ed5851757dfed306875edf1d59e030881102ef24ef': 'CollectionUpdated',
            // Add more event signatures as needed
        };
        
        return signatures[eventSignature] || 'Unknown';
    }

    generateSummary(decodedEvent) {
        return `Collection ${decodedEvent.collectionId} was updated by ${decodedEvent.address} to use base model "${decodedEvent.baseModel}" in block ${decodedEvent.blockNumber}`;
    }
}

// Example usage function
function decodeEventExample() {
    const exampleEvent = {
        "address": "0x536446035ef24cb011a3b55f0627df2fad083f67",
        "blockHash": "0x92fbfc5ef13c2ba48cd705dde158f4363895460297ee5299642c73694fa1ba02",
        "blockNumber": "0x10268f8",
        "data": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000094c6c616d6120332e310000000000000000000000000000000000000000000000",
        "logIndex": "0x8",
        "removed": false,
        "topics": [
          "0xb0b7b214963f2e16da9cf6ed5851757dfed306875edf1d59e030881102ef24ef",
          "0x0000000000000000000000000000000000000000000000000000000000000014",
          "0x00000000000000000000000043adac5516f8e2d3d2bd31276bec343547ee6612"
        ],
        "transactionHash": "0x3d417250bd9c0467163546968453287a27002d57d1160a0cf9d0052b98e8f4af",
        "transactionIndex": "0x7"
      };

    const decoder = new CollectionDataDecoder();
    const decodedResult = decoder.decodeEvent(exampleEvent);
    
    console.log(JSON.stringify(decodedResult, null, 2));
    return decodedResult;
}

// Run the example if this file is executed directly
if (require.main === module) {
    decodeEventExample();
}

module.exports = CollectionDataDecoder;