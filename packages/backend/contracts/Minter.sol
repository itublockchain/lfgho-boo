//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "forge-std/console.sol";
import "./Parser.sol";
import "./Oracle.sol";
import "./interfaces/IGhoToken.sol";

contract Minter {
    BitcoinTxParser public btcTxParser;
    Oracle public priceFeed;
    IGhoToken public ghoToken;

    constructor(
        address _btcTxParserAddress,
        address _oracle,
        address _ghoTokenAddress
    ) {
        btcTxParser = BitcoinTxParser(_btcTxParserAddress);
        priceFeed = Oracle(_oracle);
        ghoToken = IGhoToken(_ghoTokenAddress);
    }

    function getAmountOfAddress(
        address _address
    ) public view returns (uint256) {
        return btcTxParser.addressToAmount(_address);
    }

    function getPriceOfSatoshi(uint256 _amount) public view returns (uint256) {
        return priceFeed.getConversionRate(_amount);
    }

    function mint(address _address) public {
        uint256 amount = getAmountOfAddress(_address);
        uint256 satoshiInUsd = getPriceOfSatoshi(amount);
        uint256 ghoAmount = satoshiInUsd * 1e16;
        ghoToken.mint(_address, ghoAmount);
    }
}
