import React, { useState } from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import LandingPage from './landingPage/landingpage';
import RegisterPage from './registerpage/registerPage';
import LoginPage from './loginPage/loginPage';
import PerfilPage from './perfilPage/perfilPage';
import PublicProfile from './publicprofile/publicProfile';
import SearchPage from './searchPage/searchPage';
import GaleryPage from './galeryPage/galeryPage';
import GaleryPublicPage from './galerypublicPage/galeryPublicPage';
import CalendarioPage from './calendarioPage/calendarioPage';
import CalendarioPublicPage from './calendariopublicPage/calendariopublicPage';
import Inbox from './inbox/inbox';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [newMessageAlert, setNewMessageAlert] = useState(false);

  return (
    <div className="App">
      <Navbar newMessageAlert={newMessageAlert} />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas protegidas */}
        <ProtectedRoute path="/profile" element={<PerfilPage />} />
        <ProtectedRoute path="/publicProfile/:id" element={<PublicProfile />} />
        <ProtectedRoute path="/search" element={<SearchPage />} />
        <ProtectedRoute path="/gallery" element={<GaleryPage />} />
        <ProtectedRoute path="/galeryPublic/:id" element={<GaleryPublicPage />} />
        <ProtectedRoute path="/calendario" element={<CalendarioPage />} />
        <ProtectedRoute path="/calendarioPublic/:id" element={<CalendarioPublicPage />} />
        <ProtectedRoute path="/inbox" element={<Inbox setNewMessageAlert={setNewMessageAlert} />} />
        <ProtectedRoute path="/alerts" element={<Inbox setNewMessageAlert={setNewMessageAlert} />} />
      </Routes>
    </div>
  );
}

export default App;