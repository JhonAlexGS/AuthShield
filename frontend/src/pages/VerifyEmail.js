import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../services/api';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    try {
      const response = await authService.verifyEmail(token);
      setStatus('success');
      setMessage(response.message);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Error al verificar email');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Verificando email...
              </h2>
            </>
          )}

          {status === 'success' && (
            <>
              <svg
                className="mx-auto h-12 w-12 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                ¡Email verificado!
              </h2>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
              <div className="mt-6">
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Iniciar Sesión
                </Link>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <svg
                className="mx-auto h-12 w-12 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Error en la verificación
              </h2>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
              <div className="mt-6 space-y-2">
                <Link
                  to="/login"
                  className="block text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
