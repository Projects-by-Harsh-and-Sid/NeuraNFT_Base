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
  const masterAccessControlAddress = deployedAddresses.MasterAccessControl;
  const nftAccessControlAddress = deployedAddresses.NFTAccessControl;
  const nftMetadataAddress = deployedAddresses.NFTMetadata;
  await deployer.deploy(NFTContract, masterAccessControlAddress, nftAccessControlAddress, nftMetadataAddress);
  const nftContract = await NFTContract.deployed();
  console.log("NFTContract deployed at:", nftContract.address);
  deployedAddresses.NFTContract = nftContract.address;

  // Grant access to NFTContract in MasterAccessControl
  const masterAccessControl = await MasterAccessControl.at(masterAccessControlAddress);
  await masterAccessControl.grantAccess(nftContract.address, nftContract.address);
  console.log("Granted access to NFTContract in MasterAccessControl");

  // Save updated addresses to file
  saveAddresses(network, deployedAddresses);
};
