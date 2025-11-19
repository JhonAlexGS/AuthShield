const jwt = require('jsonwebtoken');
const Token = require('../models/Token');

class JWTService {
  // Generate Access Token
  static generateAccessToken(userId) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
  }

  // Generate Refresh Token
  static generateRefreshToken(userId) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE }
    );
  }

  // Verify Access Token
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  // Verify Refresh Token
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error('Refresh token inválido o expirado');
    }
  }

  // Decode token without verification
  static decodeToken(token) {
    return jwt.decode(token);
  }

  // Save token to database
  static async saveToken(userId, token, type) {
    const decoded = jwt.decode(token);
    const expiresAt = new Date(decoded.exp * 1000);

    await Token.create({
      userId,
      token,
      type,
      expiresAt
    });
  }

  // Check if token is blacklisted
  static async isTokenBlacklisted(token) {
    const tokenDoc = await Token.findOne({ token, blacklisted: true });
    return !!tokenDoc;
  }

  // Blacklist token
  static async blacklistToken(token) {
    await Token.updateOne(
      { token },
      { blacklisted: true }
    );
  }

  // Blacklist all user tokens
  static async blacklistAllUserTokens(userId) {
    await Token.updateMany(
      { userId, blacklisted: false },
      { blacklisted: true }
    );
  }

  // Clean expired tokens
  static async cleanExpiredTokens() {
    await Token.deleteMany({
      expiresAt: { $lt: new Date() }
    });
  }
}

module.exports = JWTService;
