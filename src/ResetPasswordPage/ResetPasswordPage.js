import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './ResetPasswordPage.css';

function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  // Detectar el modo de recuperación de contraseña en la URL y obtener el access_token
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1)); // Obtiene parámetros del hash
    const queryParams = new URLSearchParams(window.location.search); // Obtiene parámetros de consulta

    const tokenFromHash = hashParams.get('access_token');
    const tokenFromQuery = queryParams.get('access_token');
    const typeFromHash = hashParams.get('type');
    const typeFromQuery = queryParams.get('type');

    // Revisar si el token y el tipo están en hash o en los parámetros de consulta
    if ((typeFromHash === 'recovery' || typeFromQuery === 'recovery') && (tokenFromHash || tokenFromQuery)) {
      setIsRecoveryMode(true);
      setAccessToken(tokenFromHash || tokenFromQuery);
    } else {
      setErrorMessage('El enlace de restablecimiento de contraseña no es válido o ha expirado.');
    }
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!isRecoveryMode || !accessToken) {
      setErrorMessage('No estás en modo de recuperación de contraseña.');
      return;
    }

    try {
      // Autenticación usando el access_token de recuperación
      const { data, error } = await supabase.auth.updateUser({ password: newPassword }, { access_token: accessToken });
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
    <div className="reset-password-page">
      <div className="reset-password-container">
        <h1>Cambiar Contraseña</h1>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        {isRecoveryMode ? (
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
      
      <div className="reset-password-image">
        <img src="/reset.jpg" alt="Cambiar Contraseña" />
      </div>
    </div>
  );
}

export default ResetPasswordPage;