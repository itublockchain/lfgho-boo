const axios = require("axios");
const createUTXO = require("./createUtxo");
// Configure Bitcoin Api
const btcApiBase = `https://api.blockcypher.com/v1/btc/test3/`;

async function bitcoinUnspentCall(address, evmaddress) {
  try {
    const response = await axios.get(
      `${btcApiBase}addrs/${address}?unspentOnly=true`
    );
    let inputs = [];
    let utxos = response.data.txrefs;
    let totalAmountAvailable = 0;
    for (const element of utxos) {
      if (element.spent === false) {
        let utxo = {
          txid: element.tx_hash,
          satoshis: element.value,
          address: address,
          vout: element.tx_output_n,
        };
        totalAmountAvailable += utxo.satoshis;
        inputs.push(utxo);
      }
    }
    //console.log(inputs);
    //console.log("Total Amount Available: ", totalAmountAvailable);

    // Find the UTXO with the greatest amount
    let maxUtxo = inputs.reduce(
      (prev, current) => (prev.satoshis > current.satoshis ? prev : current),
      { satoshis: 0 }
    );
    console.log("Greatest Amount : ", maxUtxo.satoshis);

    // Call bitcoinTxHexCall to get the hex and pubkey
    if (maxUtxo.txid) {
      const { hex, pubkey } = await bitcoinTxHexCall(
        maxUtxo.txid,
        maxUtxo.satoshis
      );
      console.log("Transaction Hex: ", hex);
      console.log("Public Key: ", pubkey);
      // convert satoshi to string btc
      const btc = maxUtxo.satoshis / 1e8;
      const unsignedTx = createUTXO(
        maxUtxo.txid,
        maxUtxo.vout,
        maxUtxo.address,
        pubkey,
        `${btc}`,
        hex,
        evmaddress
      );
      return unsignedTx;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function bitcoinTxHexCall(txid, value) {
  try {
    const response = await axios.get(
      `${btcApiBase}txs/${txid}?includeHex=true`
    );
    let hex = response.data.hex;
    let outputs = response.data.outputs;
    let pubkey = outputs.find((output) => output.value === value)?.script || "";
    return { hex, pubkey }; // Return an object containing both values
  } catch (error) {
    console.error(error);
    return {}; // Return an empty object in case of an error
  }
}

module.exports = { bitcoinUnspentCall };
