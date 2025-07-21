const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verify,
  connectWallet,
  updateWallet,
  sendOTP,
  verifyOTP,
 resetPasswordWithOTP ,
} = require('../controllers/authController');

const protect = require('../middleware/authMiddleware');


router.post('/register', register);
router.post('/login', login);


router.post('/send-otp', sendOTP);                     // matches sendOTP
router.post('/verify-otp', verifyOTP);                 // matches verifyOTP
router.post('/reset-password-otp', resetPasswordWithOTP); // matches resetPasswordWithOTP


router.get('/verify', protect, verify);
router.post('/connect-wallet', protect, connectWallet);
router.put('/updateWallet', protect, updateWallet);

module.exports = router;
