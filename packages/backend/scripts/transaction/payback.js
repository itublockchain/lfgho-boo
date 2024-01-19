const bitcore = require("bitcore-lib");
const axios = require("axios");
const fs = require("fs");
const envFilePath = "../../env.json";
const envFileContent = fs.readFileSync(envFilePath, "utf8");
const envConfig = JSON.parse(envFileContent);
const multisigAddress = "36NUkt6FWUi3LAWBqWRdDmdTWbt91Yvfu7";

/*
@param address - address of the multisig wallet
@dev getUTXOs function gets the unspent transactions of the address
@returns array of unspent transactions
*/
async function getUTXOs(address) {
  try {
    const { data: utxos } = await axios.get(
      `https://blockstream.info/testnet/api/address/${address}/utxo`
    );
    return utxos;
  } catch (error) {
    console.error("Failed to fetch UTXOs:", error);
    return [];
  }
}
/*
@param recipientAddress - address of the recipient
@param amount - amount to be sent
@param firstkey - one of three private key
@param secondkey - one of three private key 
@dev createEscrowTransaction function creates a transaction
@returns transaction
*/
async function createEscrowTransaction(
  recipientAddress,
  amount,
  firstkey,
  secondkey
) {
  const tx = new bitcore.Transaction();

  const utxos = await getUTXOs(multisigAddress);
  if (!utxos.length) {
    throw new Error("No UTXOs found for this address.");
  }

  tx.from(utxos);
  tx.to(recipientAddress, amount);
  tx.change(multisigAddress);
  tx.sign([firstkey, secondkey]);

  return tx;
}

createEscrowTransaction(
  "tb1qgzfedw36d62dcltug6cnutt2x5dach2833vtt6",
  100000000,
  envConfig.BITCOIN_PRIVATE_KEY,
  envConfig.BITCOIN_PRIVATE_KEY2
);
