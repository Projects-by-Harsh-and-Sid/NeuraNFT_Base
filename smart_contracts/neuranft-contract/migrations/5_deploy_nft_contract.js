// File: migrations/4_deploy_nft_contract.js
const MasterAccessControl = artifacts.require("MasterAccessControl");
const NFTAccessControl = artifacts.require("NFTAccessControl");
const NFTMetadata = artifacts.require("NFTMetadata");
const NFTContract = artifacts.require("NFTContract");
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
  
    // Deploy NFTContract
    const masterAccessControlAddress  = deployedAddresses.MasterAccessControl;
    const nftAccessControlAddress     = deployedAddresses.NFTAccessControl;
    const nftMetadataAddress          = deployedAddresses.NFTMetadata;
    await deployer.deploy(NFTContract, masterAccessControlAddress, nftAccessControlAddress, nftMetadataAddress);
    const nftContract = await NFTContract.deployed();
    const nftAccessControl = await NFTAccessControl.deployed();
    const nftMetadata = await NFTMetadata.deployed();
    console.log("NFTContract deployed at:", nftContract.address);
    deployedAddresses.NFTContract = nftContract.address;
  
    // Grant access to NFTContract in MasterAccessControl
    const masterAccessControl = await MasterAccessControl.at(masterAccessControlAddress);
    await masterAccessControl.grantAccess(nftContract.address, nftContract.address);
    console.log("Granted access to NFTContract in MasterAccessControl");
  

    // Grant access of NFTAccessControl to NFTContract in MasterAccessControl
    await masterAccessControl.grantAccess(nftAccessControl.address, nftContract.address);
    console.log("Granted access of NFTAccessControl to NFTContract in MasterAccessControl");

    // Grant access of NFTMetadata to NFTContract in MasterAccessControl
    await masterAccessControl.grantAccess(nftMetadata.address, nftContract.address);
    console.log("Granted access of NFTMetadata to NFTContract in MasterAccessControl");




    // Grant access to NFTContract in NFTAccessControl
    // const nftAccessControl = await NFTAccessControl.at(nftAccessControlAddress);
    await nftAccessControl.grantAccess(0, 0, nftContract.address, 6); // Granting AbsoluteOwnership
    console.log("Granted access to NFTContract in NFTAccessControl");
  
    // Grant access to NFTContract in NFTMetadata
    // const nftMetadata = await NFTMetadata.at(nftMetadataAddress);
    await masterAccessControl.grantAccess(nftMetadata.address, nftContract.address);
    console.log("Granted access to NFTContract in NFTMetadata");
  
    // Save updated addresses to file
    saveAddresses(network, deployedAddresses);
  };