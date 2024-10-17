import React, { useState, useEffect } from 'react';
import './perfilPage.css'; 
import { supabase } from '../supabaseClient'; 
import { useNavigate } from 'react-router-dom';
import { FaGuitar, FaDrum, FaMicrophone, FaMusic } from 'react-icons/fa';
import instrumentIcons from '../instrumentIcons'; // Ruta correcta de tu archivo


function PerfilPage() {
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState('');
  const [genres, setGenres] = useState('');
  const [reviews, setReviews] = useState([]);
  const [photoUrl, setPhotoUrl] = useState(null); // URL de la foto de perfil actual
  const [selectedFile, setSelectedFile] = useState(null); // Para manejar la imagen seleccionada
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
          .eq('id', user.id)  // Cambiado de 'auth_id' a 'id'
          .single();

        if (error) {
          console.error("Error fetching user data:", error);
          return;
        }

        if (userData) {
          setBio(userData.bio || '');
          setInstruments(userData.instruments ? userData.instruments.split(', ') : []);
          setGenres(userData.genres || '');
          setPhotoUrl(userData.photo_url || ''); // Cargar la URL de la foto
        }
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Maneja la selección del archivo (sin subirlo inmediatamente)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file); // Guardar el archivo seleccionado
      console.log("Archivo seleccionado:", file.name);
    }
  };

  // Subir la foto a Supabase y actualizar la URL en la base de datos
  const handlePhotoUpload = async () => {
    if (!selectedFile || !user) {
      console.error("No hay archivo seleccionado o el usuario no está autenticado.");
      return;
    }

    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`; // Usar el ID del usuario como nombre del archivo
    const filePath = `profilephoto/${fileName}`;

    // Subir archivo a Supabase Storage en el bucket 'profilephoto'
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

    console.log("Archivo subido correctamente. Intentando generar la URL pública...");

    // Generar manualmente la URL pública con la estructura correcta
    const publicURL = `https://lrhdoypasirlowtxryvk.supabase.co/storage/v1/object/public/profilephoto/${filePath}`;

    // Debug: Verificar que la URL pública está generada correctamente
    console.log("Public URL generada manualmente:", publicURL);

    // Guardar la URL en la base de datos del usuario
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({ photo_url: publicURL }) // Guardar la URL de la imagen
      .eq('id', user.id); // Cambiado de 'auth_id' a 'id'

    if (updateError) {
      console.error("Error actualizando la URL de la imagen en la base de datos:", updateError);
      return;
    }

    // Debug: Verificar que se está actualizando correctamente la base de datos
    console.log("Tabla users actualizada con la URL:", publicURL);

    // Actualizar el estado local con la nueva URL
    setPhotoUrl(publicURL);
    setSelectedFile(null); // Limpiar la selección del archivo
    alert('¡Foto de perfil actualizada correctamente!');
  };

  const handleBioChange = (e) => {
    setBio(e.target.value);
  };

  const handleGenresChange = (e) => {
    setGenres(e.target.value);
  };

  const addReview = (review) => {
    setReviews([...reviews, review]);
  };

  const renderInstrumentIcon = (instrument) => {
    return instrumentIcons[instrument] || <FaMusic />; // Muestra el icono del instrumento o uno genérico
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

      <div className="profile-container">
        {/* Sección de la Foto de Perfil y Autobiografía */}
        <div className="left-section">
          <div className="profile-photo-section">
            <h2>Foto de Perfil</h2>
            {photoUrl ? <img src={photoUrl} alt="Foto de Perfil" className="profilephoto" /> : <p>No hay foto de perfil.</p>}
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {/* Botón para subir la foto seleccionada */}
            <button onClick={handlePhotoUpload} disabled={!selectedFile}>
              Guardar foto de perfil
            </button>
          </div>

          <div className="bio-section">
            <h2>Autobiografía</h2>
            <textarea 
              value={bio} 
              onChange={handleBioChange} 
              placeholder="Escribe sobre tu experiencia musical..."
              rows="5"
            />
          </div>
        </div>

        {/* Sección de Talentos Musicales y Reseñas */}
        <div className="right-section">
          <div className="talentos-section">
            <h2>Talentos Musicales</h2>
            <div className="instruments-genres">
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
