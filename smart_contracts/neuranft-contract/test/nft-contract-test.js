// File: test/NFTContract.test.js
const truffleAssert = require('truffle-assertions');


const MasterAccessControl = artifacts.require("MasterAccessControl");
const NFTAccessControl = artifacts.require("NFTAccessControl");
const NFTMetadata = artifacts.require("NFTMetadata");
const NFTContract = artifacts.require("NFTContract");

contract("NFTContract", accounts => {
  let masterAccessControl;
  let nftAccessControl;
  let nftMetadata;
  let nftContract;
  const owner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const collectionId = 1;

  beforeEach(async () => {
    // Deploy contracts
    masterAccessControl = await MasterAccessControl.new({ from: owner });
    nftAccessControl = await NFTAccessControl.new(masterAccessControl.address, { from: owner });
    nftMetadata = await NFTMetadata.new(masterAccessControl.address, nftAccessControl.address, { from: owner });
    nftContract = await NFTContract.new(masterAccessControl.address, nftAccessControl.address, nftMetadata.address, { from: owner });
    
    // Grant access to NFTContract in MasterAccessControl
    await masterAccessControl.grantAccess(nftContract.address, nftContract.address, { from: owner });
    
    // Grant access to test accounts in MasterAccessControl
    await masterAccessControl.grantAccess(nftContract.address, owner, { from: owner });
    await masterAccessControl.grantAccess(nftContract.address, user1, { from: owner });
    await masterAccessControl.grantAccess(nftContract.address, user2, { from: owner });
    
    // Grant access to NFTContract in NFTAccessControl
    await nftAccessControl.grantAccess(collectionId, 0, nftContract.address, 6, { from: owner }); // Granting AbsoluteOwnership
    
    // Grant access to test accounts in NFTAccessControl
    await nftAccessControl.grantAccess(collectionId, 0, owner, 6, { from: owner }); // Granting AbsoluteOwnership
    await nftAccessControl.grantAccess(collectionId, 0, user1, 6, { from: owner }); // Granting AbsoluteOwnership
    await nftAccessControl.grantAccess(collectionId, 0, user2, 6, { from: owner }); // Granting AbsoluteOwnership


    await masterAccessControl.grantAccess(masterAccessControl.address, owner, { from: owner });
    await masterAccessControl.grantAccess(nftAccessControl.address, nftContract.address, { from: owner });
    await masterAccessControl.grantAccess(nftMetadata.address, nftContract.address, { from: owner });

  });

  it("should create an NFT", async () => {
    const result = await nftContract.createNFT(collectionId, "Test NFT", 3, { from: user1 });
    const nftId = result.logs[0].args.tokenId.toNumber();
    
    const nftInfo = await nftContract.getNFTInfo(collectionId, nftId);
    assert.equal(nftInfo.name, "Test NFT", "NFT name should match");
    assert.equal(nftInfo.levelOfOwnership, 3, "NFT level of ownership should match");
    assert.equal(nftInfo.owner, user1, "NFT owner should be user1");
  });

  it("should transfer an NFT", async () => {
    const result = await nftContract.createNFT(collectionId, "Test NFT", 3, { from: user1 });
    const nftId = result.logs[0].args.tokenId.toNumber();

    await nftContract.transferNFT(collectionId, nftId, user2, { from: user1 });
    const newOwner = await nftContract.ownerOf(collectionId, nftId);
    assert.equal(newOwner, user2, "NFT should be transferred to user2");
  });

  it("should burn an NFT", async () => {
    const result = await nftContract.createNFT(collectionId, "Test NFT", 3, { from: user1 });
    const nftId = result.logs[0].args.tokenId.toNumber();

    await nftContract.burnNFT(collectionId, nftId, { from: user1 });
    
    await truffleAssert.reverts(
      nftContract.ownerOf(collectionId, nftId),
      "NFTContract: Invalid token ID"
    );
  });

  it("should get collection NFT count", async () => {
    await nftContract.createNFT(collectionId, "Test NFT 1", 3, { from: user1 });
    await nftContract.createNFT(collectionId, "Test NFT 2", 3, { from: user1 });

    const count = await nftContract.getCollectionNFTCount(collectionId);
    assert.equal(count.toNumber(), 2, "Collection should have 2 NFTs");
  });

  it("should get number of unique holders", async () => {
    await nftContract.createNFT(collectionId, "Test NFT 1", 3, { from: user1 });
    await nftContract.createNFT(collectionId, "Test NFT 2", 3, { from: user1 });
    await nftContract.createNFT(collectionId, "Test NFT 3", 3, { from: user2 });

    const holders = await nftContract.numberOfHolders(collectionId);
    assert.equal(holders.toNumber(), 2, "Collection should have 2 unique holders");
  });
});
