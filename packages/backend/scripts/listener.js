const axios = require("axios");
const { ethers } = require("ethers");
const fs = require("fs");
const envFilePath = "../env.json";
const envFileContent = fs.readFileSync(envFilePath, "utf8");
const envConfig = JSON.parse(envFileContent);

const btcRpcUrl = `https://api.blockcypher.com/v1/btc/test3/`;
const ETH_API_KEY = envConfig.ETH_API_KEY;
const ethNodeUrl = `https://eth-sepolia.g.alchemy.com/v2/${ETH_API_KEY}`;
const ETH_PRIVATE_KEY = envConfig.ETH_PRIVATE_KEY;

// Ethereum setup
const provider = new ethers.JsonRpcProvider(ethNodeUrl);
const wallet = new ethers.Wallet(ETH_PRIVATE_KEY, provider);
//const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// Bitcoin vault address and blockchain explorer API
const bitcoinVaultAddress = "tb1qgzfedw36d62dcltug6cnutt2x5dach2833vtt6";

// function that tracks bitcoin vault address and when a bitcoin came into wallet. Extract that transaction and return the op_return output.
async function checkBitcoinTransactions() {
  try {
    const response = await axios.get(
      `${btcRpcUrl}/addrs/${bitcoinVaultAddress}/full`
    );
    const transactions = response.data.txs;
    const latestTransaction = transactions[0];
    const opReturnData = latestTransaction.outputs[2].data_hex;
    const opReturnString = Buffer.from(opReturnData, "hex").toString("utf8");
    console.log("opReturnData:", opReturnData);
    console.log("opReturnString:", opReturnString);
    return opReturnData;
  } catch (e) {
    console.log("Error with Bitcoin RPC getbestblockhash:", e);
    throw e;
  }
}

// Poll for new transactions at regular intervals
//setInterval(checkBitcoinTransactions, 60000); // Adjust the interval as needed
checkBitcoinTransactions();
