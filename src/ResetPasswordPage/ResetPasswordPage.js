import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [recoveryToken, setRecoveryToken] = useState(null);

  useEffect(() => {
    // Captura el token y el tipo desde los parámetros de consulta
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const type = urlParams.get('type');

    // Verifica si tenemos un token y un tipo válido
    if (type === 'recovery' && token) {
      setRecoveryToken(token);
      // Verificar el token y establecer la sesión de autenticación
      supabase.auth.verifyOtp({ token, type: 'recovery' })
        .then(({ data, error }) => {
          if (error) {
            setErrorMessage('El enlace de restablecimiento de contraseña no es válido o ha expirado.');
          } else if (data) {
            console.log("Sesión de autenticación establecida con éxito:", data.session);
          }
        });
    } else {
      setErrorMessage('El enlace de restablecimiento de contraseña no es válido o ha expirado.');
    }
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (!recoveryToken) {
      setErrorMessage('No estás en modo de recuperación de contraseña.');
      return;
    }

    try {
      // Intenta actualizar la contraseña después de establecer la sesión de autenticación
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
      {recoveryToken ? (
        <form onSubmit={handlePasswordUpdate}>
          <label>Nueva Contraseña:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit">Actualizar Contraseña</button>
        </form>
      ) : (
        <p>No se puede restablecer la contraseña sin un enlace de recuperación válido.</p>
      )}
    </div>
  );
}

export default ResetPasswordPage;