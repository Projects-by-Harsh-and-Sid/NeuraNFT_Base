const HelloWorld = artifacts.require("HelloWorld");

contract("HelloWorld", accounts => {
    
    let instance;

    before(async () => {
        instance = await HelloWorld.deployed();
    });
    
    it("should check message is helloworld or not", async () => {
        let message = await instance.getMessage();
        assert.equal(message, "Hello World", "The initial message should be 'Hello World'");
    });

    it("should set a new message", async () => {
        await instance.setMessage("Hello Tron");
        let newMessage = await instance.getMessage();
        assert.equal(newMessage, "Hello Tron", "The new message should be 'Hello Tron'");
    });
});