import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { twoFactorService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import QRCode from 'react-qr-code';

const Setup2FA = ({ onClose }) => {
  const { checkAuth } = useAuth();
  const [step, setStep] = useState('select'); // select, setup, verify
  const [method, setMethod] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [backupCodes, setBackupCodes] = useState([]);
  const [code, setCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMethodSelect = async (selectedMethod) => {
    setMethod(selectedMethod);
    setLoading(true);

    try {
      if (selectedMethod === 'totp') {
        const response = await twoFactorService.setupTOTP();
        setQrCode(response.data.qrCode);
        setSecret(response.data.secret);
        setStep('setup');
        toast.info(response.message);
      } else if (selectedMethod === 'email') {
        await twoFactorService.setupEmail2FA();
        setStep('verify');
        toast.success('Código enviado a tu email');
      } else if (selectedMethod === 'sms') {
        setStep('setup');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al configurar 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleSMSSetup = async () => {
    if (!phoneNumber) {
      toast.error('Por favor ingresa tu número de teléfono');
      return;
    }

    setLoading(true);
    try {
      await twoFactorService.setupSMS2FA(phoneNumber);
      setStep('verify');
      toast.success('Código enviado a tu teléfono');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al enviar SMS');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code) {
      toast.error('Por favor ingresa el código');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (method === 'totp') {
        response = await twoFactorService.verifyTOTP(code);
        setBackupCodes(response.data.backupCodes);
      } else if (method === 'email') {
        response = await twoFactorService.verifyEmail2FA(code);
      } else if (method === 'sms') {
        response = await twoFactorService.verifySMS2FA(code);
      }

      toast.success(response.message);
      await checkAuth();
      
      if (method === 'totp' && response.data.backupCodes) {
        setStep('backup');
      } else {
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Configurar Autenticación de Dos Factores
                </h3>

                {/* Select Method */}
                {step === 'select' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 mb-4">
                      Selecciona un método de autenticación:
                    </p>
                    
                    <button
                      onClick={() => handleMethodSelect('totp')}
                      disabled={loading}
                      className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 transition-colors"
                    >
                      <div className="text-left">
                        <div className="font-medium text-gray-900">Aplicación Autenticadora (TOTP)</div>
                        <div className="text-sm text-gray-500">Google Authenticator, Authy, etc.</div>
                      </div>
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    <button
                      onClick={() => handleMethodSelect('email')}
                      disabled={loading}
                      className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 transition-colors"
                    >
                      <div className="text-left">
                        <div className="font-medium text-gray-900">Email</div>
                        <div className="text-sm text-gray-500">Recibe códigos por correo electrónico</div>
                      </div>
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    <button
                      onClick={() => handleMethodSelect('sms')}
                      disabled={loading}
                      className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 transition-colors"
                    >
                      <div className="text-left">
                        <div className="font-medium text-gray-900">SMS</div>
                        <div className="text-sm text-gray-500">Recibe códigos por mensaje de texto</div>
                      </div>
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* TOTP Setup */}
                {step === 'setup' && method === 'totp' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                      Escanea este código QR con tu aplicación autenticadora:
                    </p>
                    <div className="flex justify-center p-4 bg-white">
                      <QRCode value={qrCode} size={200} />
                    </div>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <p className="font-medium mb-1">O ingresa este código manualmente:</p>
                      <code className="text-xs break-all">{secret}</code>
                    </div>
                    <button
                      onClick={() => setStep('verify')}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                      Continuar
                    </button>
                  </div>
                )}

                {/* SMS Setup */}
                {step === 'setup' && method === 'sms' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Teléfono
                      </label>
                      <input
                        type="tel"
                        placeholder="+57 300 123 4567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Incluye el código de país (ej: +57)
                      </p>
                    </div>
                    <button
                      onClick={handleSMSSetup}
                      disabled={loading}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {loading ? 'Enviando...' : 'Enviar Código'}
                    </button>
                  </div>
                )}

                {/* Verify Code */}
                {step === 'verify' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código de Verificación
                      </label>
                      <input
                        type="text"
                        placeholder="123456"
                        maxLength="8"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center text-2xl tracking-widest"
                      />
                    </div>
                    <button
                      onClick={handleVerify}
                      disabled={loading}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {loading ? 'Verificando...' : 'Verificar'}
                    </button>
                  </div>
                )}

                {/* Backup Codes */}
                {step === 'backup' && (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            Guarda estos códigos de respaldo en un lugar seguro. Cada uno puede usarse solo una vez.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                        {backupCodes.map((code, index) => (
                          <div key={index} className="p-2 bg-white rounded border">
                            {code}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                      Finalizar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setup2FA;
