import React, { useState, useEffect } from 'react';
import './perfilPage.css'; // Asegúrate de crear este archivo CSS
import { supabase } from '../supabaseClient'; // Ruta correcta a supabaseClient.js
import { useNavigate } from 'react-router-dom';
import { FaGuitar, FaDrum, FaMicrophone, FaMusic } from 'react-icons/fa'; // Íconos para instrumentos

function PerfilPage() {
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState('');
  const [genres, setGenres] = useState('');
  const [reviews, setReviews] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [instruments, setInstruments] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const navigate = useNavigate();

  // Cargar datos del usuario desde Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: userData, error } = await supabase
          .from('users')
          .select('bio, instruments, genres')
          .eq('auth_id', user.id)
          .single();

        if (userData) {
          setBio(userData.bio || '');
          setInstruments(userData.instruments ? userData.instruments.split(', ') : []);
          setGenres(userData.genres || '');
        }
      }
    };

    fetchUserData();
  }, []);

  // Maneja el cierre de sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Maneja la carga de la foto de perfil
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    setPhoto(URL.createObjectURL(file)); // Muestra una vista previa de la foto cargada
  };

  // Maneja la biografía
  const handleBioChange = (e) => {
    setBio(e.target.value);
  };

  // Maneja el género musical
  const handleGenresChange = (e) => {
    setGenres(e.target.value);
  };

  // Simulación de agregar una reseña
  const addReview = (review) => {
    setReviews([...reviews, review]);
  };

  // Mapea los instrumentos a íconos
  const renderInstrumentIcon = (instrument) => {
    switch (instrument) {
      case 'Guitarra Eléctrica':
        return <FaGuitar />;
      case 'Batería':
        return <FaDrum />;
      case 'Voz':
        return <FaMicrophone />;
      case 'Piano':
      case 'Saxofón': // Usaremos un ícono genérico de música
        return <FaMusic />;
      default:
        return <FaMusic />; // Ícono genérico si no hay uno específico
    }
  };

  return (
    <div className="perfil-page">
      {/* Navbar */}
      <div className="navbar">
        <div className="logo">
          <img src="Subject.png" alt="Logo" />
        </div>
        <nav>
          <ul>
            <li><a href="/">Inicio</a></li>
            <li><a href="/search">Búsqueda</a></li>
            <li><a href="/community">Comunidad</a></li>
            <li><a href="/calendar">Calendario</a></li>
            <li><a href="/contact">Contacto</a></li>
            <li><a href="/inbox">Buzón de Entrada</a></li>
            <li><a href="/alerts">Alertas ({alertas.length})</a></li>
            <li><a href="/gallery">Galería</a></li>
            <li><a href="/profile">{user ? user.email : 'Perfil'}</a></li>
            <li><button className="logout-btn" onClick={handleLogout}>Cerrar Sesión</button></li>
          </ul>
        </nav>
      </div>

      <h1>Mi Perfil</h1>

      {/* Sección de la Foto de Perfil */}
      <div className="profile-photo-section">
        <h2>Foto de Perfil</h2>
        {photo ? <img src={photo} alt="Foto de Perfil" className="profile-photo" /> : <p>No hay foto de perfil.</p>}
        <input type="file" accept="image/*" onChange={handlePhotoUpload} />
      </div>

      {/* Sección de Autobiografía */}
      <div className="bio-section">
        <h2>Autobiografía</h2>
        <textarea 
          value={bio} 
          onChange={handleBioChange} 
          placeholder="Escribe sobre tu experiencia musical..."
          rows="5"
        />
      </div>

      {/* Sección de Talentos Musicales */}
      <div className="talentos-section">
        <h2>Talentos Musicales</h2>
        <div className="instruments">
          <h3>Instrumentos</h3>
          <ul>
            {instruments.length > 0 ? instruments.map((instrument, index) => (
              <li key={index}>
                {renderInstrumentIcon(instrument)} {instrument}
              </li>
            )) : <p>No has seleccionado instrumentos.</p>}
          </ul>
        </div>
        <div className="genres">
          <h3>Géneros Musicales</h3>
          <input 
            type="text" 
            value={genres} 
            onChange={handleGenresChange} 
            placeholder="Escribe tus géneros musicales favoritos" 
          />
        </div>
      </div>

      {/* Sección de Reseñas */}
      <div className="reviews-section">
        <h2>Reseñas</h2>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={index} className="review">
              <p>{review}</p>
            </div>
          ))
        ) : (
          <p>No hay reseñas aún.</p>
        )}
      </div>
    </div>
  );
}

export default PerfilPage;
