"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useContractRead } from "wagmi";
import Image from "next/image";
import oracleABI from "../abis/oracleABI.json";


const Page = () => {
  const [ghoValue, setGhoValue] = useState(1);

  const handleInputChange = (e: any) => {
    setGhoValue(e.target.value);
  };

  const { data: decimalrate } = useContractRead({
    address: "0x65dae2712abae2120a39ca362b0dc73db4ef2630",
    abi: oracleABI,
    functionName: "getPrice",
  });

  console.log(decimalrate);
  
  const rate = ((Number(ghoValue) / ((Number(decimalrate)) / 1e8)));
  console.log(rate);
  
  return (
    <div id="payback" className="p=20 flex justify-between    ">
      <>
        <div
          className="absolute top-[40%] left-[50%] translate-y-[-50%] translate-x-[-50%] text-sm/[24px] font-bold
       bg-[#8AF3FB] p-30 rounded-[10px] shadow-[100px_35px_35px_-15px_rgba(0,0,0,0)]  border-l-8 border-b-8 border-black text-center mb-32 
        w-[500px] h-[300px]  justify-center  flex flex-col items-center   "
        >
          <div className="flex mb-14  space-x-8">
            <div className="flex-col flex">
            <div className="bg-white rounded-full border-[3px] border-black border-1 h-[77px] bg-[url('/GHO_LOGO.jpeg')] bg-center bg-no-repeat bg-cover "></div>
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
              className=" h-[16px] mt-6"
            ></Image>
            <div className="flex-col flex">
              
            <div className="bg-white border-black border-[3px] rounded-full h-[77px] bg-[url('/BTC_LOGO.jpeg')] bg-center bg-no-repeat bg-cover  "></div>
              <p className="text-black font-bold font-sans mt-6">Bitcoin</p>
              
             
              <input
                type="number"
                value={rate}
                readOnly
                className="bg-[#99DDE2] border-[3px] border-black rounded-md mt-3 py-1 w-[85px] text-center font-bold"
              />
            </div>
          </div>
          <button className="bg-[#b4faff] rounded-md border-[3px] px-4 py-1 mb-4 border-black">
            Payback
          </button>
        </div>
      </>
    </div>
  );
};
export default dynamic(() => Promise.resolve(Page), {
  ssr: false,
});
