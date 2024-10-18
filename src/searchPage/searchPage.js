import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import './searchPage.css'; // Importa el archivo CSS para mantener consistencia con los estilos

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async () => {
    console.log('Buscando:', query); // Verificar que la búsqueda comienza

    try {
      // Reemplazo de la consulta incorrecta con una que use correctamente el operador `or` en Supabase
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, instruments, genres')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,instruments.ilike.%${query}%,genres.ilike.%${query}%`);

      if (error) {
        console.error('Error al buscar usuarios:', error);
      } else {
        console.log('Resultados obtenidos:', data); // Ver los resultados obtenidos
        setResults(data); // Actualizar el estado de resultados
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
          <img src="Subject.png" alt="Logo" />
        </div>
        <nav>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/profile">Mi Perfil</Link></li>
            <li><Link to="/community">Comunidad</Link></li>
            <li><Link to="/calendar">Calendario</Link></li>
            <li><Link to="/contact">Contacto</Link></li>
            <li><Link to="/gallery">Galería</Link></li>
            <li><Link to="/inbox">Buzón de Entrada</Link></li>
            <li><Link to="/alerts">Alertas</Link></li>
            <li><button className="logout-btn" onClick={() => supabase.auth.signOut().then(() => navigate('/login'))}>Cerrar Sesión</button></li>
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
            <Link to={`/publicProfile/${user.id}`}>
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
