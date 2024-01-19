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
    <div  id="anasayfa"  className="p=20     " >
      
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
      {/* <Header /> */}
      <ConnectButton />
      <DepositButton />
      <PaybackButton />
      
      {/* <Link href="/payback">Payback</Link> */}
      {/* <Link href="/deposit"> Deposit</Link> */}
    
    </div>
  )
}

