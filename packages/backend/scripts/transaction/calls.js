const axios = require("axios"); // HTTP client

/* const fs = require("fs");
const envFilePath = "../../env.json";
const envFileContent = fs.readFileSync(envFilePath, "utf8");
const envConfig = JSON.parse(envFileContent);
 */

// Configure Bitcoin Api
const btcApiBase = `https://api.blockcypher.com/v1/btc/test3/`;

/*
@param address - address of the user
@dev bitcoinUnspentCall function gets the unspent transactions of the address
@returns array of unspent transactions
*/
function bitcoinUnspentCall(address) {
  return axios
    .get(`${btcApiBase}addrs/${address}?unspentOnly=true`)
    .then((response) => {
      let inputs = [];
      let inputsHex = [];
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
          totalAmountAvailable += utxo.satoshis;
          inputCount++;
          inputs.push(utxo);
        } else {
          continue;
        }
      }
      console.log(inputs);
      console.log("Total Amount Available: ", totalAmountAvailable);
    })
    .catch((error) => {
      console.log(error);
    });
}
/*
@param txid - transaction id
@dev bitcoinTxHexCall function gets the transaction hex
@returns transaction hex
*/
function bitcoinTxHexCall(txid) {
  return axios
    .get(`https://api.blockcypher.com/v1/btc/test3/txs/${txid}?includeHex=true`)
    .then((response) => {
      console.log(response.data.hex);
    })
    .catch((error) => {
      console.log(error);
    });
}

bitcoinUnspentCall("tb1qgzfedw36d62dcltug6cnutt2x5dach2833vtt6");
