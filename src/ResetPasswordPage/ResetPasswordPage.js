import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './ResetPasswordPage.css';

function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar el estado de autenticación al cargar la página
  useEffect(() => {
    const checkAuthSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
      } else {
        setErrorMessage('No se encontró una sesión de autenticación activa.');
      }
    };

    checkAuthSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setErrorMessage('No se encontró una sesión de autenticación activa.');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setErrorMessage('Necesitas una sesión activa para cambiar la contraseña.');
      return;
    }

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
          <button type="submit" disabled={!isAuthenticated}>Actualizar Contraseña</button>
        </form>
      </div>
      
      <div className="reset-password-image">
        <img src="/reset.jpg" alt="Cambiar Contraseña" />
      </div>
    </div>
  );
}

export default ResetPasswordPage;