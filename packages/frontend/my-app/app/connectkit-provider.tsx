'use client';
import { WagmiConfig, createConfig } from "wagmi";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { OrangeKitProvider } from "orangekit";
import "orangekit/dist/index.css";
const config = createConfig(
  getDefaultConfig({
    // Required API Keys
    alchemyId: process.env.ALCHEMY_ID, // or infuraId
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",

    // Required
    appName: "Your App Name",
    // Optional
    appDescription: "Your App Description",
    appUrl: "https://family.co", // your app's url
    appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  }),
);

export const ConnectkitProvider = ({ children }) => {
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider>
        <OrangeKitProvider>
          {children}
        </OrangeKitProvider>
      </ConnectKitProvider>
    </WagmiConfig>
  );
}