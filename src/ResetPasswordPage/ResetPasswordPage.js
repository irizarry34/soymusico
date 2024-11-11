import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './ResetPasswordPage.css';

function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
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
      </div>
      
      <div className="reset-password-image">
        <img src="/reset.jpg" alt="Cambiar Contraseña" />
      </div>
    </div>
  );
}

export default ResetPasswordPage;