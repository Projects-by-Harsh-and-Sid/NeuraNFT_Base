// Import dependencies
const { Web3 } = require('web3');
const axios = require('axios');


const NFTAccessEventDecoder = require('./event_log_decoder/NFT_Access_Control.js');

// Configuration
const CONTRACT_ADDRESSES = {
    ACCESS_CONTROL: "0x2c6993608197b40ae0d0d1042829541067ac761e"
};

const DB_CONFIG = {
    hostname: 'test.database.neuranft.com',
    port: 5431,
    endpoints: {
        access: '/api/access-control'
    }
};

// Initialize decoder
const accessDecoder = new NFTAccessEventDecoder();

/**
 * Sends decoded data to the database service
 */
async function sendToDatabase(endpoint, data) {
    const path = `http://${DB_CONFIG.hostname}:${DB_CONFIG.port}${endpoint}`;
    console.log('Sending to URL:', path);
    console.log('Sending data:', JSON.stringify(data, null, 2));
    
    try {
        const response = await axios.post(path, data);
        return response.data;
    } catch (error) {
        console.error('Database error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw error;
    }
}

/**
 * Main function for processing events
 */
async function main(params) {
    try {
        console.log('Received params:', JSON.stringify(params, null, 2));

        // Validate input
        if (!params.data || !params.data[0]) {
            throw new Error('No event data provided');
        }

        const contract_address = params.data[0].address;
        console.log('Contract address:', contract_address);
        
        // Verify contract address
        if (contract_address !== CONTRACT_ADDRESSES.ACCESS_CONTROL) {
            throw new Error(`Unknown contract address: ${contract_address}`);
        }

        // Decode events
        console.log('Decoding events...');
        const decodedEvents = await accessDecoder.decodeEvents(params.data);
        console.log('Decoded events:', JSON.stringify(decodedEvents, null, 2));
        
        if (!decodedEvents || decodedEvents.length === 0) {
            throw new Error('No valid events decoded');
        }

        // Send to database
        console.log('Sending to database...');
        const result = await sendToDatabase(
            DB_CONFIG.endpoints.access, 
            { events: decodedEvents }
        );
        console.log('Database response:', result);

        // Return success response
        return {
            success: true,
            data: result,
            decodedEvents: decodedEvents,
            summary: decodedEvents.map(event => event.summary)
        };

    } catch (error) {
        console.error('Error processing access control event:', error);
        return {
            success: false,
            error: error.message,
            decodedEvents: [], 
            params: params
        };
    }
}

// Test events
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

// Run the test
async function runTest() {
    console.log('Starting test...');
    try {
        const result = await main({ data: exampleEvents });
        console.log('Test result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Test failed:', error);
    }
}

runTest();