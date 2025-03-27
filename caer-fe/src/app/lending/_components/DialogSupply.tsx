"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUsdcBalance } from "@/hooks/useTokenBalance";
import { DialogDescription } from "@radix-ui/react-dialog";
import { CreditCard, DollarSign, Loader2 } from "lucide-react";
import React, { useState } from "react";

const DialogSupply = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [hasPosition, setHasPosition] = useState<boolean | unknown>(false);
  const isProcessing = false;
  const usdcBalance = useUsdcBalance();

  const handleBorrow = async () => {};
  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            className="bg-gradient-to-r from-indigo-400 to-blue-600  hover:from-indigo-500 hover:to-blue-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 rounded-lg"
            size="lg"
          >
            Borrow $USDC
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-gradient-to-b from-white to-slate-50 border-0 shadow-xl rounded-xl">
          <DialogHeader className="pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-blue-500" />
              <DialogTitle className="text-xl font-bold text-slate-800">
                Borrow USDC
              </DialogTitle>
            </div>
            {!hasPosition && (
              <DialogDescription className="mt-2 text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100 flex items-center">
                You need to create a position before borrowing.
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-6 py-4">
            <Card className="border border-slate-200 bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-slate-700">
                    Borrow Amount
                  </h3>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    Loan
                  </Badge>
                </div>

                <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <Input
                    placeholder={`Enter amount of USDC to borrow`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isProcessing}
                    type="number"
                    min="0"
                    step="0.01"
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-medium"
                  />
                  <div className="flex items-center gap-1 bg-slate-200 px-3 py-1 rounded-md">
                    <DollarSign className="h-4 w-4 text-slate-700" />
                    <span className="font-semibold text-slate-700">USDC</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Your balance : </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className=" text-gray-600">{usdcBalance}</span>
                    <button
                      onClick={() => setAmount(usdcBalance)}
                      className="text-xs p-0.5 border border-blue-500 rounded-md text-blue-500 hover:bg-blue-200"
                    >
                      Max
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <h4 className="text-xs font-medium text-slate-600 mb-2">
                Transaction Steps:
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${
                      !hasPosition
                        ? "bg-blue-100 text-blue-600"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    {hasPosition ? "✓" : "1"}
                  </div>
                  <span
                    className={
                      hasPosition
                        ? "text-slate-400 line-through"
                        : "text-slate-700"
                    }
                  >
                    Create position
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2 flex items-center justify-center bg-blue-100 text-blue-600">
                    {hasPosition ? "1" : "2"}
                  </div>
                  <span className="text-slate-700">Approve token</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2 flex items-center justify-center bg-blue-100 text-blue-600">
                    {hasPosition ? "2" : "3"}
                  </div>
                  <span className="text-slate-700">Borrow tokens</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="flex items-start">
                <div className="bg-blue-100 p-1 rounded-full mr-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xs font-medium text-blue-700 mb-1">
                    Borrowing Information
                  </h4>
                  <p className="text-xs text-blue-600">
                    Borrowing incurs interest over time. Make sure to maintain
                    sufficient collateral to avoid liquidation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleBorrow}
              disabled={isProcessing || !amount}
              className={`w-full h-12 text-base font-medium rounded-lg ${
                isProcessing
                  ? "bg-slate-200 text-slate-500"
                  : "bg-gradient-to-r from-blue-500 to-indigo-400 hover:from-blue-600 hover:to-indigo-500 text-white shadow-md hover:shadow-lg"
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span>Processing Transaction...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>{`Borrow USDC`}</span>
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DialogSupply;
