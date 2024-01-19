const axios = require("axios"); // HTTP client
const { ethers } = require("ethers"); // Ethereum JavaScript API
const fs = require("fs");
const envFilePath = "../env.json";
const envFileContent = fs.readFileSync(envFilePath, "utf8");
const envConfig = JSON.parse(envFileContent);

// Configure Bitcoin node RPC
const BTC_API_KEY = envConfig.BTC_API_KEY;
const btcRpcUrl = `https://go.getblock.io/${BTC_API_KEY}`;
console.log("btcRpcUrl:", btcRpcUrl);

// Configure your Ethereum node and Relay contract
const ETH_API_KEY = envConfig.ETH_API_KEY;
const ethNodeUrl = `https://eth-sepolia.g.alchemy.com/v2/${ETH_API_KEY}`;
const relayContractAddress = "";
const relayContractAbi = [
  /* ABI of the Relay Contract */
];

// Initialize Ethereum ethers connection
const privateKey = envConfig.ETH_PRIVATE_KEY;
const provider = new ethers.JsonRpcProvider(ethNodeUrl);
const wallet = new ethers.Wallet(privateKey, provider);

// Relay contract instance
/* const relayContract = new ethers.Contract(
  relayContractAddress,
  relayContractAbi,
  provider
); */

// Function to perform RPC call to the Bitcoin node
async function bitcoinRpcCall(method, params = []) {
  try {
    const response = await axios.post(btcRpcUrl, {
      jsonrpc: "1.0",
      id: method,
      method: method,
      params: params,
    });

    return response.data.result;
  } catch (e) {
    console.log(`Error with Bitcoin RPC ${method}:`, e);
    throw e;
  }
}

// Function to get the best block hash
async function getBestBlockHash() {
  return bitcoinRpcCall("getbestblockhash");
}

// Function to get block header
async function getBlockHeader(blockHash) {
  return bitcoinRpcCall("getblockheader", [blockHash, false]); // false for hex format
}

// Function to submit block header to Relay contract
async function submitBlockHeaderToRelay(blockHeader) {
  const contractWithSigner = relayContract.connect(wallet);
  try {
    // Send the transaction
    const tx = await contractWithSigner.HeaderToMerkle(blockHeader);
    const receipt = await tx.wait();
    console.log("Transaction receipt:", receipt);
  } catch (e) {
    console.log("Error submitting block header to relay:", e);
    throw e;
  }
}

// Main Function
(async () => {
  try {
    const blockHash = await getBestBlockHash();
    console.log("Best block hash:", blockHash);
    const blockHeader = await getBlockHeader(blockHash);
    console.log("Block header:", blockHeader);

    //await submitBlockHeaderToRelay(blockHeader);
  } catch (e) {
    console.log("Error in relay process:", e);
  }
})();
