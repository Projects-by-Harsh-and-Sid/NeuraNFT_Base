// File: test/NFTMetadata.test.js

const truffleAssert = require('truffle-assertions');

const MasterAccessControl = artifacts.require("MasterAccessControl");
const NFTAccessControl = artifacts.require("NFTAccessControl");
const NFTMetadata = artifacts.require("NFTMetadata");

contract("NFTMetadata", accounts => {
  let masterAccessControl;
  let nftAccessControl;
  let nftMetadata;
  const owner = accounts[0];
  const collectionId = 1;
  const nftId = 1;

  beforeEach(async () => {
    masterAccessControl = await MasterAccessControl.new({ from: owner });
    nftAccessControl = await NFTAccessControl.new(masterAccessControl.address, { from: owner });
    nftMetadata = await NFTMetadata.new(masterAccessControl.address, nftAccessControl.address, { from: owner });
    
    // Grant access to test accounts
    await masterAccessControl.grantAccess(nftMetadata.address, owner, { from: owner });
    await masterAccessControl.grantAccess(nftMetadata.address, accounts[1], { from: owner });
  });

  it("should create and retrieve metadata", async () => {
    const metadata = {
      image: "ipfs://image",
      baseModel: "model1",
      data: "ipfs://data",
      rag: "ipfs://rag",
      fineTuneData: "ipfs://finetune",
      description: "Test NFT"
    };

    await nftMetadata.createMetadata(collectionId, nftId, Object.values(metadata), { from: owner });
    const retrievedMetadata = await nftMetadata.getMetadata(collectionId, nftId);

    assert.equal(retrievedMetadata.image, metadata.image, "Image should match");
    assert.equal(retrievedMetadata.baseModel, metadata.baseModel, "Base model should match");
    assert.equal(retrievedMetadata.data, metadata.data, "Data should match");
    assert.equal(retrievedMetadata.rag, metadata.rag, "RAG should match");
    assert.equal(retrievedMetadata.fineTuneData, metadata.fineTuneData, "Fine-tune data should match");
    assert.equal(retrievedMetadata.description, metadata.description, "Description should match");
  });

  it("should update metadata", async () => {
    const initialMetadata = {
      image: "ipfs://image1",
      baseModel: "model1",
      data: "ipfs://data1",
      rag: "ipfs://rag1",
      fineTuneData: "ipfs://finetune1",
      description: "Initial NFT"
    };

    await nftMetadata.createMetadata(collectionId, nftId, Object.values(initialMetadata), { from: owner });

    const updatedMetadata = {
      image: "ipfs://image2",
      baseModel: "model2",
      data: "ipfs://data2",
      rag: "ipfs://rag2",
      fineTuneData: "ipfs://finetune2",
      description: "Updated NFT"
    };

    await nftMetadata.updateMetadata(collectionId, nftId, Object.values(updatedMetadata), { from: owner });
    const retrievedMetadata = await nftMetadata.getMetadata(collectionId, nftId);

    assert.equal(retrievedMetadata.image, updatedMetadata.image, "Updated image should match");
    assert.equal(retrievedMetadata.baseModel, updatedMetadata.baseModel, "Updated base model should match");
    assert.equal(retrievedMetadata.data, updatedMetadata.data, "Updated data should match");
    assert.equal(retrievedMetadata.rag, updatedMetadata.rag, "Updated RAG should match");
    assert.equal(retrievedMetadata.fineTuneData, updatedMetadata.fineTuneData, "Updated fine-tune data should match");
    assert.equal(retrievedMetadata.description, updatedMetadata.description, "Updated description should match");
  });

  it("should delete metadata", async () => {
    const metadata = {
      image: "ipfs://image",
      baseModel: "model1",
      data: "ipfs://data",
      rag: "ipfs://rag",
      fineTuneData: "ipfs://finetune",
      description: "Test NFT"
    };

    await nftMetadata.createMetadata(collectionId, nftId, Object.values(metadata), { from: owner });
    await nftMetadata.deleteMetadata(collectionId, nftId, { from: owner });

    await truffleAssert.reverts(
      nftMetadata.getMetadata(collectionId, nftId),
      "NFTMetadata: Metadata does not exist"
    );
  });
});
