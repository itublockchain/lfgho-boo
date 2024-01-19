// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*
@title Bitcoin transaction parser
@dev Parses a Bitcoin transaction and extracts the two regular outputs and the OP_RETURN output
*/
contract BitcoinTxParser {
    struct Output {
        string value; // BTC amount in Satoshis as a string
        bytes scriptPubKey;
    }

    struct BitcoinTransaction {
        Output[2] standardOutputs; // Array for the two regular outputs
        string opReturnData; // Data from OP_RETURN output as a string
    }

    /*
    @notice Parses a Bitcoin transaction and extracts the two regular outputs and the OP_RETURN output
    @param tx The Bitcoin transaction to parse
    @return The parsed transaction
    */
    function parseTransaction(
        bytes memory _tx
    ) public pure returns (BitcoinTransaction memory) {
        BitcoinTransaction memory parsedTx;

        // Start after version (4 bytes) and SegWit marker & flag (2 bytes)
        uint offset = 6;

        // Skip the input count and input data (assuming fixed size for this example)
        offset += 1 + 41;

        // Read the number of outputs
        uint8 outputCount = uint8(_tx[offset]);
        offset += 1;

        require(outputCount == 3, "Unexpected number of outputs");

        // Parse the first two regular outputs
        for (uint i = 0; i < 2; i++) {
            uint256 value;
            (value, offset) = readUint64(_tx, offset);
            parsedTx.standardOutputs[i].value = uintToString(value);

            uint scriptLen0;
            (scriptLen0, offset) = readVarInt(_tx, offset);
            offset += scriptLen0; // Skipping the script for this example
        }

        // Parse the OP_RETURN output
        offset += 8; // Skip the value of the OP_RETURN output
        uint scriptLen1;
        (scriptLen1, offset) = readVarInt(_tx, offset);
        require(_tx[offset] == 0x6a, "Last output is not OP_RETURN");
        offset += 1; // Skip OP_RETURN opcode
        parsedTx.opReturnData = convertBytesToString(
            slice(_tx, offset, scriptLen1 - 1)
        );

        return parsedTx;
    }

    // Helper functions...

    function uintToString(uint256 v) internal pure returns (string memory str) {
        if (v == 0) {
            return "0";
        }
        uint256 j = v;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = v;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + (j % 10)));
            j /= 10;
        }
        str = string(bstr);
    }

    function bytesToHexString(
        bytes memory data,
        uint offset,
        uint length
    ) internal pure returns (string memory) {
        bytes memory buffer = new bytes(2 * length);
        bytes memory chars = "0123456789abcdef";

        for (uint i = 0; i < length; i++) {
            buffer[2 * i] = chars[uint8(data[offset + i] >> 4)];
            buffer[2 * i + 1] = chars[uint8(data[offset + i] & 0x0f)];
        }

        return string(buffer);
    }

    function readVarInt(
        bytes memory data,
        uint offset
    ) internal pure returns (uint, uint) {
        require(data.length >= offset + 1, "Data out of bounds");
        return (uint(uint8(data[offset])), offset + 1);
    }

    function readUint64(
        bytes memory data,
        uint offset
    ) internal pure returns (uint256, uint) {
        require(data.length >= offset + 8, "Data out of bounds");
        uint256 value;
        for (uint i = 0; i < 8; i++) {
            value |= uint256(uint8(data[offset + i])) << (8 * i);
        }
        return (value, offset + 8);
    }

    function convertBytesToString(
        bytes memory data
    ) internal pure returns (string memory) {
        return string(data);
    }

    function slice(
        bytes memory data,
        uint start,
        uint length
    ) internal pure returns (bytes memory) {
        bytes memory part = new bytes(length);
        for (uint i = 0; i < length; i++) {
            part[i] = data[i + start];
        }
        return part;
    }
}
