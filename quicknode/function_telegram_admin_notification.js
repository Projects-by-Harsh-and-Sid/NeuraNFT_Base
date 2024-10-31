// masterAccessNotifier.js
import axios from 'axios';
import dotenv from 'dotenv';
import Web3 from 'web3';

dotenv.config();

class MasterAccessNotifier {
    constructor() {
        this.web3 = new Web3();
        this.telegramConfig = {
            botToken: process.env.TELEGRAM_BOT_TOKEN,
            chatId: process.env.TELEGRAM_CHAT_ID,
            apiUrl: `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`
        };
        
        // Event signatures mapping
        this.eventSignatures = {
            '0x9f520b3bfc56d06f7065d10b4683b3f57ac8895d5026cd176dee95ce1454cb8d': 'AccessGranted',
            '0x4b26b1898d389fc92cf87e8f77a0e3611dbde04c63ce40237da9a3624134ecb5': 'AccessRevoked',
            // Add other event signatures as needed
        };
    }

    // Decode master access control log
    decodeEventLog(log) {
        try {
            const eventSignature = log.topics[0];
            const eventName = this.eventSignatures[eventSignature] || 'Unknown Event';

            // Decode the event parameters
            const decodedLog = {
                eventType: eventName,
                contractAddress: log.address.toLowerCase(),
                callerAddress: '0x' + log.topics[1].slice(26).toLowerCase(),
                targetAddress: '0x' + log.topics[2].slice(26).toLowerCase(),
                blockNumber: parseInt(log.blockNumber, 16),
                transactionHash: log.transactionHash,
                timestamp: new Date(),
                success: true
            };

            // Additional decoding based on event type
            if (eventName === 'AccessGranted') {
                decodedLog.accessLevel = 'Full Access';
                decodedLog.operation = 'Grant Access';
            } else if (eventName === 'AccessRevoked') {
                decodedLog.accessLevel = 'No Access';
                decodedLog.operation = 'Revoke Access';
            }

            return decodedLog;

        } catch (error) {
            console.error('Error decoding event log:', error);
            throw new Error(`Failed to decode event log: ${error.message}`);
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

        const statusSymbol = decodedLog.success ? '✅' : '❌';
        const operation = decodedLog.operation;
        const shortCallerAddress = `${decodedLog.callerAddress.slice(0, 6)}...${decodedLog.callerAddress.slice(-4)}`;
        const shortTargetAddress = `${decodedLog.targetAddress.slice(0, 6)}...${decodedLog.targetAddress.slice(-4)}`;
        const shortTxHash = `${decodedLog.transactionHash.slice(0, 6)}...${decodedLog.transactionHash.slice(-4)}`;

        return `${statusSymbol} *Master Access Control Update*\n\n` +
               `*Operation:* ${operation}\n` +
               `*Status:* ${decodedLog.success ? 'Success' : 'Failed'}\n` +
               `*Caller:* \`${shortCallerAddress}\`\n` +
               `*Target:* \`${shortTargetAddress}\`\n` +
               `*Contract:* \`${decodedLog.contractAddress}\`\n` +
               `*Access Level:* ${decodedLog.accessLevel}\n` +
               `*Tx Hash:* [${shortTxHash}](https://basescan.org/tx/${decodedLog.transactionHash})\n` +
               `*Time:* ${formattedDate}`;
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

            console.log('Telegram notification sent successfully');
            return response.data;

        } catch (error) {
            console.error('Error sending Telegram notification:', error);
            throw error;
        }
    }

    // Main handler function
    async handleMasterAccessLog(log) {
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
            console.error('Error handling master access log:', error);
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
                const result = await this.handleMasterAccessLog(log);
                results.push(result);
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