const crypto = require('crypto');
const User = require('../models/User');
const JWTService = require('../utils/jwtService');
const TOTPService = require('../services/totpService');
const sendEmail = require('../services/emailService');
const sendSMS = require('../services/smsService');

// @desc    Setup 2FA (TOTP - Google Authenticator)
// @route   POST /api/2fa/setup/totp
// @access  Private
exports.setupTOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+totpSecret');

    if (user.twoFactorEnabled && user.twoFactorMethod === 'totp') {
      return res.status(400).json({
        success: false,
        message: 'TOTP ya está configurado'
      });
    }

    // Generate secret
    const { secret, otpauthUrl } = TOTPService.generateSecret(user.email);

    // Generate QR code
    const qrCode = await TOTPService.generateQRCode(otpauthUrl);

    // Save secret temporarily (not enabled yet)
    user.totpSecret = secret;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: {
        secret,
        qrCode
      },
      message: 'Escanea el código QR con Google Authenticator y verifica con el código generado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// @desc    Verify and enable TOTP
// @route   POST /api/2fa/verify/totp
// @access  Private
exports.verifyTOTP = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user.id).select('+totpSecret');

    if (!user.totpSecret) {
      return res.status(400).json({
        success: false,
        message: 'TOTP no configurado. Por favor configura primero.'
      });
    }

    // Verify TOTP code
    const isValid = TOTPService.verifyToken(code, user.totpSecret);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido'
      });
    }

    // Generate backup codes
    const backupCodes = TOTPService.generateBackupCodes();

    // Enable 2FA
    user.twoFactorEnabled = true;
    user.twoFactorMethod = 'totp';
    user.totpBackupCodes = backupCodes;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'TOTP habilitado correctamente',
      data: {
        backupCodes: backupCodes.map(bc => bc.code)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// @desc    Setup 2FA Email
// @route   POST /api/2fa/setup/email
// @access  Private
exports.setupEmail2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Por favor verifica tu email primero'
      });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash and save code
    user.emailTwoFactorCode = crypto.createHash('sha256').update(code).digest('hex');
    user.emailTwoFactorExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Send email
    const message = `
      <h1>Configuración de Autenticación de Dos Factores</h1>
      <p>Hola ${user.name},</p>
      <p>Tu código de verificación es:</p>
      <h2 style="color: #007bff; letter-spacing: 5px;">${code}</h2>
      <p>Este código expirará en 10 minutos.</p>
      <p>Si no solicitaste esto, puedes ignorar este email.</p>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Código de Verificación 2FA - SecureAuth',
      message
    });

    res.status(200).json({
      success: true,
      message: 'Código de verificación enviado a tu email'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// @desc    Verify and enable Email 2FA
// @route   POST /api/2fa/verify/email
// @access  Private
exports.verifyEmail2FA = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.emailTwoFactorCode || !user.emailTwoFactorExpire) {
      return res.status(400).json({
        success: false,
        message: 'No hay código pendiente. Por favor solicita uno nuevo.'
      });
    }

    // Check if code expired
    if (user.emailTwoFactorExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Código expirado. Por favor solicita uno nuevo.'
      });
    }

    // Hash provided code
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    if (hashedCode !== user.emailTwoFactorCode) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido'
      });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    user.twoFactorMethod = 'email';
    user.emailTwoFactorCode = undefined;
    user.emailTwoFactorExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Autenticación por email habilitada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// @desc    Setup 2FA SMS
// @route   POST /api/2fa/setup/sms
// @access  Private
exports.setupSMS2FA = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const user = await User.findById(req.user.id);

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash and save code
    user.phoneNumber = phoneNumber;
    user.smsTwoFactorCode = crypto.createHash('sha256').update(code).digest('hex');
    user.smsTwoFactorExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Send SMS
    const message = `Tu código de verificación SecureAuth es: ${code}. Expira en 10 minutos.`;
    await sendSMS(phoneNumber, message);

    res.status(200).json({
      success: true,
      message: 'Código de verificación enviado a tu teléfono'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// @desc    Verify and enable SMS 2FA
// @route   POST /api/2fa/verify/sms
// @access  Private
exports.verifySMS2FA = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.smsTwoFactorCode || !user.smsTwoFactorExpire) {
      return res.status(400).json({
        success: false,
        message: 'No hay código pendiente. Por favor solicita uno nuevo.'
      });
    }

    // Check if code expired
    if (user.smsTwoFactorExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Código expirado. Por favor solicita uno nuevo.'
      });
    }

    // Hash provided code
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    if (hashedCode !== user.smsTwoFactorCode) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido'
      });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    user.twoFactorMethod = 'sms';
    user.smsTwoFactorCode = undefined;
    user.smsTwoFactorExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Autenticación por SMS habilitada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// @desc    Verify 2FA during login
// @route   POST /api/2fa/verify-login
// @access  Public (requires tempToken)
exports.verify2FALogin = async (req, res) => {
  try {
    const { code, tempToken, isBackupCode } = req.body;

    if (!tempToken) {
      return res.status(400).json({
        success: false,
        message: 'Token temporal requerido'
      });
    }

    // Verify temp token
    const decoded = JWTService.verifyAccessToken(tempToken);
    const user = await User.findById(decoded.id).select('+totpSecret');

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Usuario no encontrado o 2FA no habilitado'
      });
    }

    let isValid = false;

    // Verify based on method
    switch (user.twoFactorMethod) {
      case 'totp':
        if (isBackupCode) {
          // Verify backup code
          isValid = TOTPService.verifyBackupCode(user.totpBackupCodes, code);
          if (isValid) {
            user.totpBackupCodes = TOTPService.markBackupCodeAsUsed(user.totpBackupCodes, code);
            await user.save({ validateBeforeSave: false });
          }
        } else {
          // Verify TOTP
          isValid = TOTPService.verifyToken(code, user.totpSecret);
        }
        break;

      case 'email':
        if (!user.emailTwoFactorCode || user.emailTwoFactorExpire < Date.now()) {
          return res.status(400).json({
            success: false,
            message: 'Código expirado. Por favor solicita uno nuevo.'
          });
        }
        const hashedEmailCode = crypto.createHash('sha256').update(code).digest('hex');
        isValid = hashedEmailCode === user.emailTwoFactorCode;
        if (isValid) {
          user.emailTwoFactorCode = undefined;
          user.emailTwoFactorExpire = undefined;
          await user.save({ validateBeforeSave: false });
        }
        break;

      case 'sms':
        if (!user.smsTwoFactorCode || user.smsTwoFactorExpire < Date.now()) {
          return res.status(400).json({
            success: false,
            message: 'Código expirado. Por favor solicita uno nuevo.'
          });
        }
        const hashedSMSCode = crypto.createHash('sha256').update(code).digest('hex');
        isValid = hashedSMSCode === user.smsTwoFactorCode;
        if (isValid) {
          user.smsTwoFactorCode = undefined;
          user.smsTwoFactorExpire = undefined;
          await user.save({ validateBeforeSave: false });
        }
        break;
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido'
      });
    }

    // Generate real tokens
    const accessToken = JWTService.generateAccessToken(user._id);
    const refreshToken = JWTService.generateRefreshToken(user._id);

    // Save tokens
    await JWTService.saveToken(user._id, accessToken, 'access');
    await JWTService.saveToken(user._id, refreshToken, 'refresh');

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          twoFactorEnabled: user.twoFactorEnabled
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// @desc    Send 2FA code during login
// @route   POST /api/2fa/send-code
// @access  Public (requires tempToken)
exports.send2FACode = async (req, res) => {
  try {
    const { tempToken } = req.body;

    if (!tempToken) {
      return res.status(400).json({
        success: false,
        message: 'Token temporal requerido'
      });
    }

    // Verify temp token
    const decoded = JWTService.verifyAccessToken(tempToken);
    const user = await User.findById(decoded.id);

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Usuario no encontrado o 2FA no habilitado'
      });
    }

    // Generate code based on method
    if (user.twoFactorMethod === 'email') {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.emailTwoFactorCode = crypto.createHash('sha256').update(code).digest('hex');
      user.emailTwoFactorExpire = Date.now() + 10 * 60 * 1000;
      await user.save({ validateBeforeSave: false });

      const message = `
        <h1>Código de Autenticación</h1>
        <p>Hola ${user.name},</p>
        <p>Tu código de verificación es:</p>
        <h2 style="color: #007bff; letter-spacing: 5px;">${code}</h2>
        <p>Este código expirará en 10 minutos.</p>
      `;

      await sendEmail({
        email: user.email,
        subject: 'Código de Verificación - SecureAuth',
        message
      });
    } else if (user.twoFactorMethod === 'sms') {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.smsTwoFactorCode = crypto.createHash('sha256').update(code).digest('hex');
      user.smsTwoFactorExpire = Date.now() + 10 * 60 * 1000;
      await user.save({ validateBeforeSave: false });

      const message = `Tu código de verificación SecureAuth es: ${code}. Expira en 10 minutos.`;
      await sendSMS(user.phoneNumber, message);
    }

    res.status(200).json({
      success: true,
      message: 'Código enviado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// @desc    Disable 2FA
// @route   POST /api/2fa/disable
// @access  Private
exports.disable2FA = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id).select('+password +totpSecret');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña incorrecta'
      });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorMethod = 'none';
    user.totpSecret = undefined;
    user.totpBackupCodes = [];
    user.emailTwoFactorCode = undefined;
    user.emailTwoFactorExpire = undefined;
    user.smsTwoFactorCode = undefined;
    user.smsTwoFactorExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: '2FA deshabilitado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};
