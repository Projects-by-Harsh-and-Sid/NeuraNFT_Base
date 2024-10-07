// File: migrations/2_deploy_nft_access_control.js
const MasterAccessControl = artifacts.require("MasterAccessControl");
const NFTAccessControl = artifacts.require("NFTAccessControl");
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
  
    // Deploy NFTAccessControl
    const masterAccessControlAddress = deployedAddresses.MasterAccessControl;
    await deployer.deploy(NFTAccessControl, masterAccessControlAddress);
    const nftAccessControl = await NFTAccessControl.deployed();
    console.log("NFTAccessControl deployed at:", nftAccessControl.address);
    deployedAddresses.NFTAccessControl = nftAccessControl.address;
  
    // Grant access to NFTAccessControl in MasterAccessControl
    const masterAccessControl = await MasterAccessControl.at(masterAccessControlAddress);
    await masterAccessControl.grantAccess(nftAccessControl.address, nftAccessControl.address);
    console.log("Granted access to NFTAccessControl in MasterAccessControl");
  
    // Save updated addresses to file
    saveAddresses(network, deployedAddresses);
  };