# Compiling Tron Smart Contracts

This guide provides detailed information on compiling smart contracts for the Tron blockchain, including version control considerations and handling multiple related contracts.

## Compilation Process

TronBox uses the Solidity compiler to compile your smart contracts. When you run the compile command, TronBox:

1. Reads all `.sol` files in your `contracts/` directory
2. Compiles each contract
3. Generates corresponding JSON files in the `build/contracts/` directory

### Compilation Command

To compile your contracts, run:

```bash
tronbox compile
```

## Compilation Output

For each contract, TronBox generates a JSON file in the `build/contracts/` directory. This file contains:

- Contract ABI (Application Binary Interface)
- Bytecode
- Source mapping
- Compiler information

Example structure of a generated JSON file:

```json
{
  "contractName": "MyContract",
  "abi": [...],
  "bytecode": "0x...",
  "deployedBytecode": "0x...",
  "sourceMap": "...",
  "deployedSourceMap": "...",
  "source": "...",
  "sourcePath": "...",
  "ast": {...},
  "legacyAST": {...},
  "compiler": {
    "name": "solc",
    "version": "0.5.8+commit.23d335f2.Emscripten.clang"
  },
  "networks": {}
}
```

## Version Controlling

TronBox uses the `Migrations.sol` contract to handle version controlling. This contract keeps track of which migrations have been applied to the blockchain.

Key points about version controlling:

1. Each migration script is assigned a number (e.g., `1_initial_migration.js`, `2_deploy_mycontract.js`).
2. The `Migrations.sol` contract stores the number of the last applied migration.
3. When you run `tronbox migrate`, it only runs the migration scripts that haven't been applied yet.

## Compiling Multiple Related Smart Contracts

When dealing with multiple related contracts, consider the following:

1. **Order of Compilation**: Contracts are compiled in alphabetical order by default. If you need a specific order, you can use numbered prefixes in your filenames.

2. **Dependencies**: If contract B depends on contract A, make sure to import A in B:

   ```solidity
   import "./ContractA.sol";

   contract ContractB {
     ContractA public contractA;
     // ... rest of the contract
   }
   ```

3. **Library Linking**: If you're using libraries, they need to be deployed before the contracts that use them. This is handled in the migration scripts, not during compilation.

4. **Inheritance**: When using inheritance, ensure that the base contracts are in the same directory or properly imported.

## Compilation Artifacts

The compilation process generates several important artifacts:

1. **ABI (Application Binary Interface)**: Defines how to call functions in the contract and how data is encoded/decoded.
2. **Bytecode**: The compiled smart contract code that is deployed to the blockchain.
3. **Source Map**: Helps with debugging by mapping the bytecode back to the original Solidity code.

These artifacts are stored in the `build/contracts/` directory and are crucial for deploying and interacting with your contracts.

## Best Practices

1. **Use a .gitignore file**: Add `build/` to your `.gitignore` to avoid committing compiled artifacts to version control.
2. **Consistent Solidity Version**: Use the same Solidity version across all your contracts to avoid compatibility issues.
3. **Regular Compilation**: Compile your contracts regularly during development to catch errors early.
4. **Clean Build**: Use `tronbox compile --all` to recompile all contracts, ignoring the cache.

By following these guidelines, you can efficiently manage the compilation process for your Tron smart contracts, even when dealing with complex, interdependent contract systems.