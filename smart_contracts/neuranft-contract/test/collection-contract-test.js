// File: test/CollectionContract.test.js
const truffleAssert = require('truffle-assertions');


const MasterAccessControl = artifacts.require("MasterAccessControl");
const NFTContract = artifacts.require("NFTContract");
const CollectionContract = artifacts.require("CollectionContract");

contract("CollectionContract", accounts => {
  let masterAccessControl;
  let nftContract;
  let collectionContract;
  const owner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];

  beforeEach(async () => {
    masterAccessControl = await MasterAccessControl.new({ from: owner });
    nftContract = await NFTContract.new(masterAccessControl.address, masterAccessControl.address, masterAccessControl.address, { from: owner });
    collectionContract = await CollectionContract.new(masterAccessControl.address, nftContract.address, { from: owner });
    
    // Grant access to test accounts
    await masterAccessControl.grantAccess(collectionContract.address, owner, { from: owner });
    await masterAccessControl.grantAccess(collectionContract.address, user1, { from: owner });
    await masterAccessControl.grantAccess(collectionContract.address, user2, { from: owner });
  });

  it("should create a collection", async () => {
    const result = await collectionContract.createCollection("Punks", 4890 ,"BaseModel1", "ipfs://image", "Test Collection", { from: user1 });
    const collectionId = result.logs[0].args.collectionId.toNumber();

    const metadata = await collectionContract.getCollectionMetadata(collectionId);
    assert.equal(metadata.name, "Punks", "Name should match");
    assert.equal(metadata.contextWindow, 4890, "Total supply should match");
    assert.equal(metadata.baseModel, "BaseModel1", "Base model should match");
    assert.equal(metadata.image, "ipfs://image", "Image should match");
    assert.equal(metadata.description, "Test Collection", "Description should match");
    assert.equal(metadata.creator, user1, "Creator should be user1");
  });

  it("should update a collection", async () => {
    const createResult = await collectionContract.createCollection("gibbrish2", 4096,"BaseModel1", "ipfs://image1", "Test Collection", { from: user1 });
    const collectionId = createResult.logs[0].args.collectionId.toNumber();

    await collectionContract.updateCollection(collectionId,"PunksX", 4096 ,"BaseModel2", "ipfs://image2", "Updated Collection", { from: user1 });

    const updatedMetadata = await collectionContract.getCollectionMetadata(collectionId);
    assert.equal(updatedMetadata.name, "PunksX", "Name should match");
    assert.equal(updatedMetadata.contextWindow, 4096, "Total supply should match");
    assert.equal(updatedMetadata.baseModel, "BaseModel2", "Updated base model should match");
    assert.equal(updatedMetadata.image, "ipfs://image2", "Updated image should match");
    assert.equal(updatedMetadata.description, "Updated Collection", "Updated description should match");
  });

  it("should transfer collection ownership", async () => {
    const createResult = await collectionContract.createCollection("gibbrish", 4096 ,"BaseModel1", "ipfs://image", "Test Collection", { from: user1 });
    const collectionId = createResult.logs[0].args.collectionId.toNumber();

    await collectionContract.transferCollection(collectionId, user2, { from: user1 });

    const newOwner = await collectionContract.getCollectionOwner(collectionId);
    assert.equal(newOwner, user2, "Collection owner should be updated");
  });

  it("should get total collections", async () => {
    await collectionContract.createCollection("gibbrish2", 4096, "BaseModel1", "ipfs://image1", "Test Collection 1", { from: user1 });
    await collectionContract.createCollection("gibbrish3", 4096,"BaseModel2", "ipfs://image2", "Test Collection 2", { from: user1 });

    const totalCollections = await collectionContract.getTotalCollections();
    assert.equal(totalCollections.toNumber(), 2, "Total collections should be 2");
  });

  it("should get all collections", async () => {
    await collectionContract.createCollection("gibbrish4", 4096,"BaseModel1", "ipfs://image1", "Test Collection 1", { from: user1 });
    await collectionContract.createCollection("gibbrish5", 4096,"BaseModel2", "ipfs://image2", "Test Collection 2", { from: user1 });

    const allCollections = await collectionContract.getAllCollections();
    assert.equal(allCollections.length, 2, "Should return 2 collections");
    assert.equal(allCollections[0].baseModel, "BaseModel1", "First collection base model should match");
    assert.equal(allCollections[1].baseModel, "BaseModel2", "Second collection base model should match");
  });

  it("should not allow non-owners to update collection", async () => {
    const createResult = await collectionContract.createCollection("gibbrish6", 4096,"BaseModel1", "ipfs://image1", "Test Collection", { from: user1 });
    const collectionId = createResult.logs[0].args.collectionId.toNumber();

    await truffleAssert.reverts(
      collectionContract.updateCollection(collectionId,"PunksX",4000, "BaseModel2", "ipfs://image2", "Updated Collection", { from: user2 }),
      "CollectionContract: Not the collection owner"
    );
  });

  it("should not allow non-owners to transfer collection", async () => {
    const createResult = await collectionContract.createCollection("gibbrish7", 4096,"BaseModel1", "ipfs://image", "Test Collection", { from: user1 });
    const collectionId = createResult.logs[0].args.collectionId.toNumber();

    await truffleAssert.reverts(
      collectionContract.transferCollection(collectionId, user2, { from: user2 }),
      "CollectionContract: Not the collection owner"
    );
  });
});