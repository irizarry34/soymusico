import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './landingPage/landingpage'; // Importa tu componente de landing page
import RegisterPage from './registerpage/registerPage'; // Importa el componente de registro
import LoginPage from './loginPage/loginPage'; // Importa el componente de login
import PerfilPage from './perfilPage/perfilPage'; // Importa el componente de perfil
import PublicProfile from './publicprofile/publicProfile'; // Asegúrate de que coincida con la carpeta y archivo exactos
import instrumentIcons from './instrumentIcons'; // Asegúrate de usar la ruta correcta
import SearchPage from './searchPage/searchPage'; // Ruta del componente SearchPage


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
          <Route path="/publicProfile" element={<PublicProfile />} /> {/* Corrige la ruta */}
          
          {/* Ruta para la página de busqueda de musicos */}
          <Route path="/search" element={<SearchPage />} />
          
          {/* Ruta para la los usuarios en la busqueda */}
          <Route path="/publicProfile/:id" element={<PublicProfile />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
