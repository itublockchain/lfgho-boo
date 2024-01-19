const crypto = require("crypto");

// Function to perform double SHA-256 hashing
function doubleSHA256(data) {
  return crypto
    .createHash("sha256")
    .update(crypto.createHash("sha256").update(data).digest())
    .digest();
}

// Function to reverse byte order (little-endian <--> big-endian)
function reverseByteOrder(hexString) {
  return Buffer.from(hexString, "hex").reverse().toString("hex");
}

// Function to calculate Merkle Root
function calculateMerkleRoot(transactions) {
  // Convert transactions to little-endian format
  let hashes = transactions.map((tx) => reverseByteOrder(tx));

  // Process the tree until there's only one hash
  while (hashes.length > 1) {
    // Ensure even number of hashes
    if (hashes.length % 2 !== 0) {
      hashes.push(hashes[hashes.length - 1]);
    }

    // Prepare the new layer
    let newLayer = [];
    for (let i = 0; i < hashes.length; i += 2) {
      // Concatenate two hashes and double-hash them
      let concatenatedHash = doubleSHA256(
        Buffer.concat([
          Buffer.from(hashes[i], "hex"),
          Buffer.from(hashes[i + 1], "hex"),
        ])
      );
      newLayer.push(concatenatedHash.toString("hex"));
    }

    // Set the new layer as the current layer
    hashes = newLayer;
  }

  // Convert the final hash back to big-endian format
  return reverseByteOrder(hashes[0]);
}

const transactions = [
  "34ddae5b4e465e7549314fa56d4fc5eec36922f6723a2d41ac41d5219fa75c2f",
  "99f65bdde6ae74a8afdf909400687ce0d5fd4868b7a4ffd1ed2b19f26b5dbf8c",
  "356a3823baa566908a8970c53566f7179047d389ffa793693818ee3c6fe0cc92",
  "db35aa8dc87d894cad7167a6049d8ea9c630224c55d553de8db80a368ff2731a",
  "5db7b2a028259e4c966f06cbfa7755754a2bc27130ae9278f843af2013200b00",
  "b127d64dbd7f86844fac56cb0bd2228b0963439ad9277b7a4657e5e0c1f0a153",
  "b432e47e88e3a424bc837dee378e03c3240ef1018ca2d392f7580176e6eabe84",
  "d098a141c9ea28882a1dcf4514abaf8203da305859844d6d2895a4415de33d01",
  "26aa5ab3a482df764dbcace00371650419f0e886552fae37567180f8da75c503",
  "c9db087fc250cf0718b369273fcb010fcaa7a23314d85c04b09a29ffac47c610",
  "9b0de10f56399321ca61ff2fa0b8fae1e16a5ad961d03b79eea9dfff4d64e153",
  "c6b8deea276579392f5e09e33262de22a879f781c1e4c27cd652a97a7c84ed03",
  "f1889d6d0bdbe80a304549b2c6821bab6ba7eb2ba1253f030ef11c8791d61f90",
  "7142388d727f23c15394584079c31a2e08fa33d903f1f67ed95d8ef04c3cfc05",
  "825364c1a37948dbff80a38dc6542be4c663232d69bd83a514fd46d1c28b82c1",
  "c3e0d771c72f82661835204a4a21096a9558083de06308ef3a59118d8784d407",
  "c9419455fab70f00036125d667ae4360f711022743bde43a25dc6afe75b95bc4",
  "717f7df8dc53503c1f61133c55c42b474ed0cd7337a94e4e5e1d48a248583375",
  "5a1c8fada937f45c19a233dbf85b6951a4e7951254f4c171b433b8d1e7a97c08",
  "2274e2a30af201f07019318cd0bf0a2e87cb6a961f4a8d0cca67c0eb3225150a",
];

console.log("Merkle Root: " + calculateMerkleRoot(transactions));
