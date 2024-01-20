"use client";
import { WagmiConfig, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

import "orangekit/dist/index.css";
const chains = [sepolia];

const config = createConfig(
  getDefaultConfig({
    alchemyId: process.env.ALCHEMY_ID, // or infuraId
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    chains,
    appName: "BOO!",
  })
);

export const ConnectkitProvider = ({ children }) => {
  return (
    <div>
      <WagmiConfig config={config}>
        <ConnectKitProvider theme="retro">
          <div>{children}</div>
        </ConnectKitProvider>
      </WagmiConfig>
    </div>
  );
};
