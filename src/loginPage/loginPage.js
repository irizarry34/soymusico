import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './loginPage.css'; // Ya tienes el archivo de estilo
import { Link, useNavigate } from 'react-router-dom'; // Para manejar la navegación

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // Hook para redirigir

  const handleLogin = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      setErrorMessage('Error al iniciar sesión: ' + error.message);
    } else {
      // Login exitoso, redirigir al perfil del usuario
      navigate('/profile'); // Redirige a la página de perfil
    }
  };

  return (
    <div className="login-page">
      {/* Barra de navegación */}
      <div className="navbar">
        <div className="logo">
          <img src="Subject.png" alt="Logo" />
        </div>
        <nav>
          <ul>
            <li><Link to="/search">Búsqueda</Link></li>
            <li><Link to="/">Contacto</Link></li>
            <li><Link to="/login">Iniciar Sesión</Link></li>
            <li><Link to="/register">Registrarse</Link></li>
          </ul>
        </nav>
      </div>

      {/* Contenido de la página de inicio de sesión */}
      <div className="login-container">
        <h1>Iniciar Sesión</h1>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <form onSubmit={handleLogin}>
          <label>Correo Electrónico:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Tu correo electrónico"
          />

          <label>Contraseña:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Tu contraseña"
          />

          <button type="submit">Iniciar Sesión</button>
        </form>
        <div className="back-link">
          <a href="/">Volver a la página principal</a>
        </div>
      </div>

      {/* Imagen añadida debajo del formulario */}
      <div className="login-image">
        <img src="loginPageimg.jpg" alt="Music Concept" /> {/* Ruta desde public */}
      </div>
    </div>
  );
}

export default LoginPage;
