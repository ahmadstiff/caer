import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { poolAbi } from "@/lib/abi/poolAbi";
import { Address } from "viem";


const lendingPool = process.env.NEXT_PUBLIC_LENDING_POOL_ADDRESS as Address;

export function usePositionStatus() {
  const [hasPosition, setHasPosition] = useState(false);

  const { data: positionAddress, refetch } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "addressPosition",
    args: [
      typeof window !== "undefined" && window.ethereum
        ? (window.ethereum.selectedAddress as Address)
        : undefined,
    ],
  });

  useEffect(() => {
    if (positionAddress && typeof positionAddress === "string") {
      setHasPosition(
        positionAddress !== "0x0000000000000000000000000000000000000000"
      );
    }
  }, [positionAddress]);

  return { hasPosition, refetch };
}
