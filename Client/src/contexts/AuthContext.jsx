import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ✅ Add token to every request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Auth API
const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  verifyToken: () => api.get('/auth/verify'),
  connectWallet: (walletAddress) => api.post('/auth/connect-wallet', { walletAddress }),
  updateWallet: (walletAddress) => api.put('/auth/updateWallet', { wallet: walletAddress }),

  // ✅ OTP-based Password Reset
  sendOTP: (email) => api.post('/auth/send-otp', { email }),
  verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  resetPasswordWithOTP: (email, otp, newPassword) =>
    api.post('/auth/reset-password-otp', { email, otp, newPassword }),
};

// ✅ Create context
const AuthContext = createContext(undefined);

// ✅ Hook to use context
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

// ✅ Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return setIsLoading(false);

    authAPI
      .verifyToken()
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login(email, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const register = async (name, email, password) => {
    const { data } = await authAPI.register(name, email, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const connectWallet = async (walletAddress) => {
    const { data } = await authAPI.connectWallet(walletAddress);
    setUser(data.user);
  };

  const updateWallet = async (walletAddress) => {
    const { data } = await authAPI.updateWallet(walletAddress);
    setUser(data.user);
  };

  // ✅ OTP Password Reset Functions
  const sendOTP = async (email) => {
    const { data } = await authAPI.sendOTP(email);
    return data;
  };

  const verifyOTP = async (email, otp) => {
    const { data } = await authAPI.verifyOTP(email, otp);
    return data;
  };

  const resetPasswordWithOTP = async (email, otp, newPassword) => {
    const { data } = await authAPI.resetPasswordWithOTP(email, otp, newPassword);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        login,
        register,
        logout,
        connectWallet,
        updateWallet,
        sendOTP,
        verifyOTP,
        resetPasswordWithOTP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
