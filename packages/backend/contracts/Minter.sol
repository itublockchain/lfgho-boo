//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Parser.sol";
import "./Oracle.sol";
import "./Relay.sol";
import "./interfaces/IGhoToken.sol";

/*
@title Native Bitcoin GHO Faciliator
@dev Verify bitcoin transactions, mint GHO tokens and take repayments
*/

contract Minter {
    event mintFromBtcTransactionEvent(
        uint256 amount,
        string opReturnString,
        address opAddress,
        uint256 ghoAmount
    );

    BTCRelay public relay;
    BitcoinTxParser public btcTxParser;
    Oracle public priceFeed;
    IGhoToken public ghoToken;
    //struct for tx
    struct Transaction {
        address btcAddress;
        address evmAddress;
        uint256 ghoValue;
        bytes32 txHash;
    }

    mapping(bytes32 => bool) public isTxHashUsed;
    mapping(bytes32 => bool) public isTxHashLiquidated;
    mapping(bytes32 => bool) public isTxHashRepaid;
    mapping(bytes32 => Transaction) public txHashToTransaction;
    mapping(bytes32 => uint256) public txHashToAmount;
    mapping(address => bytes32[]) public addressToTxHashes;
    mapping(address => uint256) public addressToAmount;

    constructor(
        address _btcRelayAddress,
        address _btcTxParserAddress,
        address _oracle,
        address _ghoTokenAddress
    ) {
        relay = BTCRelay(_btcRelayAddress);
        btcTxParser = BitcoinTxParser(_btcTxParserAddress);
        priceFeed = Oracle(_oracle);
        ghoToken = IGhoToken(_ghoTokenAddress);
    }

    function mintFromBtcTransaction(
        bytes memory _tx,
        bytes32 _blockHash,
        bytes32[] memory _merkleProof
    ) public {
        //check txhash
        bytes32 txHash = sha256(_tx);
        require(!isTxHashUsed[txHash], "Transaction is already used");
        //verify tx
        require(
            relay.verifyBitcoinTransaction(txHash, _merkleProof, _blockHash),
            "Transaction is not verified"
        );
        //parse tx
        BitcoinTxParser.BitcoinTransaction memory parsedTx = btcTxParser
            .parseTransaction(_tx);
        //get amount
        uint256 amount = stringToUint(parsedTx.standardOutputs[0].value);
        //get op_return
        string memory opReturnString = parsedTx.opReturnData;
        address opAddress = parseHexStringToAddress(opReturnString);
        //get usd
        uint256 satoshiInUsd = getPriceOfSatoshi(amount);
        //mint
        uint256 ghoAmount = satoshiInUsd * 1e16;
        ghoToken.mint(opAddress, ghoAmount);
        //set txhash as used
        isTxHashUsed[txHash] = true;
        //set txhash to amount
        txHashToAmount[txHash] = ghoAmount;
        //set address to amount
        addressToAmount[opAddress] += ghoAmount;
        //set address to txhash
        addressToTxHashes[opAddress].push(txHash);
        //txhash to transaction
        txHashToTransaction[txHash] = Transaction(
            opAddress,
            msg.sender,
            ghoAmount,
            txHash
        );
        //emit event
        emit mintFromBtcTransactionEvent(
            amount,
            opReturnString,
            opAddress,
            ghoAmount
        );
    }

    function payback(uint256 _amount) public {
        uint256 amount = addressToAmount[msg.sender];
        require(
            IERC20(address(ghoToken)).allowance(msg.sender, address(this)) >=
                _amount,
            "Insufficient token allowance for payback"
        );
        addressToAmount[msg.sender] -= _amount;
        ghoToken.transferFrom(msg.sender, address(this), _amount);
        ghoToken.burn(_amount);
    }

    /*** View Functions ***/

    function getTxHashes(
        address _address
    ) public view returns (bytes32[] memory) {
        return addressToTxHashes[_address];
    }

    function checkTxHashUsed(bytes32 _txHash) public view returns (bool) {
        return isTxHashUsed[_txHash];
    }

    function getAmountByAddress(
        address _address
    ) public view returns (uint256) {
        return addressToAmount[_address];
    }

    // *** Helper Functions *** //

    function stringToUint(string memory s) internal pure returns (uint256) {
        bytes memory b = bytes(s);
        uint256 result = 0;
        for (uint i = 0; i < b.length; i++) {
            if (b[i] >= 0x30 && b[i] <= 0x39) {
                result = result * 10 + (uint256(uint8(b[i])) - 0x30);
            }
        }
        return result;
    }

    function getPriceOfSatoshi(uint256 _amount) public view returns (uint256) {
        return priceFeed.getConversionRate(_amount);
    }

    function parseHexStringToAddress(
        string memory _a
    ) internal pure returns (address _parsedAddress) {
        bytes memory tmp = bytes(_a);
        uint160 iaddr = 0;
        uint160 b1;
        uint160 b2;
        for (uint i = 2; i < 2 + 2 * 20; i += 2) {
            iaddr *= 256;
            b1 = uint160(uint8(tmp[i]));
            b2 = uint160(uint8(tmp[i + 1]));
            if ((b1 >= 97) && (b1 <= 102)) {
                b1 -= 87;
            } else if ((b1 >= 48) && (b1 <= 57)) {
                b1 -= 48;
            } else if ((b1 >= 65) && (b1 <= 70)) {
                b1 -= 55;
            }
            if ((b2 >= 97) && (b2 <= 102)) {
                b2 -= 87;
            } else if ((b2 >= 48) && (b2 <= 57)) {
                b2 -= 48;
            } else if ((b2 >= 65) && (b2 <= 70)) {
                b2 -= 55;
            }
            iaddr += (b1 * 16 + b2);
        }
        return address(iaddr);
    }
}
