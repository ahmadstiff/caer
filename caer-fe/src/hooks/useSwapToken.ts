"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { erc20Abi, parseUnits } from "viem";
import { lendingPool } from "@/constants/addresses";
import { poolAbi } from "@/lib/abi/poolAbi";
import { toast } from "sonner";
import { SwapTokenParams } from "@/types/type";

export const useSwapToken = () => {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { writeContract } = useWriteContract();

  const swapToken = async ({
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    onSuccess,
    onError,
  }: SwapTokenParams) => {
    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setError("");
      setIsLoading(true);

      // Calculate the amount with proper decimals
      const amountIn = parseUnits(fromAmount, fromToken.decimals);

      // First approve the token spending
      // await writeContract({
      //   address: fromToken.address as Address,
      //   abi: erc20Abi,
      //   functionName: "approve",
      //   args: [lendingPool, BigInt(amountIn) + BigInt(1000)],
      // });

      // Then perform the swap
      await writeContract({
        address: lendingPool,
        abi: poolAbi,
        functionName: "swapTokenByPosition",
        args: [toToken.address, fromToken.address, BigInt(amountIn), BigInt(1)], // Position index 0
      });

      toast.success(
        `Swap successful: ${fromAmount} ${fromToken.name} to ${toAmount} ${toToken.name}`
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error during swap:", err);
      setError("Failed to execute swap. Please try again.");
      toast.error("Swap failed");

      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    swapToken,
    isLoading,
    error,
    setError,
  };
};
