const bitcoin = require("bitcoinjs-lib");
require("dotenv").config();
const { ECPairFactory } = require("ecpair");
const tinysecp = require("tiny-secp256k1");
const ECPair = ECPairFactory(tinysecp);
const network = bitcoin.networks.testnet; // Use bitcoin.networks.testnet for Testnet
const psbt = new bitcoin.Psbt({ network });
psbt.addInput({
  hash: "44f043a4d1ad2c884ac56a6cb7963d391d94e9de83afabcca5d9c2b2b6a843d7", // UTXO transaction id
  index: 0, // UTXO output index
  nonWitnessUtxo: Buffer.from(
    "027ad4e1e5541d14fc78dc92f1f318be63765f173c3a0d33395651124459a56212",
    "hex"
  ),

  // You may need to add additional details depending on the UTXO type
});

// Adding an output
psbt.addOutput({
  address: "tb1q4ru2elfmym7vtw4lh3xlzt5cley25j4vrpp8et",
  value: 500, // Amount to send in satoshis
});
const keyPair = ECPair.fromWIF(process.env.BITCOIN_PRIVATE_KEY, network);
psbt.signInput(0, keyPair);
psbt.validateSignaturesOfInput(0);
psbt.finalizeAllInputs();
const txHex = psbt.extractTransaction().toHex();
console.log(txHex);
