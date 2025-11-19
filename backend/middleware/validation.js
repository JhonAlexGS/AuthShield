const { body, validationResult } = require('express-validator');

// Handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// Validate registration
exports.validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Por favor ingrese un email válido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'),
  
  exports.handleValidationErrors
];

// Validate login
exports.validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Por favor ingrese un email válido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('La contraseña es requerida'),
  
  exports.handleValidationErrors
];

// Validate password reset request
exports.validateResetPasswordRequest = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Por favor ingrese un email válido')
    .normalizeEmail(),
  
  exports.handleValidationErrors
];

// Validate password reset
exports.validateResetPassword = [
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'),
  
  exports.handleValidationErrors
];

// Validate 2FA setup
exports.validate2FASetup = [
  body('method')
    .notEmpty().withMessage('El método 2FA es requerido')
    .isIn(['totp', 'email', 'sms']).withMessage('Método 2FA inválido'),
  
  exports.handleValidationErrors
];

// Validate 2FA verification
exports.validate2FAVerification = [
  body('code')
    .notEmpty().withMessage('El código es requerido')
    .isLength({ min: 6, max: 8 }).withMessage('El código debe tener entre 6 y 8 caracteres'),
  
  exports.handleValidationErrors
];

// Validate phone number
exports.validatePhoneNumber = [
  body('phoneNumber')
    .notEmpty().withMessage('El número de teléfono es requerido')
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Por favor ingrese un número de teléfono válido'),
  
  exports.handleValidationErrors
];
