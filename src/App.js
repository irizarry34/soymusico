// src/App.js
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './landingPage/landingpage'; // Importa tu componente de landing page
import RegisterPage from './registerpage/registerPage'; // Importa el componente de registro
import LoginPage from './loginPage/loginPage'; // Importa el componente de login
import PerfilPage from './perfilPage/perfilPage'; // Importa el componente de perfil

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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
