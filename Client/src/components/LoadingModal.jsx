import React from 'react';
import { Shield, Lock, Zap } from 'lucide-react';

const LoadingModal = ({ isOpen, message = 'Loading...' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20 text-center animate-scale-in">
        <div className="relative mb-8">
          {/* Animated Loader */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin"></div>
            
            {/* Rotating Icons */}
            <div className="absolute inset-0 animate-spin-slow">
              <Shield className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
              <Lock className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
              <Zap className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 h-4 w-4 text-teal-400" />
            </div>
          </div>
          
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-cyan-400/20 blur-2xl rounded-full opacity-75 animate-pulse"></div>
        </div>

        <h3 className="text-xl font-semibold text-white mb-4 animate-pulse">
          {message}
        </h3>
        
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        <p className="text-gray-400 text-sm mt-4">
          Establishing secure connection...
        </p>
      </div>
    </div>
  );
};

export default LoadingModal;