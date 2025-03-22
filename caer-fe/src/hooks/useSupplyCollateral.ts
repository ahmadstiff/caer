import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { poolAbi } from "@/lib/abi/poolAbi";
import { mockErc20Abi } from "@/lib/abi/mockErc20Abi";
import { lendingPool, mockWeth } from "@/constants/addresses";
import { usePositionStatus } from "./usePositionStatus";

export function useSupplyCollateral() {
  const { hasPosition, refetch } = usePositionStatus();
  const { data: approveHash, writeContract: approveTransaction } =
    useWriteContract();
  const { data: supplyHash, writeContract: supplyTransaction } =
    useWriteContract();
  const { data: positionHash, writeContract: createPositionTransaction } =
    useWriteContract();

  const { isLoading: isApproveLoading } = useWaitForTransactionReceipt({
    hash: approveHash,
  });
  const { isLoading: isSupplyLoading, isSuccess } =
    useWaitForTransactionReceipt({ hash: supplyHash });
  const { isLoading: isPositionLoading } = useWaitForTransactionReceipt({
    hash: positionHash,
  });

  const handleSupply = async (amount: { toString: () => string }) => {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount to supply");
      return;
    }

    const parsedAmount = parseUnits(amount.toString(), 18);

    try {
      if (!hasPosition) {
        await createPositionTransaction({
          address: lendingPool,
          abi: poolAbi,
          functionName: "createPosition",
          args: [],
        });
        await refetch();
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
    } catch (error) {
      alert(`Supply error: ${(error as Error).message}`);
    }
  };

  return {
    handleSupply,
    isProcessing: isApproveLoading || isSupplyLoading || isPositionLoading,
    isSuccess,
  };
}
