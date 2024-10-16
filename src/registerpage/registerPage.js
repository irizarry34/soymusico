// src/registerpage/registerPage.js
import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Ruta correcta a supabaseClient.js
import './RegisterPage.css'; // Asegúrate de que el nombre del archivo CSS coincida

function RegisterPage() {
  const [profileType, setProfileType] = useState('Musician');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [instruments, setInstruments] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('users')
      .insert([
        { 
          profile_type: profileType,
          first_name: firstName,
          last_name: lastName,
          email: email,
          username: username,
          password: password,
          phone: phone,
          instruments: instruments.join(', ') // Almacena como una cadena separada por comas
        }
      ]);
    
    if (error) {
      console.error(error);
      alert(`Error al registrar usuario: ${error.message}`);
    } else {
      console.log('Usuario registrado:', data);
      alert('Usuario registrado exitosamente');
      // Opcional: Limpiar el formulario o redirigir al usuario
      setProfileType('Musician');
      setFirstName('');
      setLastName('');
      setEmail('');
      setUsername('');
      setPassword('');
      setPhone('');
      setInstruments([]);
    }
  };

  const instrumentOptions = {
    "Cuerdas": [
      "Violín",
      "Viola",
      "Violonchelo",
      "Contrabajo",
      "Guitarra acústica",
      "Guitarra eléctrica",
      "Bajo eléctrico",
      "Arpa",
      "Banjo",
      "Mandolina",
      "Ukulele",
      "Cítara",
      "Laúd",
      "Sitar",
      "Koto",
      "Guzheng"
    ],
    "Viento Madera": [
      "Flauta transversal",
      "Flauta dulce",
      "Clarinete",
      "Oboe",
      "Fagot",
      "Saxofón",
      "Piccolo",
      "Contrafagot"
    ],
    "Viento Metal": [
      "Trompeta",
      "Trombón",
      "Trompa",
      "Tubo",
      "Corneta",
      "Trompa francesa"
    ],
    "Percusión": [
      "Batería",
      "Tambores",
      "Platillos",
      "Congas",
      "Bongos",
      "Djembé",
      "Cajón",
      "Xilófono",
      "Marimba",
      "Vibrafón",
      "Glockenspiel",
      "Timpani",
      "Campanas tubulares"
    ],
    "Teclado": [
      "Piano acústico",
      "Piano eléctrico",
      "Teclado electrónico",
      "Órgano",
      "Sintetizador",
      "Clavicordio",
      "Accordeón",
      "Melódica"
    ],
    "Electrónicos": [
      "Sintetizador",
      "Secuenciador",
      "Sampler",
      "Drum machine",
      "Theremin",
      "Controlador MIDI"
    ],
    "Tradicionales y Étnicos": [
      "Didgeridoo",
      "Shamisen",
      "Balalaika",
      "Kora",
      "Erhu",
      "Bagpipes",
      "Tabla",
      "Oud",
      "Maracas",
      "Guiro",
      "Charango",
      "Panflute"
    ],
    "Otros": [
      "Harmónica",
      "Melódica",
      "Kalimba",
      "Steel drums",
      "Electro-acústicos"
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
      <div className="register-container">
        <h1>Registro de Usuario</h1>
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
