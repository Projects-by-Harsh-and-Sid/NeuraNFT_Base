// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./MasterAccessControl.sol";


contract NFTMetadata {
    // Reference to Master Access Control
    MasterAccessControl public accessControl;

    // Metadata structure
    struct Metadata {
        string image;         // BTFS URL of the image
        string baseModel;     // Base model identifier
        string data;          // BTFS URL of data
        string rag;           // BTFS URL of RAG
        string fineTuneData;  // BTFS URL of fine-tune data
        string description;   // Text description
    }

    // Mappings
    mapping(uint256 => mapping(uint256 => Metadata)) private metadataMap; // collectionId => NFTId => Metadata

    // Events
    event MetadataCreated(uint256 indexed collectionId, uint256 indexed nftId, Metadata metadata);
    event MetadataUpdated(uint256 indexed collectionId, uint256 indexed nftId, Metadata metadata);
    event MetadataDeleted(uint256 indexed collectionId, uint256 indexed nftId);

    // Constructor
    constructor(address _accessControlAddress) {
        accessControl = MasterAccessControl(_accessControlAddress);
        accessControl.grantSelfAccess(msg.sender);
    }

    // Modifier to check access
    modifier onlyAuthorized() {
        require(accessControl.selfCheckAccess(msg.sender), "NFTMetadata: Not authorized");
        _;
    }

    // Create new metadata
    function createMetadata(uint256 _collectionId, uint256 _nftId, Metadata memory _metadata) external onlyAuthorized {
        metadataMap[_collectionId][_nftId] = _metadata;
        emit MetadataCreated(_collectionId, _nftId, _metadata);
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