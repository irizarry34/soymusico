import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './landingPage/landingpage';
import RegisterPage from './registerpage/registerPage';
import LoginPage from './loginPage/loginPage';
import PerfilPage from './perfilPage/perfilPage';
import PublicProfile from './publicprofile/publicProfile';
import instrumentIcons from './instrumentIcons';
import SearchPage from './searchPage/searchPage';
import GaleryPage from './galeryPage/galeryPage';
import GaleryPublicPage from './galerypublicPage/galeryPublicPage';
import CalendarioPage from './calendarioPage/calendarioPage'; // Importa el componente del calendario
import CalendarioPublicPage from './calendariopublicPage/calendariopublicPage'; // Importa el componente de calendario público

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta para la página principal (landing page) */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Ruta para la página de registro */}
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Ruta para la página de login */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Ruta para la página de perfil */}
          <Route path="/profile" element={<PerfilPage />} />

          {/* Ruta para la página de ver el perfil público */}
          <Route path="/publicProfile/:id" element={<PublicProfile />} />

          {/* Ruta para la página de búsqueda */}
          <Route path="/search" element={<SearchPage />} />

          {/* Ruta para la página de galería privada */}
          <Route path="/gallery" element={<GaleryPage />} />

          {/* Ruta para la galería pública del usuario */}
          <Route path="/galeryPublic/:id" element={<GaleryPublicPage />} />
          
          {/* Ruta para la página de calendario */}
          <Route path="/calendario" element={<CalendarioPage />} />

          {/* Ruta para la página de calendario público */}
          <Route path="/calendarioPublic/:id" element={<CalendarioPublicPage />} /> {/* Añade la ruta para CalendarioPublicPage */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
