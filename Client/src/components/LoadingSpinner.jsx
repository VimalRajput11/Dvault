import React from 'react';
import { Shield, Lock, Zap } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin"></div>
          
          <div className="absolute inset-0 animate-spin-slow">
            <Shield className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
            <Lock className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
            <Zap className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 h-4 w-4 text-teal-400" />
          </div>
        </div>
        
        <div className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Loading D-Vault
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          Securing your digital assets...
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;