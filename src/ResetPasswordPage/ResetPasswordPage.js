import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [recoveryToken, setRecoveryToken] = useState(null);

  useEffect(() => {
    // Depuración: imprime el hash y query de la URL
    console.log("Hash:", window.location.hash);
    console.log("Query:", window.location.search);

    // Intentar obtener el token desde el hash primero
    let hashParams = new URLSearchParams(window.location.hash.substring(1));
    let token = hashParams.get('access_token');
    let type = hashParams.get('type');

    // Si no está en el hash, intentar obtenerlo desde el query
    if (!token || type !== 'recovery') {
      const urlParams = new URLSearchParams(window.location.search);
      token = urlParams.get('access_token');
      type = urlParams.get('type');
    }

    // Verificar si tenemos un token válido
    if (type === 'recovery' && token) {
      setRecoveryToken(token);
      supabase.auth.setSession({ access_token: token, refresh_token: token })
        .then(({ error }) => {
          if (error) {
            setErrorMessage('El enlace de restablecimiento de contraseña no es válido o ha expirado.');
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