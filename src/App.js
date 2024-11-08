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

        {/* Agrupa las rutas protegidas dentro de ProtectedRoute */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<PerfilPage />} />
          <Route path="/publicProfile/:id" element={<PublicProfile />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/gallery" element={<GaleryPage />} />
          <Route path="/galeryPublic/:id" element={<GaleryPublicPage />} />
          <Route path="/calendario" element={<CalendarioPage />} />
          <Route path="/calendarioPublic/:id" element={<CalendarioPublicPage />} />
          <Route path="/inbox" element={<Inbox setNewMessageAlert={setNewMessageAlert} />} />
          <Route path="/alerts" element={<Inbox setNewMessageAlert={setNewMessageAlert} />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;