// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./MasterAccessControl.sol";
import "./NFTContract.sol";

contract CollectionContract {
    MasterAccessControl public masterAccessControl;
    NFTContract public nftContract;

    struct CollectionMetadata {
        string name;
        uint256 contextWindow;
        string baseModel;
        string image;
        string description;
        address creator;
        uint256 dateCreated;
        address owner;
    }

    mapping(uint256 => CollectionMetadata) private collections;
    mapping(uint256 => address) private collectionOwners;

    uint256 private totalCollections;

    event CollectionCreated(uint256 indexed collectionId, address indexed creator, string baseModel);
    event CollectionUpdated(uint256 indexed collectionId, address indexed updater);
    event CollectionTransferred(uint256 indexed collectionId, address indexed previousOwner, address indexed newOwner);

    constructor(address _masterAccessControlAddress, address _nftContractAddress) {
        masterAccessControl = MasterAccessControl(_masterAccessControlAddress);
        nftContract = NFTContract(_nftContractAddress);
        masterAccessControl.grantSelfAccess(msg.sender);
    }

    modifier onlyAuthorized() {
        require(masterAccessControl.selfCheckAccess(msg.sender), "CollectionContract: Not authorized");
        _;
    }

    modifier onlyCollectionOwner(uint256 _collectionId) {
        require(collectionOwners[_collectionId] == msg.sender, "CollectionContract: Not the collection owner");
        _;
    }

    function createCollection(
        string memory _name,
        uint256 _contextWindow,
        string memory _baseModel,
        string memory _image,
        string memory _description
    ) external onlyAuthorized returns (uint256) {
        totalCollections++;
        uint256 newCollectionId = totalCollections;

        collections[newCollectionId] = CollectionMetadata({
            name : _name,
            contextWindow : _contextWindow,
            baseModel: _baseModel,
            image: _image,
            description: _description,
            creator: msg.sender,
            dateCreated: block.timestamp,
            owner: msg.sender
        });

        collectionOwners[newCollectionId] = msg.sender;

        emit CollectionCreated(newCollectionId, msg.sender, _baseModel);

        return newCollectionId;
    }

    function updateCollection(
        uint256 _collectionId,
        string memory _name,
        uint256 _contextWindow,
        string memory _baseModel,
        string memory _image,
        string memory _description
    ) external onlyCollectionOwner(_collectionId) {
        CollectionMetadata storage collection = collections[_collectionId];
        
        collection.name = _name;
        collection.contextWindow = _contextWindow;
        collection.baseModel = _baseModel;
        collection.image = _image;
        collection.description = _description;


        emit CollectionUpdated(_collectionId, msg.sender);
    }

    function transferCollection(uint256 _collectionId, address _newOwner) external onlyCollectionOwner(_collectionId) {
        require(_newOwner != address(0), "CollectionContract: Invalid new owner address");

        address previousOwner = collectionOwners[_collectionId];
        collectionOwners[_collectionId] = _newOwner;
        collections[_collectionId].owner = _newOwner;

        emit CollectionTransferred(_collectionId, previousOwner, _newOwner);
    }

    function getCollectionMetadata(uint256 _collectionId) external view returns (CollectionMetadata memory) {
        require(_collectionId > 0 && _collectionId <= totalCollections, "CollectionContract: Invalid collection ID");
        return collections[_collectionId];
    }

    function getCollectionOwner(uint256 _collectionId) external view returns (address) {
        require(_collectionId > 0 && _collectionId <= totalCollections, "CollectionContract: Invalid collection ID");
        return collectionOwners[_collectionId];
    }

    function getTotalCollections() external view returns (uint256) {
        return totalCollections;
    }

    function getAllCollections() external view returns (CollectionMetadata[] memory) {
        CollectionMetadata[] memory allCollections = new CollectionMetadata[](totalCollections);
        
        for (uint256 i = 1; i <= totalCollections; i++) {
            allCollections[i - 1] = collections[i];
        }

        return allCollections;
    }

    function getCollectionNFTCount(uint256 _collectionId) external view returns (uint256) {
        require(_collectionId > 0 && _collectionId <= totalCollections, "CollectionContract: Invalid collection ID");
        return nftContract.getCollectionNFTCount(_collectionId);
    }

    function getCollectionUniqueHolders(uint256 _collectionId) external view returns (uint256) {
        require(_collectionId > 0 && _collectionId <= totalCollections, "CollectionContract: Invalid collection ID");
        return nftContract.numberOfHolders(_collectionId);
    }
}