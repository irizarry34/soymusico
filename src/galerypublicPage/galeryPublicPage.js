import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './galeryPublicPage.css';

function GaleryPublicPage() {
  const { id } = useParams(); // Usar el ID para cargar la galería pública del usuario
  const [media, setMedia] = useState([]);

  useEffect(() => {
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
  }, [id]);

  return (
    <div className="galery-public-page">
      <h1>Galería Pública</h1>
      <div className="media-gallery">
        {media.map((item, index) => (
          <div key={index} className="media-item">
            <img src={item.url} alt="Media" />
            <p>{item.caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GaleryPublicPage;
