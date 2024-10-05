// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract MasterAccessControl {
    // Mapping from contract address to a mapping of caller addresses to access rights
    mapping(address => mapping(address => bool)) private accessRights;

    // Events
    event AccessGranted(address indexed contractAddress, address indexed caller);
    event AccessRevoked(address indexed contractAddress, address indexed caller);

    // Modifier to check access rights
    modifier onlyAuthorized()
    {
        require(hasAccess(address(this), msg.sender), "MasterAccessControl: Not authorized");
        _;
    }

    // Constructor
    constructor() {
        // Grant deployer access
        accessRights[address(this)][msg.sender] = true;
        emit AccessGranted(address(this), msg.sender);
    }

    // Grant access to a caller for a specific contract
    function grantAccess(address _contract, address _caller) external onlyAuthorized {
        // Implement ownership logic if necessary
        accessRights[_contract][_caller] = true;
        emit AccessGranted(_contract, _caller);
    }

    // Revoke access
    function revokeAccess(address _contract, address _caller) onlyAuthorized() external {
        // Implement ownership logic if necessary
        accessRights[_contract][_caller] = false;
        emit AccessRevoked(_contract, _caller);
    }


    function grantSelfAccess(address _addressToGrant) external {
        accessRights[msg.sender][_addressToGrant] = true;
        emit AccessGranted(msg.sender, _addressToGrant);
    }

    function revokeSelfAccess(address _addressToRevoke) external {
        accessRights[msg.sender][_addressToRevoke] = false;
        emit AccessRevoked(msg.sender, _addressToRevoke);
    }



    // Check if an address has access to a contract
    function hasAccess(address _contract, address _caller) public view returns (bool) {
        return accessRights[_contract][_caller];
    }

    // Function for contracts to check access
    function selfCheckAccess(address _addressToCheck) external view returns (bool) {
        return accessRights[msg.sender][_addressToCheck];
    }
}