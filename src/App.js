// src/App.js
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './landingPage/landingpage'; // Importa tu componente de landing page
import RegisterPage from './registerpage/registerPage'; // Importa el componente de registro

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta para la página principal (landing page) */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Ruta para la página de registro */}
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
