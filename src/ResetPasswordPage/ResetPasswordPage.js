import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [message, setMessage] = useState(''); // Definimos `message` y `setMessage`
  const [recoveryToken, setRecoveryToken] = useState(null);
  const [isTokenExpired, setIsTokenExpired] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const type = urlParams.get('type');

    console.log("Token:", token);
    console.log("Type:", type);

    if (type === 'recovery' && token) {
      setRecoveryToken(token);
    } else {
      setErrorMessage('El enlace de restablecimiento de contraseña no es válido o ha expirado.');
    }
  }, []);

  const handleVerifyToken = async (e) => {
    e.preventDefault();

    if (!email || !recoveryToken) {
      setErrorMessage('Proporciona tu correo electrónico y verifica el enlace.');
      return;
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: recoveryToken,
        type: 'recovery'
      });

      if (error) {
        if (error.message.includes("expired")) {
          setErrorMessage('El enlace de restablecimiento de contraseña ha expirado.');
          setIsTokenExpired(true);
        } else {
          setErrorMessage('El enlace de restablecimiento de contraseña no es válido o ha expirado.');
        }
      } else if (data) {
        setSuccessMessage('Token verificado. Ahora puedes cambiar tu contraseña.');
      }
    } catch (err) {
      console.error('Error al verificar el token:', err);
      setErrorMessage('Ocurrió un error. Intenta nuevamente.');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMessage('Error al actualizar la contraseña: ' + error.message);
      } else {
        setSuccessMessage('Contraseña actualizada exitosamente.');
      }
    } catch (err) {
      console.error('Error al actualizar la contraseña:', err);
      setErrorMessage('Ocurrió un error. Intenta nuevamente.');
    }
  };

  const handleRequestNewLink = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://master.du5bvw1goxlgn.amplifyapp.com/reset-password'
      });

      if (error) {
        setErrorMessage(`Error al solicitar un nuevo enlace: ${error.message}`);
      } else {
        setMessage('Se ha enviado un nuevo enlace de restablecimiento a tu correo electrónico.');
        setIsTokenExpired(false);
      }
    } catch (err) {
      setErrorMessage('Error al solicitar un nuevo enlace. Intenta nuevamente.');
    }
  };

  return (
    <div>
      <h2>Cambiar Contraseña</h2>
      {errorMessage && <div>{errorMessage}</div>}
      {successMessage && <div>{successMessage}</div>}
      {message && <p>{message}</p>} {/* Mostrar mensaje si existe */}
      {!isTokenExpired ? (
        <form onSubmit={handleVerifyToken}>
          <label>Correo Electrónico:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Verificar Enlace de Recuperación</button>
        </form>
      ) : (
        <div>
          <p>Tu enlace de restablecimiento ha expirado. Solicita uno nuevo a continuación.</p>
          <button onClick={handleRequestNewLink}>Solicitar Nuevo Enlace</button>
        </div>
      )}
      {successMessage && (
        <form onSubmit={handlePasswordUpdate}>
          <label>Nueva Contraseña:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <button type="submit">Actualizar Contraseña</button>
        </form>
      )}
    </div>
  );
}

export default ResetPasswordPage;