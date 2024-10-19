import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../publicprofile/publicProfile.css';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ReactStars from 'react-stars';

// Importa todos los iconos en una sola línea
import { FaGuitar, FaDrum, FaMusic, FaCompactDisc, FaHeadphones } from 'react-icons/fa';
import { GiElectric, GiMicrophone, GiSaxophone, GiFlute } from 'react-icons/gi';
import { MdAudiotrack, MdRecordVoiceOver } from 'react-icons/md';
import { IoMdMic } from 'react-icons/io';

// Define los iconos para cada instrumento musical
const instrumentIcons = {
  Guitarra: <FaGuitar />,
  Batería: <FaDrum />,
  Micrófono: <IoMdMic />,
  Saxofón: <GiSaxophone />,
  Flauta: <GiFlute />,
  Bajo: <GiElectric />,
  Voz: <MdRecordVoiceOver />,
};

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
  const { id } = useParams();
  const [currentUser, setCurrentUser] = useState(null); // Usuario autenticado
  const [publicUser, setPublicUser] = useState(null); // Usuario del perfil público
  const [bio, setBio] = useState('');
  const [instruments, setInstruments] = useState([]);
  const [genres, setGenres] = useState([]);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [reviews, setReviews] = useState([]); // Almacenar las reseñas
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);
  const [contactMessage, setContactMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const navigate = useNavigate(); // Para redirigir

  // Obtener los datos del usuario autenticado
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error obteniendo el usuario autenticado:', error);
        return;
      }
      setCurrentUser(user); // Guardar los datos del usuario autenticado
    };

    fetchCurrentUser();
  }, []);

  // Obtener los datos del perfil público (usuario seleccionado en la búsqueda)
  useEffect(() => {
    const fetchPublicUserData = async () => {
      const { data: userData, error } = await supabase
        .from('users')
        .select('bio, instruments, genres, photo_url, first_name, last_name, email')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error al obtener los datos del perfil público:", error);
        return;
      }

      if (userData) {
        setPublicUser(userData);
        setBio(userData.bio || '');
        setInstruments(userData.instruments ? userData.instruments.split(', ') : []);
        setGenres(userData.genres ? userData.genres.split(', ') : []);
        setPhotoUrl(userData.photo_url || '');
      }
    };

    const fetchReviews = async () => {
      const { data: reviewsData, error } = await supabase
        .from('reviews')
        .select('review_text, rating, created_at, reviewer_user_id')
        .eq('reviewed_user_id', id);

      if (error) {
        console.error("Error al obtener las reseñas:", error);
      } else {
        setReviews(reviewsData);
      }
    };

    if (id) {
      fetchPublicUserData();
      fetchReviews();
    }
  }, [id]);

  const renderInstrumentIcon = (instrument) => {
    return instrumentIcons[instrument] || <FaMusic />;
  };

  const renderGenreIcon = (genre) => {
    return genreIcons[genre] || <FaCompactDisc />;
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleSubmitReview = async () => {
    const { error } = await supabase
      .from('reviews')
      .insert([
        { reviewer_user_id: currentUser.id, reviewed_user_id: id, review_text: review, rating: rating }
      ]);

    if (error) {
      console.error("Error al enviar la reseña:", error);
    } else {
      console.log("Reseña enviada:", review, "Puntuación:", rating);
      setReview('');
      setRating(0);
    }
  };

  const handleContactMessage = () => {
    console.log("Mensaje de contacto enviado:", contactMessage, contactEmail, contactPhone);
  };

  if (!publicUser) {
    return <p>Cargando perfil...</p>;
  }

  return (
    <div className="perfil-page">
      {/* Navbar */}
      <div className="navbar">
        <div className="logo">
          <img src="/Subject.png" alt="Logo" />
        </div>
        <nav>
          <ul>
            <li><a href="/">Inicio</a></li>
            <li><a href="/search">Búsqueda</a></li>
            <li><a href="/calendar">Calendario</a></li>
            <li><a href="/contact">Contacto</a></li>
            <li><a href="/inbox">Buzón de Entrada</a></li>
            <li><a href="/gallery">Galería</a></li> {/* Enlace agregado */}
            <li><a href="/profile">{currentUser ? currentUser.email : 'Perfil'}</a></li>
            <li><button className="logout-btn" onClick={() => navigate('/login')}>Cerrar Sesión</button></li>
          </ul>
        </nav>
      </div>

      {/* Sección de la Foto de Perfil y nombre completo */}
      <div className="profile-container">
        <div className="left-section">
          <div className="profile-photo-section">
            {photoUrl ? <img src={photoUrl} alt="Foto de Perfil" className="profilephoto" /> : <p>No hay foto de perfil.</p>}
          </div>
          <div className="profile-name">
            <h2>{`${publicUser.first_name} ${publicUser.last_name}`}</h2>
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

          {/* Sección para mostrar reseñas */}
          <div className="reviews-list">
            <h3>Reseñas</h3>
            {reviews.length > 0 ? (
              reviews.map((reviewItem, index) => (
                <div key={index} className="review-item">
                  <p><strong>Reseña:</strong> {reviewItem.review_text}</p>
                  <ReactStars 
                    count={5} 
                    value={reviewItem.rating} 
                    size={24} 
                    edit={false}
                    color2={'#ffd700'}
                  />
                  <p><small>Escrita el: {new Date(reviewItem.created_at).toLocaleDateString()}</small></p>
                </div>
              ))
            ) : (
              <p>No hay reseñas aún.</p>
            )}
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
