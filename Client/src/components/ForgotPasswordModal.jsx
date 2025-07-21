import React, { useState, useEffect } from 'react';
import { X, Mail, Send, Shield, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import toast, { Toaster } from 'react-hot-toast';

const ForgotPasswordModal = ({ isOpen, onClose, onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [timer, setTimer] = useState(300); // 5 minutes countdown
  const [canResend, setCanResend] = useState(false);
  const { sendOTP, verifyOTP, resetPasswordWithOTP } = useAuth();

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Timer countdown for OTP
  useEffect(() => {
    let interval = null;
    if (currentStep === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => {
          if (timer <= 1) {
            setCanResend(true);
            return 0;
          }
          return timer - 1;
        });
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [currentStep, timer]);

  if (!isOpen) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      await sendOTP(email.trim());
      toast.success('OTP sent to your email!');
      setCurrentStep(2);
      setTimer(300); // Reset timer to 5 minutes
      setCanResend(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      await verifyOTP(email, otpString);
      toast.success('OTP verified successfully!');
      setCurrentStep(3);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword.trim()) {
      toast.error('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const otpString = otp.join('');
      await resetPasswordWithOTP(email, otpString, newPassword);
      toast.success('Password reset successfully!');
      
      // Close modal and redirect to login after a short delay
      setTimeout(() => {
        handleClose();
        onBackToLogin();
      }, 1500);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      await sendOTP(email);
      toast.success('New OTP sent to your email!');
      setTimer(300);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']); // Clear previous OTP
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setOtp(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
    setCurrentStep(1);
    setTimer(300);
    setCanResend(false);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleBackToLogin = () => {
    handleClose();
    onBackToLogin();
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="mb-8">
              <button
                onClick={handleBackToLogin}
                className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300 mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Sign In</span>
              </button>
              
              <h1 className="text-2xl font-bold text-white mb-2">
                Forgot Password?
              </h1>
              <p className="text-gray-400 text-sm">
                Enter your email and we'll send you a 6-digit OTP to reset your password.
              </p>
            </div>

            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-300"
                    placeholder="Enter your email address"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Send OTP</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        );

      case 2:
        return (
          <>
            <div className="mb-8">
              <button
                onClick={handleBackStep}
                className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300 mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              
              <h1 className="text-2xl font-bold text-white mb-2">
                Enter OTP
              </h1>
              <p className="text-gray-400 text-sm">
                We've sent a 6-digit OTP to <strong className="text-white">{email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Enter 6-digit OTP
                </label>
                <div className="flex justify-center space-x-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-bold bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white transition-all duration-300"
                      disabled={isLoading}
                    />
                  ))}
                </div>
              </div>

              {/* Timer and Resend */}
              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-gray-400 text-sm">
                    OTP expires in <span className="text-cyan-400 font-medium">{formatTime(timer)}</span>
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-red-400 text-sm">OTP has expired</p>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors duration-300"
                    >
                      Resend OTP
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || otp.join('').length !== 6}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      <span>Verify OTP</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Resend OTP Button */}
            {canResend && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors duration-300"
                >
                  Didn't receive OTP? Resend
                </button>
              </div>
            )}
          </>
        );

      case 3:
        return (
          <>
            <div className="mb-8">
              <button
                onClick={handleBackStep}
                className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300 mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              
              <h1 className="text-2xl font-bold text-white mb-2">
                Set New Password
              </h1>
              <p className="text-gray-400 text-sm">
                Create a strong password for your account.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-300"
                    placeholder="Enter new password (min 6 characters)"
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Password must be at least 6 characters long
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-300"
                    placeholder="Confirm your new password"
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || newPassword.length < 6 || newPassword !== confirmPassword}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      <span>Reset Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        );

      default:
        return null;
    }
  };
return (
  <div 
    className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto"
    onClick={handleBackdropClick}
  >
    <div className="relative">
      {/* 🔆 Shimmer Background Layers */}
      <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/10 via-white/5 to-blue-500/10 rounded-3xl blur-2xl animate-pulse" />
      <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400/10 via-gray-900/10 to-blue-400/10 rounded-3xl blur-xl animate-pulse delay-100" />

      {/* 🔒 Modal Content */}
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-300 dark:border-gray-700 shadow-xl animate-scale-in my-8 mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-cyan-400" />
            <span className="text-xl font-bold text-white">D-Vault</span>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-700/50 rounded-lg transition-all duration-300 group"
          >
            <X className="h-5 w-5 text-gray-400 group-hover:text-white" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  step <= currentStep
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-12 h-1 mx-2 transition-all duration-300 ${
                    step < currentStep ? 'bg-cyan-500' : 'bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        {renderStepContent()}

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Remember your password?{' '}
            <button
              onClick={handleBackToLogin}
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-300"
            >
              Sign in instead
            </button>
          </p>
        </div>

        {/* Security Badge */}
        <div className="mt-6 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-4 w-4 text-cyan-400" />
            <span className="text-xs text-cyan-300 font-medium">
              🔒 Your security is our priority
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

};

export default ForgotPasswordModal;