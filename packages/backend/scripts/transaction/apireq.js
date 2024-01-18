const axios = require("axios"); // HTTP client
const fs = require("fs");
const envFilePath = "../../env.json";
const envFileContent = fs.readFileSync(envFilePath, "utf8");
const envConfig = JSON.parse(envFileContent);

// Configure Bitcoin node RPC
const BTC_API_KEY = envConfig.BTC_API_KEY;
const btcApiBase = `https://api.blockcypher.com/v1/btc/test3/`;
console.log("btcRpcUrl:", btcRpcUrl);

function bitcoinUnspentCall(address) {
  return axios
    .get(`${btcApiBase}addrs/${address}?unspentOnly=true`)
    .then((response) => {
      let inputs = [];
      let utxos = response.data.txrefs;
      let totalAmountAvailable = 0;
      let inputCount = 0;
      for (const element of utxos) {
        if (element.spent === false) {
          let utxo = {};
          utxo.txid = element.tx_hash;
          utxo.satoshis = element.value;
          utxo.address = address;
          utxo.vout = element.tx_output_n;
          axios
            .get(`${btcApiBase}txs/${utxo.txid}?includeHex=true`)
            .then((response) => {
              utxo.scriptPubKey = response.data.outputs[utxo.vout].script;
              utxo.hex = response.data.hex;
            });
          totalAmountAvailable += utxo.satoshis;
          inputCount++;
          inputs.push(utxo);
        } else {
          continue;
        }
      }
      console.log(inputs);
      console.log("Total Amount Available: ", totalAmountAvailable);
    });
}
function bitcoinTxHexCall(txid) {
  return axios
    .get(`https://api.blockcypher.com/v1/btc/test3/txs/${txid}?includeHex=true`)
    .then((response) => {
      console.log(response.data.hex);
    });
}

bitcoinUnspentCall("tb1qgzfedw36d62dcltug6cnutt2x5dach2833vtt6");
