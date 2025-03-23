import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { poolAbi } from "@/lib/abi/poolAbi";
import { mockErc20Abi } from "@/lib/abi/mockErc20Abi";
import { mockUsdc } from "@/constants/addresses";

const lendingPool = process.env.NEXT_PUBLIC_LENDING_POOL_ADDRESS as string;

export const useSupply = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const { isLoading: isApproveLoading } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { isLoading: isSupplyLoading } = useWaitForTransactionReceipt({
    hash: supplyHash,
  });

  const supply = async (amount: string) => {
    setIsProcessing(true);
    setError(null);

    if (!amount || isNaN(Number(amount))) {
      setError("Invalid supply amount");
      setIsProcessing(false);
      return;
    }

    const supplyAmountBigInt = BigInt(Number(amount) * 10 ** 6);

    try {
      console.log("⏳ Sending approval transaction...");

      await approveTransaction({
        abi: mockErc20Abi,
        address: mockUsdc,
        functionName: "approve",
        args: [lendingPool, supplyAmountBigInt],
      });

      console.log("✅ Approval transaction sent, waiting for confirmation...");
      await new Promise((resolve) => setTimeout(resolve, 5000));

      console.log("✅ Approval confirmed, proceeding with supply...");
      await supplyTransaction({
        abi: poolAbi,
        address: `0x${lendingPool}`,
        functionName: "supply",
        args: [supplyAmountBigInt],
      });

      console.log("🚀 Supply transaction sent!");
    } catch (err) {
      console.error("❌ Transaction failed:", err);
      setError("Transaction failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    supply,
    isApprovePending,
    isSupplyPending,
    isApproveLoading,
    isSupplyLoading,
    isProcessing,
    error,
  };
};
