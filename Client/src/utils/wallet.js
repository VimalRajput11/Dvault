// utils/getCurrentWallet.js
import { useAccount } from 'wagmi';

export const getCurrentWallet = async () => {
  const { address, isConnected } = useAccount();
  if (!isConnected || !address) throw new Error("Wallet not connected");
  return address;
};
