import React from 'react';
import { Shield, Github, Twitter, Mail } from 'lucide-react';

const Footer = ({ onOpenAuth }) => {
  const handleJoinDVault = () => {
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
    <footer className="relative py-20 border-t border-gray-200/50 dark:border-gray-700/50">
      <div className="absolute inset-0 bg-gradient-to-t from-gray-100/50 dark:from-slate-900/50 to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CTA Section */}
        <div className="text-center mb-16">
          <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-teal-500/10 rounded-3xl p-12 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 bg-clip-text text-transparent">
                Ready to Secure Your Future?
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust D-Vault with their most valuable digital assets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleJoinDVault}
                className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25 animate-pulse-glow text-white"
              >
                <span className="flex items-center space-x-2">
                  <span>Join D-Vault Today</span>
                  <Shield className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                </span>
              </button>
              <button 
                onClick={handleSignIn}
                className="px-8 py-4 border border-gray-300 dark:border-gray-600 rounded-full font-semibold text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 text-gray-700 dark:text-gray-300"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>

        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <Shield className="h-8 w-8 text-cyan-500" />
                <div className="absolute inset-0 bg-cyan-400/20 blur-md rounded-full"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                D-Vault
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              The future of decentralized storage. Secure, private, and completely under your control.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-all duration-300 group">
                <Github className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              </a>
              <a href="#" className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-all duration-300 group">
                <Twitter className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-cyan-500" />
              </a>
              <a href="#" className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-all duration-300 group">
                <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-500" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-cyan-500 transition-colors duration-300">Features</a></li>
              <li><a href="#" className="hover:text-cyan-500 transition-colors duration-300">Security</a></li>
              <li><a href="#" className="hover:text-cyan-500 transition-colors duration-300">Pricing</a></li>
              <li><a href="#" className="hover:text-cyan-500 transition-colors duration-300">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-cyan-500 transition-colors duration-300">About</a></li>
              <li><a href="#" className="hover:text-cyan-500 transition-colors duration-300">Blog</a></li>
              <li><a href="#" className="hover:text-cyan-500 transition-colors duration-300">Careers</a></li>
              <li><a href="#" className="hover:text-cyan-500 transition-colors duration-300">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 D-Vault. Built with privacy and security in mind.
          </p>
          <div className="flex space-x-6 text-sm text-gray-600 dark:text-gray-400">
            <a href="#" className="hover:text-cyan-500 transition-colors duration-300">Privacy Policy</a>
            <a href="#" className="hover:text-cyan-500 transition-colors duration-300">Terms of Service</a>
            <a href="#" className="hover:text-cyan-500 transition-colors duration-300">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;