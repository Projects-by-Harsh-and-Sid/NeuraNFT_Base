// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./MasterAccessControl.sol";
import "./NFTAccessControl.sol";
import "./NFTMetadata.sol";

// Abstract ERC721 contract
abstract contract ERC721 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    function balanceOf(address owner) public view virtual returns (uint256 balance);
    function ownerOf(uint256 tokenId) public view virtual returns (address owner);
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public virtual;
    function safeTransferFrom(address from, address to, uint256 tokenId) public virtual;
    function transferFrom(address from, address to, uint256 tokenId) public virtual;
    function approve(address to, uint256 tokenId) public virtual;
    function setApprovalForAll(address operator, bool _approved) public virtual;
    function getApproved(uint256 tokenId) public view virtual returns (address operator);
    function isApprovedForAll(address owner, address operator) public view virtual returns (bool);
}

contract NFTContract is ERC721 {
    MasterAccessControl public masterAccessControl;
    NFTAccessControl public nftAccessControl;
    NFTMetadata public nftMetadata;

    struct NFTInfo {
        uint8 levelOfOwnership;
        uint256 collectionId;
        string name;
        address creator;
        uint256 creationDate;
        address owner;
    }

    mapping(uint256 => mapping(uint256 => NFTInfo)) private nfts; // collectionId => nftId => NFTInfo
    mapping(uint256 => uint256) private collectionNFTCount; // collectionId => number of NFTs
    mapping(address => uint256) private balances; // owner => number of NFTs
    mapping(address => mapping (uint256=>uint256)) balanceCollection; // owner => collectionId => number of NFTs
    
    mapping(uint256 => address) private tokenApprovals;
    mapping(address => mapping(address => bool)) private operatorApprovals;

    uint256 private nextTokenId = 1;

    event NFTCreated(uint256 indexed collectionId, uint256 indexed nftId, string name, address creator);
    event NFTBurned(uint256 indexed collectionId, uint256 indexed nftId);

    constructor(address _masterAccessControlAddress, address _nftAccessControlAddress, address _nftMetadataAddress) {
        masterAccessControl = MasterAccessControl(_masterAccessControlAddress);
        nftAccessControl    = NFTAccessControl(_nftAccessControlAddress);
        nftMetadata         = NFTMetadata(_nftMetadataAddress);
        masterAccessControl.grantSelfAccess(msg.sender);
    }

    modifier onlyAuthorized() {
        require(masterAccessControl.selfCheckAccess(msg.sender), "NFTContract: Not authorized");
        _;
    }

    modifier onlyNFTOwner(uint256 _collectionId, uint256 _nftId) {
        require(nfts[_collectionId][_nftId].owner == msg.sender, "NFTContract: Not the NFT owner");
        _;
    }


    // ------------------------------
    // NFT create and burn functions
    // ------------------------------

    function createNFT(uint256 _collectionId, string memory _name, uint8 _levelOfOwnership) external returns (uint256) {

        require(_levelOfOwnership > 0 && _levelOfOwnership <= 6, "NFTContract: Invalid level of ownership");

        uint256 nftId = nextTokenId++;
        NFTInfo memory newNFT = NFTInfo({
            levelOfOwnership: _levelOfOwnership,
            collectionId: _collectionId,
            name: _name,
            creator: msg.sender,
            creationDate: block.timestamp,
            owner: msg.sender
        });

        nfts[_collectionId][nftId] = newNFT;
        collectionNFTCount[_collectionId]++;
        balances[msg.sender]++;
        balanceCollection[msg.sender][_collectionId]++;

        // Grant absolute ownership to the creator
        nftAccessControl.grantAccess(_collectionId, nftId, msg.sender, AccessLevel.AbsoluteOwnership);

        emit NFTCreated(_collectionId, nftId, _name, msg.sender);
        emit Transfer(address(0), msg.sender, nftId);

        return nftId;
    }

    function burnNFT(uint256 _collectionId, uint256 _nftId) external onlyNFTOwner(_collectionId, _nftId) {
        
        address owner = nfts[_collectionId][_nftId].owner;

        delete nfts[_collectionId][_nftId];
        collectionNFTCount[_collectionId]--;
        balances[owner]--;
        balanceCollection[owner][_collectionId]--;

        // Remove metadata
        nftMetadata.deleteMetadata(_collectionId, _nftId);

        // Remove access control entries
        nftAccessControl.revokeAccess(_collectionId, _nftId, owner);

        emit NFTBurned(_collectionId, _nftId);
        emit Transfer(owner, address(0), _nftId);
    }



    // ------------------------------
    // NFT transfer functions
    // ------------------------------

    function transferNFT(uint256 _collectionId, uint256 _nftId, address _to) external {
        safeTransferFrom(msg.sender, _to, _nftId);
    }


    // ------------------------------
    // NFT info functions
    // ------------------------------

    function getNFTInfo(uint256 _collectionId, uint256 _nftId) external view returns (NFTInfo memory) {
        return nfts[_collectionId][_nftId];
    }

    function getCollectionNFTCount(uint256 _collectionId) external view returns (uint256) {
        return collectionNFTCount[_collectionId];
    }

    function getCollectionNFTs(uint256 _collectionId) external view returns (uint256[] memory) {

        uint256 count                   = collectionNFTCount[_collectionId];
        uint256[] memory collectionNFTs = new uint256[](count);
        uint256 index                   = 0;

        for (uint256 i = 1; i < nextTokenId; i++) {
            if (nfts[_collectionId][i].collectionId == _collectionId) {
                collectionNFTs[index] = i;
                index++;
            }
        }

        return collectionNFTs;
    }

    // ERC721 Implementation
    function balanceOf(address owner) public view override returns (uint256) {
        return balances[owner];
    }

    function balanceOfCollection(address owner, uint256 collectionId) public view returns (uint256) {
        return balanceCollection[owner][collectionId];
    }

    function ownerOf(uint256 tokenId) public view override returns (address) {
        for (uint256 collectionId = 1; collectionId < nextTokenId; collectionId++) {
            if (nfts[collectionId][tokenId].owner != address(0)) {
                return nfts[collectionId][tokenId].owner;
            }
        }
        revert("NFTContract: Invalid token ID");
    }


    function numberOfHolder(uint256 _collectionId) public view returns (uint256) {
        
        // Count the number of unique holders
        uint256 count = 0;
        address[] memory holders = new address[](nextTokenId);

        for (uint256 i = 1; i < nextTokenId; i++) {
            if (nfts[_collectionId][i].owner != address(0)) {
                address holder = nfts[_collectionId][i].owner;
                bool found = false;
                for (uint256 j = 0; j < count; j++) {
                    if (holders[j] == holder) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    holders[count] = holder;
                    count++;
                }
            }
        }
    }

    // ------------------------------
    // ERC721 functions
    // ------------------------------

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override {
        transferFrom(from, to, tokenId);
        require(_checkOnERC721Received(from, to, tokenId, data), "NFTContract: Transfer to non ERC721Receiver implementer");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public override {
        safeTransferFrom(from, to, tokenId, "");
    }

    function transferFrom(address from, address to, uint256 tokenId) public override {
        require(_isApprovedOrOwner(msg.sender, tokenId), "NFTContract: Not approved or owner");
        _transfer(from, to, tokenId);
    }

    function approve(address to, uint256 tokenId) public override {
        address owner = ownerOf(tokenId);
        require(to != owner, "NFTContract: Approval to current owner");
        require(msg.sender == owner || isApprovedForAll(owner, msg.sender), "NFTContract: Not owner or approved for all");
        tokenApprovals[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) public override {
        require(operator != msg.sender, "NFTContract: Approve to caller");
        operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function getApproved(uint256 tokenId) public view override returns (address) {
        require(_exists(tokenId), "NFTContract: Token does not exist");
        return tokenApprovals[tokenId];
    }

    function isApprovedForAll(address owner, address operator) public view override returns (bool) {
        return operatorApprovals[owner][operator];
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        for (uint256 collectionId = 1; collectionId < nextTokenId; collectionId++) {
            if (nfts[collectionId][tokenId].owner != address(0)) {
                return true;
            }
        }
        return false;
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
    }

    function _transfer(address from, address to, uint256 tokenId) internal {
        require(ownerOf(tokenId) == from, "NFTContract: Transfer from incorrect owner");
        require(to != address(0), "NFTContract: Transfer to the zero address");

        uint256 collectionId;
        for (uint256 i = 1; i < nextTokenId; i++) {
            if (nfts[i][tokenId].owner == from) {
                collectionId = i;
                break;
            }
        }

        // Clear approvals
        approve(address(0), tokenId);

        balances[from]--;
        balances[to]++;
        nfts[collectionId][tokenId].owner = to;

        emit Transfer(from, to, tokenId);

        // Update access control
        AccessLevel currentAccessLevel = nftAccessControl.getAccessLevel(collectionId, tokenId, from);
        nftAccessControl.revokeAccess(collectionId, tokenId, from);
        nftAccessControl.grantAccess(collectionId, tokenId, to, currentAccessLevel);
    }

    function _checkOnERC721Received(address from, address to, uint256 tokenId, bytes memory data) private returns (bool) {
        if (to.code.length > 0) {
            try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data) returns (bytes4 retval) {
                return retval == IERC721Receiver.onERC721Received.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert("NFTContract: Transfer to non ERC721Receiver implementer");
                } else {
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
    }
}

interface IERC721Receiver {
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4);
}