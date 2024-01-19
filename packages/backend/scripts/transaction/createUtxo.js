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
  const outValue = (amount - 0.0001) * 100000000; // value in satoshi
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

  const changeValue = unspentOutput.amount * 100000000 - outValue - fee;
  console.log(unspentOutput.amount * 100000000);
  console.log("Change Value: ", changeValue);
  psbt.addOutput({
    address: bitaddress, // change address
    value: changeValue,
  });
  console.log("Second Output Added");
  // Example EVM address to include in OP_RETURN (hex encoded)
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

  // Serialize the PSBT for the unsigned transaction
  const unsignedPsbtHex = psbt.toHex();
  console.log("Unsigned PSBT Hex: ", unsignedPsbtHex);
  return unsignedPsbtHex;
}
console.log("Third Output Added");
console.log("-----------");
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

//EXAMPLE USAGE
createUtxo(
  "87c567fe2a83355836caa01047590f1511117bbf9dc75c33acc316ad216309f9",
  0,
  "tb1q4ru2elfmym7vtw4lh3xlzt5cley25j4vrpp8et",
  "0014409396ba3a6e94dc7d7c46b13e2d6a351bdc5d47",
  "0.001",
  "01000000000103692ed041b4782e30a79f13a74611553bf2dae04a30d14b8b439d8fb9f5602eaa0000000000fdffffffbc869341d672508f6fb56e095917e9057ad22a558549b2131d4757804222092e0200000000fdffffff91b7b664fe2c45739618f4e0f5da009832deb9df82c3091f1cf18cd484402c7e0000000000fdffffff03801a060000000000160014409396ba3a6e94dc7d7c46b13e2d6a351bdc5d470000000000000000226a2000000c2610340fc000000000000000000000000000000000000000000000123a3893070000000000160014f12b9a5792044c0fb368bbb7deb735381bdd9cce0247304402201fd0d88c79a361344b70cb606362994fa8f3655d14c227424f5b285a18c680ac02201b77ba3e37eff1044d059c6871582b024f10a462d419426bfd880c11a5602fd0012103f6a6b50529912a326df4051ef1cb916b6e45dbb2bc2a070069830ea0a72745ae02473044022039532dfd1573d53e73b4a48002c409e46439fee83cb939cb37e65d92d55134b1022047145a0e0d1d9ed1eced47fb8cafd5d4cacff651aa12c1b4197ade660c35d2a7012103f6a6b50529912a326df4051ef1cb916b6e45dbb2bc2a070069830ea0a72745ae024830450221008dcb09be3cb55860dcffca7394d78feed016238fa443c27a1bfc4fcb6240bbb4022022468f014284b9e6ce24542eb64fb22e383de3c29e6e9cf93f0ec6d40bbdaa12012103f6a6b50529912a326df4051ef1cb916b6e45dbb2bc2a070069830ea0a72745ae00000000",
  "0xb9D795B50542920618b2176d3675B6d8Be4d5838"
);
