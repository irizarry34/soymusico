import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);  // Asegúrate de que estas constantes estén definidas
const navigate = useNavigate();

function Navbar({ newMessageAlert }) {
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
          <button className="logout-btn" onClick={() => supabase.auth.signOut().then(() => navigate('/login'))}>
            Cerrar Sesión
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;