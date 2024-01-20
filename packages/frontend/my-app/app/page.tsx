"use client";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { useContractRead } from "wagmi";
import oracleABI from "./abis/oracleABI.json";

export default function Home() {
  const [utxoData, setUtxoData] = useState(null);
  const [utxoCreating, setUtxoCreating] = useState(false);
  const handleCreateUTXO = async (bitaddress: any, familykitadd: any) => {
    setUtxoCreating(true);
    try {
      const address = bitaddress;
      const evmaddress = familykitadd;
      const response = await axios.get(
        `http://localhost:3001/api/bitcoinUnspent`,
        {
          params: { address, evmaddress },
        }
      );
      setUtxoData(response.data);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
    setUtxoCreating(false);
  };

  const unisat = (window as any).unisat;
  const [inputValue, setInputValue] = useState(1);
  const [transactionID, setTransactionID] = useState("Deposit First");

  const handleInputChange = (e: any) => {
    setInputValue(e.target.value);
  };

  const { data: decimalrate } = useContractRead({
    address: "0x65dae2712abae2120a39ca362b0dc73db4ef2630",
    abi: oracleABI,
    functionName: "getPrice",
  });
  const rate = Math.floor((Number(inputValue) * Number(decimalrate)) / 1e8);
  return (
    <div id="home" className="flex justify-between">
      <>
        <div className="flex flex-col">
          <div
            className="absolute top-[40%] left-[50%] translate-y-[-50%] translate-x-[-50%] text-sm/[24px] font-bold
       bg-[#8AF3FB] p-30 rounded-[10px] shadow-[100px_35px_35px_-15px_rgba(0,0,0,0)]  border-l-8 border-b-8 border-black text-center mb-32 
        w-[500px] h-[300px]  justify-center  flex flex-col items-center   "
          >
            <div className="flex mb-14  space-x-8">
              <div className="flex-col flex">
                <div className="bg-white border-black border-[3px] rounded-full h-[77px] w-[77px] bg-[url('/BTC_LOGO.jpeg')] bg-center bg-no-repeat bg-cover mt-12 "></div>
                <p className="text-black font-bold font-sans mt-6">Bitcoin</p>
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  className="bg-[#99DDE2] border-[3px] border-black rounded-md mt-3 py-1 w-[85px] text-center font-bold"
                />
              </div>
              <Image
                src={"/Arrow.png"}
                alt=""
                width={170}
                height={10}
                className=" h-[16px] mt-20"
              ></Image>
              <div className="flex-col flex items-center">
                <div className="bg-white border-black border-[3px] rounded-full h-[77px] w-[77px] bg-[url('/GHO_LOGO.jpeg')] bg-center bg-no-repeat bg-cover mt-12 "></div>
                <p className="text-black font-bold font-sans mt-6">GHO</p>
                <input
                  type="number"
                  value={rate}
                  readOnly
                  className="bg-[#99DDE2] border-[3px] border-black rounded-md mt-3 py-1 w-[85px] text-center font-bold"
                />
              </div>
            </div>
            <button className="bg-[#99DDE2] rounded-md border-[4px] px-4 py-1 mb-12 border-black font-bold">
              Deposit
            </button>
          </div>
          <div
            className="absolute top-[63%] left-[50%] bg-[#8AF3FB] rounded-[10px] shadow-[100px_35px_35px_-15px_rgba(0,0,0,0)]  border-l-8 border-b-8 border-black text-center 
        w-[500px] h-[120px]  justify-center  flex flex-col items-center translate-y-[-50%] translate-x-[-50%]"
          >
            <input
              type="text"
              value={transactionID}
              readOnly
              className="bg-[#99DDE2] border-[3px] border-black rounded-md mt-3 py-1 w-[400px] text-center font-bold"
            ></input>
            <button className="bg-[#99DDE2] rounded-md border-[4px] px-4 py-1 mt-3 border-black font-bold">
              Submit
            </button>
          </div>
        </div>
      </>
    </div>
  );
}
