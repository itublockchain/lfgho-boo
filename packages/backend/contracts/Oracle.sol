// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Oracle {
    function getPrice() public view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43
        );

        (, int256 price, , , ) = priceFeed.latestRoundData();

        return uint256(price);
    }

    function getVersion() public view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43
        );
        return priceFeed.version();
    }

    function getConversionRate(
        uint256 satoshiAmount
    ) public view returns (uint256) {
        uint256 btcPrice = getPrice();

        //  should divide by 1e8 to get the price of 1 satoshi in usd
        //  should divide by 1e6 to get the price with 2 decimal (exp. 111)
        uint256 satoshiInUsd = (btcPrice * satoshiAmount) / 1e14;
        return satoshiInUsd;
    }
}
