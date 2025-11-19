import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { twoFactorService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Verify2FA = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuth } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBackupCode, setIsBackupCode] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorMethod, setTwoFactorMethod] = useState('');

  useEffect(() => {
    if (!location.state || !location.state.tempToken) {
      navigate('/login');
      return;
    }

    setTempToken(location.state.tempToken);
    setTwoFactorMethod(location.state.twoFactorMethod);

    // Auto-send code for email/sms methods
    if (location.state.twoFactorMethod === 'email' || location.state.twoFactorMethod === 'sms') {
      handleSendCode();
    }
  }, [location, navigate]);

  const handleSendCode = async () => {
    try {
      await twoFactorService.send2FACode(tempToken);
      toast.success('Código enviado');
    } catch (error) {
      toast.error('Error al enviar código');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code) {
      toast.error('Por favor ingresa el código');
      return;
    }

    setLoading(true);

    try {
      const response = await twoFactorService.verify2FALogin(code, tempToken, isBackupCode);
      toast.success('Autenticación exitosa');
      await checkAuth();
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  const getMethodName = () => {
    switch (twoFactorMethod) {
      case 'totp':
        return 'Aplicación Autenticadora';
      case 'email':
        return 'Email';
      case 'sms':
        return 'SMS';
      default:
        return '2FA';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verificación de Dos Factores
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa el código de verificación de {getMethodName()}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="code" className="sr-only">
              Código de Verificación
            </label>
            <input
              id="code"
              name="code"
              type="text"
              maxLength={isBackupCode ? "8" : "6"}
              required
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center text-2xl tracking-widest sm:text-sm"
              placeholder={isBackupCode ? "12345678" : "123456"}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
            />
          </div>

          {twoFactorMethod === 'totp' && (
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => setIsBackupCode(!isBackupCode)}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                {isBackupCode ? 'Usar código de la app' : 'Usar código de respaldo'}
              </button>
            </div>
          )}

          {(twoFactorMethod === 'email' || twoFactorMethod === 'sms') && (
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={handleSendCode}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Reenviar código
              </button>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Verificar'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-gray-600 hover:text-gray-500"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Verify2FA;
