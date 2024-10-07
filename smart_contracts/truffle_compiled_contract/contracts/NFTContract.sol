// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./MasterAccessControl.sol";
import "./NFTAccessControl.sol";
import "./NFTMetadata.sol";

// Novel ERC standard incorporating collection ID
abstract contract ERC721Collection {
    event Transfer(address indexed from, address indexed to, uint256 indexed collectionId, uint256 tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed collectionId, uint256 tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    function balanceOf(address owner) public view virtual returns (uint256 balance);
    function balanceOfCollection(address owner, uint256 collectionId) public view virtual returns (uint256 balance);
    function ownerOf(uint256 collectionId, uint256 tokenId) public view virtual returns (address owner);
    function safeTransferFrom(address from, address to, uint256 collectionId, uint256 tokenId, bytes memory data) public virtual;
    function safeTransferFrom(address from, address to, uint256 collectionId, uint256 tokenId) public virtual;
    function transferFrom(address from, address to, uint256 collectionId, uint256 tokenId) public virtual;
    function approve(address to, uint256 collectionId, uint256 tokenId) public virtual;
    function setApprovalForAll(address operator, bool _approved) public virtual;
    function getApproved(uint256 collectionId, uint256 tokenId) public view virtual returns (address operator);
    function isApprovedForAll(address owner, address operator) public view virtual returns (bool);
}

contract NFTContract is ERC721Collection {
    MasterAccessControl public masterAccessControl;
    NFTAccessControl public nftAccessControl;
    NFTMetadata public nftMetadata;

    struct NFTInfo {
        uint8 levelOfOwnership;
        string name;
        address creator;
        uint256 creationDate;
        address owner;
    }

    mapping(uint256 => mapping(uint256 => NFTInfo)) private nfts; // collectionId => tokenId => NFTInfo
    mapping(uint256 => uint256) private collectionNFTCount; // collectionId => number of NFTs
    mapping(address => uint256) private balances; // owner => total number of NFTs
    mapping(address => mapping(uint256 => uint256)) private balanceCollection; // owner => collectionId => number of NFTs

    mapping(uint256 => mapping(uint256 => address)) private tokenApprovals; // collectionId => tokenId => approved address
    mapping(address => mapping(address => bool)) private operatorApprovals;

    mapping(uint256 => uint256) private nextTokenId; // collectionId => nextTokenId

    event NFTCreated(uint256 indexed collectionId, uint256 indexed tokenId, string name, address creator);
    event NFTBurned(uint256 indexed collectionId, uint256 indexed tokenId);

    constructor(address _masterAccessControlAddress, address _nftAccessControlAddress, address _nftMetadataAddress) {
        masterAccessControl = MasterAccessControl(_masterAccessControlAddress);
        nftAccessControl = NFTAccessControl(_nftAccessControlAddress);
        nftMetadata = NFTMetadata(_nftMetadataAddress);
        masterAccessControl.grantSelfAccess(msg.sender);
    }

    modifier onlyAuthorized() {
        require(masterAccessControl.selfCheckAccess(msg.sender), "NFTContract: Not authorized");
        _;
    }

    modifier onlyNFTOwner(uint256 _collectionId, uint256 _tokenId) {
        require(nfts[_collectionId][_tokenId].owner == msg.sender, "NFTContract: Not the NFT owner");
        _;
    }

    function createNFT(uint256 _collectionId, string memory _name, uint8 _levelOfOwnership) external returns (uint256) {
        require(_levelOfOwnership > 0 && _levelOfOwnership <= 6, "NFTContract: Invalid level of ownership");

        if (nextTokenId[_collectionId] == 0) {
            nextTokenId[_collectionId] = 1;
        }

        uint256 tokenId = nextTokenId[_collectionId]++;
        NFTInfo memory newNFT = NFTInfo({
            levelOfOwnership: _levelOfOwnership,
            name: _name,
            creator: msg.sender,
            creationDate: block.timestamp,
            owner: msg.sender
        });

        nfts[_collectionId][tokenId] = newNFT;
        collectionNFTCount[_collectionId]++;
        balances[msg.sender]++;
        balanceCollection[msg.sender][_collectionId]++;

        nftAccessControl.grantAccess(_collectionId, tokenId, msg.sender, AccessLevel.AbsoluteOwnership);

        emit NFTCreated(_collectionId, tokenId, _name, msg.sender);
        emit Transfer(address(0), msg.sender, _collectionId, tokenId);

        return tokenId;
    }

    function burnNFT(uint256 _collectionId, uint256 _tokenId) external onlyNFTOwner(_collectionId, _tokenId) {
        address owner = nfts[_collectionId][_tokenId].owner;

        delete nfts[_collectionId][_tokenId];
        collectionNFTCount[_collectionId]--;
        balances[owner]--;
        balanceCollection[owner][_collectionId]--;

        nftMetadata.deleteMetadata(_collectionId, _tokenId);
        nftAccessControl.revokeAccess(_collectionId, _tokenId, owner);

        emit NFTBurned(_collectionId, _tokenId);
        emit Transfer(owner, address(0), _collectionId, _tokenId);
    }

    function transferNFT(uint256 _collectionId, uint256 _tokenId, address _to) external {
        safeTransferFrom(msg.sender, _to, _collectionId, _tokenId);
    }

    function getNFTInfo(uint256 _collectionId, uint256 _tokenId) external view returns (NFTInfo memory) {
        return nfts[_collectionId][_tokenId];
    }

    function getCollectionNFTCount(uint256 _collectionId) external view returns (uint256) {
        return collectionNFTCount[_collectionId];
    }

    function getCollectionNFTs(uint256 _collectionId) external view returns (uint256[] memory) {
        uint256 count = collectionNFTCount[_collectionId];
        uint256[] memory collectionNFTs = new uint256[](count);
        uint256 index = 0;

        for (uint256 i = 1; i < nextTokenId[_collectionId]; i++) {
            if (nfts[_collectionId][i].owner != address(0)) {
                collectionNFTs[index] = i;
                index++;
            }
        }

        return collectionNFTs;
    }

    function balanceOf(address owner) public view override returns (uint256) {
        return balances[owner];
    }

    function balanceOfCollection(address owner, uint256 collectionId) public view override returns (uint256) {
        return balanceCollection[owner][collectionId];
    }

    function ownerOf(uint256 collectionId, uint256 tokenId) public view override returns (address) {
        address owner = nfts[collectionId][tokenId].owner;
        require(owner != address(0), "NFTContract: Invalid token ID");
        return owner;
    }

    function numberOfHolders(uint256 _collectionId) public view returns (uint256) {
        uint256 count = 0;
        address[] memory holders = new address[](nextTokenId[_collectionId]);

        for (uint256 i = 1; i < nextTokenId[_collectionId]; i++) {
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
        return count;
    }

    function safeTransferFrom(address from, address to, uint256 collectionId, uint256 tokenId, bytes memory data) public override {
        transferFrom(from, to, collectionId, tokenId);
        require(_checkOnERC721Received(from, to, collectionId, tokenId, data), "NFTContract: Transfer to non ERC721Receiver implementer");
    }

    function safeTransferFrom(address from, address to, uint256 collectionId, uint256 tokenId) public override {
        safeTransferFrom(from, to, collectionId, tokenId, "");
    }

    function transferFrom(address from, address to, uint256 collectionId, uint256 tokenId) public override {
        require(_isApprovedOrOwner(msg.sender, collectionId, tokenId), "NFTContract: Not approved or owner");
        _transfer(from, to, collectionId, tokenId);
    }

    function approve(address to, uint256 collectionId, uint256 tokenId) public override {
        address owner = ownerOf(collectionId, tokenId);
        require(to != owner, "NFTContract: Approval to current owner");
        require(msg.sender == owner || isApprovedForAll(owner, msg.sender), "NFTContract: Not owner or approved for all");
        
        tokenApprovals[collectionId][tokenId] = to;
        emit Approval(owner, to, collectionId, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) public override {
        require(operator != msg.sender, "NFTContract: Approve to caller");
        operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function getApproved(uint256 collectionId, uint256 tokenId) public view override returns (address) {
        require(_exists(collectionId, tokenId), "NFTContract: Token does not exist");
        return tokenApprovals[collectionId][tokenId];
    }

    function isApprovedForAll(address owner, address operator) public view override returns (bool) {
        return operatorApprovals[owner][operator];
    }

    function _exists(uint256 collectionId, uint256 tokenId) internal view returns (bool) {
        return nfts[collectionId][tokenId].owner != address(0);
    }

    function _isApprovedOrOwner(address spender, uint256 collectionId, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf(collectionId, tokenId);
        return (spender == owner || getApproved(collectionId, tokenId) == spender || isApprovedForAll(owner, spender));
    }

    function _transfer(address from, address to, uint256 collectionId, uint256 tokenId) internal {
        require(ownerOf(collectionId, tokenId) == from, "NFTContract: Transfer from incorrect owner");
        require(to != address(0), "NFTContract: Transfer to the zero address");

        // Clear approvals
        approve(address(0), collectionId, tokenId);

        balances[from]--;
        balances[to]++;
        balanceCollection[from][collectionId]--;
        balanceCollection[to][collectionId]++;
        nfts[collectionId][tokenId].owner = to;

        emit Transfer(from, to, collectionId, tokenId);

        // Update access control
        AccessLevel currentAccessLevel = nftAccessControl.getAccessLevel(collectionId, tokenId, from);
        nftAccessControl.revokeAccess(collectionId, tokenId, from);
        nftAccessControl.grantAccess(collectionId, tokenId, to, currentAccessLevel);
    }

    function _checkOnERC721Received(address from, address to, uint256 collectionId, uint256 tokenId, bytes memory data) private returns (bool) {
        if (to.code.length > 0) {
            try IERC721Receiver(to).onERC721Received(msg.sender, from, collectionId, tokenId, data) returns (bytes4 retval) {
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
    function onERC721Received(address operator, address from, uint256 collectionId, uint256 tokenId, bytes calldata data) external returns (bytes4);
}