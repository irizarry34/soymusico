import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './galeryPage.css';
import { useNavigate } from 'react-router-dom';

function GaleryPage() {
  const [media, setMedia] = useState([]);
  const [files, setFiles] = useState([]);
  const [caption, setCaption] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Cargar datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user data:', error);
      } else {
        setUser(data.user);
      }
    };

    fetchUserData();
  }, []);

  // Cargar medios del usuario
  useEffect(() => {
    const fetchMedia = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching media:', error);
      } else {
        setMedia(data);
      }
    };

    if (user) {
      fetchMedia();  // Cargar medios después de que se cargue el usuario
    }
  }, [user]);

  // Manejar selección de archivos
  const handleFileChange = (e) => {
    setFiles(e.target.files); // Permitir múltiples archivos
  };

  // Manejar la subida de archivos
  const handleUpload = async () => {
    if (files.length === 0 || !user) return; // Validar que hay archivos y usuario

    const uploadPromises = Array.from(files).map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${new Date().getTime()}-${file.name}`;
      const filePath = `media/${fileName}`;

      // Subir archivo al bucket 'media'
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return null;
      }

      // Generar la URL pública del archivo subido
      const { data: fileData, error: urlError } = supabase
        .storage
        .from('media')
        .getPublicUrl(filePath);

      if (urlError || !fileData) {
        console.error('Error getting public URL:', urlError);
        return null;
      }

      // Insertar la referencia en la tabla 'media' con la URL pública
      const { error: insertError } = await supabase
        .from('media')
        .insert([{ url: fileData.publicUrl, caption: caption || file.name, user_id: user.id }]);

      if (insertError) {
        console.error('Error inserting media data:', insertError);
        return null;
      }

      return { url: fileData.publicUrl, caption: caption || file.name };
    });

    // Subir los archivos y agregar los medios a la galería
    const uploadedMedia = await Promise.all(uploadPromises);
    setFiles([]); // Limpiar los archivos después de la subida
    setCaption(''); // Limpiar el campo de caption
    setMedia([...media, ...uploadedMedia.filter(Boolean)]); // Agregar los medios subidos
  };

  return (
    <div className="galery-page">
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
            <li><a href="/profile">Mi Perfil</a></li>
            <li><button className="public-gallery-btn" onClick={() => navigate(`/galeryPublic/${user?.id}`)}>
              Galería Pública
            </button></li>
          </ul>
        </nav>
      </div>

      <h1>Mi Galería</h1>

      {/* Sección de carga */}
      <div className="upload-section">
        <input type="file" multiple onChange={handleFileChange} /> {/* Permitir múltiples archivos */}
        <input
          type="text"
          placeholder="Escribe un pie de foto"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <button onClick={handleUpload}>Subir</button>
      </div>

      {/* Galería de medios */}
      <div className="media-gallery">
        {media.map((item, index) => (
          <div key={index} className="media-item">
            {item.url.endsWith('.mp4') || item.url.endsWith('.mov') ? (
              <video controls src={item.url} alt="Media" />
            ) : (
              <img src={item.url} alt="Media" />
            )}
            <p>{item.caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GaleryPage;
