"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronUp,
  ChevronDown,
  Wallet,
  HandCoins,
  TrendingUp,
  CircleDollarSign,
} from "lucide-react";

import { mockUsdc, mockUsde, mockWbtc, mockWeth } from "@/constants/addresses";
import type { Address } from "viem";
import { TOKEN_OPTIONS } from "@/constants/tokenOption";
import PositionToken from "./position-token";
import { useReadLendingData } from "@/hooks/read/useReadLendingData";
import { useBorrowBalance } from "@/hooks/useBorrowBalance";

const PositionCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    checkAvailability,
    collateralAddress,
    borrowAddress,
    userCollateral,
  } = useReadLendingData();

  const userBorrowShares = useBorrowBalance();

  const addressPosition = checkAvailability as `0x${string}` | undefined;

  const findNameToken = (address: Address | unknown) => {
    const token = TOKEN_OPTIONS.find((asset) => asset.address === address);
    return token?.name;
  };

  const convertRealAmount = (amount: number | unknown, decimal: number) => {
    const realAmount = Number(amount) ? Number(amount) / decimal : 0; // convert to USDC
    return realAmount;
  };

  return (
    <Card className="bg-slate-900/50 border border-slate-800 shadow-lg overflow-hidden">
      <CardHeader className="pb-2 border-b py-2 border-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 py-2">
            <CircleDollarSign className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-xl text-white">Your Position</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="px-4 md:px-6">
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-800/30 rounded-lg">
              <div className="space-y-2 text-center">
                <div className="text-xs md:text-sm text-slate-400 flex items-center justify-center gap-1">
                  <Wallet className="h-3.5 w-3.5 text-blue-500" />
                  Collateral
                </div>
                <div className="text-base md:text-lg font-medium text-white">
                  {userCollateral
                    ? convertRealAmount(userCollateral, 1e18).toFixed(5)
                    : "0"}{" "}
                  <span className="text-blue-400">
                    ${findNameToken(collateralAddress)}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-center">
                <div className="text-xs md:text-sm text-slate-400 flex items-center justify-center gap-1">
                  <HandCoins className="h-3.5 w-3.5 text-red-500" />
                  Debt
                </div>
                <div className="text-base md:text-lg font-medium text-white">
                  {userBorrowShares || "0"}{" "}
                  <span className="text-blue-400">
                    ${findNameToken(borrowAddress)}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-center">
                <div className="text-xs md:text-sm text-slate-400 flex items-center justify-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                  APY
                </div>
                <div className="text-base md:text-lg font-medium text-green-400">
                  {userBorrowShares ? "14.45%" : "0%"}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              {checkAvailability ===
              "0x0000000000000000000000000000000000000000" ? (
                <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <div className="bg-slate-800/50 p-4 rounded-full">
                    <Wallet className="h-10 w-10 text-slate-500" />
                  </div>
                  <span className="text-xl md:text-2xl text-slate-300">
                    No positions available
                  </span>
                  <p className="text-sm text-slate-500 max-w-md">
                    You don't have any active positions. Start by supplying
                    collateral and borrowing assets.
                  </p>
                  <Button className="mt-2 bg-blue-600 hover:bg-blue-700">
                    Create Position
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-800/50 text-sm font-medium text-slate-400">
                    <div className="pl-4">Assets</div>
                    <div className="text-center">Value</div>
                    <div className="text-center">Actions</div>
                  </div>
                  <div className="divide-y divide-slate-800/50">
                    {/* WETH */}
                    <PositionToken
                      name={findNameToken(mockWeth)}
                      address={mockWeth}
                      decimal={1e18}
                      addressPosition={addressPosition}
                    />
                    {/* WBTC */}
                    <PositionToken
                      name={findNameToken(mockWbtc)}
                      address={mockWbtc}
                      decimal={1e8}
                      addressPosition={addressPosition}
                    />
                    {/* USDE */}
                    <PositionToken
                      name={findNameToken(mockUsde)}
                      address={mockUsde}
                      decimal={1e8}
                      addressPosition={addressPosition}
                    />
                    {/* USDC */}
                    <PositionToken
                      name={findNameToken(mockUsdc)}
                      address={mockUsdc}
                      decimal={1e6}
                      addressPosition={addressPosition}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default PositionCard;
