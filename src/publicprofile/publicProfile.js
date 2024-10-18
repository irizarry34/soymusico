import React, { useState, useEffect } from 'react';
import '../publicprofile/publicProfile.css';  
import { supabase } from '../supabaseClient';
import instrumentIcons from '../instrumentIcons'; 
import { useNavigate } from 'react-router-dom';
import ReactStars from 'react-stars'; 

// Importa todos los iconos en una sola línea, evitando duplicados
import { FaGuitar, FaDrum, FaMusic, FaCompactDisc, FaHeadphones } from 'react-icons/fa'; 
import { GiElectric, GiMicrophone, GiSaxophone, GiFlute } from 'react-icons/gi'; 
import { MdAudiotrack, MdRecordVoiceOver } from 'react-icons/md'; 
import { IoMdMic } from 'react-icons/io';

// Define los iconos para cada género musical
const genreIcons = {
  Rock: <FaGuitar />,
  Jazz: <GiSaxophone />,
  Clásica: <FaCompactDisc />,
  Pop: <FaMusic />,
  Blues: <FaHeadphones />,
  "Hip Hop": <GiMicrophone />,
  Reggae: <FaMusic />,
  Electrónica: <GiElectric />,
  "Heavy Metal": <FaDrum />,
  Funk: <FaMusic />,
  Country: <FaMusic />,
  Soul: <FaMusic />,
  "R&B": <FaHeadphones />,
  Disco: <FaCompactDisc />,
  Latino: <FaMusic />,
  Folk: <GiFlute />,
  Gospel: <MdRecordVoiceOver />,
  Indie: <FaMusic />,
  Ska: <FaHeadphones />,
  Punk: <FaDrum />,
  House: <GiElectric />,
  Techno: <FaCompactDisc />,
  Dubstep: <GiElectric />,
  Trap: <IoMdMic />,
  "Bossa Nova": <GiFlute />,
  Salsa: <FaMusic />,
  Merengue: <FaMusic />,
  Bachata: <FaHeadphones />,
  Cumbia: <FaMusic />,
  Flamenco: <MdAudiotrack />,
};

function PublicProfile() {
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState('');
  const [instruments, setInstruments] = useState([]);
  const [genres, setGenres] = useState([]);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);
  const [contactMessage, setContactMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const navigate = useNavigate(); // Para redirigir

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: userData, error } = await supabase
          .from('users')
          .select('bio, instruments, genres, photo_url')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching user data:", error);
          return;
        }

        if (userData) {
          setBio(userData.bio || '');
          setInstruments(userData.instruments ? userData.instruments.split(', ') : []);
          setGenres(userData.genres ? userData.genres.split(', ') : []);
          setPhotoUrl(userData.photo_url || '');
        }
      }
    };

    fetchUserData();
  }, []);

  const renderInstrumentIcon = (instrument) => {
    return instrumentIcons[instrument] || <FaMusic />;
  };

  const renderGenreIcon = (genre) => {
    return genreIcons[genre] || <FaCompactDisc />; 
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleSubmitReview = () => {
    console.log("Reseña enviada:", review, "Puntuación:", rating);
  };

  const handleContactMessage = () => {
    console.log("Mensaje de contacto enviado:", contactMessage, contactEmail, contactPhone);
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
            <li><a href="/search">Búsqueda</a></li> {/* Enlace para la búsqueda */}
            <li><a href="/community">Comunidad</a></li>
            <li><a href="/calendar">Calendario</a></li>
            <li><a href="/contact">Contacto</a></li>
            <li><a href="/inbox">Buzón de Entrada</a></li>
            <li><a href="/gallery">Galería</a></li>
            <li><a href="/profile">{user ? user.email : 'Perfil'}</a></li>
            <li><button className="logout-btn" onClick={() => navigate('/login')}>Cerrar Sesión</button></li>
          </ul>
        </nav>
      </div>

      {/* Sección de la Foto de Perfil */}
      <div className="profile-container">
        <div className="left-section">
          <div className="profile-photo-section">
            {photoUrl ? <img src={photoUrl} alt="Foto de Perfil" className="profilephoto" /> : <p>No hay foto de perfil.</p>}
          </div>

          {/* Sección de la Autobiografía */}
          <div className="bio-section">
            <p>{bio}</p>
          </div>

          {/* Sección para dejar un mensaje o enviar un correo */}
          <div className="contact-section">
            <h3>Deja un mensaje o envía un correo</h3>
            <input 
              type="email" 
              placeholder="Tu correo electrónico" 
              value={contactEmail} 
              onChange={(e) => setContactEmail(e.target.value)} 
            />
            <input 
              type="tel" 
              placeholder="Tu teléfono de contacto" 
              value={contactPhone} 
              onChange={(e) => setContactPhone(e.target.value)} 
            />
            <textarea 
              placeholder="Escribe tu mensaje..." 
              rows="5" 
              value={contactMessage} 
              onChange={(e) => setContactMessage(e.target.value)} 
            />
            <button onClick={handleContactMessage}>Enviar Mensaje</button>
          </div>
        </div>

        {/* Sección de Talentos Musicales y Géneros */}
        <div className="right-section">
          <div className="talentos-section">
            <h3>Talentos Musicales</h3>
            <div className="instruments-genres">
              <div className="instruments">
                <h3>Instrumentos:</h3>
                <ul>
                  {instruments.map((instrument, index) => (
                    <li key={index}>{renderInstrumentIcon(instrument)} {instrument}</li>
                  ))}
                </ul>
              </div>

              {/* Sección de Géneros Musicales */}
              <div className="genres">
                <h3>Géneros Musicales:</h3>
                <ul>
                  {genres.map((genre, index) => (
                    <li key={index}>{renderGenreIcon(genre)} {genre}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Espacio para escribir reseñas con estrellas */}
          <div className="review-section">
            <h3>Deja una reseña</h3>
            <textarea 
              placeholder="Escribe tu reseña..." 
              rows="5" 
              value={review} 
              onChange={(e) => setReview(e.target.value)} 
            />
            <div className="star-rating">
              <ReactStars 
                count={5} 
                onChange={handleRatingChange} 
                size={24} 
                color2={'#ffd700'} 
              />
            </div>
            <button onClick={handleSubmitReview}>Enviar Reseña</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicProfile;
