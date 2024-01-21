const bitcoin = require("bitcoinjs-lib");
const axios = require("axios");
const psbt = new bitcoin.Psbt({ network: bitcoin.networks.testnet }); // For Mainnet: const psbt = new bitcoin.Psbt({ network: bitcoin.networks.bitcoin })
const { ECPairFactory } = require("ecpair");
const tinysecp = require("tiny-secp256k1");
const ECPair = ECPairFactory(tinysecp);
const fs = require("fs");
const envFilePath = __dirname + "/env.json";
const envFileContent = fs.readFileSync(envFilePath, "utf8");
const envConfig = JSON.parse(envFileContent);

const BTC_PRIVATE_KEY = envConfig.BITCOIN_PRIVATE_KEY_2;
const multisigAddress = "tb1q4ru2elfmym7vtw4lh3xlzt5cley25j4vrpp8et";
const API_KEY = envConfig.BLOCKCYPHER_API_KEY;
console.log(BTC_PRIVATE_KEY);

// Calculate the fee
const txSize = 2 * 180 + 34 * 3 + 9;
let fee = txSize * 33;
console.log("Fee: ", fee);
/*
@param txid - transaction id, vout - output index, bitaddress - address, pubkey - public key, amount - amount in BTC, raw - raw transaction hex, evmaddress - EVM address
@dev createUtxo function creates a UTXO for the transaction
@returns unsigned psbt hex and needed to be signed to broadcast the transaction
*/
let inputs = [];
let totalAmountAvailable = 0; // To evaluate, if we have enough funds to send the transaction
let inputCount = 0; // To later calculate the transaction size
async function getUtxos() {
  // Creating UTXO
  await axios
    .get(`https://mempool.space/testnet/api/address/${multisigAddress}/utxo`)
    .then((firstResponse) => {
      //get data create unspentOutput and input it to psbt
      let utxos = firstResponse.data;
      for (const element of utxos) {
        let utxo = {}; // Generate utxo object to specify input for transaction
        utxo.amount = element.value / 1e8; // 100 million satoshi = 1 Bitcoin
        utxo.address = multisigAddress; // Address of the sender wallet
        utxo.txid = element.txid; // Transaction ID of the transaction behind the utxo
        utxo.vout = element.vout; // To identify the utxo
        utxo.scriptPubKey = "0014a8f8acfd3b26fcc5babfbc4df12e98fe48aa4aac";
        totalAmountAvailable += utxo.amount; // increase the available funds by the amount within the utxo
        inputCount += 1;
        inputs.push(utxo);
        console.log("UTXO ADDED INPUT");
      }
    });
}
async function createUTXO(address, amount) {
  // Get the unspent transaction outputs from the sender wallet, that will be used as input for the transaction
  await getUtxos();
  //raw transaction
  for (let i = 0; i < inputs.length; i++) {
    await axios
      .get(`https://mempool.space/testnet/api/tx/${inputs[i].txid}/hex`)
      .then((secondResponse) => {
        inputs[i].raw = secondResponse.data;
        console.log("UTXO: ", inputs[i]);
      });
  }
  for (let i = 0; i < inputs.length; i++) {
    const rawTransaction = inputs[i].raw;
    // Non-segwit transaction input

    psbt.addInput({
      hash: inputs[i].txid,
      index: inputs[i].vout,
      nonWitnessUtxo: Buffer.from(rawTransaction, "hex"),
    });
    console.log("Input Added");
  }
  console.log("Amount:", amount);
  console.log("Address:", address);
  psbt.addOutput({
    address: address,
    value: 24000,
  });
  console.log("First Output Added");
  console.log("Total Amount Avaible: ", totalAmountAvailable);
  const changeValue = Math.floor(totalAmountAvailable * 1e8 - amount - fee);
  console.log("Change Value: ", changeValue);
  psbt.addOutput({
    address: multisigAddress, // change address
    value: changeValue,
  });
  console.log("Second Output Added");
  const unsignedPsbtHex = psbt.toHex();
  console.log("Unsigned PSBT Hex: ", unsignedPsbtHex);
  // Validator to validate signature
  const validator = (pubkey, msghash, signature) =>
    ECPair.fromPublicKey(pubkey).verify(msghash, signature);
  // Sign the transaction
  console.log("Signing Transaction...");
  await psbt.signAllInputsAsync(
    ECPair.fromWIF(BTC_PRIVATE_KEY, bitcoin.networks.testnet)
  );

  console.log("Validating Signatures...");
  // you can use validate signature method provided by library to make sure generated signature is valid
  psbt.validateSignaturesOfAllInputs(validator); // if this returns false, then you can throw the error
  psbt.finalizeAllInputs();

  try {
    const transaction = psbt.extractTransaction();
    const signedTransaction = transaction.toHex();
    const transactionId = transaction.getId();
    console.log("-----------");
    console.log("Signed Transaction: ", signedTransaction);
    console.log("Transaction ID: ", transactionId);
    console.log("-----------");
    //Broadcast the transaction
    await axios
      .post(
        `https://api.blockcypher.com/v1/btc/test3/txs/push?token=${API_KEY}`,
        {
          tx: signedTransaction,
        }
      )
      .then((thirdResponse) => {
        console.log("-----------");
        console.log("Transaction Broadcasted");
        console.log("Transaction ID: ", thirdResponse.data.tx.hash);
        console.log("-----------");
      });
  } catch (e) {
    console.log(e);
  }
}
module.exports = { createUTXO };
