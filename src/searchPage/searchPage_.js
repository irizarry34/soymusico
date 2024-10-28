import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import './searchPage.css'; // Importa el archivo CSS para mantener consistencia con los estilos

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [user, setUser] = useState(null); // Estado para almacenar al usuario autenticado
  const navigate = useNavigate();

  // Verificar si hay un usuario autenticado al cargar la página
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession(); // Verificar si hay sesión activa
      if (session?.user) {
        setUser(session.user); // Establecer el usuario si está autenticado
      } else {
        navigate('/login'); // Redirigir al login si no hay sesión
      }
    };
    checkUser();
  }, [navigate]);

  const handleSearch = async () => {
    console.log('Buscando:', query);

    if (!query) {
      console.log('La consulta está vacía.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*'); // Seleccionamos todos los campos para depuración

      if (error) {
        console.error('Error al buscar usuarios:', error);
      } else {
        console.log('Todos los usuarios obtenidos:', data); // Ver todos los datos obtenidos

        // Ajustar el filtro para permitir coincidencias parciales en varios campos
        const filteredResults = data.filter(user =>
          user.first_name.toLowerCase().includes(query.toLowerCase()) ||
          user.last_name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase()) ||
          (user.instruments && user.instruments.toLowerCase().includes(query.toLowerCase())) ||
          (user.genres && user.genres.toLowerCase().includes(query.toLowerCase()))
        );

        console.log('Resultados filtrados:', filteredResults);
        setResults(filteredResults);
      }
    } catch (error) {
      console.error('Error inesperado durante la búsqueda:', error);
    }
  };

  return (
    <div className="search-page">
      {/* Navbar */}
      <div className="navbar">
        <div className="logo">
          <img src="/Subject.png" alt="Logo" /> {/* Verifica que la ruta del logo sea correcta */}
        </div>
        <nav>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/profile">Mi Perfil</Link></li>
            <li><Link to="/calendar">Calendario</Link></li>
            <li><Link to="/contact">Contacto</Link></li>
            <li><Link to="/gallery">Galería</Link></li>
            <li><Link to="/inbox">Buzón de Entrada</Link></li>
            <li><Link to="/alerts">Alertas</Link></li>
            {user && (
              <li>
                <button
                  className="logout-btn"
                  onClick={() => supabase.auth.signOut().then(() => navigate('/login'))}
                >
                  Cerrar Sesión
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>

      {/* Campo de búsqueda */}
      <div className="search-container">
        <input
          className="search-input"
          type="text"
          placeholder="Buscar usuarios por nombre, apellido, email, instrumentos, géneros"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="search-button" onClick={handleSearch}>Buscar</button>
      </div>

      {/* Resultados de búsqueda */}
      <ul className="search-results">
        {results.length === 0 && <p>No se encontraron resultados</p>}
        {results.map((user) => (
          <li key={user.id}>
            <Link 
              to={{
                pathname: `/publicProfile/${user.id}`,
                state: { email: user.email }, // Pasamos el email en el estado de navegación
              }}
            >
              {user.first_name} {user.last_name} - {user.email}
            </Link>
            <p>Instrumentos: {user.instruments || 'No especificado'}</p>
            <p>Géneros: {user.genres || 'No especificado'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchPage;
