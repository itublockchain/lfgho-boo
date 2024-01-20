"use client";
import { ConnectKitButton } from "connectkit";
import { useAccount, useDisconnect } from "wagmi";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";

const Header: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [bitaddress, setAddress] = useState("");
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      // This logic will run when accounts state changes, except for the initial render
      if (accounts.length > 0) {
        setConnected(true);
        localStorage.setItem("connected", "true");
        setAddress(accounts[0]);
        localStorage.setItem("bitAddress", accounts[0]);
      } else {
        setConnected(false);
      }
    }
  }, [accounts]);

  useEffect(() => {
    const unisat = (window as any).unisat;
    const checkUnisat = async () => {
      try {
        const accounts = await unisat.getAccounts();
        setAccounts(accounts);
      } catch (error) {
        console.error("Error fetching Unisat accounts:", error);
      }
    };

    // Listen for account changes
    unisat.on("accountsChanged", setAccounts);

    // Fetch accounts on component mount
    checkUnisat();

    // Clean up event listener when the component unmounts
    return () => {
      unisat.removeListener("accountsChanged", setAccounts);
    };
  }, []);
  function truncateAddress(address: any) {
    return address.slice(0, 6) + "..." + address.slice(-4);
  }
  const unisat = (window as any).unisat;
  return (
    <>
      <div className="p=20 flex justify-between">
        <div className="flex   space-x-8 justify-center items-center  ">
          <Image
            src={"/boo.png"}
            alt=""
            width={100}
            height={50}
            className="pb-10 mt-2"
          ></Image>
          <button
            className="bg-[#ffffff] text-black font-sans  font-bold border-black border-[3px]
  border-solid px-6 py-1 rounded-2xl textcolor-white mb-5"
          >
            <a href="/">Home</a>
          </button>
          <button
            className="bg-[#99DDE2] text-black font-sans  font-bold border-black border-[3px]
  border-solid px-6 py-1 rounded-2xl textcolor-white mb-5"
          >
            <a href="/payback">Payback</a>
          </button>
        </div>

        <div className="flex flex-row justify-between space-x-5  mt-9 mr-8">
          {connected ? (
            <button
              className="bg-[#99DDE2] text-black font-sans font-bold border-black border-[3px]
  border-solid text-center rounded-lg textcolor-white w-[188px] h-[40px] mt-1 shadow-[100px_35px_35px_-15px_rgba(0,0,0,0)] flex items-center justify-center"
            >
              <span className="truncate">{truncateAddress(bitaddress)}</span>
            </button>
          ) : (
            <button
              className="bg-[#99DDE2] text-black font-sans font-bold border-black border-[3px]
  border-solid text-center rounded-lg textcolor-white w-[188px] h-[40px] mt-1 shadow-[100px_35px_35px_-15px_rgba(0,0,0,0)] flex items-center justify-center"
              onClick={async () => {
                const result = await unisat.requestAccounts();
              }}
            >
              Connect Unisat Wallet
            </button>
          )}

          <ConnectKitButton mode="dark" />
        </div>
      </div>
    </>
  );
};

export default Header;
