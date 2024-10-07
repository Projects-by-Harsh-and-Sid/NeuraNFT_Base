const TronWeb = require('tronweb');

const tronWeb = new TronWeb({
    fullHost: 'http://127.0.0.1:8090',
    privateKey: process.env.SR_PRIVATE_KEY
});

// First proposal parameters
const parametersForProposal1 = [
    {"key":9,"value":1},
    {"key":10,"value":1},
    {"key":11,"value":420},
    {"key":19,"value":90000000000},
    {"key":15,"value":1},
    {"key":18,"value":1},
    {"key":16,"value":1},
    {"key":20,"value":1},
    {"key":26,"value":1},
    {"key":30,"value":1},
    {"key":5,"value":16000000},
    {"key":31,"value":160000000},
    {"key":32,"value":1},
    {"key":39,"value":1},
    {"key":41,"value":1},
    {"key":3,"value":1000},
    {"key":47,"value":10000000000},
    {"key":49,"value":1},
    {"key":13,"value":80},
    {"key":7,"value":1000000},
    {"key":61,"value":600},
    {"key":63,"value":1},
    {"key":65,"value":1},
    {"key":66,"value":1},
    {"key":67,"value":1},
    {"key":68,"value":1000000},
    {"key":69,"value":1},
    {"key":70,"value":14},
    {"key":71,"value":1},
    {"key":76,"value":1}
];

const parametersForProposal2 = [
    {"key":47,"value":15000000000},
    {"key":59,"value":1},
    {"key":72,"value":1},
    {"key":73,"value":3000000000},
    {"key":74,"value":2000},
    {"key":75,"value":12000},
    {"key":77,"value":1},
    {"key":78,"value":864000}
];

async function modifyChainParameters(parameters, proposalID){
    parameters.sort((a, b) => a.key - b.key);

    // Create proposal
    const unsignedProposalTxn = await tronWeb.transactionBuilder.createProposal(parameters, tronWeb.defaultAddress.base58);
    const signedProposalTxn = await tronWeb.trx.sign(unsignedProposalTxn);
    const receipt = await tronWeb.trx.sendRawTransaction(signedProposalTxn);
    console.log('Create Proposal Receipt:', receipt);

    // Wait for the proposal to be broadcasted
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Vote for the proposal
    const unsignedVoteTxn = await tronWeb.transactionBuilder.voteProposal(proposalID, true, tronWeb.defaultAddress.base58);
    const signedVoteTxn = await tronWeb.trx.sign(unsignedVoteTxn);
    const voteReceipt = await tronWeb.trx.sendRawTransaction(signedVoteTxn);
    console.log('Vote Proposal Receipt:', voteReceipt);
}

async function main() {
    console.log("Modifying Chain Parameters: Proposal 1");
    await modifyChainParameters(parametersForProposal1, 1);

    // Wait for the first proposal to be approved
    console.log("Waiting for Proposal 1 to be approved...");
    await new Promise(resolve => setTimeout(resolve, 60000)); // Adjust the time as needed

    console.log("Modifying Chain Parameters: Proposal 2");
    await modifyChainParameters(parametersForProposal2, 2);
}

main().catch(err => {
    console.error('Error in modify_parameters.js:', err);
});
