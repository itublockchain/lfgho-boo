const axios = require("axios");
async function signer(unisat, unsigned) {
  try {
    const unPushed = await unisat.signPsbt(unsigned);
    return unPushed;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
async function pusher(unisat, unPushed) {
  try {
    const pushedTx = await unisat.pushPsbt(unPushed);
    return pushedTx;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
async function fetchUnsigned(address, evmaddress) {
  try {
    const response = await axios.get(
      `http://localhost:3001/api/getUTXO?address=${address}&evmaddress=${evmaddress}`
    );
    const unsigned = response.data;
    return unsigned;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
async function fetchSigned(unisat, address, evmaddress) {
  console.log("fetchSigned");
  try {
    const response = await fetchUnsigned(address, evmaddress);
    console.log("Response: ", response);
    const { unsignedPsbtHex, raw } = response;
    const unPushed = await signer(unisat, unsignedPsbtHex);
    console.log("unPushed: ", unPushed);
    const pushedTx = await pusher(unisat, unPushed);
    console.log("PushedTx: ", pushedTx);
    return { pushedTx, raw };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = { fetchSigned };
