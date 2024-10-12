// File: test/NFTAccessControl.test.js
const truffleAssert = require('truffle-assertions');


const MasterAccessControl = artifacts.require("MasterAccessControl");
const NFTAccessControl = artifacts.require("NFTAccessControl");

contract("NFTAccessControl", accounts => {
  let masterAccessControl;
  let nftAccessControl;
  const owner = accounts[0];
  const user1 = accounts[1];
  const collectionId = 1;
  const nftId = 1;

  beforeEach(async () => {
    masterAccessControl = await MasterAccessControl.new({ from: owner });
    nftAccessControl = await NFTAccessControl.new(masterAccessControl.address, { from: owner });
  });

  it("should grant and check access levels", async () => {
    await nftAccessControl.grantAccess(collectionId, nftId, user1, 2, { from: owner });
    const accessLevel = await nftAccessControl.getAccessLevel(collectionId, nftId, user1);
    assert.equal(accessLevel.toNumber(), 2, "Access level should be 2");
  });

  it("should revoke access", async () => {
    await nftAccessControl.grantAccess(collectionId, nftId, user1, 2, { from: owner });
    await nftAccessControl.revokeAccess(collectionId, nftId, user1, { from: owner });
    const accessLevel = await nftAccessControl.getAccessLevel(collectionId, nftId, user1);
    assert.equal(accessLevel.toNumber(), 0, "Access level should be 0 after revocation");
  });

  it("should check minimum access", async () => {
    await nftAccessControl.grantAccess(collectionId, nftId, user1, 3, { from: owner });
    const hasMinimumAccess = await nftAccessControl.checkMinimumAccess(collectionId, nftId, user1, 2);
    assert.isTrue(hasMinimumAccess, "User should have minimum access");
  });
});
