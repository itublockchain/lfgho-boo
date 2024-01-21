const bitcore = require("bitcore-lib");
const axios = require("axios");
const fs = require("fs");
const envFilePath = __dirname + `/env.json`;
const envFileContent = fs.readFileSync(envFilePath, "utf8");
const envConfig = JSON.parse(envFileContent);
const multisigAddress = "tb1qgzfedw36d62dcltug6cnutt2x5dach2833vtt6";
const btcApiBase = `https://api.blockcypher.com/v1/btc/test3/`;

async function sendBTC(toAddress, amount) {
  // Get the unspent transaction outputs from the sender wallet, that will be used as input for the transaction
  await axios
    .get(`https://mempool.space/testnet/api/address/${multisigAddress}/utxo`)
    .then((firstResponse) => {
      let inputs = [];
      let utxos = firstResponse.data;

      let totalAmountAvailable = 0; // To evaluate, if we have enough funds to send the transaction
      let inputCount = 0; // To later calculate the transaction size

      for (const element of utxos) {
        let utxo = {}; // Generate utxo object to specify input for transaction
        utxo.satoshis = element.value; // 100 million satoshi = 1 Bitcoin
        utxo.address = multisigAddress; // Address of the sender wallet
        utxo.txId = element.txid; // Transaction ID of the transaction behind the utxo
        utxo.outputIndex = element.vout; // To identify the utxo
        utxo.scriptPubKey = "0014409396ba3a6e94dc7d7c46b13e2d6a351bdc5d47";
        totalAmountAvailable += utxo.satoshis; // increase the available funds by the amount within the utxo
        inputCount += 1;

        inputs.push(utxo);
      }
      //get inputs pubkey and hash and push it
      /*       for (let i = 0; i < inputs.length; i++) {
        bitcoinTxHexCall(inputs[i].txid, inputs[i].satoshis).then(
          (secondResponse) => {
            inputs[i].scriptPubKey = secondResponse.pubkey;
            console.log("UTXO: ", inputs[i]);
          }
        );
      } */

      // 2. Generate transaction
      const transaction = new bitcore.Transaction();
      const satoshiToSend = amount; // 100 million satoshi = 1 Bitcoin
      let outputCount = 2; // one for recipient, one for change

      // calculate fee
      const transactionSize =
        inputCount * 180 + outputCount * 34 + 10 - inputCount;
      let fee = transactionSize * 33; // 33 satoshi per byte
      console.log("Fee: ", fee);
      console.log("Total amount available: ", totalAmountAvailable);
      console.log(
        "Amount to send: ",
        totalAmountAvailable - satoshiToSend - fee
      );
      if (totalAmountAvailable - satoshiToSend - fee < 0) {
        // Check, if funds are sufficient to send transaction
        throw new Error("Insufficient funds");
      }

      // Specify transaction
      for (const input of inputs) {
        console.log("Input: ", input);
        transaction.from(input);
      }
      transaction.to(multisigAddress, Math.floor(amount));
      transaction.change(multisigAddress);
      transaction.fee(Math.round(fee));
      transaction.sign(envConfig.BITCOIN_PRIVATE_KEY);

      const serializedTransaction = transaction.serialize();
      console.log("Serialized transaction: ", serializedTransaction);

      // broadcast transaction
      axios
        .post(
          `https://mempool.space/testnet/api/tx`,
          `{"tx":"${serializedTransaction}"}`
        )
        .then((thirdResponse) => {
          console.log(thirdResponse.data);
        });
    });
}

async function bitcoinTxHexCall(txid, value) {
  try {
    const response = await axios.get(
      `${btcApiBase}txs/${txid}?includeHex=true`
    );
    let outputs = response.data.outputs;
    let pubkey = outputs.find((output) => output.value === value)?.script || "";
    return { pubkey }; // Return an object containing both values
  } catch (error) {
    console.error(error);
    return {}; // Return an empty object in case of an error
  }
}

module.exports = { sendBTC };
