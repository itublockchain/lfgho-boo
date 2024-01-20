"use client";
import { ConnectKitButton } from "connectkit";
import { useAccount, useDisconnect } from "wagmi";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button, Card, Input, Radio } from "antd";

/* UNISAT START */
/* const [unisatInstalled, setUnisatInstalled] = useState(false);
const [connected, setConnected] = useState(false);
const [accounts, setAccounts] = useState<string[]>([]);
const [publicKey, setPublicKey] = useState("");
const [address, setAddress] = useState("");
const [balance, setBalance] = useState({
  confirmed: 0,
  unconfirmed: 0,
  total: 0,
});
const [network, setNetwork] = useState("testnet");
const getBasicInfo = async () => {
  const unisat = (window as any).unisat;
  const [address] = await unisat.getAccounts();
  setAddress(address);

  const publicKey = await unisat.getPublicKey();
  setPublicKey(publicKey);

  const balance = await unisat.getBalance();
  setBalance(balance);

  const network = await unisat.getNetwork();
  setNetwork(network);
};
const selfRef = useRef<{ accounts: string[] }>({
  accounts: [],
});
const self = selfRef.current;
const handleAccountsChanged = (_accounts: string[]) => {
  if (self.accounts[0] === _accounts[0]) {
    // prevent from triggering twice
    return;
  }
  self.accounts = _accounts;
  if (_accounts.length > 0) {
    setAccounts(_accounts);
    setConnected(true);

    setAddress(_accounts[0]);

    getBasicInfo();
  } else {
    setConnected(false);
  }
};
const handleNetworkChanged = (network: string) => {
  setNetwork(network);
  getBasicInfo();
};
useEffect(() => {
  async function checkUnisat() {
    let unisat = (window as any).unisat;

    for (let i = 1; i < 10 && !unisat; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 100 * i));
      unisat = (window as any).unisat;
    }

    if (unisat) {
      setUnisatInstalled(true);
    } else if (!unisat) return;

    unisat.getAccounts().then((accounts: string[]) => {
      handleAccountsChanged(accounts);
    });

    unisat.on("accountsChanged", handleAccountsChanged);
    unisat.on("networkChanged", handleNetworkChanged);

    return () => {
      unisat.removeListener("accountsChanged", handleAccountsChanged);
      unisat.removeListener("networkChanged", handleNetworkChanged);
    };
  }

  checkUnisat().then();
}, []); */
/* UNISAT END */
const Header: React.FC = () => {
  const { isConnected, address, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();

  console.log("isConnected", isConnected);
  console.log(isConnecting);
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

        <div className="flex space-x-5  mt-9 mr-8">
          <ConnectKitButton />
        </div>
      </div>
    </>
  );
};

export default Header;
