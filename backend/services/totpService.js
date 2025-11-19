const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class TOTPService {
  // Generate TOTP secret
  static generateSecret(email) {
    const secret = speakeasy.generateSecret({
      name: `SecureAuth (${email})`,
      length: 32
    });
    
    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url
    };
  }

  // Generate QR Code
  static async generateQRCode(otpauthUrl) {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl);
      return qrCodeDataURL;
    } catch (error) {
      throw new Error('Error al generar código QR');
    }
  }

  // Verify TOTP token
  static verifyToken(token, secret) {
    const window = parseInt(process.env.TOTP_WINDOW) || 2;
    
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: window
    });
  }

  // Generate backup codes
  static generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = speakeasy.generateSecret({ length: 10 }).base32.substring(0, 8);
      codes.push({
        code: code,
        used: false
      });
    }
    return codes;
  }

  // Verify backup code
  static verifyBackupCode(backupCodes, code) {
    const backupCode = backupCodes.find(bc => bc.code === code && !bc.used);
    return !!backupCode;
  }

  // Mark backup code as used
  static markBackupCodeAsUsed(backupCodes, code) {
    const backupCode = backupCodes.find(bc => bc.code === code);
    if (backupCode) {
      backupCode.used = true;
    }
    return backupCodes;
  }
}

module.exports = TOTPService;
