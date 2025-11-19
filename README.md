# Sistema de Autenticación Seguro

Sistema completo de autenticación con Node.js, Express, MongoDB, React y JWT que implementa autenticación de dos factores (2FA), recuperación de contraseña, verificación de email, rate limiting y todas las mejores prácticas de seguridad.

## 🚀 Características

### Backend
- ✅ **Autenticación JWT** con tokens de acceso y refresh
- ✅ **2FA Multi-método**: TOTP (Google Authenticator), Email y SMS
- ✅ **Blacklist de Tokens** para logout seguro
- ✅ **Rate Limiting** (5 intentos de login)
- ✅ **Verificación de Email**
- ✅ **Recuperación de Contraseña**
- ✅ **Roles y Permisos** (user, admin, moderator)
- ✅ **Políticas de Contraseñas** robustas
- ✅ **Protección contra ataques**: XSS, NoSQL Injection, HPP
- ✅ **Encriptación de Contraseñas** con bcrypt
- ✅ **Arquitectura MVC**

### Frontend
- ✅ **React 18** con React Router
- ✅ **Tailwind CSS** para estilos
- ✅ **Refresh Token Automático**
- ✅ **Interfaz completa** para todas las funcionalidades
- ✅ **Notificaciones** con react-toastify
- ✅ **QR Codes** para TOTP
- ✅ **Responsive Design**

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- MongoDB (v4.4 o superior)
- npm o yarn
- Cuenta de Gmail para envío de emails (o servicio SMTP)
- Cuenta de Twilio para SMS (opcional)

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd secure-auth-system
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Copiar el archivo `.env.example` a `.env` y configurar las variables:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/secure-auth-db

# JWT
JWT_SECRET=tu_clave_secreta_super_segura_cambiala_en_produccion
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=tu_clave_refresh_super_segura_cambiala_en_produccion
JWT_REFRESH_EXPIRE=7d

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_password_de_aplicacion
EMAIL_FROM=noreply@tuapp.com

# Twilio (SMS) - Opcional
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Client URL
CLIENT_URL=http://localhost:3000

# Rate Limiting
MAX_LOGIN_ATTEMPTS=5
LOGIN_ATTEMPTS_WINDOW=15

# 2FA
TOTP_WINDOW=2
```

#### Configuración de Gmail para envío de emails:

1. Habilitar verificación en dos pasos en tu cuenta de Gmail
2. Generar una "Contraseña de aplicación":
   - Ir a https://myaccount.google.com/security
   - Seleccionar "Contraseñas de aplicaciones"
   - Generar una nueva contraseña
   - Usar esa contraseña en `EMAIL_PASSWORD`

### 3. Configurar Frontend

```bash
cd ../frontend
npm install
```

Copiar el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

El archivo `.env` debe contener:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚀 Ejecución

### Iniciar MongoDB

```bash
# Asegúrate de que MongoDB esté corriendo
mongod
```

### Iniciar Backend

```bash
cd backend
npm run dev
# El servidor estará en http://localhost:5000
```

### Iniciar Frontend

```bash
cd frontend
npm start
# La aplicación estará en http://localhost:3000
```

## 📚 Uso del Sistema

### 1. Registro de Usuario

1. Ir a http://localhost:3000/register
2. Completar el formulario con:
   - Nombre completo
   - Email válido
   - Contraseña (mínimo 8 caracteres, con mayúsculas, minúsculas, números y caracteres especiales)
3. Revisar email para verificar cuenta

### 2. Verificación de Email

1. Revisar tu email
2. Hacer clic en el enlace de verificación
3. Serás redirigido a la página de login

### 3. Inicio de Sesión

1. Ir a http://localhost:3000/login
2. Ingresar email y contraseña
3. Si tienes 2FA habilitado, ingresa el código correspondiente

### 4. Configurar 2FA

Desde el Dashboard, puedes configurar tres tipos de 2FA:

#### TOTP (Google Authenticator)
1. Clic en "Configurar" en la sección de 2FA
2. Seleccionar "Aplicación Autenticadora"
3. Escanear el código QR con tu app (Google Authenticator, Authy, etc.)
4. Ingresar el código de 6 dígitos generado
5. Guardar los códigos de respaldo en un lugar seguro

#### Email
1. Clic en "Configurar" en la sección de 2FA
2. Seleccionar "Email"
3. Revisar tu email y copiar el código
4. Ingresar el código en la aplicación

#### SMS
1. Clic en "Configurar" en la sección de 2FA
2. Seleccionar "SMS"
3. Ingresar tu número de teléfono con código de país (+57 para Colombia)
4. Revisar el SMS y copiar el código
5. Ingresar el código en la aplicación

### 5. Recuperación de Contraseña

1. En la página de login, clic en "¿Olvidaste tu contraseña?"
2. Ingresar tu email
3. Revisar el email con el enlace de recuperación
4. Hacer clic en el enlace e ingresar nueva contraseña

## 🔐 Seguridad

### Medidas Implementadas

1. **Encriptación de Contraseñas**: bcrypt con salt de 10 rondas
2. **JWT Tokens**: Access tokens (15min) y Refresh tokens (7 días)
3. **Blacklist de Tokens**: Tokens invalidados en logout
4. **Rate Limiting**: 
   - Login: 5 intentos en 15 minutos
   - Recuperación de contraseña: 3 intentos por hora
   - Verificación de email: 3 intentos por hora
   - Códigos 2FA: 5 intentos en 15 minutos
5. **Bloqueo de Cuenta**: Después de 5 intentos fallidos por 15 minutos
6. **Validación de Datos**: express-validator
7. **Protección XSS**: xss-clean
8. **NoSQL Injection**: express-mongo-sanitize
9. **HTTP Parameter Pollution**: hpp
10. **Headers de Seguridad**: helmet

### Políticas de Contraseñas

Las contraseñas deben:
- Tener mínimo 8 caracteres
- Contener al menos una mayúscula
- Contener al menos una minúscula
- Contener al menos un número
- Contener al menos un carácter especial (@$!%*?&)

## 📁 Estructura del Proyecto

```
secure-auth-system/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── twoFactorController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── rateLimiter.js
│   │   └── validation.js
│   ├── models/
│   │   ├── User.js
│   │   └── Token.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── twoFactorRoutes.js
│   ├── services/
│   │   ├── emailService.js
│   │   ├── smsService.js
│   │   └── totpService.js
│   ├── utils/
│   │   └── jwtService.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProtectedRoute.js
│   │   │   └── Setup2FA.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── ForgotPassword.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── ResetPassword.js
│   │   │   ├── Verify2FA.js
│   │   │   └── VerifyEmail.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── postcss.config.js
│   └── tailwind.config.js
└── README.md
```

## 🌐 API Endpoints

### Autenticación

- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión (requiere auth)
- `POST /api/auth/refresh` - Refrescar access token
- `GET /api/auth/verify-email/:token` - Verificar email
- `POST /api/auth/resend-verification` - Reenviar email de verificación
- `POST /api/auth/forgot-password` - Solicitar recuperación de contraseña
- `PUT /api/auth/reset-password/:token` - Restablecer contraseña
- `GET /api/auth/me` - Obtener usuario actual (requiere auth)

### 2FA

- `POST /api/2fa/setup/totp` - Configurar TOTP (requiere auth)
- `POST /api/2fa/verify/totp` - Verificar y activar TOTP (requiere auth)
- `POST /api/2fa/setup/email` - Configurar Email 2FA (requiere auth)
- `POST /api/2fa/verify/email` - Verificar y activar Email 2FA (requiere auth)
- `POST /api/2fa/setup/sms` - Configurar SMS 2FA (requiere auth)
- `POST /api/2fa/verify/sms` - Verificar y activar SMS 2FA (requiere auth)
- `POST /api/2fa/verify-login` - Verificar 2FA durante login
- `POST /api/2fa/send-code` - Enviar código 2FA
- `POST /api/2fa/disable` - Deshabilitar 2FA (requiere auth)

## 🧪 Testing

### Probar con Postman o Insomnia

1. Importar la colección de endpoints
2. Registrar un usuario
3. Verificar email
4. Hacer login
5. Configurar 2FA
6. Probar refresh token
7. Hacer logout

### Escenarios de Prueba

1. **Registro exitoso**: Usuario recibe email de verificación
2. **Login sin verificar email**: Debe permitir login pero mostrar estado
3. **5 intentos fallidos de login**: Cuenta bloqueada por 15 minutos
4. **Configurar TOTP**: QR funcional con Google Authenticator
5. **Login con 2FA**: Requiere código adicional
6. **Usar código de respaldo TOTP**: Válido una sola vez
7. **Refresh token**: Genera nuevo access token
8. **Logout**: Token agregado a blacklist
9. **Recuperación de contraseña**: Email con enlace válido 30 minutos

## 🐛 Solución de Problemas

### MongoDB no conecta
```bash
# Verificar que MongoDB esté corriendo
sudo service mongodb status

# Iniciar MongoDB
sudo service mongodb start
```

### Email no se envía
- Verificar credenciales de Gmail en `.env`
- Asegurarse de usar contraseña de aplicación (no tu contraseña normal)
- Verificar que la verificación en dos pasos esté habilitada

### SMS no se envía
- Verificar credenciales de Twilio
- Verificar saldo en cuenta de Twilio
- Verificar formato de número de teléfono (+código_país número)

### Frontend no se conecta al backend
- Verificar que el backend esté corriendo en puerto 5000
- Verificar `REACT_APP_API_URL` en `.env` del frontend
- Verificar CORS en el backend

## 📝 Notas Importantes

1. **Producción**: Cambiar todas las claves secretas en `.env`
2. **HTTPS**: Usar HTTPS en producción
3. **Variables de Entorno**: Nunca subir archivos `.env` a repositorios públicos
4. **MongoDB**: Configurar autenticación en producción
5. **Rate Limiting**: Ajustar según necesidades de tu aplicación
6. **Códigos de Respaldo**: Informar a usuarios que los guarden de forma segura

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👤 Autor

Tu Nombre - [Tu Email]

## 🙏 Agradecimientos

- Express.js
- React
- MongoDB
- Tailwind CSS
- JWT
- Speakeasy (TOTP)
- Twilio (SMS)
- Nodemailer

---

**Nota**: Este es un proyecto de demostración. Para uso en producción, asegúrate de realizar pruebas exhaustivas de seguridad y cumplir con las regulaciones de privacidad aplicables (GDPR, CCPA, etc.).
