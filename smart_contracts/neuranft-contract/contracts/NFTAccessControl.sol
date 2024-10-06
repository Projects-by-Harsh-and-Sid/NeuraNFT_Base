// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./MasterAccessControl.sol";

    // Access Levels
enum AccessLevel {
        None,
        UseModel,
        Resale,
        CreateReplica,
        ViewAndDownload,
        AbsoluteOwnership
    }



contract NFTAccessControl {
    // Reference to Master Access Control
    MasterAccessControl public accessControl;

    // Access Levels

    // None                  - No access
    // 1 - UseModel          - Can use the model
    // 2 - Resale            - Can resell the NFT without replicating and data and model view
    // 3 - CreateReplica     - Can create a replica of the NFT but not data view
    // 4 - ViewAndDownload   - Can view and download the data and model but no absolute ownership
    // 5 - AbsoluteOwnership - Can view, download, create replica, resale, and use model, set access levels

    // Mappings
    mapping(uint256 => mapping(uint256 => mapping(address => AccessLevel))) private nftAccess; // collectionId => NFTId => address => AccessLevel

    // Default access level for all users per NFT
    mapping(uint256 => mapping(uint256 => AccessLevel)) private defaultAccessLevel;

    // Max access level for a NFT

    mapping(uint256 => mapping(uint256 => AccessLevel)) private maxAccessLevel;


    // basic reverse mapping for user access
    mapping(address => mapping(uint256 => mapping (uint256 => AccessLevel))) private userAccess; // address => collectionId => NFTId




    // AccessEntry struct
    struct AccessEntry {
        uint256 collectionId;
        uint256 nftId;
        AccessLevel accessLevel;
    }

    // Mapping from user to their list of access entries
    mapping(address => AccessEntry[]) private userAccessList;

    // Helper mapping to track indices in userAccessList for efficient removal
    mapping(address => mapping(uint256 => mapping(uint256 => uint256))) private userAccessIndex; // address => collectionId => nftId => index in userAccessList (index + 1)



    // Events
    event AccessGranted(uint256 indexed collectionId, uint256 indexed nftId, address indexed user, AccessLevel accessLevel);
    event AccessRevoked(uint256 indexed collectionId, uint256 indexed nftId, address indexed user);
    event AccessLevelChanged(address indexed user, uint256 indexed collectionId, uint256 indexed nftId, AccessLevel newAccessLevel);

    

    
    // Constructor
    constructor(address _accessControlAddress) {
        accessControl = MasterAccessControl(_accessControlAddress);
        accessControl.grantSelfAccess(msg.sender);
    }


    //------------------------------------------------------------------------
    // ------------------------------ Modifiers ------------------------------
    //------------------------------------------------------------------------



    // Modifier to check access
    modifier onlyAuthorized() {
        require(accessControl.selfCheckAccess(msg.sender), "NFTAccessControl: Not authorized");
        _;
    }

    modifier onlyAuthorizedOrOwner(uint256 _collectionId, uint256 _nftId) {

        bool isAuthorized   = accessControl.selfCheckAccess(msg.sender);
        bool OwnerOrGreater = nftAccess[_collectionId][_nftId][msg.sender] >= AccessLevel.AbsoluteOwnership;

        require(isAuthorized || OwnerOrGreater, "NFTAccessControl: Not authorized");
        _;
    }

    modifier maxAccessLevelCheck(uint256 _collectionId, uint256 _nftId, AccessLevel _accessLevel) {

        bool maxAccess      = maxAccessLevel[_collectionId][_nftId] >= _accessLevel;
        bool isMaxAccess    = maxAccessLevel[_collectionId][_nftId] == AccessLevel.None;

        require(maxAccess || isMaxAccess , "NFTAccessControl: Access level exceeds max access level");
        _;
    }





    //------------------------------------------------------------------------
    // -------------------------- Setting Default Access ---------------------
    //------------------------------------------------------------------------


    function setMaxAccessLevel(uint256 _collectionId, uint256 _nftId, AccessLevel _accessLevel) external onlyAuthorizedOrOwner(_collectionId, _nftId) maxAccessLevelCheck(_collectionId, _nftId, _accessLevel)
    {
        require(_accessLevel != AccessLevel.None, "NFTAccessControl: Invalid access level");
        maxAccessLevel[_collectionId][_nftId] = _accessLevel;
    }


    // Set default access level
    function setDefaultAccessLevel(uint256 _collectionId, uint256 _nftId, AccessLevel _accessLevel) external onlyAuthorizedOrOwner(_collectionId, _nftId) maxAccessLevelCheck(_collectionId, _nftId, _accessLevel)
    {   
        defaultAccessLevel[_collectionId][_nftId] = _accessLevel;
    }


    //------------------------------------------------------------------------
    // --------------------------- Setting User Access -----------------------
    //------------------------------------------------------------------------



    // // Grant access to a user
    // function grantAccess(uint256 _collectionId, uint256 _nftId, address _user, AccessLevel _accessLevel) external onlyAuthorizedOrOwner(_collectionId, _nftId) {
    //     require(_accessLevel != AccessLevel.None, "NFTAccessControl: Invalid access level");

    //     nftAccess[_collectionId][_nftId][_user] = _accessLevel;
    //     userAccess[_user][_collectionId][_nftId] = _accessLevel;

    //     emit AccessGranted(_collectionId, _nftId, _user, _accessLevel);
    // }


    // Grant access to a user
    function grantAccess(
        uint256 _collectionId, 
        uint256 _nftId, 
        address _user, 
        AccessLevel _accessLevel
    ) 
        external 
        onlyAuthorizedOrOwner(_collectionId, _nftId) 
        maxAccessLevelCheck(_collectionId, _nftId, _accessLevel)
    {
        require(_accessLevel != AccessLevel.None, "NFTAccessControl: Invalid access level");

        nftAccess[_collectionId][_nftId][_user] = _accessLevel;
        userAccess[_user][_collectionId][_nftId] = _accessLevel;

        // Update userAccessList and userAccessIndex
        if (userAccessIndex[_user][_collectionId][_nftId] == 0) {
            // Entry does not exist
            userAccessList[_user].push(AccessEntry({
                collectionId: _collectionId,
                nftId: _nftId,
                accessLevel: _accessLevel
            }));
            // Store index (indexing from 1 because default mapping value is 0)
            userAccessIndex[_user][_collectionId][_nftId] = userAccessList[_user].length;
        } else {
            // Entry exists, update accessLevel
            uint256 index = userAccessIndex[_user][_collectionId][_nftId] - 1;
            userAccessList[_user][index].accessLevel = _accessLevel;
        }

        emit AccessGranted(_collectionId, _nftId, _user, _accessLevel);
        emit AccessLevelChanged(_user, _collectionId, _nftId, _accessLevel);
    }







    // // Revoke access from a user
    // function revokeAccess(uint256 _collectionId, uint256 _nftId, address _user) external onlyAuthorized {
    //     delete nftAccess[_collectionId][_nftId][_user];

    //     delete userAccess[_user][_collectionId][_nftId];

    //     emit AccessRevoked(_collectionId, _nftId, _user);
    // }



    // Revoke access from a user
    function revokeAccess(
        uint256 _collectionId, 
        uint256 _nftId, 
        address _user
    ) 
        external 
        onlyAuthorized 
    {
        delete nftAccess[_collectionId][_nftId][_user];
        delete userAccess[_user][_collectionId][_nftId];

        // Update userAccessList and userAccessIndex
        uint256 indexPlusOne = userAccessIndex[_user][_collectionId][_nftId];
        if (indexPlusOne > 0) {
            uint256 index = indexPlusOne - 1;
            uint256 lastIndex = userAccessList[_user].length - 1;

            if (index != lastIndex) {
                // Swap the last entry with the one to delete
                AccessEntry memory lastEntry = userAccessList[_user][lastIndex];
                userAccessList[_user][index] = lastEntry;
                // Update the index mapping
                userAccessIndex[_user][lastEntry.collectionId][lastEntry.nftId] = indexPlusOne;
            }

            // Remove the last element
            userAccessList[_user].pop();
            // Delete index mapping
            delete userAccessIndex[_user][_collectionId][_nftId];
        }

        emit AccessRevoked(_collectionId, _nftId, _user);
        emit AccessLevelChanged(_user, _collectionId, _nftId, AccessLevel.None);
    }



    // -----------------------------------------------------------------------
    // ------------------------------ Getting Access -------------------------
    // -----------------------------------------------------------------------


    // Get all access for a user

    // struct UserAccessStruct {
    //     uint256 collectionIds;
    //     uint256 nftIds;
    //     AccessLevel accessLevels;
    // }

    // function getAllAccessForUser(address _user) external view returns (UserAccessStruct[] memory) {
        

    //     uint256 collectionIds = ;
    //     uint256 nftIds;
    //     uint256 accessLevels;

    //     UserAccessStruct[] memory userAccessStruct = new UserAccessStruct[](collectionIds);

    //     for (uint256 i = 0; i < collectionIds; i++) {
    //         nftIds = accessControl.getNFTCount(i);
    //         userAccessStruct[i].collectionIds = i;
    //         userAccessStruct[i].nftIds = nftIds;
    //         for (uint256 j = 0; j < nftIds; j++) {
    //             accessLevels = userAccess[_user][i][j];
    //             userAccessStruct[i].accessLevels = accessLevels;
    //         }
    //     }

    //     return userAccessStruct;

    // }


    // Get all access entries for a user
    function getAllAccessForUser(address _user) external view returns (AccessEntry[] memory) {
        return userAccessList[_user];
    }


    // Get user's access level
    function getAccessLevel(uint256 _collectionId, uint256 _nftId, address _user) external view returns (AccessLevel) {
        AccessLevel level = nftAccess[_collectionId][_nftId][_user];
        if (level == AccessLevel.None) {
            return defaultAccessLevel[_collectionId][_nftId];
        }
        return level;
    }

    function checkMinimumAccess(uint256 _collectionId, uint256 _nftId, address _user, AccessLevel _accessLevel) external view returns (bool) {
        
        AccessLevel level = nftAccess[_collectionId][_nftId][_user];

        AccessLevel minimum_access = 
        
        if (level == AccessLevel.None) {
            return defaultAccessLevel[_collectionId][_nftId] >= _accessLevel;
        }
        return level >= _accessLevel;
    }
}
