// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script,console2} from "forge-std/Script.sol";
import {BtctoUsdPriceFeed} from "../src/BtctoUsdPriceFeed.sol";

contract DeployPriceFeed is Script{
 function run() public {
    vm.startBroadcast();
    BtctoUsdPriceFeed priceFeed = new BtctoUsdPriceFeed();
    vm.stopBroadcast();
    
 }
}