const bitcoin = require("bitcoinjs-lib");
const bip39 = require("bip39");
const { BIP32Factory } = require("bip32");
const ecc = require("tiny-secp256k1");
const bip32 = BIP32Factory(ecc);

const network = bitcoin.networks.bitcoin; // Use bitcoin.networks.testnet for testnet

const mnemonics = [
  bip39.generateMnemonic(),
  bip39.generateMnemonic(),
  bip39.generateMnemonic(),
];
console.log("Mnemonics:", mnemonics);

let keys = mnemonics.map((mnemonic) => {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  return bip32.fromSeed(seed, network);
});

//const pubkeys = keys.map((key) => key.publicKey);
const pubkeys = [
  "026477115981fe981a6918a6297d9803c4dc04f328f22041bedff886bbc2962e01", // Suppose 3 of 2 is AAVE Wallets.
  "02c96db2302d19b43d4c69368babace7854cc84eb9e061cde51cfa77ca4a22b8b9",
  "03c6103b3b83e4a24a0e33a4df246ef11772f9992663db0c35759a5e2ebf68d8e9",
].map((hex) => Buffer.from(hex, "hex"));
const { address } = bitcoin.payments.p2sh({
  redeem: bitcoin.payments.p2ms({ m: 2, pubkeys }),
});

console.log("Multisig Address:", address);

/* 
This is the multisig wallet address for using the vault. This is a testing product. Do not use this for your production.
36NUkt6FWUi3LAWBqWRdDmdTWbt91Yvfu7
*/
