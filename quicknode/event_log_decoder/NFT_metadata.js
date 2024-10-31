const {Web3} = require('web3');

class NFTMetadataDecoder {
    constructor() {
        this.web3 = new Web3();
        
        this.eventSignatures = {
            '0x03f37875a30d73ff3ec38e4597342ebf44d54b2097441e1e23ca00a68a9ff692': 'MetadataUpdated'
        };
    }

    decodeMetadataEvent(event) {
        const eventType = this.eventSignatures[event.topics[0]] || 'Unknown';
        
        const baseInfo = {
            type: eventType,
            blockNumber: parseInt(event.blockNumber, 16),
            blockHash: event.blockHash,
            transactionHash: event.transactionHash,
            transactionIndex: parseInt(event.transactionIndex, 16),
            logIndex: parseInt(event.logIndex, 16),
            contractAddress: event.address,
            collectionId: parseInt(event.topics[1], 16),
            nftId: parseInt(event.topics[2], 16)
        };

        const decodedMetadata = this.decodeMetadataData(event.data);

        return {
            ...baseInfo,
            metadata: decodedMetadata,
            summary: `NFT Metadata Updated: Collection ${baseInfo.collectionId}, Token ${baseInfo.nftId}, Model "${decodedMetadata.baseModel}"`
        };
    }

    decodeMetadataData(data) {
        // Remove '0x' prefix
        const cleanData = data.slice(2);
        
        // Get the starting positions of each string in the array
        const dataArray = cleanData.match(/.{1,64}/g);
        
        // The first word contains the offset to the start of the array
        const startOffset = parseInt(dataArray[0], 16);
        
        // Each subsequent word is an offset to a string
        const offsets = dataArray.slice(1, 7).map(hex => parseInt(hex, 16));
        
        // Extract each string using its offset and length
        return {
            image: this.formatImage(this.extractString(cleanData, offsets[0])),
            // baseModel: "-",
            // data: this.extractString(cleanData, offsets[2]),
            // rag: this.extractString(cleanData, offsets[3]),
            // fineTuneData: this.extractString(cleanData, offsets[4]),
            description: this.extractString(cleanData, offsets[5])
        };
    }

    formatImage(imageUrl) {
        if (!imageUrl) return '';

        // Match until the end of common image extensions
        const extensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
        const extensionPattern = `(.*?\\.(${extensions.join('|')}))`;
        const regex = new RegExp(extensionPattern, 'i');
        
        const match = imageUrl.match(regex);
        if (match) {
            return match[1];
        }
        
        return imageUrl;
    }


    extractString(data, offset) {
        // Each string starts with a 32-byte length prefix
        const startPos = offset * 2;
        const lengthHex = data.slice(startPos, startPos + 64);
        const length = parseInt(lengthHex, 16);
        
        // Get the actual string data
        const stringHex = data.slice(startPos + 64, startPos + 64 + (length * 2));
        let decoded = this.web3.utils.hexToUtf8('0x' + stringHex);
        
        // Clean up the string - remove any non-printable characters and extra whitespace
        decoded = decoded.replace(/[\x00-\x1F\x7F-\x9F]/g, ''); // Remove control characters
        decoded = decoded.replace(/[^\x20-\x7E]/g, ''); // Keep only printable ASCII
        decoded = decoded.trim(); // Remove leading/trailing whitespace
        
        // Extract URLs or other valid content
        if (decoded.includes('http')) {
            const urlMatch = decoded.match(/(https?:\/\/[^\s]+)/);
            if (urlMatch) {
                decoded = urlMatch[0];
            }
        }
        
        return decoded;
    }
}

// // Example usage
// function decodeExample() {
//     const exampleEvent = {
//         "address": "0x13846e6fde06853f6cc822a58f97adbebf1e6afd",
//         "blockHash": "0x53c1c72be3905dd2600fa4069bc9cc9409535e06e091fc9aff267d7de640dd03",
//         "blockNumber": "0x1026966",
//         "data": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000002200000000000000000000000000000000000000000000000000000000000000280000000000000000000000000000000000000000000000000000000000000003268747470733a2f2f626173652e6261636b656e642e6e657572616e66742e636f6d2f696d6167652f74656d7031332e706e67000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000094c6c616d6120332e310000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002668747470733a2f2f626173652e6261636b656e642e6e657572616e66742e636f6d2f646174610000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002568747470733a2f2f626173652e6261636b656e642e6e657572616e66742e636f6d2f726167000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002e68747470733a2f2f626173652e6261636b656e642e6e657572616e66742e636f6d2f66696e6554756e65446174610000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000090416e2041492d67656e657261746564206372656174696f6e2c2070617274206f66207468652072653a67656e65726174657320636f6c6c656374696f6e2e2054686973206973206120756e69717565204e46542066726f6d207468652072653a67656e65726174657320636f6c6c656374696f6e2c20666561747572696e67204c6c616d6120332e31206d6f64656c2e00000000000000000000000000000000",     
//         "logIndex": "0x27",
//         "removed": false,
//         "topics": [
//           "0x03f37875a30d73ff3ec38e4597342ebf44d54b2097441e1e23ca00a68a9ff692",
//           "0x0000000000000000000000000000000000000000000000000000000000000001",
//           "0x0000000000000000000000000000000000000000000000000000000000000006"
//         ],
//         "transactionHash": "0x5dfece9d5ba17c427f6ab6bc72d48ec73708f78970ef6dac893726410895ec10",
//         "transactionIndex": "0xf"
//       };

//     const decoder = new NFTMetadataDecoder();
//     const decodedMetadata = decoder.decodeMetadataEvent(exampleEvent);
//     console.log(JSON.stringify(decodedMetadata, null, 2));
//     return decodedMetadata;
// }

// // Run the example
// decodeExample();

module.exports = NFTMetadataDecoder;