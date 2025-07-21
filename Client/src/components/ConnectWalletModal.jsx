import React, { useEffect } from 'react';
import { X, Wallet } from 'lucide-react';
import { useWeb3Modal } from '@web3modal/react';

const ConnectWalletModal = ({ isOpen, onClose }) => {
  const { open } = useWeb3Modal();

  // Open wallet modal automatically when isOpen becomes true
  useEffect(() => {
    if (isOpen) {
      open();
    }
  }, [isOpen, open]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-md w-full border border-white/20 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Connect Wallet</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-all duration-300"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-300 mb-8">
          Choose your preferred wallet to connect to D-Vault and access your secure storage.
        </p>

        {/* Connect button (optional, can keep or remove) */}
        <button
          onClick={() => {
            open();
            onClose();
          }}
          className="w-full flex items-center space-x-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all duration-300 group transform hover:scale-105"
        >
          <div className="text-2xl">🔗</div>
          <div className="flex-1 text-left">
            <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors duration-300">
              Connect Wallet
            </div>
            <div className="text-sm text-gray-400">
              Open Web3Modal to select MetaMask, Coinbase, or WalletConnect
            </div>
          </div>
        </button>

        {/* Security Info */}
        <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
          <p className="text-yellow-300 text-sm">
            🔒 Your wallet connection is secured with end-to-end encryption. D-Vault never stores your private keys.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectWalletModal;
