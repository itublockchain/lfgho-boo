// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {BtctoUsdPriceFeed} from "../src/BtctoUsdPriceFeed.sol";

contract PriceFeedTest is Test {
    BtctoUsdPriceFeed public priceFeedTest;

    function setUp() public {
        priceFeedTest = new BtctoUsdPriceFeed();
        
    }

    function testGetPrice() public view{
        uint256 price = priceFeedTest.getPrice();
        console.log("price",price);
    }

    
}
