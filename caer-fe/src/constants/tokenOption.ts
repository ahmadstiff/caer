import { mockEna, mockUsdc, mockUsde, mockWbtc, mockWeth } from "./addresses";
import usde from "../../public/usde.png";
import ena from "../../public/ena.png";

export interface TokenOption {
  name: string;
  namePrice: string;
  address: string;
  logo: string;
  decimals: number;
}

export const TOKEN_OPTIONS: TokenOption[] = [
  {
    name: "WETH",
    namePrice: "ETH",
    address: mockWeth,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
    decimals: 18,
  },
  {
    name: "WBTC",
    namePrice: "BTC",
    address: mockWbtc,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png",
    decimals: 8,
  },
  {
    name: "USDC",
    namePrice: "USDC",
    address: mockUsdc,
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ43MuDqq54iD1ZCRL_uthAPkfwSSL-J5qI_Q&s",
    decimals: 6,
  },
  {
    name: "ENA",
    namePrice: "ENA",
    address: mockEna,
    logo: ena.src,
    decimals: 18,
  },
  {
    name: "USDe",
    namePrice: "USDe",
    address: mockUsde,
    logo: usde.src,
    decimals: 18,
  },
];
