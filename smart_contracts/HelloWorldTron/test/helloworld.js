const HelloWorld = artifacts.require("HelloWorld");

contract("HelloWorld", accounts => {
    it("should deploy the contract and return 'Hello World'", async () => {
        let instance = await HelloWorld.deployed();
        let message = await instance.getMessage();
        assert.equal(message, "Hello World", "The initial message should be 'Hello World'");
    });

    it("should set a new message", async () => {
        let instance = await HelloWorld.deployed();
        await instance.setMessage("Hello Tron");
        let newMessage = await instance.getMessage();
        assert.equal(newMessage, "Hello Tron", "The new message should be 'Hello Tron'");
    });
});
