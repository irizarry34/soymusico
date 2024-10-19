import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './landingPage/landingpage'; // Importa tu componente de landing page
import RegisterPage from './registerpage/registerPage'; // Importa el componente de registro
import LoginPage from './loginPage/loginPage'; // Importa el componente de login
import PerfilPage from './perfilPage/perfilPage'; // Importa el componente de perfil
import PublicProfile from './publicprofile/publicProfile'; // Importa el perfil público
import instrumentIcons from './instrumentIcons'; // Asegúrate de usar la ruta correcta
import SearchPage from './searchPage/searchPage'; // Importa el componente de búsqueda
import GaleryPage from './galeryPage/galeryPage'; // Importa el componente de galería
import GaleryPublicPage from './galerypublicPage/galeryPublicPage'; // Importa la galería pública

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
          <Route path="/publicProfile/:id" element={<PublicProfile />} /> {/* Ruta pública */}
          
          {/* Ruta para la página de búsqueda */}
          <Route path="/search" element={<SearchPage />} />

          {/* Ruta para la página de galería privada */}
          <Route path="/gallery" element={<GaleryPage />} />

          {/* Ruta para la galería pública del usuario */}
          <Route path="/galeryPublic/:id" element={<GaleryPublicPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
