const MasterAccessControl = artifacts.require("MasterAccessControl");
const NFTAccessControl = artifacts.require("NFTAccessControl");
const NFTMetadata = artifacts.require("NFTMetadata");
const NFTContract = artifacts.require("NFTContract");
const CollectionContract = artifacts.require("CollectionContract");

const fs = require('fs');
const path = require('path');

module.exports = async function(deployer, network) {
  const deployedAddresses = {};

  // Function to save addresses
  const saveAddresses = () => {
    const buildPath = path.resolve(__dirname, '..', 'build', 'contractAddresses');
    if (!fs.existsSync(buildPath)) {
      fs.mkdirSync(buildPath, { recursive: true });
    }
    fs.writeFileSync(
      path.join(buildPath, `${network}_addresses.json`),
      JSON.stringify(deployedAddresses, null, 2)
    );
    console.log(`Addresses saved to ${network}_addresses.json`);
  };

  // Deploy MasterAccessControl
  await deployer.deploy(MasterAccessControl);
  const masterAccessControl = await MasterAccessControl.deployed();
  console.log("MasterAccessControl deployed at:", masterAccessControl.address);
  deployedAddresses.MasterAccessControl = masterAccessControl.address;

  // Deploy NFTAccessControl
  await deployer.deploy(NFTAccessControl, masterAccessControl.address);
  const nftAccessControl = await NFTAccessControl.deployed();
  console.log("NFTAccessControl deployed at:", nftAccessControl.address);
  deployedAddresses.NFTAccessControl = nftAccessControl.address;

  // Deploy NFTMetadata
  await deployer.deploy(NFTMetadata, masterAccessControl.address, nftAccessControl.address);
  const nftMetadata = await NFTMetadata.deployed();
  console.log("NFTMetadata deployed at:", nftMetadata.address);
  deployedAddresses.NFTMetadata = nftMetadata.address;

  // Deploy NFTContract
  await deployer.deploy(NFTContract, masterAccessControl.address, nftAccessControl.address, nftMetadata.address);
  const nftContract = await NFTContract.deployed();
  console.log("NFTContract deployed at:", nftContract.address);
  deployedAddresses.NFTContract = nftContract.address;

  // Deploy CollectionContract
  await deployer.deploy(CollectionContract, masterAccessControl.address, nftContract.address);
  const collectionContract = await CollectionContract.deployed();
  console.log("CollectionContract deployed at:", collectionContract.address);
  deployedAddresses.CollectionContract = collectionContract.address;

  // Additional setup steps if needed
  // For example, granting access rights or setting initial state

  // Grant access to NFTContract in MasterAccessControl
  await masterAccessControl.grantAccess(nftContract.address, nftContract.address);
  console.log("Granted access to NFTContract in MasterAccessControl");

  // Grant access to CollectionContract in MasterAccessControl
  await masterAccessControl.grantAccess(collectionContract.address, collectionContract.address);
  console.log("Granted access to CollectionContract in MasterAccessControl");

  // You may add more setup steps here as needed

  // Save all addresses to file
  saveAddresses();

  console.log("All contracts deployed and set up successfully");
};