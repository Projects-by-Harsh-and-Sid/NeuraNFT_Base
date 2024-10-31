const axios = require('axios');
import config from './config.json';


// Telegram bot configuration
const TELEGRAM_BOT_TOKEN = config.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = config.TELEGRAM_CHAT_ID;
const TELEGRAM_API_URL = config.TELEGRAM_API_URL;

/**
 * Creates a formatted message for Telegram from a single stream data item
 * @param {Object} item - The stream data item
 * @returns {string} - Formatted message text
 */
function createMessage(item) {
    const ethAmount = (BigInt(item.amount) / BigInt(1e18)).toString();
    return `🔔 *New Token Approval on ${item.network || 'Ethereum Network'}*\n\n` +
           `💰 *Amount:* ${ethAmount} ETH\n` +
           `🔢 *Block:* ${item.blockNumber || 'N/A'}\n` +
           `👤 *Spender:* \`${item.spender || 'N/A'}\`\n` +
           `🪙 *Token:* \`${item.token || 'N/A'}\`\n` +
           `📝 *Transaction:* \`${item.transactionHash || 'N/A'}\`\n` +
           `👛 *Wallet:* \`${item.wallet || 'N/A'}\``;
}

/**
 * Sends a message to Telegram
 * @param {string} message - The message to send
 * @returns {Promise<Object>} - Telegram API response
 */
async function sendToTelegram(message) {
    try {
        const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });
        
        return response.data;
    } catch (error) {
        console.error('Error sending to Telegram:', error.response ? error.response.data : error.message);
        throw error;
    }
}

/**
 * Processes and sends multiple messages to Telegram
 * @param {Array} data - Array of stream data items
 * @returns {Promise<string>} - A message indicating the number of Telegram messages sent
 */
async function processAndSendMessages(data) {
    try {
        // Send messages sequentially to avoid rate limiting
        let successCount = 0;
        for (const item of data) {
            const message = createMessage(item);
            await sendToTelegram(message);
            successCount++;
            
            // Add a small delay between messages to respect Telegram's rate limits
            if (successCount < data.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        console.log(`Sent ${successCount} messages to Telegram`);
        return `Successfully sent ${successCount} messages to Telegram`;
    } catch (error) {
        console.error('Error in message processing:', error);
        throw error;
    }
}

/**
 * Main function to process incoming data and send it to Telegram
 * @param {Object} params - Parameters passed to the function
 * @param {Array} params.data - Array of stream data items
 * @returns {Object} - Result of the operation
 */
async function main(params) {
    console.log('Starting main function with params:', JSON.stringify(params, null, 2));

    try {
        const { data } = params;

        // Validate input
        if (!Array.isArray(data)) {
            throw new Error('Invalid input: data is not an array');
        }

        if (data.length === 0) {
            return {
                message: "No data to send to Telegram",
                result: "No messages sent.",
            };
        }

        // Send data to Telegram
        const result = await processAndSendMessages(data);
        
        return {
            message: "Streams data sent to Telegram",
            result: result,
            processedTransactions: data.length
        };
    } catch (error) {
        console.error('Error in main function:', error.message);
        return {
            error: "Failed to send data to Telegram",
            details: error.message,
        };
    }
}

module.exports = { main };