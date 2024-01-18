'use client';
import { useModal } from "connectkit";
import { useAccount, useDisconnect } from "wagmi";
import React from "react";
import { ConnectButton } from "orangekit";


export default function Home() {
  const { isConnected, address, isConnecting } = useAccount();
  const { setOpen } = useModal();
  const { disconnect } = useDisconnect();
  if (isConnecting) return <p>Connecting...</p>;
    return (
      <div className="p=20">
        {
          !isConnected && (
            <button className="bg-white px-4 py-2 rounded text-black"
            onClick={() => setOpen(true)}>
              Open Modal
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
      </div>
    )
  
  function YourApp() {
      return <ConnectButton />;
    }
}