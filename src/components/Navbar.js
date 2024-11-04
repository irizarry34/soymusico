import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

function Navbar({ newMessageAlert }) {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="logo">
        <img src="/Subject.png" alt="Logo" />
      </div>
      <ul>
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/search">Búsqueda</Link></li>
        <li><Link to="/calendar">Calendario</Link></li>
        <li><Link to="/contact">Contacto</Link></li>
        <li><Link to="/gallery">Galería</Link></li>
        <li>
          <Link to="/alerts" className="alerts-link">
            Alertas
            {newMessageAlert && <span className="alert-icon">🔴</span>}
          </Link>
        </li>
        <li><Link to="/profile">Mi Perfil</Link></li>
        <li>
          <button
            className="logout-btn"
            onClick={() => supabase.auth.signOut().then(() => navigate('/login'))}
          >
            Cerrar Sesión
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;