const bitcoin = require("bitcoinjs-lib");
const { ECPairFactory } = require("ecpair");
const tinysecp = require("tiny-secp256k1");
const ECPair = ECPairFactory(tinysecp);
const psbt = new bitcoin.Psbt({ network: bitcoin.networks.testnet }); // For Mainnet: const psbt = new bitcoin.Psbt({ network: bitcoin.networks.bitcoin })
const fs = require("fs");
const envFilePath = "../env.json";
const envFileContent = fs.readFileSync(envFilePath, "utf8");
const envConfig = JSON.parse(envFileContent);
const BTC_PRIVATE_KEY = envConfig.BTC_PRIVATE_KEY;
// Validator to validate signature
const validator = (pubkey, msghash, signature) =>
  ECPair.fromPublicKey(pubkey).verify(msghash, signature);

// Creating UTXO
const unspentOutput = {
  txid: "76d117d00e47509975603bfc957c56edf6cab483ec91f3ac86e7c3c0ec80aa73",
  vout: 0,
  address: "tb1qgzfedw36d62dcltug6cnutt2x5dach2833vtt6",
  scriptPubKey: "0014409396ba3a6e94dc7d7c46b13e2d6a351bdc5d47",
  amount: 0.0001,
};
// get transaction hex
const rawTransaction =
  "02000000000101301186bb5e7df2a225815045fcef512ce93530292d8a224968a20ba0d6a26e510000000000ffffffff028813000000000000160014a8f8acfd3b26fcc5babfbc4df12e98fe48aa4aac7e13000000000000160014a8f8acfd3b26fcc5babfbc4df12e98fe48aa4aac0247304402200e8a46b3068b2dabc78ccdbc35ee79d6b84b00eb9157d55a4ddedf22a3a75f88022033f37c741eecf89129d1d366f3d6a4c3d84ff97d0ed0e7ecbf73410de49f97880121027ad4e1e5541d14fc78dc92f1f318be63765f173c3a0d33395651124459a5621200000000";

// check if it's a Segwit or Non-Segwit transaction
/* const isSegwit = rawTransaction.substring(8, 12) === "0001";
if (isSegwit) {
  // add segwit transaction input

  psbt.addInput({
    hash: unspentOutput.txid,
    index: unspentOutput.vout,
    witnessUtxo: {
      script: Buffer.from(unspentOutput.scriptPubKey, "hex"),
      value: unspentOutput.amount * 1000, // value in satoshi
    },
    redeemScript: Buffer.from(unspentOutput.redeemScript, "hex"),
  });
} else { */

// add non-segwit transaction input
psbt.addInput({
  hash: unspentOutput.txid,
  index: unspentOutput.vout,
  nonWitnessUtxo: Buffer.from(rawTransaction, "hex"),
});
// add output - destination address and the amount to transfer to
psbt.addOutput({
  address: "tb1q4ru2elfmym7vtw4lh3xlzt5cley25j4vrpp8et",
  value: 0.00005 * 100000000, // value in satoshi (0.0005 BTC)
});

//}

// If we look closely, We have input of 1 BTC and we are trying to send 0.5 BTC
// If we just use these configurations to send the transaction, it will consume remaining 0.5 BTC as fees
// which we wouldn't want
// So we'll leave some fee for the transaction, let's say 0.001 BTC and send the remaining amount to change address
// change address is the address you own where change from the transaction can be sent to
psbt.addOutput({
  address: "tb1q4ru2elfmym7vtw4lh3xlzt5cley25j4vrpp8et", // change address
  value: 0.0000499 * 100000000, // value in satoshi (0.000499 BTC)
});
// Example EVM address to include in OP_RETURN (hex encoded)
const evmAddressHex = Buffer.from("yourEVMAddress", "utf8").toString("hex");

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
//psbt.setMaximumFeeRate(20000);

// Serialize the PSBT for the unsigned transaction
const unsignedPsbtHex = psbt.toHex();
console.log("Unsigned PSBT Hex: ", unsignedPsbtHex);

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
