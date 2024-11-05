import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useParams, useNavigate } from 'react-router-dom';
import './calendariopublicPage.css';
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
          start: new Date(event.calendar_start_date).toISOString().split('T')[0],
          end: new Date(event.calendar_end_date).toISOString().split('T')[0],
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

  const refreshDjangoAccessToken = async () => {
    const refreshToken = localStorage.getItem('django_refresh_token');
    if (!refreshToken) {
        console.error("No se encontró el token de refresco de Django. Por favor, inicia sesión nuevamente.");
        return null;
    }

    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error al refrescar el token de Django:', errorData);

            // Si el token de refresco no es válido, pide al usuario que inicie sesión nuevamente
            if (errorData.code === "token_not_valid") {
                console.error("El token de refresco de Django no es válido o ha expirado. Por favor, inicia sesión nuevamente.");
                localStorage.removeItem('django_token'); 
                localStorage.removeItem('django_refresh_token'); 
                return null;
            }
            return null;
        }

        const data = await response.json();
        localStorage.setItem('django_token', data.access);
        return data.access;
    } catch (error) {
        console.error('Error al refrescar el token de Django:', error);
        return null;
    }
  };

  const handleContactMessage = async () => {
    const token = localStorage.getItem('django_token');

    if (!token) {
        console.error("Usuario no autenticado. Por favor, inicia sesión.");
        return;
    }

    let djangoRecipientId;
    try {
        const emailResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/get-user-uuid/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: publicUser.email.toLowerCase() })
        });

        if (emailResponse.ok) {
            const data = await emailResponse.json();
            djangoRecipientId = data.uuid;
        } else {
            console.error("Error al obtener el UUID del usuario en Django.");
            return;
        }
    } catch (error) {
        console.error("Error al solicitar el UUID del usuario:", error);
        return;
    }

    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/send-message/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recipient_id: djangoRecipientId,
                body: contactMessage
            })
        });

        if (response.ok) {
            console.log("Mensaje enviado exitosamente");
            setContactMessage('');
            alert("Mensaje enviado con éxito!");
        } else {
            const errorData = await response.json();
            console.error("Error al enviar el mensaje:", errorData);
            alert("Hubo un error al enviar el mensaje.");
        }
    } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("No se pudo enviar el mensaje. Por favor, intenta nuevamente.");
    }
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
                  Mi Perfil
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
              events={events}
              selectable={false}
              eventClick={null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarioPublicPage;