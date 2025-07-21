import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Header from '../components/Header.jsx';
import Hero from '../components/Hero.jsx';
import Features from '../components/Features.jsx';
import Footer from '../components/Footer.jsx';
import AuthModal from '../components/AuthModal.jsx';
import ForgotPasswordModal from '../components/ForgotPasswordModal.jsx';
import ConnectWalletModal from '../components/ConnectWalletModal.jsx'; // ✅

const LandingPage = () => {
  const { token } = useParams();

  // 🟡 Auth modal state
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(!!token);

  // 🟢 Wallet modal state
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // ✅ Open auth modal with mode
  const openAuthModal = (mode = 'login') => {
    setAuthModal({ isOpen: true, mode });
    setShowForgotPassword(false);
    setShowResetPassword(false);
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: 'login' });
  };

  const switchAuthMode = (mode) => {
    setAuthModal({ isOpen: true, mode });
  };

  const handleForgotPassword = () => {
    setAuthModal({ isOpen: false, mode: 'login' });
    setShowForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setAuthModal({ isOpen: true, mode: 'login' });
  };

  useEffect(() => {
    if (token) {
      setShowResetPassword(true);
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-blue-900 dark:to-cyan-900 opacity-90"></div>
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23000000%22 fill-opacity=%220.02%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] dark:bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.02%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>

      {/* Page Content */}
      <div className="relative z-10">
        <Header
          onOpenAuth={openAuthModal}
          onConnectWallet={() => setIsWalletModalOpen(true)} // ✅ pass wallet open function
        />
        <Hero onOpenAuth={openAuthModal} />
        <Features />
        <Footer onOpenAuth={openAuthModal} />
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        mode={authModal.mode}
        onSwitchMode={switchAuthMode}
        onShowForgotPassword={handleForgotPassword}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onBackToLogin={handleBackToLogin}
      />

      {/* ✅ Wallet Connect Modal */}
      <ConnectWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </div>
  );
};

export default LandingPage;
