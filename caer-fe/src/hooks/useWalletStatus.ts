import { useAccount } from 'wagmi';

const useWalletStatus = () => {
  const { isConnected, address } = useAccount();

  return {
    isConnected,
    address,
  };
};

export default useWalletStatus;
