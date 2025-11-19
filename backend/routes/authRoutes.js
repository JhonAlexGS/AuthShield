const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateResetPasswordRequest,
  validateResetPassword
} = require('../middleware/validation');
const {
  loginLimiter,
  resetPasswordLimiter,
  emailVerificationLimiter
} = require('../middleware/rateLimiter');

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', 
  loginLimiter, 
  validateLogin, 
  login);
router.post('/refresh', refreshToken);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', emailVerificationLimiter, resendVerification);
router.post('/forgot-password', resetPasswordLimiter, validateResetPasswordRequest, forgotPassword);
router.put('/reset-password/:token', validateResetPassword, resetPassword);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
