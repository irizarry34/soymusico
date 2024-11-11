import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [recoveryToken, setRecoveryToken] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

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
      setErrorMessage('Por favor, proporciona tu correo electrónico y asegúrate de que el enlace es válido.');
      return;
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: recoveryToken,
        type: 'recovery',
      });

      if (error) {
        console.error("Error de verificación:", error.message);
        setErrorMessage('El enlace de restablecimiento de contraseña no es válido o ha expirado.');
      } else if (data && data.session) {
        await supabase.auth.setSession(data.session);
        setIsVerified(true); // Permite que el usuario cambie la contraseña
        setSuccessMessage('Ahora puedes cambiar tu contraseña.');
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

  return (
    <div>
      <h2>Cambiar Contraseña</h2>
      {errorMessage && <div>{errorMessage}</div>}
      {successMessage && <div>{successMessage}</div>}
      {!isVerified ? (
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