import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './loginPage.css';
import { Link, useNavigate } from 'react-router-dom';


function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Inicia sesión con Supabase
      const { data: session, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setErrorMessage('Error al iniciar sesión: ' + error.message);
        localStorage.removeItem('supabase_token');
        localStorage.removeItem('supabase_refresh_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_password');
      } else {
        console.log('Sesión completa en Supabase:', session);

        if (session && session.session && session.session.access_token) {
          localStorage.setItem('supabase_token', session.session.access_token); // Guardar el token de Supabase
          localStorage.setItem('supabase_refresh_token', session.session.refresh_token); // Guardar el refresh token de Supabase
          localStorage.setItem('user_email', email);
          localStorage.setItem('user_password', password);
          console.log('Token de Supabase almacenado:', session.session.access_token);
          console.log('Token de refresco de Supabase almacenado:', session.session.refresh_token);

          // Solicitar un token JWT de Django
          const response = await fetch('http://localhost:8000/api/token/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
          });

          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('django_token', data.access); // Guardar el token de acceso de Django
            localStorage.setItem('django_refresh_token', data.refresh); // Guardar el token de refresco de Django
            console.log('Token JWT de Django almacenado:', data.access);
            console.log('Token de refresco de Django almacenado:', data.refresh);

            // Verificación de todos los tokens en localStorage
            console.log('Tokens en localStorage:', {
              django_token: localStorage.getItem('django_token'),
              django_refresh_token: localStorage.getItem('django_refresh_token'),
              supabase_token: localStorage.getItem('supabase_token'),
              supabase_refresh_token: localStorage.getItem('supabase_refresh_token'),
            });

            // Redirigir al perfil del usuario
            navigate('/profile');
          } else {
            const errorData = await response.json();
            setErrorMessage(`Error al obtener el token de Django: ${errorData.detail}`);
          }
        } else {
          console.error('No se encontró un token en la sesión de Supabase:', session);
          setErrorMessage('Error al obtener el token. Intenta nuevamente.');
        }
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setErrorMessage('Ocurrió un error inesperado. Intenta nuevamente.');
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
            required
          />

          <label>Contraseña:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Tu contraseña"
            required
          />

          <button type="submit">Iniciar Sesión</button>
        </form>
        <div className="back-link">
          <Link to="/">Volver a la página principal</Link>
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