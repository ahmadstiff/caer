import { useReadContract } from "wagmi";
import { poolAbi } from "@/lib/abi/poolAbi";
import { Address } from "viem";


const lendingPool = process.env.NEXT_PUBLIC_LENDING_POOL_ADDRESS as Address;

export const useLendingPoolData = (userAddress?: Address) => {
  const { data: totalSupplyAssets } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "totalSupplyAssets",
    args: [],
  });

  const { data: totalSupplyShares } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "totalSupplyShares",
    args: [],
  });

  const { data: checkAvailability } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "addressPosition",
    args: [userAddress],
  });

  const { data: collateralAddress } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "collateralToken",
  });

  const { data: borrowAddress } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "borrowToken",
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
    checkAvailability,
    collateralAddress,
    borrowAddress,
    userCollateral,
  };
};
