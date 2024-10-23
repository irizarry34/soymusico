import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useParams, useNavigate } from 'react-router-dom';
import './calendariopublicPage.css'; // Archivo CSS específico para esta página
import { supabase } from '../supabaseClient';

function CalendarioPublicPage() {
  const { id } = useParams(); // Captura el ID del músico público
  const [events, setEvents] = useState([]);
  const [publicUser, setPublicUser] = useState(null); // Datos del perfil público
  const [currentUser, setCurrentUser] = useState(null); // Datos del usuario autenticado
  const [contactMessage, setContactMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const navigate = useNavigate();

  // Obtener el usuario autenticado
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error obteniendo el usuario autenticado:', error);
        return;
      }
      setCurrentUser(user);
    };

    fetchCurrentUser();
  }, []);

  // Obtener los eventos de disponibilidad del músico
  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('user_id', id);

      if (error) {
        console.error('Error al obtener los eventos:', error);
      } else {
        const normalizedEvents = data.map(event => ({
          id: event.id,
          title: event.status || 'Disponible',
          start: event.start_date,
          end: event.end_date,
        }));
        setEvents(normalizedEvents);
      }
    };

    if (id) {
      fetchEvents();
    }
  }, [id]);

  // Obtener los datos del perfil público
  useEffect(() => {
    const fetchPublicUserData = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('first_name, last_name, email')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error al obtener los datos del perfil público:", error);
      } else {
        setPublicUser(data);
      }
    };

    if (id) {
      fetchPublicUserData();
    }
  }, [id]);

  // Manejar el envío del mensaje de contacto
  const handleContactMessage = () => {
    console.log("Mensaje enviado a:", publicUser.email, contactMessage, contactEmail, contactPhone);
    setContactMessage('');
    setContactEmail('');
    setContactPhone('');
    alert('Mensaje enviado correctamente.');
  };

  return (
    <div className="calendario-public-page">
      {/* Navbar */}
      <div className="calendarioPublic-navbar">
        <div className="calendarioPublic-logo">
          <img src="/Subject.png" alt="Logo" />
        </div>
        <nav>
          <ul className="calendarioPublic-nav-list">
            <li><a href="/">Inicio</a></li>
            <li><a href="/search">Búsqueda</a></li>
            <li><a href="/contact">Contacto</a></li>
            <li><a href="/inbox">Buzón de Entrada</a></li>
            <li><a href="/gallery">Galería</a></li>
            {currentUser && (
              <li>
                <button
                  className="logout-btn"
                  onClick={() => navigate('/profile')}
                >
                  Perfil
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>

      <div className="calendario-public-content">
        {/* Sección izquierda: Formulario de contacto */}
        <div className="calendarioPublic-left-section">
          <h2>Contacta con {publicUser?.first_name} {publicUser?.last_name}:</h2>
          <input
            type="email"
            placeholder="Tu correo electrónico"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
          <input
            type="tel"
            placeholder="Tu teléfono"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
          <textarea
            placeholder="Escribe tu mensaje..."
            rows="5"
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
          />
          <button onClick={handleContactMessage}>Enviar Mensaje</button>
        </div>

        {/* Sección derecha: Calendario de disponibilidad */}
        <div className="calendarioPublic-right-section">
          <h2>Disponibilidad:</h2>
          <div className="calendarioPublic-calendar-section">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events} // Muestra los eventos sin opción de modificación
              selectable={false} // Desactiva la selección
              eventClick={null} // No permite interacción en los eventos
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarioPublicPage;
