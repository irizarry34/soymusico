import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Ruta correcta a supabaseClient.js
import './RegisterPage.css'; // Asegúrate de que el nombre del archivo CSS coincida
import { Link, useNavigate } from 'react-router-dom'; // Añadir useNavigate para manejar la redirección

function RegisterPage() {
  const [profileType, setProfileType] = useState('Musician');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [instruments, setInstruments] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate(); // Hook para redirigir al usuario

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Crear usuario en Supabase
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password
    });

    if (signUpError) {
      setErrorMessage(`Error al registrar usuario en Supabase: ${signUpError.message}`);
      return;
    }

    // Crear registro en tabla 'users' en Supabase con campos adicionales
    const { error: userError } = await supabase
      .from('users')
      .insert([
        { 
          profile_type: profileType,
          first_name: firstName,
          last_name: lastName,
          email: email,
          username: username,
          phone: phone,
          instruments: instruments.join(', '), // Almacenar instrumentos como una cadena separada por comas
          id: signUpData.user.id // Asegurarse que coincida con el auth.uid()
        }
      ]);

    if (userError) {
      setErrorMessage(`Error al guardar datos del usuario en Supabase: ${userError.message}`);
      return;
    }

    // Crear el usuario en Django con los datos necesarios, incluyendo el email
    const createDjangoUser = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/register/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: email,
            password: password,
            first_name: firstName,
            last_name: lastName,
            email: email // Agregar email aquí para que se registre en Django
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al registrar el usuario en Django');
        }

        return response.json();
      } catch (error) {
        setErrorMessage(`Error al crear usuario en Django: ${error.message}`);
        return null;
      }
    };

    // Llamada para crear usuario en Django
    const djangoUser = await createDjangoUser();
    if (!djangoUser) return; // Detener si hay error al crear usuario en Django

    // Redirigir al perfil del usuario después de un registro exitoso en ambas plataformas
    navigate('/profile');
  };

  const instrumentOptions = {
    "Cuerdas": [
      "Violín", "Viola", "Violonchelo", "Contrabajo", "Guitarra acústica", 
      "Guitarra eléctrica", "Bajo eléctrico", "Arpa", "Banjo", "Mandolina",
      "Ukulele", "Cítara", "Laúd", "Sitar", "Koto", "Guzheng"
    ],
    "Viento Madera": [
      "Flauta transversal", "Flauta dulce", "Clarinete", "Oboe", "Fagot", 
      "Saxofón", "Piccolo", "Contrafagot"
    ],
    "Viento Metal": [
      "Trompeta", "Trombón", "Trompa", "Tuba", "Corneta", "Trompa francesa"
    ],
    "Percusión": [
      "Batería", "Tambores", "Platillos", "Congas", "Bongos", "Djembé", "Cajón", 
      "Xilófono", "Marimba", "Vibrafón", "Glockenspiel", "Timpani", "Campanas tubulares"
    ],
    "Teclado": [
      "Piano acústico", "Piano eléctrico", "Teclado electrónico", "Órgano", 
      "Sintetizador", "Clavicordio", "Accordeón", "Melódica"
    ],
    "Electrónicos": [
      "Sintetizador", "Secuenciador", "Sampler", "Drum machine", "Theremin", "Controlador MIDI"
    ],
    "Tradicionales y Étnicos": [
      "Didgeridoo", "Shamisen", "Balalaika", "Kora", "Erhu", "Bagpipes", 
      "Tabla", "Oud", "Maracas", "Guiro", "Charango", "Panflute"
    ],
    "Otros": [
      "Harmónica", "Melódica", "Kalimba", "Steel drums", "Electro-acústicos"
    ]
  };

  const handleInstrumentChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setInstruments([...instruments, value]);
    } else {
      setInstruments(instruments.filter((instrument) => instrument !== value));
    }
  };

  return (
    <div className="register-page">
      {/* Barra de navegación */}
      <div className="navbar">
        <div className="logo">
          <img src="Subject.png" alt="Logo" />
        </div>
        <nav>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/search">Búsqueda</Link></li>
            <li><Link to="/contact">Contacto</Link></li>
            <li><Link to="/login">Iniciar Sesión</Link></li>
            <li><Link to="/register">Registrarse</Link></li>
          </ul>
        </nav>
      </div>

      <div className="register-image">
        <img src="registerPage2.jpg" alt="Music Concept" /> {/* Ruta desde public */}
      </div>

      <div className="register-container">
        <h1>Registro de Usuario</h1>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <form onSubmit={handleSubmit}>
          <label>Tipo de Perfil:</label>
          <select value={profileType} onChange={(e) => setProfileType(e.target.value)}>
            <option value="Musician">Músico</option>
            <option value="Public">Público en General</option>
          </select>

          <label>Nombre:</label>
          <input 
            type="text" 
            value={firstName} 
            onChange={(e) => setFirstName(e.target.value)} 
            placeholder="Tu nombre"
            required
          />

          <label>Apellidos:</label>
          <input 
            type="text" 
            value={lastName} 
            onChange={(e) => setLastName(e.target.value)} 
            placeholder="Tus apellidos"
            required
          />

          <label>Correo Electrónico:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Tu correo electrónico"
            required
          />

          <label>Nombre de Usuario:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="Tu nombre de usuario"
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

          <label>Teléfono:</label>
          <input 
            type="text" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder="Tu teléfono"
          />

          <label>Instrumentos:</label>
          <div className="instrument-options">
            {Object.keys(instrumentOptions).map((category) => (
              <div key={category} className="instrument-category">
                <h4>{category}</h4>
                {instrumentOptions[category].map((instrument) => (
                  <label key={instrument}>
                    <input 
                      type="checkbox" 
                      value={instrument} 
                      onChange={handleInstrumentChange} 
                    />
                    {instrument}
                  </label>
                ))}
              </div>
            ))}
          </div>

          <button type="submit">Registrarse</button>
        </form>
        <div className="back-link">
          <a href="/">Volver a la página principal</a>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
