// File: migrations/1_deploy_master_access_control.js
const MasterAccessControl = artifacts.require("MasterAccessControl");
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
  const deployedAddresses = {};

  // Deploy MasterAccessControl
  await deployer.deploy(MasterAccessControl);
  const masterAccessControl = await MasterAccessControl.deployed();
  console.log("MasterAccessControl deployed at:", masterAccessControl.address);
  deployedAddresses.MasterAccessControl = masterAccessControl.address;

  // Save address to file
  saveAddresses(network, deployedAddresses);
};
