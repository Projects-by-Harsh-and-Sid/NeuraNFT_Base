after deployemnt all contracts are saved in the `build` folder. 
```bash
tronbox migrate --network shasta
```

if smart contract deployment fails due to out of energy then
- get more tokens
- stake more tokens to get bandwidth and energy https://shasta.tronscan.org/#/wallet/resources
- increase the fee limit in the `tronbox.js` file 


the address of the deployed contract is stored in hex format but on tronscan it is displayed in base58 format.

to convert the address from hex to base58 format use the following command:
```bash
tronweb.address.fromHex('0xcontract_address')
```