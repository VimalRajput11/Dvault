import React, { useState, useEffect, useMemo } from "react";
import {
  Plus, FolderOpen, Trash2, Clock, HardDrive,
  Wallet, ArrowRight, Eye,
} from "lucide-react";
import { initWeb3 } from "../utils/contractInit";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAccount } from "wagmi";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

const VaultDashboard = ({ onCreateVault }) => {
  const [vaults, setVaults] = useState([]);
  const [isLoading, setLoad] = useState(true);
  const { user } = useAuth();
  const { address: wallet } = useAccount();
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVaultId, setSelectedVaultId] = useState(null);
  const [selectedVaultName, setSelectedVaultName] = useState("");

  // Helper: Count active files per vault (you may want to optimize this if possible)
  const countActiveFiles = async (contract, vaultId) => {
    const total = await contract.methods.getFileCount(vaultId).call();
    let active = 0;
    for (let i = 0; i < total; i++) {
      const f = await contract.methods.getFile(vaultId, i).call();
      if (f.cid !== "" && f.size > 0) active++;
    }
    return active;
  };

  // Fetch vaults on wallet change
  const fetchVaults = async () => {
    if (!wallet) return setVaults([]);

    setLoad(true);
    try {
      const { contract } = await initWeb3();
      const vaultCount = await contract.methods.getVaultCount().call();

      const chainVaults = await Promise.all(
        [...Array(Number(vaultCount)).keys()].map(async (id) => {
          try {
            const v = await contract.methods.getVault(id).call();
            const activeFiles = await countActiveFiles(contract, id);
            return {
              id,
              name: v.name,
              description: v.description,
              size: Number(v.size),
              encryptionLevel: v.encryptionLevel,
              files: activeFiles,
              storageLimit: v.storageLimit,
              accessType: v.accessType,
              lastAccessed: v.lastAccessed,
              owner: v.owner,
            };
          } catch (err) {
            // Skip deleted vaults and log unexpected issues
            if (
              err?.message?.includes("Vault deleted") ||
              err?.data?.message?.includes("Vault deleted")
            ) {
              return null;
            }
            console.error(`Error fetching vault ${id}:`, err);
            return null;
          }
        })
      );

      // Filter only valid vaults owned by current wallet (case-insensitive)
      const filteredVaults = chainVaults.filter((v) => !!v);
      const ownedVaults = filteredVaults.filter(
        (v) => v.owner.toLowerCase() === wallet.toLowerCase()
      );

      setVaults(ownedVaults);
    } catch (err) {
      console.error("Failed to load vaults:", err);
      setVaults([]);
    } finally {
      setLoad(false);
    }
  };

  // Run fetchVaults when wallet changes
  useEffect(() => {
    fetchVaults();
  }, [wallet]);

  // Listen to changes in account or chain and refresh vaults accordingly
  useEffect(() => {
    const { ethereum } = window;
    if (!ethereum) return;

    const handleAccountsChanged = async () => fetchVaults();
    const handleChainChanged = async () => fetchVaults();

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
      ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  // Delete vault handler
  const handleDeleteVault = async () => {
    if (!selectedVaultId) return;

    try {
      const { web3, contract } = await initWeb3();
      const accounts = await web3.eth.getAccounts();
      await contract.methods.deleteVault(selectedVaultId).send({ from: accounts[0] });
      toast.success("Vault deleted!");
      setVaults((prev) => prev.filter((v) => v.id !== selectedVaultId));
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Delete failed");
    } finally {
      setShowDeleteModal(false);
      setSelectedVaultId(null);
      setSelectedVaultName("");
    }
  };

  const handleOpenVault = (id) => navigate(`/vault/${id}`);

  // Memoized aggregate stats to avoid recalculations on each render
  const totalUsedGB = useMemo(() => {
    const totalBytes = vaults.reduce((acc, v) => acc + (v.size || 0), 0);
    return (totalBytes / 1024).toFixed(2);
  }, [vaults]);

  const totalFiles = useMemo(() => 
    vaults.reduce((acc, v) => acc + (v.files || 0), 0), [vaults]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-300 border-t-cyan-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading vaults…</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Welcome{user?.name ? `, ${user.name}` : ""}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your encrypted storage vaults</p>
          </div>
          <button
            onClick={onCreateVault}
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-full transition-all transform hover:scale-105 hover:shadow-lg"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>Create Vault</span>
          </button>
        </div>

        {/* Wallet Alert */}
        {!wallet && (
          <div className="mb-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl flex gap-3 items-start">
            <Wallet className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">
                Connect Your Wallet
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Connect your wallet to use blockchain features.
              </p>
            </div>
          </div>
        )}

        {/* No Vaults */}
        {vaults.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {user?.wallet ? "No vaults found" : "No wallet connected"}
            </h3>
            {user?.wallet && (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Create your first vault to start storing encrypted files.
                </p>
                <button
                  onClick={onCreateVault}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-full transform hover:scale-105 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Vault</span>
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Vault Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vaults.map((vault, index) => (
                <div
                  key={vault.id}
                  onClick={() => handleOpenVault(vault.id)}
                  className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-300 dark:border-gray-700 shadow-xl animate-scale-in my-8 mx-auto group cursor-pointer relative overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleOpenVault(vault.id); }}
                >
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
                  {/* Shimmer hover effect */}
                  <div className="absolute inset-0 -top-full bg-gradient-to-b from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:top-full transition-all duration-1000 transform skew-y-12" />
                  <div className="relative z-10">
                    {/* Top Icons */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="w-12 h-12 flex items-center justify-center rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                        <FolderOpen className="h-6 w-6 text-cyan-500" />
                      </div>
                      <div className="flex gap-1 animate-pulse">
                        <span className="w-2 h-2 bg-green-400 rounded-full" />
                        <span className="w-2 h-2 bg-green-400/50 rounded-full" />
                        <span className="w-2 h-2 bg-green-400/25 rounded-full" />
                      </div>
                    </div>

                    {/* Vault Info */}
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                      {vault.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{vault.description}</p>

                    {/* Vault Stats */}
                    <div className="space-y-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex justify-between">
                        <div className="flex gap-2 items-center">
                          <HardDrive className="h-4 w-4" />
                          <span>{(vault.size / 1024).toFixed(2)} GB</span>
                        </div>
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full capitalize">
                          {vault.accessType || 'Private'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {vault.lastAccessed && !isNaN(Number(vault.lastAccessed))
                            ? new Date(Number(vault.lastAccessed)).toLocaleString()
                            : "recently"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {vault.files || 0} files • {vault.encryptionLevel} • Limit: {vault.storageLimit}GB
                      </div>
                    </div>

                    {/* Bottom Buttons */}
                    <div className="flex justify-between items-center">
                      <div className="group/button flex items-center space-x-3 px-4 py-2.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl transition-all duration-300 flex-1 mr-3">
                        <Eye className="h-4 w-4 text-cyan-600 group-hover/button:scale-110 transition-transform" />
                        <span className="text-sm font-medium text-cyan-700 group-hover/button:text-cyan-600">Open Vault</span>
                        <ArrowRight className="h-4 w-4 text-cyan-600 group-hover/button:translate-x-1 transition-transform" />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVaultId(vault.id);
                          setSelectedVaultName(vault.name);
                          setShowDeleteModal(true);
                        }}
                        className="p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                        title="Delete Vault"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Aggregate Stats */}
            <div className="mt-16 bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-300 dark:border-gray-700 shadow-xl">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Storage Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-cyan-500 mb-2">{totalUsedGB} GB</div>
                  <div className="text-gray-600 dark:text-gray-400">Total Used</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-500 mb-2">{totalFiles}</div>
                  <div className="text-gray-600 dark:text-gray-400">Total Files</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-teal-500 mb-2">{vaults.length}</div>
                  <div className="text-gray-600 dark:text-gray-400">Active Vaults</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-500 mb-2">99.9%</div>
                  <div className="text-gray-600 dark:text-gray-400">Uptime</div>
                </div>
              </div>
            </div>
          </>
        )}

        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          fileName={selectedVaultName}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteVault}
        />
      </div>
    </section>
  );
};

export default VaultDashboard;
