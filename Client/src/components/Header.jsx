import React, { useState } from 'react';
import { Shield, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';
import { useAccount, useDisconnect } from 'wagmi';
import { Web3Button } from '@web3modal/react';
import { toast } from 'react-hot-toast';

const Header = ({ onOpenAuth }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Full logout: app + wallet
  const handleLogout = () => {
    logout(); // Your app logout (AuthContext)
    disconnect(); // Disconnect wallet via wagmi
    localStorage.removeItem('walletconnect'); // Clear WalletConnect session
    toast.success('You have been logged out and wallet disconnected');
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleAuthClick = (mode) => {
    onOpenAuth ? onOpenAuth(mode) : navigate(`/${mode}`);
    closeMobileMenu();
  };

  return (
    <header className="relative z-20 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm bg-white/20 dark:bg-gray-800/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* TOP BAR */}
        <div className="flex justify-between items-center py-4 lg:py-6">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Shield className="h-8 w-8 text-cyan-500" />
              <div className="absolute inset-0 bg-cyan-400/20 blur-md rounded-full" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
              D-Vault
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            <ThemeToggle />

            {user ? (
              <div className="flex items-center space-x-4">
                {isConnected ? (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 rounded-full border border-green-200 dark:border-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-green-700 dark:text-green-400 font-medium">
                      {address.slice(0, 6)}…{address.slice(-4)}
                    </span>
                  </div>
                ) : (
                  <Web3Button />
                )}

                {/* User pill */}
                <div className="flex items-center space-x-3 px-3 py-2 bg-gray-100/50 dark:bg-gray-800/50 rounded-full border border-gray-200/50 dark:border-gray-700/50">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 group"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleAuthClick('login')}
                  className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 font-medium transition-all duration-300 relative group"
                >
                  <span className="relative z-10">Sign In</span>
                  <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button
                  onClick={() => handleAuthClick('register')}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-full text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="lg:hidden flex items-center space-x-3">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE NAV */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 space-y-4 shadow-xl">
            {user ? (
              <>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                  </div>
                </div>

                {isConnected ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">
                        Wallet Connected
                      </span>
                    </div>
                    <span className="text-xs text-green-600 dark:text-green-400 font-mono">
                      {address.slice(0, 6)}…{address.slice(-4)}
                    </span>
                  </div>
                ) : (
                  <Web3Button className="w-full p-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl text-white font-medium transition-all duration-300 shadow-lg" />
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl border border-red-200 dark:border-red-800"
                >
                  <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="font-medium text-red-600 dark:text-red-400">Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleAuthClick('login')}
                  className="w-full p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleAuthClick('register')}
                  className="w-full p-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl font-medium text-white shadow-lg"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
