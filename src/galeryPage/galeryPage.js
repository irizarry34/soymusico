import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './galeryPage.css';
import { useNavigate } from 'react-router-dom';

function GaleryPage() {
  const [media, setMedia] = useState([]);
  const [files, setFiles] = useState([]);
  const [caption, setCaption] = useState('');
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(0); // Progreso de carga
  const [selectedMedia, setSelectedMedia] = useState([]); // Para manejar selección de fotos/videos
  const [message, setMessage] = useState(''); // Para mostrar mensajes
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
        .select('id, url, caption, path, is_public') // Asegúrate de seleccionar el campo `id` y `is_public`
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching media:', error);
      } else {
        setMedia(data);
      }
    };

    if (user) {
      fetchMedia(); // Cargar medios después de que se cargue el usuario
    }
  }, [user]);

// Función de logout
const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error al cerrar sesión:', error);
  } else {
    // Eliminar todos los tokens de localStorage
    localStorage.removeItem('django_token');
    localStorage.removeItem('django_refresh_token');
    localStorage.removeItem('supabase_token');
    localStorage.removeItem('supabase_refresh_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_password');

    // Redirigir al usuario a la página de login
    navigate('/login');
  }
};

  // Manejar selección de archivos
  const handleFileChange = (e) => {
    setFiles(e.target.files); // Permitir múltiples archivos
  };

  // Manejar la subida de archivos con progreso
  const handleUpload = async () => {
    if (files.length === 0 || !user) return; // Validar que hay archivos y usuario

    const totalFiles = files.length;
    let uploadedCount = 0;

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

      // Insertar la referencia en la tabla 'media' con la URL pública y el path
      const { data: insertData, error: insertError } = await supabase
        .from('media')
        .insert([{ url: fileData.publicUrl, caption: caption || file.name, user_id: user.id, path: filePath, is_public: true }]) // Nuevo registro será público
        .select(); // Asegurarnos de devolver el ID del nuevo registro

      if (insertError) {
        console.error('Error inserting media data:', insertError);
        return null;
      }

      uploadedCount += 1;
      setProgress(Math.floor((uploadedCount / totalFiles) * 100)); // Actualizar progreso

      return { ...insertData[0], url: fileData.publicUrl, caption: caption || file.name, path: filePath };
    });

    // Subir los archivos y agregar los medios a la galería
    const uploadedMedia = await Promise.all(uploadPromises);
    setFiles([]); // Limpiar los archivos después de la subida
    setCaption(''); // Limpiar el campo de caption
    setMedia([...media, ...uploadedMedia.filter(Boolean)]); // Agregar los medios subidos
    setProgress(0); // Reiniciar progreso después de la subida
    setMessage('¡Archivo subido con éxito!'); // Mostrar mensaje de éxito
  };

  // Manejar la selección de medios
  const toggleSelectMedia = (item) => {
    setSelectedMedia((prevSelected) => {
      if (prevSelected.includes(item)) {
        return prevSelected.filter((mediaItem) => mediaItem.id !== item.id);
      } else {
        return [...prevSelected, item];
      }
    });
  };

  // Manejar la eliminación de medios seleccionados
  const handleDelete = async () => {
    if (selectedMedia.length === 0) return;

    const deletePromises = selectedMedia.map(async (mediaItem) => {
      if (!mediaItem.path) {
        console.error("El archivo no tiene un 'path' válido:", mediaItem);
        return;
      }

      // Eliminar el archivo del bucket
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([mediaItem.path]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        return;
      }

      // Eliminar el registro de la base de datos
      if (!mediaItem.id) {
        console.error('No se encontró un ID válido para el registro de la base de datos', mediaItem);
        return;
      }

      const { error: deleteError } = await supabase
        .from('media')
        .delete()
        .eq('id', mediaItem.id);

      if (deleteError) {
        console.error('Error deleting media from database:', deleteError);
      } else {
        // Actualizar el estado eliminando el archivo localmente
        setMedia((prevMedia) => prevMedia.filter((item) => item.id !== mediaItem.id));
      }
    });

    await Promise.all(deletePromises);
    setSelectedMedia([]); // Limpiar la selección
    setMessage('Medios borrados con éxito'); // Mostrar mensaje de éxito
  };

  // Manejar la actualización para marcar medios como privados
  const handleMakePrivate = async () => {
    if (selectedMedia.length === 0) return;

    const updatePromises = selectedMedia.map(async (mediaItem) => {
      if (!mediaItem.id) {
        console.error('No se encontró un ID válido para el registro de la base de datos', mediaItem);
        return;
      }

      console.log(`Marcando media con id ${mediaItem.id} como privada`);

      // Actualizar el campo is_public a false
      const { error: updateError } = await supabase
        .from('media')
        .update({ is_public: false }) // Cambiar `is_public` a false
        .eq('id', mediaItem.id);

      if (updateError) {
        console.error('Error updating media to private:', updateError);
      } else {
        console.log(`Media con id ${mediaItem.id} marcada como privada en la base de datos`);

        // Actualizar el estado localmente
        setMedia((prevMedia) =>
          prevMedia.map((item) => (item.id === mediaItem.id ? { ...item, is_public: false } : item))
        );
      }
    });

    await Promise.all(updatePromises);
    setSelectedMedia([]); // Limpiar la selección
    setMessage('Medios marcados como privados'); // Mostrar mensaje de éxito
  };

  // Manejar la actualización para marcar medios como públicos
  const handleMakePublic = async () => {
    if (selectedMedia.length === 0) return;

    const updatePromises = selectedMedia.map(async (mediaItem) => {
      if (!mediaItem.id) {
        console.error('No se encontró un ID válido para el registro de la base de datos', mediaItem);
        return;
      }

      console.log(`Marcando media con id ${mediaItem.id} como pública`);

      // Actualizar el campo is_public a true
      const { error: updateError } = await supabase
        .from('media')
        .update({ is_public: true }) // Cambiar `is_public` a true
        .eq('id', mediaItem.id);

      if (updateError) {
        console.error('Error updating media to public:', updateError);
      } else {
        console.log(`Media con id ${mediaItem.id} marcada como pública en la base de datos`);

        // Actualizar el estado localmente
        setMedia((prevMedia) =>
          prevMedia.map((item) => (item.id === mediaItem.id ? { ...item, is_public: true } : item))
        );
      }
    });

    await Promise.all(updatePromises);
    setSelectedMedia([]); // Limpiar la selección
    setMessage('Medios marcados como públicos'); // Mostrar mensaje de éxito
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
            <li><a href="/profile">Mi Perfil</a></li>
            <li><button className="public-gallery-btn" onClick={() => navigate(`/galeryPublic/${user?.id}`)}>
              Galería Pública
            </button></li>
            <li><button className="public-gallery-btn" onClick={handleLogout}>Cerrar Sesión</button></li> {/* Botón de logout */}
          </ul>
        </nav>
      </div>

      <h1>Mi Galería</h1>

      {/* Mostrar mensaje */}
      {message && <p className="message">{message}</p>}

      {/* Sección de carga */}
      <div className="upload-section">
        <input type="file" multiple onChange={handleFileChange} /> {/* Permitir múltiples archivos */}
        <input
          type="text"
          placeholder="Escribe un pie de foto"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <button onClick={handleUpload}>Cargar</button>

        {/* Mostrar progreso de carga */}
        {progress > 0 && <p>Subiendo: {progress}%</p>}
      </div>

      <div className="media-gallery">
        {media.map((item, index) => (
          <div key={index} className={`media-item ${selectedMedia.includes(item) ? 'selected' : ''}`}>
            <div className="select-box" onClick={() => toggleSelectMedia(item)} style={{ fontSize: '24px' }}>
              {selectedMedia.includes(item) ? '✓' : '□'}
            </div>
            {/* Tag de estado público/privado */}
            <div className={`tag ${item.is_public ? 'public' : 'private'}`}>
              {item.is_public ? 'Público' : 'Privado'}
            </div>
            {item.url.endsWith('.mp4') || item.url.endsWith('.mov') ? (
              <video controls src={item.url} alt="Media" />
            ) : (
              <img src={item.url} alt="Media" />
            )}
            <p>{item.caption}</p>
          </div>
        ))}
      </div>

      {/* Botones si hay medios seleccionados */}
      {selectedMedia.length > 0 && (
        <div className="delete-section">
          <button onClick={handleDelete}>Borrar</button>
          <button onClick={handleMakePrivate}>Privada</button> {/* Botón para marcar como privado */}
          <button onClick={handleMakePublic}>Pública</button> {/* Botón para marcar como público */}
        </div>
      )}
    </div>
  );
}

export default GaleryPage;
