import { poolAbi } from "@/lib/abi/poolAbi";
import { Address } from "viem";
import { useAccount, useReadContract } from "wagmi";

const lendingPool = process.env.NEXT_PUBLIC_LENDING_POOL_ADDRESS as Address;

export const useBorrowBalance = () => {
  const { address } = useAccount();
  const { data: borrowBalance } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "userBorrowShares",
    args: [address],
  });

  return borrowBalance ? Number(borrowBalance) / 1e6 : "0.00";
};
