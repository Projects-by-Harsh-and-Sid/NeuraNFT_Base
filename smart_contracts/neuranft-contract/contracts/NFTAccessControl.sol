// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./MasterAccessControl.sol";

contract NFTAccessControl {
    // Reference to Master Access Control
    MasterAccessControl public accessControl;

    // Access Levels
    enum AccessLevel { None, AbsoluteOwnership, ViewAndDownload, CreateReplica, Resale, UseModel }

    // None                  - No access
    // 1 - UseModel          - Can use the model
    // 2 - Resale            - Can resell the NFT without replicating and data and model view
    // 3 - CreateReplica     - Can create a replica of the NFT but not data view
    // 4 - ViewAndDownload   - Can view and download the data and model but no absolute ownership
    // 5 - AbsoluteOwnership - Can view, download, create replica, resale, and use model

    // Mappings
    mapping(uint256 => mapping(uint256 => mapping(address => AccessLevel))) private nftAccess; // collectionId => NFTId => address => AccessLevel

    // Default access level for all users per NFT
    mapping(uint256 => mapping(uint256 => AccessLevel)) private defaultAccessLevel;

    // basic reverse mapping for user access
    mapping(address => mapping(uint256 => uint256)) private userAccess; // address => collectionId => NFTId


    // Events
    event AccessGranted(uint256 indexed collectionId, uint256 indexed nftId, address indexed user, AccessLevel accessLevel);
    event AccessRevoked(uint256 indexed collectionId, uint256 indexed nftId, address indexed user);

    // Constructor
    constructor(address _accessControlAddress) {
        accessControl = MasterAccessControl(_accessControlAddress);
    }

    // Modifier to check access
    modifier onlyAuthorized() {
        require(accessControl.selfCheckAccess(msg.sender), "NFTAccessControl: Not authorized");
        _;
    }

    // Set default access level
    function setDefaultAccessLevel(uint256 _collectionId, uint256 _nftId, AccessLevel _accessLevel) external onlyAuthorized {
        defaultAccessLevel[_collectionId][_nftId] = _accessLevel;
    }

    // Grant access to a user
    function grantAccess(uint256 _collectionId, uint256 _nftId, address _user, AccessLevel _accessLevel) external onlyAuthorized {
        require(_accessLevel != AccessLevel.None, "NFTAccessControl: Invalid access level");
        nftAccess[_collectionId][_nftId][_user] = _accessLevel;
        emit AccessGranted(_collectionId, _nftId, _user, _accessLevel);
    }

    // Revoke access from a user
    function revokeAccess(uint256 _collectionId, uint256 _nftId, address _user) external onlyAuthorized {
        delete nftAccess[_collectionId][_nftId][_user];
        emit AccessRevoked(_collectionId, _nftId, _user);
    }

    // Get user's access level
    function getAccessLevel(uint256 _collectionId, uint256 _nftId, address _user) external view returns (AccessLevel) {
        AccessLevel level = nftAccess[_collectionId][_nftId][_user];
        if (level == AccessLevel.None) {
            return defaultAccessLevel[_collectionId][_nftId];
        }
        return level;
    }
}
