"use client";
import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { CardContent, Card } from "@/components/ui/card";
import Image from "next/image";
import { TOKEN_OPTIONS } from "@/constants/tokenOption";
import DialogSupply from "./DialogSupply";
import DialogWithdraw from "./DialogWithdraw";

const LendingData = () => {
  return (
    <div className="min-h-screen text-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {/* Table */}
        <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-sm rounded-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-900">
                    <th className="text-center p-4 text-sm font-medium text-gray-400">
                      Loan
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      <div className="flex items-center">Liquidity</div>
                    </th>

                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      Collateral
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">
                      APY
                    </th>
                    <th className="text-center p-4 text-sm font-medium text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 text-left">
                      <div className="flex items-center justify-center space-x-1">
                        <div>
                          <Image
                            src={
                              TOKEN_OPTIONS.find(
                                (token) => token?.name === "USDC"
                              )?.logo ?? "/placeholder.svg"
                            }
                            alt="USDC"
                            width={100}
                            height={100}
                            className="w-7 h-7 rounded-full"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-gray-100">$USDC</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-100">
                      <div>
                        <div className="font-medium">212,000,000 $USDC</div>
                        <div className="text-sm text-gray-500">$211.92M</div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center space-x-1 text-gray-100 gap-3">
                        <div>
                          <Image
                            src={
                              TOKEN_OPTIONS.find(
                                (token) => token?.name === "WETH"
                              )?.logo ?? "/placeholder.svg"
                            }
                            alt="USDC"
                            width={100}
                            height={100}
                            className="w-7 h-7 rounded-full"
                          />
                        </div>
                        <div>$WETH</div>
                      </div>
                    </td>
                    <td className="p-4 text-left">
                      <div className="font-medium text-green-500">5.62%</div>
                    </td>
                    <td className="p-4 text-center flex justify-center">
                      <div className="flex items-center gap-2">
                        <div>
                          <DialogSupply />
                        </div>
                        <div>
                          {/* <Button className="bg-violet-800/80 hover:bg-violet-700/80 duration-300 cursor-pointer px-4 py-2 rounded-md transition-all">
                            Withdraw
                          </Button> */}
                          <DialogWithdraw />
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </div>
      </main>
    </div>
  );
};

export default LendingData;
