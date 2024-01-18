// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract BtctoUsdPriceFeed   {
   function getPrice() public view returns(uint256) { 

  
        AggregatorV3Interface priceFeed = AggregatorV3Interface(0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43);
        
        (,int256 price ,,,) = priceFeed.latestRoundData();
        
        return uint256(price);
   }

   function getVersion()public view returns(uint256){
     AggregatorV3Interface priceFeed = AggregatorV3Interface(0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43);
     return priceFeed.version();
   }
}
