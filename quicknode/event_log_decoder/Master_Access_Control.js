const { Web3 } = require('web3');
const path = require('path');
const fs = require('fs');

class MasterAccessControlEventDecoder {
    constructor(providerUrl, contractAddress) {
        // Initialize Web3 with increased timeout and retry options
        const provider = new Web3.providers.HttpProvider(providerUrl, {
            timeout: 30000,
            reconnect: {
                auto: true,
                delay: 5000,
                maxAttempts: 5,
                onTimeout: true
            }
        });
        
        this.web3 = new Web3(provider);
        
        // Load ABI from file
        const abiPath = '../../smart_contracts/truffle_compiled_contract/build/contracts/MasterAccessControl.json';
        if (!fs.existsSync(abiPath)) {
            throw new Error('ABI file not found at: ' + abiPath);
        }
        
        const rawdata = fs.readFileSync(abiPath);
        const contractData = JSON.parse(rawdata);
        
        if (!contractData.abi) {
            throw new Error('ABI not found in contract data');
        }
        
        this.contract = new this.web3.eth.Contract(contractData.abi, contractAddress);
    }

    async getBlockTimestamp(blockNumber) {
        try {
            const block = await this.web3.eth.getBlock(blockNumber);
            if (!block) {
                throw new Error(`Block ${blockNumber} not found`);
            }
            const date = new Date(Number(block.timestamp) * 1000);
            return date.toISOString().replace('T', ' ').slice(0, 19);
        } catch (error) {
            console.error(`Error getting timestamp for block ${blockNumber}:`, error);
            return new Date().toISOString().replace('T', ' ').slice(0, 19);
        }
    }

    // Get readable contract name from address
    getContractName(address) {
        const contractAddresses = {
            '0x52AD5a6D11a1D68736894F4eab33CCD594E1db5A': 'MasterAccessControl',
            '0xf9179350E92092F283dC34B5E99F53BfF96effbf': 'NFTAccessControl',
            '0x62B5C46B0eCDda777B98d3ca5100DCa4d0532026': 'NFTMetadata',
            '0x112bC2e4d638839162686B8EAb2F1161562BDbAB': 'NFTContract',
            '0xc367B82Aed2625e0e592283954E6079B01f0cD48': 'CollectionContract'
        };
        return contractAddresses[address] || 'Unknown Contract';
    }

    async formatEvent(event) {
        const timestamp = await this.getBlockTimestamp(event.blockNumber);
        const baseFormat = {
            transaction_hash: event.transactionHash,
            block_number: event.blockNumber,
            timestamp: timestamp
        };

        let eventInfo;
        switch(event.event) {
            case 'AccessGranted':
                eventInfo = {
                    operation: 'Grant Access',
                    contract_address: event.returnValues.contractAddress,
                    contract_name: this.getContractName(event.returnValues.contractAddress),
                    caller_address: event.returnValues.caller,
                    status: 'Success',
                    reason: `Access granted to ${this.getContractName(event.returnValues.contractAddress)}`
                };
                break;

            case 'AccessRevoked':
                eventInfo = {
                    operation: 'Revoke Access',
                    contract_address: event.returnValues.contractAddress,
                    contract_name: this.getContractName(event.returnValues.contractAddress),
                    caller_address: event.returnValues.caller,
                    status: 'Success',
                    reason: `Access revoked from ${this.getContractName(event.returnValues.contractAddress)}`
                };
                break;

            default:
                eventInfo = {
                    operation: 'Unknown Operation',
                    status: 'Unknown',
                    reason: `Unrecognized event type: ${event.event}`
                };
        }

        return {
            ...baseFormat,
            ...eventInfo
        };
    }

    async getFormattedEvents(fromBlock, toBlock) {
        try {
            console.log(`Fetching Master Access Control events from block ${fromBlock} to ${toBlock}...`);
            
            const events = await this.contract.getPastEvents('allEvents', {
                fromBlock,
                toBlock
            });

            console.log(`Found ${events.length} total events`);

            const formattedEvents = await Promise.all(
                events.map(async (event) => {
                    try {
                        return await this.formatEvent(event);
                    } catch (error) {
                        console.error('Error formatting event:', error);
                        return null;
                    }
                })
            );

            return formattedEvents
                .filter(event => event !== null)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        } catch (error) {
            console.error('Error fetching events:', error);
            throw new Error(`Failed to fetch events: ${error.message}`);
        }
    }

    // Get events for a specific contract
    async getContractEvents(contractAddress, fromBlock, toBlock) {
        const allEvents = await this.getFormattedEvents(fromBlock, toBlock);
        return allEvents.filter(event => 
            event.contract_address?.toLowerCase() === contractAddress.toLowerCase()
        );
    }

    // Get events for a specific caller
    async getCallerEvents(callerAddress, fromBlock, toBlock) {
        const allEvents = await this.getFormattedEvents(fromBlock, toBlock);
        return allEvents.filter(event => 
            event.caller_address?.toLowerCase() === callerAddress.toLowerCase()
        );
    }

    // Check if an address has access to a contract
    async checkAccess(contractAddress, callerAddress) {
        try {
            const hasAccess = await this.contract.methods.hasAccess(contractAddress, callerAddress).call();
            return {
                contract_address: contractAddress,
                contract_name: this.getContractName(contractAddress),
                caller_address: callerAddress,
                has_access: hasAccess
            };
        } catch (error) {
            console.error('Error checking access:', error);
            throw error;
        }
    }

    // Check multiple access permissions at once
    async checkMultipleAccess(contractAddresses, callerAddress) {
        try {
            const results = await Promise.all(
                contractAddresses.map(contractAddress => 
                    this.checkAccess(contractAddress, callerAddress)
                )
            );
            return results;
        } catch (error) {
            console.error('Error checking multiple access permissions:', error);
            throw error;
        }
    }
}

module.exports = MasterAccessControlEventDecoder;