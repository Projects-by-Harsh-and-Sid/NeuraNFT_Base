const { Web3 } = require('web3');  // Updated import syntax
const NFTAccessControlABI = require('../../smart_contracts/truffle_compiled_contract/build/contracts/NFTAccessControl').abi;

class NFTAccessControlEventDecoder {
    constructor(providerUrl, contractAddress) {
        this.web3 = new Web3('https://base-sepolia-rpc.publicnode.com');
        this.contract = new this.web3.eth.Contract(NFTAccessControlABI, contractAddress);
    }

    // Helper function to decode access levels with numeric value
    decodeAccessLevel(level) {
        const accessLevels = {
            '0': 'None (0)',
            '1': 'UseModel (1)',
            '2': 'Resale (2)',
            '3': 'CreateReplica (3)',
            '4': 'ViewAndDownload (4)',
            '5': 'EditData (5)',
            '6': 'AbsoluteOwnership (6)'
        };
        return accessLevels[level] || 'Unknown';
    }

    // Format timestamp
    async getBlockTimestamp(blockNumber) {
        const block = await this.web3.eth.getBlock(blockNumber);
        const date = new Date(block.timestamp * 1000);
        return date.toISOString().replace('T', ' ').slice(0, 19);
    }

    // Determine operation and status based on event type and values
    determineOperationAndStatus(eventName, oldLevel, newLevel) {
        if (eventName === 'AccessGranted') {
            return {
                operation: 'Grant Access Request',
                status: 'Success',
                reason: 'Access is granted'
            };
        } else if (eventName === 'AccessRevoked') {
            return {
                operation: 'Revoke Access Request',
                status: 'Success',
                reason: 'Access is revoked'
            };
        } else if (eventName === 'AccessLevelChanged') {
            if (newLevel === '0') {
                return {
                    operation: 'Revoke Access Request',
                    status: 'Success',
                    reason: 'Access level changed to None'
                };
            } else {
                return {
                    operation: 'Modify Access Request',
                    status: 'Success',
                    reason: `Access level changed from ${this.decodeAccessLevel(oldLevel)} to ${this.decodeAccessLevel(newLevel)}`
                };
            }
        }
    }

    async formatEvent(event, ownerAddress) {
        const timestamp = await this.getBlockTimestamp(event.blockNumber);
        const baseFormat = {
            nftid: parseInt(event.returnValues.nftId),
            collectionid: parseInt(event.returnValues.collectionId),
            user_address: event.returnValues.user,
            owner_address: ownerAddress,
            timestamp: timestamp
        };

        let operationInfo;
        if (event.event === 'AccessGranted') {
            operationInfo = {
                operation: 'Grant Access Request',
                access_request: this.decodeAccessLevel(event.returnValues.accessLevel),
                current_level: this.decodeAccessLevel(event.returnValues.accessLevel),
                status: 'Success',
                reason: 'Access is granted'
            };
        } else if (event.event === 'AccessRevoked') {
            operationInfo = {
                operation: 'Revoke Access Request',
                access_request: 'None (0)',
                current_level: 'None (0)',
                status: 'Success',
                reason: 'Access is revoked'
            };
        } else if (event.event === 'AccessLevelChanged') {
            operationInfo = {
                operation: 'Modify Access Request',
                access_request: this.decodeAccessLevel(event.returnValues.newAccessLevel),
                current_level: this.decodeAccessLevel(event.returnValues.newAccessLevel),
                status: 'Success',
                reason: `Access level changed to ${this.decodeAccessLevel(event.returnValues.newAccessLevel)}`
            };
        }

        return {
            ...baseFormat,
            ...operationInfo
        };
    }

    async getFormattedEvents(fromBlock, toBlock, ownerAddress) {
        try {
            // Get all events
            const events = await this.contract.getPastEvents('allEvents', {
                fromBlock,
                toBlock
            });

            // Format all events
            const formattedEvents = await Promise.all(
                events.map(event => this.formatEvent(event, ownerAddress))
            );

            // Sort by timestamp
            return formattedEvents.sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            );

        } catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    }

    async getFormattedEventsByNFT(collectionId, nftId, fromBlock, toBlock, ownerAddress) {
        const allEvents = await this.getFormattedEvents(fromBlock, toBlock, ownerAddress);
        return allEvents.filter(event => 
            event.collectionid === parseInt(collectionId) && 
            event.nftid === parseInt(nftId)
        );
    }

    async getFormattedEventsByUser(userAddress, fromBlock, toBlock, ownerAddress) {
        const allEvents = await this.getFormattedEvents(fromBlock, toBlock, ownerAddress);
        return allEvents.filter(event => 
            event.user_address.toLowerCase() === userAddress.toLowerCase()
        );
    }
}

module.exports = NFTAccessControlEventDecoder;