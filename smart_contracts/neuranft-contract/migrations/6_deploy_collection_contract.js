// File: migrations/5_deploy_collection_contract.js
const MasterAccessControl = artifacts.require("MasterAccessControl");
const NFTContract = artifacts.require("NFTContract");
const CollectionContract = artifacts.require("CollectionContract");
const fs = require('fs');
const path = require('path');



// Helper functions (add these to each file)
function getAddressesPath(network) {
    return path.resolve(__dirname, '..', 'build', 'contractAddresses', `${network}_addresses.json`);
  }
  
  function saveAddresses(network, addresses) {
    const buildPath = path.resolve(__dirname, '..', 'build', 'contractAddresses');
    if (!fs.existsSync(buildPath)) {
      fs.mkdirSync(buildPath, { recursive: true });
    }
    fs.writeFileSync(getAddressesPath(network), JSON.stringify(addresses, null, 2));
    console.log(`Addresses saved to ${network}_addresses.json`);
  }



  module.exports = async function(deployer, network) {
    const deployedAddresses = JSON.parse(fs.readFileSync(getAddressesPath(network), 'utf8'));
  
    // Deploy CollectionContract
    const masterAccessControlAddress = deployedAddresses.MasterAccessControl;
    const nftContractAddress = deployedAddresses.NFTContract;
    await deployer.deploy(CollectionContract, masterAccessControlAddress, nftContractAddress);
    const collectionContract = await CollectionContract.deployed();
    console.log("CollectionContract deployed at:", collectionContract.address);
    deployedAddresses.CollectionContract = collectionContract.address;
  
    // Grant access to CollectionContract in MasterAccessControl
    const masterAccessControl = await MasterAccessControl.at(masterAccessControlAddress);
    await masterAccessControl.grantAccess(collectionContract.address, collectionContract.address);
    console.log("Granted access to CollectionContract in MasterAccessControl");
  
    // Grant access to CollectionContract in NFTContract
    const nftContract = await NFTContract.at(nftContractAddress);
    await masterAccessControl.grantAccess(nftContractAddress, collectionContract.address);
    console.log("Granted access to CollectionContract in NFTContract");
  
    // Save updated addresses to file
    saveAddresses(network, deployedAddresses);
  
    console.log("All contracts deployed and set up successfully");
  };