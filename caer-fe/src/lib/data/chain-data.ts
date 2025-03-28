import { defineChain } from "viem";
import  caer  from "../../../public/caer.png";

const myCustomChain = defineChain({
  id: 6285153,
  name: "Ca Chain",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://44.213.128.45:8547/"] },
  },
  blockExplorers: {
    default: {
      name: "Riselabs",
      url: "https://testnet-explorer.riselabs.xyz/",
      apiUrl: "https://testnet-explorer.riselabs.xyz/api",
    },
  },
  testnet: true,
  logoURL: caer.src,
});
