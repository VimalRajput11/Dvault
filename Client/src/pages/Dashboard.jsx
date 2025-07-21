import React, { useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { toast } from 'react-hot-toast';
import ConnectWalletModal from '../components/ConnectWalletModal.jsx';
import Header from '../components/Header.jsx';
import VaultDashboard from '../components/VaultDashboard.jsx';
import CreateVaultModal from '../components/CreateVaultModal.jsx';

const Dashboard = () => {
  const [showCreateVault, setShowCreateVault] = useState(false);
  const [showConnectWallet, setShowConnectWallet] = useState(false);
  const [toastShown, setToastShown] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (isConnected && address && !toastShown) {
      toast.success(`Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`);
      setToastShown(true);
      setRenderKey((prev) => prev + 1);
      setShowConnectWallet(false); // Close connect wallet modal on success
    }
  }, [isConnected, address, toastShown]);

  const handleDisconnect = () => {
    disconnect();
    localStorage.removeItem('walletconnect');
    toast.success('Wallet disconnected');
    setToastShown(false);
    setRenderKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-blue-900 dark:to-cyan-900 opacity-90"></div>

      <div className="relative z-10">
        <Header
          onCreateVault={() => setShowCreateVault(true)}
          onDisconnect={handleDisconnect}
          address={address}
          isConnected={isConnected}
          onConnectWallet={() => setShowConnectWallet(true)} // You can pass this to header if you want a connect button there
        />

        <main className="px-4 py-6">
          {isConnected ? (
            <VaultDashboard key={renderKey} onCreateVault={() => setShowCreateVault(true)} />
          ) : (
            <div className="mt-10 mx-auto max-w-md bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-yellow-400 text-center">
              <h2 className="text-lg font-semibold text-yellow-400">🔗 Wallet Not Connected</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Connect your Ethereum wallet to view your vaults and start using blockchain features.
              </p>
              <button
                className="mt-4 px-6 py-3 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition"
                onClick={() => setShowConnectWallet(true)}
              >
                Connect Wallet
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Create Vault Modal */}
      <CreateVaultModal isOpen={showCreateVault} onClose={() => setShowCreateVault(false)} />

      {/* Connect Wallet Modal */}
      <ConnectWalletModal isOpen={showConnectWallet} onClose={() => setShowConnectWallet(false)} />
    </div>
  );
};

export default Dashboard;
