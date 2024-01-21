const bitcoin = require("bitcoinjs-lib");
const axios = require("axios");
const multisigAddress = "tb1q4ru2elfmym7vtw4lh3xlzt5cley25j4vrpp8et";

// Calculate the fee
const txSize = 1 * 180 + 34 * 3 + 9;
let fee = txSize * 33;
console.log("Fee: ", fee);

let inputs = [];
let totalAmountAvailable = 0; // To evaluate, if we have enough funds to send the transaction
let inputCount = 0; // To later calculate the transaction size
async function getUtxos(address) {
  // Creating UTXO
  await axios
    .get(`https://mempool.space/testnet/api/address/${address}/utxo`)
    .then((firstResponse) => {
      //get data create unspentOutput and input it to psbt
      let utxos = firstResponse.data;
      for (const element of utxos) {
        let utxo = {}; // Generate utxo object to specify input for transaction
        utxo.amount = element.value / 1e8; // 100 million satoshi = 1 Bitcoin
        utxo.address = multisigAddress; // Address of the sender wallet
        utxo.txid = element.txid; // Transaction ID of the transaction behind the utxo
        utxo.vout = element.vout; // To identify the utxo
        totalAmountAvailable += utxo.amount; // increase the available funds by the amount within the utxo
        inputCount += 1;
        inputs.push(utxo);
        console.log("UTXO ADDED INPUT");
      }
    });
}
async function getHexes(address, evmaddress) {
  const psbt = new bitcoin.Psbt({ network: bitcoin.networks.testnet }); // For Mainnet: const psbt = new bitcoin.Psbt({ network: bitcoin.networks.bitcoin })
  await getUtxos(address);
  for (let i = 0; i < inputs.length; i++) {
    await axios
      .get(`https://mempool.space/testnet/api/tx/${inputs[i].txid}/hex`)
      .then((secondResponse) => {
        inputs[i].raw = secondResponse.data;
        console.log("UTXO: ", inputs[i]);
      });
  }
  /*   for (let i = 0; i < inputs.length; i++) {
    const rawTransaction = inputs[i].raw;
    // Non-segwit transaction input

    psbt.addInput({
      hash: inputs[i].txid,
      index: inputs[i].vout,
      nonWitnessUtxo: Buffer.from(rawTransaction, "hex"),
    });
    console.log("Input Added");
  } */
  let maxUtxo = inputs.reduce(
    (prev, current) => (prev.amount > current.amount ? prev : current),
    { amount: 0 }
  );
  console.log("Greatest Amount : ", maxUtxo.amount);

  // Call bitcoinTxHexCall to get the hex and pubkey
  if (maxUtxo.txid) {
    const hex = maxUtxo.raw;
    console.log("Transaction Hex: ", hex);
  }
  psbt.addInput({
    hash: maxUtxo.txid,
    index: maxUtxo.vout,
    nonWitnessUtxo: Buffer.from(maxUtxo.raw, "hex"),
  });
  console.log("Amount: 10000");
  console.log("Address:", address);
  psbt.addOutput({
    address: multisigAddress, // This will change with VAULT Bridge Address
    value: 50000,
  });
  console.log("First Output Added");
  console.log("Total Amount Avaible: ", maxUtxo.amount);
  const changeValue = Math.floor(maxUtxo.amount * 1e8 - 50000 - fee);
  console.log("Change Value: ", changeValue);
  psbt.addOutput({
    address: address, // change address
    value: changeValue,
  });
  console.log("Second Output Added");
  // Example EVM address to include in OP_RETURN (hex encoded)
  console.log("EVM Address: ", evmaddress);
  const evmAddressHex = Buffer.from(evmaddress, "utf8").toString("hex");
  console.log("EVM Address Hex: ", evmAddressHex);
  // OP_RETURN output
  const opReturnOutput = {
    script: bitcoin.script.compile([
      bitcoin.opcodes.OP_RETURN,
      Buffer.from(evmAddressHex, "hex"),
    ]),
    value: 0,
  };

  // Add OP_RETURN output to the transaction
  psbt.addOutput(opReturnOutput);
  console.log("OP_RETURN Output Added");
  const unsignedPsbtHex = psbt.toHex();
  console.log("Unsigned PSBT Hex: ", unsignedPsbtHex);
  return { unsignedPsbtHex };
}

/* 
function createUtxo(txid, vout, bitaddress, pubkey, amount, raw, evmaddress) {
  // Creating UTXO
  const unspentOutput = {
    txid: txid,
    vout: vout,
    address: bitaddress,
    scriptPubKey: pubkey,
    amount: amount,
  };
  // get transaction hex
  const rawTransaction = raw;
  console.log("Raw Transaction: ", rawTransaction);
  // Non-segwit transaction input

  psbt.addInput({
    hash: unspentOutput.txid,
    index: unspentOutput.vout,
    nonWitnessUtxo: Buffer.from(rawTransaction, "hex"),
  });
  console.log("Input Added");
  // add output - destination address and the amount to transfer to
  // the out value is amount - 0.01 BTC because of fees
  console.log("Amount: ", amount);
  const outValue = Math.floor((amount - 0.0001) * 1e8); // value in satoshi
  console.log("Out Value: ", outValue);
  psbt.addOutput({
    address: "tb1q4ru2elfmym7vtw4lh3xlzt5cley25j4vrpp8et", // This will change with VAULT Bridge Address
    value: outValue,
  });
  console.log("First Output Added");

  // If we look closely, We have input of 1 BTC and we are trying to send 0.5 BTC
  // If we just use these configurations to send the transaction, it will consume remaining 0.5 BTC as fees
  // which we wouldn't want
  // So we'll leave some fee for the transaction, let's say 0.001 BTC and send the remaining amount to change address
  // change address is the address you own where change from the transaction can be sent to

  const changeValue = Math.floor(unspentOutput.amount * 1e8 - outValue - fee);
  console.log("Change Value: ", changeValue);
  psbt.addOutput({
    address: bitaddress, // change address
    value: changeValue,
  });
  console.log("Second Output Added");
  // Example EVM address to include in OP_RETURN (hex encoded)
  console.log("EVM Address: ", evmaddress);
  const evmAddressHex = Buffer.from(evmaddress, "utf8").toString("hex");
  console.log("EVM Address Hex: ", evmAddressHex);
  // OP_RETURN output
  const opReturnOutput = {
    script: bitcoin.script.compile([
      bitcoin.opcodes.OP_RETURN,
      Buffer.from(evmAddressHex, "hex"),
    ]),
    value: 0,
  };

  // Add OP_RETURN output to the transaction
  psbt.addOutput(opReturnOutput);
  console.log("OP_RETURN Output Added");

  // Serialize the PSBT for the unsigned transaction
  const unsignedPsbtHex = psbt.toHex();
  console.log("Unsigned PSBT Hex: ", unsignedPsbtHex);
  return { unsignedPsbtHex, raw };
}
/* 
------------------------------------------------------------------------------------------------------------------------
This part of code needed to be sign and validate offchain
------------------------------------------------------------------------------------------------------------------------
// Validator to validate signature
const validator = (pubkey, msghash, signature) =>
  ECPair.fromPublicKey(pubkey).verify(msghash, signature);
// Sign the transaction
console.log("Signing Transaction...");
psbt.signInput(0, ECPair.fromWIF(BTC_PRIVATE_KEY, bitcoin.networks.testnet));

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
} catch (e) {
  console.log(e);
}
*/

module.exports = { getHexes };
