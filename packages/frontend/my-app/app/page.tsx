'use client';
import { useModal } from "connectkit";
import { useAccount, useDisconnect } from "wagmi";
import React from "react";
import { ConnectButton } from "orangekit";
import Link from 'next/link';
import { linea } from "viem/chains";
import DepositButton from "./components/deposit-button";
import PaybackButton from "./components/payback-button";


export default function Home() {
  const { isConnected, address, isConnecting } = useAccount();
  const { setOpen } = useModal();
  const { disconnect } = useDisconnect();
  if (isConnecting) return <p>Connecting...</p>;
  return (
    <div id="anasayfa" className="p=20     " >

      {
        !isConnected && (
          <button className="bg-black text-white p-2 rounded-md textcolor-white"
            onClick={() => setOpen(true)}>
            Connect Wallet
          </button>
        )
      }
      {
        isConnected && (
          <div>
            <p>Connected Wallet: {address}</p>
            <button onClick={() => disconnect()}>
              Disconnect
            </button>
          </div>
        )
      }

      <div className="absolute top-[40%] left-[50%] translate-y-[-50%] translate-x-[-50%] text-sm/[24px] font-bold
       bg-white p-30 rounded-[10px] shadow-[100px_35px_35px_-15px_rgba(0,0,0,0)]  border-l-8 border-b-8 border-black text-center mb-32 
        w-[500px] h-[300px] ">
        <h1>Bitcoin Wallet Balance</h1>
        <p>Bitcoin: 0.236441</p>
        <p>Deposit: GHO Token 0.233155</p>
        <p>Bitcoin: 0.236441</p>
        <p>Deposit: GHO Token 0.233155</p>
      </div>

      <ConnectButton />
      <DepositButton />
      <PaybackButton />

      {/* <Link href="/payback">Payback</Link> */}
      {/* <Link href="/deposit"> Deposit</Link> */}

    </div>
  )
}

