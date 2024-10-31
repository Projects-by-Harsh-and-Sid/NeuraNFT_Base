// nftAccessNotifier.js
import axios from 'axios';
import dotenv from 'dotenv';
import Web3 from 'web3';

dotenv.config();

class NFTAccessNotifier {
    constructor() {
        this.web3 = new Web3();
        this.telegramConfig = {
            botToken: process.env.TELEGRAM_BOT_TOKEN,
            chatId: process.env.TELEGRAM_CHAT_ID,
            apiUrl: `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`
        };

        // Access levels mapping
        this.accessLevels = {
            0: 'None',
            1: 'UseModel',
            2: 'Resale',
            3: 'CreateReplica',
            4: 'ViewAndDownload',
            5: 'EditData',
            6: 'AbsoluteOwnership'
        };

        // Event signatures mapping
        this.eventSignatures = {
            '0x9d2895c58f907abc49b156bd3e061e8e7b444310187c44e6a689e36257f91f4e': 'AccessGranted',
            '0x4b26b1898d389fc92cf87e8f77a0e3611dbde04c63ce40237da9a3624134ecb5': 'AccessRevoked',
            '0x7cc3b2468c32ba1a25dc6d5a489e5b9b31526d86ec89e813f2440edb614c2350': 'AccessLevelChanged'
        };
    }

    // Decode NFT access control log
    decodeEventLog(log) {
        try {
            const eventSignature = log.topics[0];
            const eventName = this.eventSignatures[eventSignature] || 'Unknown Event';

            // Basic decoded data structure
            const decodedLog = {
                eventType: eventName,
                collectionId: parseInt(log.topics[1], 16),
                nftId: parseInt(log.topics[2], 16),
                userAddress: '0x' + log.topics[3].slice(26).toLowerCase(),
                blockNumber: parseInt(log.blockNumber, 16),
                transactionHash: log.transactionHash,
                timestamp: new Date(),
                contractAddress: log.address.toLowerCase()
            };

            // Decode data based on event type
            if (log.data && log.data !== '0x') {
                const decodedData = this.web3.eth.abi.decodeParameters(
                    ['uint8', 'uint8'], // accessLevel, previousLevel
                    log.data
                );
                
                decodedLog.accessLevel = this.accessLevels[decodedData[0]] || 'Unknown';
                decodedLog.previousLevel = this.accessLevels[decodedData[1]] || 'Unknown';
            }

            // Additional event-specific decoding
            switch (eventName) {
                case 'AccessGranted':
                    decodedLog.operation = 'Grant Access';
                    decodedLog.status = 'Success';
                    break;
                case 'AccessRevoked':
                    decodedLog.operation = 'Revoke Access';
                    decodedLog.status = 'Success';
                    decodedLog.accessLevel = 'None';
                    break;
                case 'AccessLevelChanged':
                    decodedLog.operation = 'Change Access Level';
                    decodedLog.status = 'Success';
                    break;
            }

            return decodedLog;

        } catch (error) {
            console.error('Error decoding NFT access event log:', error);
            throw new Error(`Failed to decode NFT access event log: ${error.message}`);
        }
    }

    // Create formatted message for Telegram
    createTelegramMessage(decodedLog) {
        const formattedDate = decodedLog.timestamp.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const statusSymbol = decodedLog.status === 'Success' ? '✅' : '❌';
        const shortUserAddress = `${decodedLog.userAddress.slice(0, 6)}...${decodedLog.userAddress.slice(-4)}`;
        const shortTxHash = `${decodedLog.transactionHash.slice(0, 6)}...${decodedLog.transactionHash.slice(-4)}`;

        let message = `${statusSymbol} *NFT Access Control Update*\n\n` +
                     `*Operation:* ${decodedLog.operation}\n` +
                     `*Collection ID:* ${decodedLog.collectionId}\n` +
                     `*NFT ID:* ${decodedLog.nftId}\n` +
                     `*User:* \`${shortUserAddress}\`\n`;

        if (decodedLog.eventType === 'AccessLevelChanged') {
            message += `*Previous Level:* ${decodedLog.previousLevel}\n` +
                      `*New Level:* ${decodedLog.accessLevel}\n`;
        } else {
            message += `*Access Level:* ${decodedLog.accessLevel}\n`;
        }

        message += `*Tx Hash:* [${shortTxHash}](https://basescan.org/tx/${decodedLog.transactionHash})\n` +
                  `*Time:* ${formattedDate}`;

        // Add additional context based on access level
        const accessContext = this.getAccessLevelContext(decodedLog.accessLevel);
        if (accessContext) {
            message += `\n\n*Access Rights:*\n${accessContext}`;
        }

        return message;
    }

    // Get context description for access levels
    getAccessLevelContext(level) {
        const contexts = {
            'UseModel': '- Can use the model for inference',
            'Resale': '- Can use the model\n- Can resell the NFT',
            'CreateReplica': '- Can use the model\n- Can create replicas\n- Can resell the NFT',
            'ViewAndDownload': '- Full model and data access\n- Can download content\n- Can create replicas',
            'EditData': '- Full model and data access\n- Can edit metadata\n- Can manage access levels',
            'AbsoluteOwnership': '- Complete control over NFT\n- Can grant/revoke access\n- All previous privileges'
        };
        return contexts[level] || '';
    }

    // Send message to Telegram
    async sendTelegramNotification(message) {
        try {
            const response = await axios.post(`${this.telegramConfig.apiUrl}/sendMessage`, {
                chat_id: this.telegramConfig.chatId,
                text: message,
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });

            console.log('NFT access notification sent successfully');
            return response.data;

        } catch (error) {
            console.error('Error sending NFT access notification:', error);
            throw error;
        }
    }

    // Main handler function
    async handleNFTAccessLog(log) {
        try {
            // Decode the event log
            const decodedLog = this.decodeEventLog(log);

            // Create formatted message
            const message = this.createTelegramMessage(decodedLog);

            // Send to Telegram
            await this.sendTelegramNotification(message);

            return {
                success: true,
                decodedLog,
                message
            };

        } catch (error) {
            console.error('Error handling NFT access log:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Process batch of logs
    async processBatchLogs(logs) {
        const results = [];
        for (const log of logs) {
            try {
                const result = await this.handleNFTAccessLog(log);
                results.push(result);
                // Add delay between messages to avoid Telegram rate limits
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error('Error processing log:', error);
                results.push({
                    success: false,
                    error: error.message,
                    log
                });
            }
        }
        return results;
    }
}