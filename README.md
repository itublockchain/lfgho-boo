
# BOO!
BOO! is an innovative Native Bitcoin GHO Faciliator, trustless mechanism where BTC transactions verifying via its BTC LightClient(spv) and minting GHO on Ethereum, with user ETH addresses tagged in OP_RETURN parsed by specialized contract.


## Contracts(Sepolia)

* Minter: 0x6CdC0cD78816531e4D3D54019F0D947b133F7b0A
* GHOToken: 0x90ECA81b3B7F6cd49534BEdEa56B83902cdB8C67
* Parser: 0x43bA15E924dBBa7E5F40Ad1936d2588E9F644041
* BTCRelay: 0x17084631f7ba4f8a2d1f5ebaa803e37927f98d8f
* Oracle: 0xdd3cF7d8D8E80Cb4A5511F1E87AaBc337dA98580

## Long Description
Introducing BOO!, a cutting-edge blockchain interoperability solution that seamlessly integrates Native Bitcoin and Ethereum, the leading cryptocurrencies in the market. Through its innovative use of GHO tokens, BOO! establishes a trustless and transparent platform for value exchange, capitalizing on the unique advantages of both blockchain networks.

At the heart of BOO! is the BTCRelay contract, a robust bridge that transmits Bitcoin block headers directly to the Ethereum network. This relay serves as a Bitcoin Lightclient(spv) within Ethereum, validating Bitcoin transactions without necessitating a full node. It provides a secure and minimally trust-dependent conduit between the two blockchains, ensuring the integrity and finality of cross-chain transactions.

Working in tandem with the BTCRelay, the Minter contract is tasked with generating GHO tokens. By interpreting the authenticated Bitcoin transaction details, such as the transferred Bitcoin amount and the prevailing exchange rate supplied by an oracle, the Minter contract accurately allocates GHO tokens to the relevant Ethereum address. This contract is the linchpin in maintaining a decentralized and tamper-proof token minting process that mirrors the actual value transitioned from Bitcoin.

The Parser contract acts as an astute analytical tool, extracting vital information from Bitcoin transactions. It meticulously decodes the transaction script to identify the OP_RETURN data, which signifies the Ethereum address of the transaction initiator. This crucial function facilitates the precise allocation of GHO tokens to the user's Ethereum account, equivalent to their Bitcoin contribution.

For the end-users, BOO! presents an intuitive interface for initiating Bitcoin transactions that include their Ethereum addresses within the OP_RETURN output. This distinctive tag in the Bitcoin transaction allows BOO!'s system to authenticate the user's transaction and extract the necessary data for the GHO token minting process. The synergy of the smart contracts and the user-friendly interface underpins BOO!'s dedication to delivering a fluid and fortified bridge between Bitcoin and Ethereum. This platform paves the way for innovative applications in decentralized finance and cross-chain operations, expanding the horizon for digital asset exchanges.
