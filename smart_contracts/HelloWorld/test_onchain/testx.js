// test_onchain/test.js

import TronWeb from 'tronweb';
import { expect } from 'chai';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Read and parse the JSON file
const HelloWorldJSON = JSON.parse(fs.readFileSync('../build/contracts/HelloWorld.json', 'utf8'));

// Configuration
const tronWeb = new TronWeb({
  fullHost: 'https://api.shasta.trongrid.io',
  privateKey: process.env.PRIVATE_KEY_SHASTA // Ensure this environment variable is set
});

// Deployed contract address
const CONTRACT_ADDRESS =HelloWorldJSON.networks['2'].address; // Replace with your contract address

// Instantiate contract
const helloWorldContract = tronWeb.contract(HelloWorldJSON.abi, CONTRACT_ADDRESS);

describe('HelloWorld - Existing Deployment', function() {
  this.timeout(10000); // Set timeout to 30 seconds for all tests in this suite

  it("should return 'Hello World'", async () => {
    try {
      console.log('Calling getMessage...');
      const message = await helloWorldContract.methods.getMessage().call();
      console.log('Message:', message);
      expect(message).to.equal("Hello World");
    } catch (error) {
      console.error('Error getting message:', error);
      throw error;
    }
  });

  it("should set a new message", async () => {
    try {
      console.log('Setting new message...');
      const tx = await helloWorldContract.methods.setMessage("Hello Tron test15").send({
        feeLimit: 100000000,
        callValue: 0,
        // shouldPollResponse: true
      });
      console.log('Transaction:', tx);
      //wait for 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log('Transaction confirmed');
      const newMessage = await helloWorldContract.methods.getMessage().call();
      console.log('New Message:', newMessage);
      expect(newMessage).to.equal("Hello Tron test15");
    } catch (error) {
      console.error('Error setting message:', error);
      throw error;
    }
  });
});
