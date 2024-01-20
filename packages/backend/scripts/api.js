const express = require("express");
const app = express();
const cors = require("cors");
const { bitcoinUnspentCall } = require("./transaction/calls");
//const { createPaybackTransaction } = require("./transaction/payback");
app.use(cors());

app.get("/api/getUTXO", async (req, res) => {
  try {
    console.log(req);
    const address = req.query.address;
    const evmaddress = req.query.evmaddress;
    const result = await bitcoinUnspentCall(address, evmaddress);
    res.json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
/* app.get("/api/payback", async (req, res) => {
  try {
    const recipientAddress = req.query.address;
    const amount = req.query.amount;
    const result = await createPaybackTransaction(recipientAddress, amount);
    res.json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
}); */

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
