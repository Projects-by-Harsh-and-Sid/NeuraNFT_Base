const { Web3 } = require('web3');

class NFTEventDecoder {
    constructor() {
        this.web3 = new Web3();
        
        // Known event signatures
        this.eventSignatures = {
            '0x70c783e7a8d1b78c0efffba9d45d314bfe7a85f6388c8e9a32536a97949a0f2a': 'NFTCreated',
            '0x9ed053bb818ff08b8353cd46f78db1f0799f31c9e4458fdb425c10eccd2efc44': 'Transfer'
        };
    }

    decodeEvents(events) {
        return events.map(event => this.decodeEvent(event));
    }

    decodeEvent(event) {
        const eventType = this.eventSignatures[event.topics[0]] || 'Unknown';
        
        const baseInfo = {
            type: eventType,
            blockNumber: parseInt(event.blockNumber, 16),
            blockHash: event.blockHash,
            transactionHash: event.transactionHash,
            transactionIndex: parseInt(event.transactionIndex, 16),
            logIndex: parseInt(event.logIndex, 16),
            contractAddress: event.address
        };

        let decodedEvent;
        switch(eventType) {
            case 'NFTCreated':
                decodedEvent = this.decodeNFTCreatedEvent(event, baseInfo);
                break;
            case 'Transfer':
                decodedEvent = this.decodeTransferEvent(event, baseInfo);
                break;
            default:
                decodedEvent = {
                    ...baseInfo,
                    rawData: event.data,
                    rawTopics: event.topics
                };
        }

        return decodedEvent;
    }

    decodeNFTCreatedEvent(event, baseInfo) {
        // Decode the collection ID and token ID from topics
        const collectionId = parseInt(event.topics[1], 16);
        const tokenId = parseInt(event.topics[2], 16);

        // Decode the data field which contains the name and creator
        const decodedData = this.decodeNFTCreatedData(event.data);

        return {
            ...baseInfo,
            collectionId: collectionId,
            tokenId: tokenId,
            name: decodedData.name,
            creator: decodedData.creator,
            summary: `NFT Created: Collection ${collectionId}, Token ${tokenId}, Name "${decodedData.name}" by ${decodedData.creator}`
        };
    }

    decodeNFTCreatedData(data) {
        // Remove '0x' prefix
        const cleanData = data.slice(2);
        
        // First 32 bytes point to the start of the name string
        const nameOffset = parseInt(cleanData.slice(0, 64), 16);
        
        // Next 32 bytes contain the creator address
        const creator = '0x' + cleanData.slice(64, 128).slice(24);
        
        // The name string starts at nameOffset
        const nameLength = parseInt(cleanData.slice(128, 192), 16);
        const nameHex = cleanData.slice(192, 192 + (nameLength * 2));
        const name = this.web3.utils.hexToUtf8('0x' + nameHex).trim();

        return { name, creator };
    }

    decodeTransferEvent(event, baseInfo) {
        return {
            ...baseInfo,
            fromCollectionId: parseInt(event.topics[1], 16),
            fromAddress: '0x' + event.topics[2].slice(26),
            toTokenId: parseInt(event.topics[3], 16),
            transferData: parseInt(event.data, 16),
            summary: `Transfer: From Collection ${parseInt(event.topics[1], 16)}, ` +
                    `From Address ${'0x' + event.topics[2].slice(26)}, ` +
                    `To Token ${parseInt(event.topics[3], 16)}`
        };
    }
}

// // Example usage
// function decodeExampleEvents() {
//     const exampleEvents = [
//         {
//           "address": "0xac537d070acfa1f0c6df29a87b5d63c26fff6dce",
//           "blockHash": "0xd84ddb681e7b498d181137cf4dec0ac1921a51bb2fdb15ac803bc2b053df2b6e",
//           "blockNumber": "0x1026912",
//           "data": "0x000000000000000000000000000000000000000000000000000000000000004000000000000000000000000043adac5516f8e2d3d2bd31276bec343547ee6612000000000000000000000000000000000000000000000000000000000000000f436f676e6974697665204c6c616d610000000000000000000000000000000000",
//           "logIndex": "0x2f",
//           "removed": false,
//           "topics": [
//             "0x70c783e7a8d1b78c0efffba9d45d314bfe7a85f6388c8e9a32536a97949a0f2a",
//             "0x0000000000000000000000000000000000000000000000000000000000000001",
//             "0x0000000000000000000000000000000000000000000000000000000000000001"
//           ],
//           "transactionHash": "0x62d67cc95a1313583d5ec244fa873df44eff812cbdc1504b80eae419d9bcae82",
//           "transactionIndex": "0x13"
//         },
//         {
//           "address": "0xac537d070acfa1f0c6df29a87b5d63c26fff6dce",
//           "blockHash": "0xd84ddb681e7b498d181137cf4dec0ac1921a51bb2fdb15ac803bc2b053df2b6e",
//           "blockNumber": "0x1026912",
//           "data": "0x0000000000000000000000000000000000000000000000000000000000000001",
//           "logIndex": "0x30",
//           "removed": false,
//           "topics": [
//             "0x9ed053bb818ff08b8353cd46f78db1f0799f31c9e4458fdb425c10eccd2efc44",
//             "0x0000000000000000000000000000000000000000000000000000000000000000",
//             "0x00000000000000000000000043adac5516f8e2d3d2bd31276bec343547ee6612",
//             "0x0000000000000000000000000000000000000000000000000000000000000001"
//           ],
//           "transactionHash": "0x62d67cc95a1313583d5ec244fa873df44eff812cbdc1504b80eae419d9bcae82",
//           "transactionIndex": "0x13"
//         }
//       ];

//     const decoder = new NFTEventDecoder();
//     const decodedEvents = decoder.decodeEvents(exampleEvents);
//     console.log(JSON.stringify(decodedEvents, null, 2));
//     return decodedEvents;
// }

// // Run the example if this file is executed directly
// if (require.main === module) {
//     decodeExampleEvents();
// }

module.exports = NFTEventDecoder;