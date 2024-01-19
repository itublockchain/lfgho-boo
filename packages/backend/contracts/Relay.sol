//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BTCRelay {
    mapping(bytes32 => bytes32) public HashToMerkle;

    function HeaderToMerkle(
        bytes calldata header
    ) public returns (bytes32 merkle, bytes32 blockHash) {
        require(header.length == 80, "Header must be 80 bytes");

        // Extracting Merkle root
        bytes32 merkleRoot = extractBytes32(header, 36);

        // Calculating block hash
        bytes32 firstHash = sha256(header);
        bytes32 doubleHash = sha256(abi.encodePacked(firstHash));

        // Reversing Merkle root and block hash byte order
        bytes32 merkleRootReversed = reverseBytes32(merkleRoot);
        bytes32 blockHashReversed = reverseBytes32(doubleHash);

        HashToMerkle[blockHashReversed] = merkleRootReversed;
        return (merkleRootReversed, blockHashReversed);
    }

    function extractBytes32(
        bytes memory data,
        uint256 start
    ) internal pure returns (bytes32 result) {
        require(start + 32 <= data.length, "Invalid start index");
        assembly {
            result := mload(add(data, add(start, 32)))
        }
    }

    function reverseBytes32(bytes32 input) internal pure returns (bytes32) {
        bytes32 result;
        for (uint256 i = 0; i < 32; i++) {
            result |= bytes32(
                (uint256(input >> (i * 8)) & 0xFF) << (248 - i * 8)
            );
        }
        return result;
    }

    function verifyBitcoinTransaction(
        bytes32 txHash,
        bytes32[] memory merkleProof,
        bytes32 blockHash
    ) public view returns (bool) {
        bytes32 computedMerkleRoot = computeMerkle(txHash, merkleProof);
        bytes32 merkleRootInRelay = HashToMerkle[blockHash];
        return computedMerkleRoot == merkleRootInRelay;
    }

    function computeMerkle(
        bytes32 txHash,
        bytes32[] memory merkleProof
    ) internal pure returns (bytes32) {
        bytes32 computedHash = txHash;

        for (uint256 i = 0; i < merkleProof.length; i++) {
            bytes32 proofElement = merkleProof[i];

            // Bitcoin's Merkle trees are implemented with an even number of elements.
            // If the number of transactions is odd, the last transaction is duplicated.
            // Depending on the position (even or odd), the order of hashing is different.
            if (computedHash < proofElement) {
                computedHash = sha256(
                    abi.encodePacked(computedHash, proofElement)
                );
            } else {
                computedHash = sha256(
                    abi.encodePacked(proofElement, computedHash)
                );
            }
        }

        return computedHash;
    }
}
