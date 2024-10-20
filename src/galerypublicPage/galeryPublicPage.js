import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './galeryPublicPage.css';

function GaleryPublicPage() {
  const { id } = useParams(); // Usar el ID para cargar la galería pública del usuario
  const [media, setMedia] = useState([]);
  const [user, setUser] = useState(null); // Estado para el usuario autenticado
  const [selectedMedia, setSelectedMedia] = useState(null); // Estado para la media seleccionada
  const [isLightboxOpen, setIsLightboxOpen] = useState(false); // Estado para el visor (lightbox)
  const navigate = useNavigate(); // Para redirigir a otras páginas

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
      } else {
        setUser(user); // Establecer usuario autenticado
      }
    };

    const fetchMedia = async () => {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('user_id', id); // Solo muestra la media del usuario cuyo perfil estás viendo

      if (error) {
        console.error('Error fetching media:', error);
      } else {
        setMedia(data);
      }
    };

    if (id) {
      fetchMedia();
    }

    fetchUserData();
  }, [id]);

  // Función para abrir el visor con la media seleccionada
  const openLightbox = (mediaItem) => {
    setSelectedMedia(mediaItem);
    setIsLightboxOpen(true);
  };

  // Función para cerrar el visor
  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setSelectedMedia(null);
  };

  return (
    <div className="galery-public-page">
      {/* Navbar */}
      <div className="navbar">
        <div className="logo">
          <img src="/Subject.png" alt="Logo" />
        </div>
        <nav>
          <ul>
            <li><a href="/">Inicio</a></li>
            <li><a href="/search">Búsqueda</a></li>
            <li><a href="/profile">Mi Perfil</a></li>
            <li>
              {/* Mostrar el correo del usuario autenticado, clickeable para ir a perfilPage.js */}
              {user && (
                <span
                  className="user-info"
                  onClick={() => navigate('/profile')} // Redirigir a perfilPage.js
                  style={{ cursor: 'pointer', color: '#F38FFF' }} // Añadido estilo para indicar que es clickeable
                >
                  {user.email}
                </span>
              )}
            </li>
            <li>
              <button className="public-gallery-btn" onClick={() => navigate(`/gallery`)}>
                Galería
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <h1>Galería Pública</h1>

      <div className="media-gallery">
        {media.length === 0 ? (
          <p>No hay medios disponibles.</p>
        ) : (
          media.map((item, index) => (
            <div key={index} className="media-item" onClick={() => openLightbox(item)}>
              {item.url.endsWith('.mp4') || item.url.endsWith('.mov') ? (
                <video src={item.url} alt="Media" />
              ) : (
                <img src={item.url} alt="Media" />
              )}
              <p>{item.caption}</p>
            </div>
          ))
        )}
      </div>

      {/* Visor (Lightbox) */}
      {isLightboxOpen && selectedMedia && (
        <div className="lightbox" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            {selectedMedia.url.endsWith('.mp4') || selectedMedia.url.endsWith('.mov') ? (
              <video controls src={selectedMedia.url} />
            ) : (
              <img src={selectedMedia.url} alt="Selected Media" />
            )}
            <p>{selectedMedia.caption}</p>
            <button onClick={closeLightbox}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GaleryPublicPage;
