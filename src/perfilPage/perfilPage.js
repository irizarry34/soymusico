import { FaGuitar, FaDrum, FaMicrophone, FaMusic } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import './perfilPage.css'; 
import { supabase } from '../supabaseClient'; 
import { useNavigate } from 'react-router-dom';
import instrumentIcons from '../instrumentIcons'; 

function PerfilPage() {
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState('');
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]); 
  const [reviews, setReviews] = useState([]);
  const [photoUrl, setPhotoUrl] = useState(null); 
  const [selectedFile, setSelectedFile] = useState(null); 
  const [instruments, setInstruments] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const navigate = useNavigate();

  // Verifica si el usuario está autenticado cada vez que se carga la página
  useEffect(() => {
    const checkUserSession = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error obteniendo la sesión:", sessionError);
        return;
      }

      if (sessionData?.session) {
        setUser(sessionData.session.user); // Obtiene el usuario de la sesión
        fetchUserData(sessionData.session.user.id); // Llama a fetchUserData con el user id
      } else {
        console.error("No hay una sesión activa.");
        navigate('/login'); // Redirige al login si no hay sesión
      }
    };

    checkUserSession();
  }, [navigate]);

  const fetchUserData = async (userId) => {
    const { data: userData, error: userFetchError } = await supabase
      .from('users')
      .select('bio, instruments, genres, photo_url') 
      .eq('id', userId) 
      .single();

    if (userFetchError) {
      console.error("Error obteniendo datos del usuario:", userFetchError);
      return;
    }

    if (userData) {
      setBio(userData.bio || '');
      setInstruments(userData.instruments ? userData.instruments.split(', ') : []);
      setGenres(userData.genres ? userData.genres.split(', ') : []);
      setSelectedGenres(userData.genres ? userData.genres.split(', ') : []); 
      setPhotoUrl(userData.photo_url || ''); 
    }

    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('review_text, reviewer_user_id')
      .eq('reviewed_user_id', userId);

    if (reviewsError) {
      console.error("Error obteniendo reseñas:", reviewsError);
    } else {
      setReviews(reviewsData);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file); 
      console.log("Archivo seleccionado:", file.name);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile || !user) {
      console.error("No hay archivo seleccionado o el usuario no está autenticado.");
      return;
    }

    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`; 
    const filePath = `profilephoto/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profilephoto')
      .upload(filePath, selectedFile, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error("Error subiendo la imagen:", uploadError);
      return;
    }

    const { data: publicUrlData, error: urlError } = supabase
      .storage
      .from('profilephoto')
      .getPublicUrl(filePath);

    if (urlError || !publicUrlData.publicUrl) {
      console.error("Error obteniendo la URL pública:", urlError);
      return;
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ photo_url: publicUrlData.publicUrl })
      .eq('id', user.id);

    if (updateError) {
      console.error("Error actualizando la URL de la imagen:", updateError);
      return;
    }

    setPhotoUrl(publicUrlData.publicUrl);  
    setSelectedFile(null);
    alert('¡Foto de perfil actualizada correctamente!');
  };

  const handleGenresChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setSelectedGenres(selected);
  };

  const saveGenres = async () => {
    if (!user) {
      console.error("El usuario no está autenticado.");
      return;
    }

    try {
      const { error: genresUpdateError } = await supabase
        .from('users')
        .update({ genres: selectedGenres.join(', ') })
        .eq('id', user.id);

      if (genresUpdateError) {
        throw genresUpdateError;
      }

      alert('¡Géneros musicales actualizados!');
    } catch (error) {
      console.error('Error actualizando los géneros:', error.message);
    }
  };

  const saveBio = async () => {
    if (!user) {
      console.error("El usuario no está autenticado.");
      return;
    }

    try {
      const { error: bioUpdateError } = await supabase
        .from('users')
        .update({ bio })
        .eq('id', user.id);

      if (bioUpdateError) {
        throw bioUpdateError;
      }

      alert('¡Autobiografía actualizada!');
    } catch (error) {
      console.error('Error actualizando la biografía:', error.message);
    }
  };

  const renderInstrumentIcon = (instrument) => {
    return instrumentIcons[instrument] || <FaMusic />; 
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
            <li><button className="logout-btn" onClick={() => navigate('/publicProfile')}>Perfil Público</button></li>
          </ul>
        </nav>
      </div>

      <h1>Mi Perfil</h1>

      <div className="profile-container">
        <div className="left-section">
          <div className="profile-photo-section">
            <h2>Foto de Perfil</h2>
            {photoUrl ? <img src={photoUrl} alt="Foto de Perfil" className="profilephoto" /> : <p>No hay foto de perfil.</p>}
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button onClick={handlePhotoUpload} disabled={!selectedFile}>Guardar foto de perfil</button>
          </div>

          <div className="bio-section">
            <h2>Autobiografía</h2>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Escribe sobre tu experiencia musical..." rows="5" />
            <button onClick={saveBio}>Guardar autobiografía</button>
          </div>
        </div>

        <div className="right-section">
          <div className="talentos-section">
            <h2>Talentos Musicales</h2>
            <div className="instruments-genres">
              <div className="instruments">
                <h3>Instrumentos</h3>
                <ul>
                  {instruments.map((instrument, index) => (
                    <li key={index}>{renderInstrumentIcon(instrument)} {instrument}</li>
                  ))}
                </ul>
              </div>
              <div className="genres">
                <h3>Géneros Musicales</h3>
                <select multiple value={selectedGenres} onChange={handleGenresChange}>
                  {[
                    'Rock', 'Jazz', 'Clásica', 'Pop', 'Blues', 'Hip Hop', 'Reggae', 'Electrónica', 
                    'Heavy Metal', 'Funk', 'Country', 'Soul', 'R&B', 'Disco', 'Latino', 'Folk', 
                    'Gospel', 'Indie', 'Ska', 'Punk', 'House', 'Techno', 'Dubstep', 'Trap', 
                    'Bossa Nova', 'Salsa', 'Merengue', 'Bachata', 'Cumbia', 'Flamenco'
                  ].map((genre) => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
                <button onClick={saveGenres}>Guardar géneros</button>
              </div>
            </div>
          </div>

          <div className="reviews-section">
            <h2>Reseñas</h2>
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <div key={index} className="review">
                  <p>{review.review_text}</p>
                </div>
              ))
            ) : (
              <p>No hay reseñas aún.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerfilPage;
