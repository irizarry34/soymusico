import { FaGuitar, FaDrum, FaMicrophone, FaMusic } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import './perfilPage.css'; 
import { supabase } from '../supabaseClient'; 
import { useNavigate } from 'react-router-dom';
import instrumentIcons from '../instrumentIcons'; // Ruta correcta de tu archivo

function PerfilPage() {
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState('');
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]); // Para almacenar los géneros seleccionados
  const [reviews, setReviews] = useState([]);
  const [photoUrl, setPhotoUrl] = useState(null); 
  const [selectedFile, setSelectedFile] = useState(null); 
  const [instruments, setInstruments] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const navigate = useNavigate();

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
          setSelectedGenres(userData.genres ? userData.genres.split(', ') : []); // Inicializar con géneros existentes
          setPhotoUrl(userData.photo_url || ''); 
        }
      }
    };

    fetchUserData();
  }, []);

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

    const { data, error: uploadError } = await supabase.storage
      .from('profilephoto')
      .upload(filePath, selectedFile, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error("Error subiendo la imagen:", uploadError);
      return;
    }

    const publicURL = `https://your-supabase-url/storage/v1/object/public/profilephoto/${filePath}`;

    const { error: updateError } = await supabase
      .from('users')
      .update({ photo_url: publicURL })
      .eq('id', user.id);

    if (updateError) {
      console.error("Error actualizando la URL de la imagen:", updateError);
      return;
    }

    setPhotoUrl(publicURL);
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
    const { error } = await supabase
      .from('users')
      .update({ genres: selectedGenres.join(', ') })
      .eq('id', user.id);

    if (error) {
      console.error('Error actualizando los géneros:', error);
    } else {
      alert('¡Géneros musicales actualizados!');
    }
  };

  const saveBio = async () => {
    const { error } = await supabase
      .from('users')
      .update({ bio })
      .eq('id', user.id);

    if (error) {
      console.error('Error actualizando la autobiografía:', error);
    } else {
      alert('¡Autobiografía actualizada!');
    }
  };

  const renderInstrumentIcon = (instrument) => {
    return instrumentIcons[instrument] || <FaMusic />; 
  };

  return (
    <div className="perfil-page">
      <div className="navbar">
        <div className="logo">
          <img src="Subject.png" alt="Logo" />
        </div>
        <nav>
          <ul>
            <li><a href="/">Inicio</a></li>
            <li><button onClick={() => navigate('/publicProfile')}>Ver Perfil Público</button></li>
            <li><button onClick={handleLogout}>Cerrar Sesión</button></li>
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
                  <p>{review}</p>
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
