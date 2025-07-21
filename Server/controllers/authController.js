const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already used' });

  const user = await User.create({ name, email, password });
  const token = signToken(user._id);
  res.status(201).json({ token, user: { _id: user._id, name: user.name, email: user.email } });
};

//  Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken(user._id);
  res.json({ token, user: { _id: user._id, name: user.name, email: user.email } });
};

//  Verify
exports.verify = (req, res) => {
  res.json({ user: req.user });
};


exports.connectWallet = async (req, res) => {
  const { walletAddress } = req.body;
  if (!walletAddress) return res.status(400).json({ message: 'Wallet address is required' });

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { wallet: walletAddress },
      { new: true }
    ).select('-password');

    res.status(200).json({ user });
  } catch (err) {
    console.error('Wallet connect error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.updateWallet = async (req, res) => {
  const { wallet } = req.body;
  if (!wallet) return res.status(400).json({ message: 'Wallet address is required' });

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { wallet },
      { new: true }
    ).select('-password');

    res.status(200).json({ user });
  } catch (err) {
    console.error('Update wallet error:', err);
    res.status(500).json({ message: 'Failed to update wallet address' });
  }
};


exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  user.resetOTP = otp;
  user.resetOTPExpiry = Date.now() + 5 * 60 * 1000; 
  await user.save();

  const html = `
    <html>
      <body style="font-family: sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2b6cb0;">Your OTP for Password Reset</h2>
          <p>Use the following OTP to reset your D-Vault password:</p>
          <h1 style="letter-spacing: 4px; color: #2b6cb0;">${otp}</h1>
          <p style="margin-top: 30px; color: gray;">Valid for 10 minutes. If you didn’t request this, ignore this email.</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail(user.email, 'Your OTP for Password Reset', html);
  res.json({ message: 'OTP sent to your email' });
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({
    email,
    resetOTP: otp,
    resetOTPExpiry: { $gt: Date.now() },
  });
  if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

  res.json({ message: 'OTP is valid' });
};

exports.resetPasswordWithOTP = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({
    email,
    resetOTP: otp,
    resetOTPExpiry: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

  user.password = newPassword;
  user.resetOTP = undefined;
  user.resetOTPExpiry = undefined;
  await user.save();

  res.json({ message: 'Password has been reset successfully' });
};
