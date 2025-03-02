import { http } from "wagmi";
import { createConfig } from "wagmi";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

const myCustomChain = defineChain({
  id: 11155931,
  name: "Rise Sepolia",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet.riselabs.xyz"] },
  },
  blockExplorers: {
    default: {
      name: "Riselabs",
      url: "https://testnet-explorer.riselabs.xyz/",
      apiUrl: "https://testnet-explorer.riselabs.xyz/api",
    },
  },
  testnet: true,
  // iconUrl:LogoEth,
});

export const config = getDefaultConfig({
  appName: "MyDApp",
  projectId: "YOUR_PROJECT_ID",
  chains: [myCustomChain],
  transports: {
    [myCustomChain.id]: http(),
  },
});
