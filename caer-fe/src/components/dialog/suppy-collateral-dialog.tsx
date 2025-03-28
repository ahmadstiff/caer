"use client";
import { useState, useEffect } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { parseUnits } from "viem";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { poolAbi } from "@/lib/abi/poolAbi";
import { mockErc20Abi } from "@/lib/abi/mockErc20Abi";
import { lendingPool, mockWeth } from "@/constants/addresses";
import { Loader2, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWethBalance } from "@/hooks/useTokenBalance";
import { Address } from "viem";


interface SupplyDialogProps {
  token: string | undefined;
}

export default function SupplyDialogCol({ token }: SupplyDialogProps) {
  const [amount, setAmount] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [hasPosition, setHasPosition] = useState(false);

  const wethBalance = useWethBalance();

  const { data: positionAddress, refetch: refetchPosition } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "addressPosition",
    args: [
      typeof window !== "undefined"
        ? (window as any).ethereum?.selectedAddress
        : undefined,
    ],
  });

  useEffect(() => {
    if (
      positionAddress &&
      positionAddress !== "0x0000000000000000000000000000000000000000"
    ) {
      setHasPosition(true);
    } else {
      setHasPosition(false);
    }
  }, [positionAddress]);

  const {
    data: approveHash,
    isPending: isApprovePending,
    writeContract: approveTransaction,
  } = useWriteContract();

  const {
    data: supplyHash,
    isPending: isSupplyPending,
    writeContract: supplyTransaction,
  } = useWriteContract();

  const {
    data: positionHash,
    isPending: isPositionPending,
    writeContract: createPositionTransaction,
  } = useWriteContract();

  const { isLoading: isApproveLoading } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { isLoading: isSupplyLoading, isSuccess } =
    useWaitForTransactionReceipt({
      hash: supplyHash,
    });

  const { isLoading: isPositionLoading } = useWaitForTransactionReceipt({
    hash: positionHash,
  });

  const handleSupply = async () => {
    try {
      if (!amount || Number.parseFloat(amount) <= 0) {
        alert("Please enter a valid amount to supply");
        return;
      }

      const parsedAmount = parseUnits(amount.toString(), 18);

      if (!hasPosition) {
        await createPositionTransaction({
          address: lendingPool,
          abi: poolAbi,
          functionName: "createPosition",
          args: [],
        });
        await refetchPosition();
      }

      await approveTransaction({
        abi: mockErc20Abi,
        address: mockWeth,
        functionName: "approve",
        args: [lendingPool, parsedAmount],
      });

      await supplyTransaction({
        address: lendingPool,
        abi: poolAbi,
        functionName: "supplyCollateralByPosition",
        args: [parsedAmount],
      });
      setAmount("");
    } catch (error) {
      alert("Supply error:");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setIsOpen(false);
    }
  }, [isSuccess]);

  const isProcessing =
    isApprovePending ||
    isSupplyPending ||
    isApproveLoading ||
    isSupplyLoading ||
    isPositionPending ||
    isPositionLoading;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-gradient-to-r from-indigo-400 to-purple-500 hover:from-purple-600 hover:to-indigo-500 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 rounded-lg"
          size="lg"
        >
          Supply {token}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-white to-slate-50 border-0 shadow-xl rounded-xl">
        <DialogHeader className="pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-purple-500" />
            <DialogTitle className="text-xl font-bold text-slate-800">
              Supply {token} as Collateral
            </DialogTitle>
          </div>
          {!hasPosition && (
            <DialogDescription className="mt-2 text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100 flex items-center">
              <Shield className="h-4 w-4 mr-2 text-amber-500" />
              You need to create a position before supplying collateral.
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-slate-700">
                  Supply Amount
                </h3>
                <Badge
                  variant="outline"
                  className="bg-purple-50 text-purple-700 border-purple-200"
                >
                  Collateral
                </Badge>
              </div>

              <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <Input
                  placeholder={`Enter amount of ${token} to supply`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isProcessing}
                  type="number"
                  min="0"
                  step="0.01"
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-medium"
                />
                <div className="flex items-center gap-1 bg-slate-200 px-3 py-1 rounded-md">
                  <span className="font-semibold text-slate-700">{token}</span>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-500 flex justify-between items-center">
                <span className="mr-1">Your Balance:</span>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 mx-2">
                    {wethBalance} WETH
                  </span>
                  <button
                    onClick={() => setAmount(wethBalance)}
                    className="text-xs p-0.5 border border-purple-500 rounded-md text-purple-500 hover:bg-purple-200"
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
                      ? "text-purple-700"
                      : "bg-purple-500 text-white"
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
                <div className="w-4 h-4 rounded-full mr-2 flex items-center justify-center text-purple-700">
                  {hasPosition ? "1" : "2"}
                </div>
                <span className="text-slate-700">Approve token</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-2 flex items-center justify-center text-purple-700">
                  {hasPosition ? "2" : "3"}
                </div>
                <span className="text-slate-700">Supply collateral</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSupply}
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
                <Shield className="mr-2 h-5 w-5" />
                <span>{`Supply ${token} as Collateral`}</span>
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
