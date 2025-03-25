import { mockEna, mockUsdc, mockUsde, mockWbtc, mockWeth } from "./addresses";
import usde from "../../public/usde.png";
import ena from "../../public/ena.png";

export interface TokenOption {
  name: string;
  address: string;
  logo: string;
  decimals: number;
}

export const TOKEN_OPTIONS: TokenOption[] = [
  {
    name: "WETH",
    address: mockWeth,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
    decimals: 18,
  },
  {
    name: "WBTC",
    address: mockWbtc,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png",
    decimals: 8,
  },
  {
    name: "USDC",
    address: mockUsdc,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/logo.png",
    decimals: 6,
  },
  {
    name: "ENA",
    address: mockEna,
    logo: ena.src,
    decimals: 18,
  },
  {
    name: "USDe",
    address: mockUsde,
    logo: usde.src,
    decimals: 18,
  },
];
