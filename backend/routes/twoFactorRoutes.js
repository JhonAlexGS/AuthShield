const express = require('express');
const router = express.Router();
const {
  setupTOTP,
  verifyTOTP,
  setupEmail2FA,
  verifyEmail2FA,
  setupSMS2FA,
  verifySMS2FA,
  verify2FALogin,
  send2FACode,
  disable2FA
} = require('../controllers/twoFactorController');
const { protect } = require('../middleware/auth');
const {
  validate2FASetup,
  validate2FAVerification,
  validatePhoneNumber
} = require('../middleware/validation');
const { twoFactorLimiter } = require('../middleware/rateLimiter');

// Setup routes (protected)
router.post('/setup/totp', protect, setupTOTP);
router.post('/verify/totp', protect, validate2FAVerification, verifyTOTP);

router.post('/setup/email', protect, twoFactorLimiter, setupEmail2FA);
router.post('/verify/email', protect, validate2FAVerification, verifyEmail2FA);

router.post('/setup/sms', protect, validatePhoneNumber, twoFactorLimiter, setupSMS2FA);
router.post('/verify/sms', protect, validate2FAVerification, verifySMS2FA);

// Login verification routes (public)
router.post('/verify-login', twoFactorLimiter, validate2FAVerification, verify2FALogin);
router.post('/send-code', twoFactorLimiter, send2FACode);

// Disable 2FA (protected)
router.post('/disable', protect, disable2FA);

module.exports = router;
