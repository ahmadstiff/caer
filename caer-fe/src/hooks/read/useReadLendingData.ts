import { useReadContract } from "wagmi";
import { poolAbi } from "@/lib/abi/poolAbi";
import { Address } from "viem";

const lendingPool = process.env.NEXT_PUBLIC_LENDING_POOL_ADDRESS as Address;

export const useReadLendingData = (
  userAddress?: Address,
  tokenAddress?: Address
) => {
  const { data: borrowAddress } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "borrowToken",
  });

  const { data: collateralAddress } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "collateralToken",
    args: [],
  });

  const { data: totalSupplyAssets } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "totalSupplyAssets",
    args: [],
  });
  const { data: tokenBalanceByPosition } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "getTokenBalancesByPosition",
    args: [tokenAddress],
  });

  const { data: totalBorrowAssets } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "totalBorrowAssets",
    args: [],
  });
  const { data: totalBorrowShares } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "totalBorrowShares",
    args: [],
  });
  const { data: totalSupplyShares } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "totalSupplyShares",
    args: [],
  });

  const { data: userCollateral } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "userCollaterals",
    args: [userAddress],
  });

  return {
    totalSupplyAssets,
    totalSupplyShares,
    collateralAddress,
    borrowAddress,
    userCollateral,
    tokenBalanceByPosition,
    totalBorrowAssets,
    totalBorrowShares,
  };
};
