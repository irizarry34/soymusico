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

    // Depuración: verifica el token y el tipo
    console.log("Token:", token);
    console.log("Type:", type);

    if (type === 'recovery' && token) {
      setRecoveryToken(token);
      // Verifica el token y establece la sesión
      supabase.auth.verifyOtp({ token, type: 'recovery' })
        .then(({ data, error }) => {
          if (error) {
            console.error("Error de verificación:", error.message);
            setErrorMessage('El enlace de restablecimiento de contraseña no es válido o ha expirado.');
          } else if (data) {
            supabase.auth.setSession(data.session)
              .then(({ error: sessionError }) => {
                if (sessionError) {
                  setErrorMessage('Error al establecer la sesión: ' + sessionError.message);
                }
              });
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
            autoComplete="new-password"
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