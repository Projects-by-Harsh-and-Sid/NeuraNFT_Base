// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./MasterAccessControl.sol";
import "./NFTAccessControl.sol";


contract NFTMetadata {
    // Reference to Master Access Control
    MasterAccessControl public accessControl;
    NFTAccessControl public nftAccessControl;

    // Metadata structure
    struct Metadata {
        string image;         // BTFS URL of the image
        string baseModel;     // Base model identifier
        string data;          // BTFS URL of data
        string rag;           // BTFS URL of RAG
        string fineTuneData;  // BTFS URL of fine-tune data
        string description;   // Text description
    }


    struct Replica {
        uint256 replicaCollectionId;
        uint256 replicaNFTId;
    }

    // Mappings
    mapping(uint256 => mapping(uint256 => Metadata)) private metadataMap; // collectionId => NFTId => Metadata
    mapping(uint256 => mapping(uint256 => Replica)) private replicaMap; // collectionId => NFTId => replicaId => (replicaCollectionId, replicaNFTId)

    // Events
    event MetadataCreated(uint256 indexed collectionId, uint256 indexed nftId, Metadata metadata);
    event MetadataUpdated(uint256 indexed collectionId, uint256 indexed nftId, Metadata metadata);
    event MetadataDeleted(uint256 indexed collectionId, uint256 indexed nftId);
    event ReplicaCreated(uint256 indexed collectionId, uint256 indexed nftId, Replica replica);

    // Constructor
    constructor(address _accessControlAddress, address _nftAccessControlAddress) {
        accessControl = MasterAccessControl(_accessControlAddress);
        nftAccessControl = NFTAccessControl(_nftAccessControlAddress);
        accessControl.grantSelfAccess(msg.sender);
    }

    // Modifier to check access
    modifier onlyAuthorized() {

        require(accessControl.selfCheckAccess(msg.sender), "NFTMetadata: Not authorized");
        _;
    }


    // None                  - No access
    // 1 - UseModel          - Can use the model
    // 2 - Resale            - Can resell the NFT without replicating and data and model view
    // 3 - CreateReplica     - Can create a replica of the NFT but not data view
    // 4 - ViewAndDownload   - Can view and download the data and model but no absolute ownership
    // 5 - AbsoluteOwnership - Can view, download, create replica, resale, and use model

    modifier onlyAuthorizedEditData(uint256 _collectionId, uint256 _nftId) {

        AccessLevel requiredAccess = AccessLevel.EditData;

        bool isAuthorized = nftAccessControl.checkMinimumAccess(_collectionId, _nftId, msg.sender ,requiredAccess);
        bool isOwner =  accessControl.selfCheckAccess(msg.sender);

        require(isAuthorized || isOwner, "NFTMetadata: Not authorized");
        _;
    }


    // Create new metadata
    function createMetadata(uint256 _collectionId, uint256 _nftId, Metadata memory _metadata) public onlyAuthorized {
        metadataMap[_collectionId][_nftId] = _metadata;
        emit MetadataCreated(_collectionId, _nftId, _metadata);
    }

    function replicateNFT(uint256 _collectionId, uint256 _nftId, uint256 _replicaCollectionId, uint256 _replicaNFTId) external onlyAuthorized {
        
        require(_metadataExists(_collectionId, _nftId), "NFTMetadata: Metadata does not exist");

        replicaMap[_collectionId][_nftId] = Replica(_replicaCollectionId, _replicaNFTId);
        Metadata memory _metadata = metadataMap[_replicaCollectionId][_replicaNFTId];

        createMetadata(_collectionId, _replicaNFTId, _metadata);

        emit ReplicaCreated(_collectionId, _nftId, Replica(_replicaCollectionId, _replicaNFTId));
            
    }




    // Update existing metadata
    function updateMetadata(uint256 _collectionId, uint256 _nftId, Metadata memory _metadata) external onlyAuthorized {
        require(_metadataExists(_collectionId, _nftId), "NFTMetadata: Metadata does not exist");
        metadataMap[_collectionId][_nftId] = _metadata;
        emit MetadataUpdated(_collectionId, _nftId, _metadata);
    }

    // Delete metadata
    function deleteMetadata(uint256 _collectionId, uint256 _nftId) external onlyAuthorized {
        require(_metadataExists(_collectionId, _nftId), "NFTMetadata: Metadata does not exist");
        delete metadataMap[_collectionId][_nftId];
        emit MetadataDeleted(_collectionId, _nftId);
    }

    // Get metadata
    function getMetadata(uint256 _collectionId, uint256 _nftId) external view returns (Metadata memory) {
        require(_metadataExists(_collectionId, _nftId), "NFTMetadata: Metadata does not exist");
        return metadataMap[_collectionId][_nftId];
    }

    // Internal function to check if metadata exists
    function _metadataExists(uint256 _collectionId, uint256 _nftId) internal view returns (bool) {
        return bytes(metadataMap[_collectionId][_nftId].image).length > 0;
    }
}

