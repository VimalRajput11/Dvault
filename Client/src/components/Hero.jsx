import React from 'react';
import { Shield, Lock, Zap, ArrowRight } from 'lucide-react';

const Hero = ({ onOpenAuth }) => {
  const handleGetStarted = () => {
    if (onOpenAuth) {
      onOpenAuth('register');
    }
  };

  const handleSignIn = () => {
    if (onOpenAuth) {
      onOpenAuth('login');
    }
  };

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Floating Icons */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 animate-float">
          <Shield className="h-6 w-6 text-cyan-400/30" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float-delayed">
          <Lock className="h-8 w-8 text-blue-400/30" />
        </div>
        <div className="absolute bottom-1/3 left-1/3 animate-float-slow">
          <Zap className="h-5 w-5 text-teal-400/30" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600 dark:from-white dark:via-cyan-200 dark:to-blue-200 bg-clip-text text-transparent">
              Secure Your Digital
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 bg-clip-text text-transparent">
              Assets Forever
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            D-Vault is the future of decentralized storage. Encrypt, store, and share your most valuable data with military-grade security on the blockchain.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleGetStarted}
              className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25 overflow-hidden text-white"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <span>Get Started</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            <button 
              onClick={handleSignIn}
              className="px-8 py-4 border border-gray-300 dark:border-gray-600 rounded-full font-semibold text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 text-gray-700 dark:text-gray-300"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up-delayed">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-3xl font-bold text-cyan-500 mb-2">256-bit</div>
            <div className="text-gray-600 dark:text-gray-300">Encryption Standard</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-3xl font-bold text-blue-500 mb-2">100%</div>
            <div className="text-gray-600 dark:text-gray-300">Decentralized</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-3xl font-bold text-teal-500 mb-2">Zero</div>
            <div className="text-gray-600 dark:text-gray-300">Knowledge Protocol</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;