//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "forge-std/console.sol";
import "./Parser.sol";
import "./Oracle.sol";
import "./Relay.sol";
import "./interfaces/IGhoToken.sol";

/*
@title Native Bitcoin GHO Faciliator
@dev Verify bitcoin transactions, mint GHO tokens and take repayments
*/

contract Minter {
    BTCRelay public relay;
    BitcoinTxParser public btcTxParser;
    Oracle public priceFeed;
    IGhoToken public ghoToken;
    //struct for tx
    struct Transaction {
        address btcAddress;
        address evmAddress;
        uint256 ghoValue;
    }

    mapping(bytes32 => bool) public isTxHashUsed;
    mapping(bytes32 => bool) public isTxHashLiquidated;
    mapping(bytes32 => bool) public isTxHashRepaid;
    mapping(bytes32 => Transaction) public txHashToTransaction;
    mapping(bytes32 => uint256) public txHashToAmount;

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
        address opAddress = address(bytes20(bytes(opReturnString)));
        //get usd
        uint256 satoshiInUsd = getPriceOfSatoshi(amount);
        //mint
        uint256 ghoAmount = satoshiInUsd * 1e16;
        ghoToken.mint(opAddress, ghoAmount);
        //set txhash as used
        isTxHashUsed[txHash] = true;
        //set txhash to amount
        txHashToAmount[txHash] = ghoAmount;
    }

    function payback(bytes32 _txHash) public {
        require(!isTxHashRepaid[_txHash], "Transaction is already repayed");
        uint256 amount = txHashToAmount[_txHash];
        require(amount > 0, "Amount is 0");
        require(
            IERC20(address(ghoToken)).allowance(msg.sender, address(this)) >=
                amount,
            "Insufficient token allowance for payback"
        );
        ghoToken.transferFrom(msg.sender, address(this), amount);
        ghoToken.burn(amount);
        isTxHashRepaid[_txHash] = true;
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
}
