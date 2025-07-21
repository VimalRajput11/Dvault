import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Eye, EyeOff, Mail, Lock, User, ArrowRight, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { toast } from 'react-hot-toast';

const validatePassword = (password) => {
  if (password.length < 6) return 'Password must be at least 6 characters long';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/\d/.test(password)) return 'Password must contain a number';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain a special character';
  return '';
};

const AuthModal = ({ isOpen, onClose, mode, onSwitchMode, onShowForgotPassword }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordWarning, setPasswordWarning] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => (document.body.style.overflow = 'unset');
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'password' && mode === 'register') {
      setPasswordWarning(validatePassword(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setPasswordWarning('');

    if (mode === 'register') {
      const warning = validatePassword(formData.password);
      if (warning) {
        setPasswordWarning(warning);
        setIsLoading(false);
        return;
      }
      if (!formData.name.trim()) {
        setError('Name is required');
        setIsLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }
      if (!agreeToTerms) {
        setError('Please agree to the terms and conditions');
        setIsLoading(false);
        return;
      }
    }

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        toast.success('Logged in successfully!');
      } else {
        await register(formData.name, formData.email, formData.password);
        toast.success('Account created successfully!');
      }
      onClose();
      navigate('/dashboard');
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || err.message || '';
      if (mode === 'login') {
        if (status === 401) setError('Incorrect password');
        else if (status === 404 || message.toLowerCase().includes('user')) setError('User not found');
        else setError('Login failed. Please try again.');
      } else {
        setError(message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setError('');
    setPasswordWarning('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setRememberMe(false);
    setAgreeToTerms(false);
    onClose();
  };

  const switchToLogin = () => {
    setError('');
    setPasswordWarning('');
    onSwitchMode('login');
  };

  const switchToRegister = () => {
    setError('');
    setPasswordWarning('');
    onSwitchMode('register');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        className="group relative overflow-hidden bg-white dark:bg-gray-900
                   rounded-3xl p-6 sm:p-8 max-w-md w-full
                   border border-gray-300 dark:border-gray-700
                   shadow-xl animate-scale-in my-8 mx-auto
                   transition-all duration-500 transform
                   hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/10
                   hover:border-cyan-500/50"
      >
        {/* shimmer tint */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
        {/* sweeping light band */}
        <div className="absolute inset-0 -top-full bg-gradient-to-b from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:top-full transition-all duration-1000 transform skew-y-12" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-cyan-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">D-Vault</span>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <X className="h-5 w-5 text-gray-500 dark:text-gray-300" />
            </button>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {mode === 'login'
                ? 'Sign in to access your secure vault'
                : 'Join D-Vault and secure your digital assets'}
            </p>
          </div>

          {/* Errors */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {passwordWarning && (
            <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-800/10 border border-yellow-300 dark:border-yellow-600 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">{passwordWarning}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your name"
                    className="pl-10 pr-4 py-3 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  className="pl-10 pr-4 py-3 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Password"
                  className="pl-10 pr-12 py-3 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirm your password"
                    className="pl-10 pr-12 py-3 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' ? (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 mr-2"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={onShowForgotPassword}
                  className="text-sm text-cyan-500 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            ) : (
              <div className="flex items-start pt-1">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-4 h-4 mt-1"
                />
                <label className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  I agree to the <span className="text-cyan-500 underline">Terms</span> and <span className="text-cyan-500 underline">Privacy</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={mode === 'login' ? switchToRegister : switchToLogin}
                className="text-cyan-500 font-semibold hover:underline"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
