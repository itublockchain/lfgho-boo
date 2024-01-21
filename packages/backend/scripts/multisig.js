const bitcoin = require("bitcoinjs-lib");

const pubkeys = [
  "0341a885b089ce469e0e4629108beeeefa8612d15e7ec969acf11fa22a670d694c", // Suppose 3 of 2 is AAVE Wallets.
  "027ad4e1e5541d14fc78dc92f1f318be63765f173c3a0d33395651124459a56212",
  "03a505f60cf94e055821f2a5bd818ee4a514ef1daaf75bf1c68c5e3537fa9b3eef",
].map((hex) => Buffer.from(hex, "hex"));
const { address } = bitcoin.payments.p2wpkh({
  redeem: bitcoin.payments.p2ms({ m: 2, pubkeys }),
});

console.log("Multisig Address:", address);

/* 
This is the multisig wallet address for using the vault. This is a testing product. Do not use this for your production.
3EXPatETB2qHMGz61MvRFx6zyZtoeZfCiB
*/
