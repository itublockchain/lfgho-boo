"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { useContractRead, useContractWrite, useAccount } from "wagmi";
import Image from "next/image";
import oracleABI from "../abis/oracleABI.json";
import ghoABI from "../abis/ghoABI.json";
import minterABI from "../abis/minterABI.json";

const Page = () => {
  const bitaddress = localStorage.getItem("bitAddress");
  const { address: evmAddress } = useAccount();
  const [ghoValue, setGhoValue] = useState(0);
  const [ghoState, setGhoState] = useState(false);
  const [showApprovedPopup, setShowApprovedPopup] = useState(false);
  const handleInputChange = (e: any) => {
    setGhoValue(e.target.value);
  };
  const handleApprovedPopupClose = () => {
    setShowApprovedPopup(false);
  };
  const {
    data: dataPay,
    isLoading: loadingPay,
    isSuccess: successPay,
    write: Payback,
  } = useContractWrite({
    address: "0x6CdC0cD78816531e4D3D54019F0D947b133F7b0A",
    abi: minterABI,
    functionName: "payback",
  });
  const { data: loan } = useContractRead({
    address: "0x6CdC0cD78816531e4D3D54019F0D947b133F7b0A",
    abi: minterABI,
    functionName: "addressToAmount",
    args: [evmAddress],
  });

  const { data: decimalrate } = useContractRead({
    address: "0x65dae2712abae2120a39ca362b0dc73db4ef2630",
    abi: oracleABI,
    functionName: "getPrice",
  });
  const rate = (Number(ghoValue) / (Number(decimalrate) / 1e8)).toFixed(5);
  const satoshi = (Number(rate) * 1e8).toFixed(0);
  console.log("satoshi", satoshi);

  const { data, isLoading, isSuccess, write } = useContractWrite({
    address: "0x90ECA81b3B7F6cd49534BEdEa56B83902cdB8C67",
    abi: ghoABI,
    functionName: "approve",
  });

  useEffect(() => {
    if (isSuccess) {
      setShowApprovedPopup(isSuccess);
      setGhoState(isSuccess);
    }
  }, [isSuccess]);

  async function approve() {
    try {
      write({
        args: ["0x6CdC0cD78816531e4D3D54019F0D947b133F7b0A", 9999 * 1e18],
      });
      setGhoState(true);
    } catch (error) {
      console.error("Error ", error);
      setGhoState(false);
    }
  }

  const handlePayback = async () => {
    await axios.get(
      `http://localhost:3001/api/payback?address=${bitaddress}&amount=${satoshi}`
    );
    await Payback({
      args: [Number(ghoValue) * 1e18],
    });
  };

  return (
    <div id="payback" className="p=20 flex justify-between    ">
      <>
        <div
          className="absolute top-[40%] left-[50%] translate-y-[-50%] translate-x-[-50%] text-sm/[24px] font-bold
          bg-[#8AF3FB] p-30 rounded-[10px] shadow-[100px_35px_35px_-15px_rgba(0,0,0,0)]  border-l-8 border-b-8 border-black text-center mb-32 
           w-[500px] h-[300px]  justify-center  flex flex-col items-center    "
        >
          <div className="flex mb-14  space-x-8">
            <div className="flex-col flex">
              <div className="bg-white border-black border-[3px] rounded-full h-[77px] w-[77px] bg-[url('/GHO_LOGO.jpeg')] bg-center bg-no-repeat bg-cover mt-12 "></div>
              <p className="text-black font-bold font-sans mt-6">GHO Token</p>
              <input
                type="text"
                value={ghoValue}
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
            <div className="flex-col flex">
              <div className="bg-white border-black border-[3px] rounded-full h-[77px] w-[77px] bg-[url('/BTC_LOGO.jpeg')] bg-center bg-no-repeat bg-cover mt-12 "></div>
              <p className="text-black font-bold font-sans mt-6">Bitcoin</p>

              <input
                type="number"
                value={rate}
                readOnly
                className="bg-[#99DDE2] indent-1 border-[3px] border-black rounded-md mt-3 py-1 w-[85px] text-center font-bold"
              />
            </div>
          </div>
          <div className="space-x-6">
            {!ghoState ? (
              <button
                className=" bg-[#b4faff] hover:bg-white   rounded-md border-[3px] px-4 py-1 mb-4 border-black"
                onClick={() => approve()}
              >
                Approve
              </button>
            ) : (
              <button
                disabled
                className="bg-[#b4faff]  opacity-25  rounded-md border-[3px] px-4 py-1 mb-12 border-black"
              >
                Approve
              </button>
            )}
            <button
              className="bg-[#b4faff] hover:bg-white  rounded-md border-[3px] px-4 py-1 mb-12 border-black"
              onClick={() => handlePayback()}
            >
              Payback
            </button>
          </div>
        </div>
      </>
      {showApprovedPopup && (
        <div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="bg-[#8AF3FB] p-8 rounded-md text-center">
            <p className="text-black font-bold text-lg mb-4 text-center">
              Approved!
            </p>
            <button
              className="bg-[#74cbd1] text-gray font-bold px-4 py-2 rounded-md text-center"
              onClick={handleApprovedPopupClose}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default dynamic(() => Promise.resolve(Page), {
  ssr: false,
});
