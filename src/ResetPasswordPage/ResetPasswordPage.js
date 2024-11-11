import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function RequestResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleRequestReset = async (e) => {
    e.preventDefault();
    
    const { error } = await supabase.auth.api.resetPasswordForEmail(email, {
      redirectTo: 'https://master.du5bvw1goxlgn.amplifyapp.com/reset-password'
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Se ha enviado un enlace de restablecimiento de contraseña a tu correo.');
    }
  };

  return (
    <div>
      <h2>Solicitar Restablecimiento de Contraseña</h2>
      <form onSubmit={handleRequestReset}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Enviar Enlace de Restablecimiento</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default RequestResetPassword;