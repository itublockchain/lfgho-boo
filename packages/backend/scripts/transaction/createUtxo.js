const bitcoin = require("bitcoinjs-lib");
const psbt = new bitcoin.Psbt({ network: bitcoin.networks.testnet }); // For Mainnet: const psbt = new bitcoin.Psbt({ network: bitcoin.networks.bitcoin })

/* 
This requirements needed to be sign and validate offchain.

const { ECPairFactory } = require("ecpair");
const tinysecp = require("tiny-secp256k1");
const ECPair = ECPairFactory(tinysecp);
const fs = require("fs");
const envFilePath = "../../env.json";
const envFileContent = fs.readFileSync(envFilePath, "utf8");
const envConfig = JSON.parse(envFileContent);
const BTC_PRIVATE_KEY = envConfig.BITCOIN_PRIVATE_KEY;
console.log(BTC_PRIVATE_KEY); */

// Calculate the fee
const txSize = 1 * 180 + 34 * 3 + 9;
let fee = txSize * 33;
console.log("Fee: ", fee);
/*
@param txid - transaction id, vout - output index, bitaddress - address, pubkey - public key, amount - amount in BTC, raw - raw transaction hex, evmaddress - EVM address
@dev createUtxo function creates a UTXO for the transaction
@returns unsigned psbt hex and needed to be signed to broadcast the transaction
*/
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

  // Non-segwit transaction input

  psbt.addInput({
    hash: unspentOutput.txid,
    index: unspentOutput.vout,
    nonWitnessUtxo: Buffer.from(rawTransaction, "hex"),
  });

  // add output - destination address and the amount to transfer to
  // the out value is amount - 0.01 BTC because of fees
  const outValue = (amount - 0.01) * 100000000; // value in satoshi
  console.log("Out Value: ", outValue);
  psbt.addOutput({
    address: "tb1q4ru2elfmym7vtw4lh3xlzt5cley25j4vrpp8et", // This will change with VAULT Bridge Address
    value: outValue,
  });

  // If we look closely, We have input of 1 BTC and we are trying to send 0.5 BTC
  // If we just use these configurations to send the transaction, it will consume remaining 0.5 BTC as fees
  // which we wouldn't want
  // So we'll leave some fee for the transaction, let's say 0.001 BTC and send the remaining amount to change address
  // change address is the address you own where change from the transaction can be sent to

  const changeValue = unspentOutput.amount * 100000000 - outValue - fee;
  console.log(unspentOutput.amount * 100000000);
  console.log("Change Value: ", changeValue);
  psbt.addOutput({
    address: bitaddress, // change address
    value: changeValue,
  });
  // Example EVM address to include in OP_RETURN (hex encoded)
  const evmAddressHex = Buffer.from(evmaddress, "utf8").toString("hex");

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

  // Serialize the PSBT for the unsigned transaction
  const unsignedPsbtHex = psbt.toHex();
  console.log("Unsigned PSBT Hex: ", unsignedPsbtHex);
  return unsignedPsbtHex;
}
/* 
This part of code needed to be sign and validate offchain
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
