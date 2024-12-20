import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import './calendarioPage.css';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

// Función para calcular la duración entre dos horas
const calculateDuration = (startTime, endTime) => {
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);
  const diff = end - start;
  const hours = diff / (1000 * 60 * 60);
  return hours > 0 ? hours : 0;
};

function CalendarioPage() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [formData, setFormData] = useState({
    id: null, // Añadimos el campo id aquí
    status: 'disponible',
    event_details: '',
    client_name: '',
    start_time: '',
    end_time: '',
    duration: '',
    earnings: ''
  });
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error al obtener los datos del usuario:', error);
      } else {
        setUser(data.user);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error al obtener los eventos:', error);
      } else {
        const normalizedEvents = data.map(event => ({
          id: event.id,
          title: event.status || 'Disponible',
          start: new Date(event.calendar_start_date).toISOString().split('T')[0],
          end: new Date(event.calendar_end_date).toISOString().split('T')[0],
          extendedProps: {
            event_details: event.event_details,
            client_name: event.client_name,
            start_time: event.start_time,
            end_time: event.end_time,
            duration: event.duration,
            earnings: event.earnings
          }
        }));
        setEvents(normalizedEvents);
      }
    };

    if (user) {
      fetchEvents();
    }
  }, [user]);

  // Ajustamos la selección de fechas
  const handleDateSelect = (selectionInfo) => {
    const start = new Date(selectionInfo.start);
    let end = new Date(selectionInfo.end);

    const calendarEndDate = new Date(end);
    end.setDate(end.getDate() - 1);

    setSelectedDates([start, end]);

    const event = events.find(
      (event) => new Date(event.start).toDateString() === start.toDateString()
    );
    if (event) {
      setFormData({
        id: event.id, // Añadimos el id del evento al formData para la edición
        status: event.title || 'disponible',
        event_details: event.extendedProps.event_details || '',
        client_name: event.extendedProps.client_name || '',
        start_time: event.extendedProps.start_time || '',
        end_time: event.extendedProps.end_time || '',
        duration: event.extendedProps.duration || '',
        earnings: event.extendedProps.earnings || ''
      });
    } else {
      setFormData({
        id: null,
        status: 'disponible',
        event_details: '',
        client_name: '',
        start_time: '',
        end_time: '',
        duration: '',
        earnings: ''
      });
    }
  };

  const handleEventClick = (info) => {
    const event = info.event;
    
    // Ajustamos la fecha de fin para que coincida con el comportamiento de handleDateSelect
    const start = new Date(event.start);
    const end = new Date(event.end || event.start);
    end.setDate(end.getDate() - 1); // Restamos un día para mostrar el rango correctamente
  
    setSelectedDates([start, end]);
  
    setFormData({
      id: event.id, // Añadimos el id del evento al formData para la edición
      status: event.title || 'disponible',
      event_details: event.extendedProps.event_details || '',
      client_name: event.extendedProps.client_name || '',
      start_time: event.extendedProps.start_time || '',
      end_time: event.extendedProps.end_time || '',
      duration: event.extendedProps.duration || '',
      earnings: event.extendedProps.earnings || ''
    });
  };

  const handleSave = async () => {
    const { id, status, event_details, client_name, start_time, end_time, earnings } = formData;
    const duration = calculateDuration(start_time, end_time);
    const [startDate, endDate] = selectedDates;

    const calendarEndDate = new Date(endDate);
    calendarEndDate.setDate(endDate.getDate() + 1);

    const { error } = await supabase
      .from('availability')
      .upsert({
        id: id || undefined,  // Esto asegura que solo se actualice si id existe
        user_id: user.id,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        calendar_start_date: startDate.toISOString().split('T')[0],
        calendar_end_date: calendarEndDate.toISOString().split('T')[0],
        status,
        event_details,
        client_name,
        start_time,
        end_time,
        duration,
        earnings
      });

    if (error) {
      setMessage({ type: 'error', text: 'Error al guardar los detalles.' });
      console.error('Error al guardar los detalles:', error);
    } else {
      setMessage({ type: 'success', text: 'Evento guardado con éxito.' });

      const updatedEvent = {
        id: id || new Date().getTime(),
        title: status || 'Disponible',
        start: startDate.toISOString().split('T')[0],
        end: calendarEndDate.toISOString().split('T')[0],
        extendedProps: {
          event_details,
          client_name,
          start_time,
          end_time,
          duration,
          earnings
        }
      };

      setEvents(prevEvents => {
        if (id) {
          return prevEvents.map(event => event.id === id ? updatedEvent : event);
        } else {
          return [...prevEvents, updatedEvent];
        }
      });
    }

    setFormData({
      id: null,
      status: 'disponible',
      event_details: '',
      client_name: '',
      start_time: '',
      end_time: '',
      duration: '',
      earnings: ''
    });
    setSelectedDates([]);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteEvent = async (eventId) => {
    const { error } = await supabase
      .from('availability')
      .delete()
      .eq('id', eventId);

    if (error) {
      setMessage({ type: 'error', text: 'Error al borrar el evento.' });
      console.error('Error al borrar el evento:', error);
    } else {
      setEvents(events.filter(event => event.id !== eventId));
      setMessage({ type: 'success', text: 'Evento borrado con éxito.' });
    }

    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = async () => {
    if (selectedDates.length > 0) {
      const [startDate] = selectedDates;
      const { error } = await supabase
        .from('availability')
        .delete()
        .eq('user_id', user.id)
        .eq('start_date', startDate.toISOString().split('T')[0]);

      if (error) {
        setMessage({ type: 'error', text: 'Error al borrar el evento.' });
        console.error('Error al borrar el evento:', error);
      } else {
        setEvents(events.filter(event => new Date(event.start).toISOString().split('T')[0] !== startDate.toISOString().split('T')[0]));
        setMessage({ type: 'success', text: 'Evento borrado con éxito.' });
      }

      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();

      // Elimina todos los tokens de localStorage
    localStorage.removeItem('django_token');
    localStorage.removeItem('django_refresh_token');
    localStorage.removeItem('supabase_token');
    localStorage.removeItem('supabase_refresh_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_password');
    
    navigate('/login');
  };

  return (
    <div className="calendario-page">
      <div className="navbar">
        <div className="logo">
          <img src="Subject.png" alt="Logo" />
        </div>
        <nav>
          <ul>
            <li><a href="/">Inicio</a></li>
            <li><a href="/search">Búsqueda</a></li>
            <li><a href="/calendario">Calendario</a></li>
            <li><a href="/inbox">Buzón de Entrada</a></li>
            <li><a href="/gallery">Galería</a></li>
            <li><a href="/profile">{user ? user.email : 'Perfil'}</a></li>
            <li><button className="calendar-btn" onClick={handleLogout}>Cerrar Sesión</button></li>
            <li><button className="calendar-btn" onClick={() => navigate(`/publicProfile/${user?.id}`)}>Perfil Público</button></li>
          </ul>
        </nav>
      </div>

      <h1>Mi Disponibilidad</h1>
      <div className="calendario-container">
        <div className="calendar-section">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
          />
        </div>

        <div className="details-section">
          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
          {selectedDates.length > 0 && (
            <div className="event-form">
              <h2>Detalles del Evento</h2>
              <p>
                Seleccionado: {selectedDates[0].toDateString()} hasta{' '}
                {selectedDates[1].toDateString()}
              </p>
              <label>
                Estado:
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="disponible">Disponible</option>
                  <option value="no disponible">No Disponible</option>
                  <option value="tentativo">Tentativo</option>
                </select>
              </label>

              <label>
                Detalles del Evento:
                <textarea
                  value={formData.event_details}
                  onChange={(e) => setFormData({ ...formData, event_details: e.target.value })}
                />
              </label>

              <label>
                Cliente:
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                />
              </label>

              <label>
                Hora de Inicio del Evento:
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </label>

              <label>
                Hora de Fin del Evento:
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </label>

              <label>
                Ganancia ($):
                <input
                  type="number"
                  value={formData.earnings}
                  onChange={(e) => setFormData({ ...formData, earnings: e.target.value })}
                />
              </label>

              <button className="calendar-btn" onClick={handleSave}>Guardar</button>
              <button className="calendar-btn" onClick={handleDelete}>Eliminar</button>
            </div>
          )}

          {events.length > 0 && (
            <div className="scheduled-events">
              <h2>Eventos Agendados</h2>
              <ul>
                {events.map(event => (
                  <li key={event.id}>
                    <p>
                      <strong>{new Date(event.start).toISOString().split('T')[0]}</strong> - <strong>{new Date(new Date(event.end).setDate(new Date(event.end).getDate() - 1)).toISOString().split('T')[0]}</strong>
                    </p>
                    <div className="event-details">
                      <p>Estado: {event.title}</p>
                      <p>Detalles: {event.extendedProps.event_details}</p>
                      <p>Cliente: {event.extendedProps.client_name}</p>
                      <p>Hora de Inicio: {event.extendedProps.start_time}</p>
                      <p>Hora de Fin: {event.extendedProps.end_time}</p>
                      <p>Ganancia: {event.extendedProps.earnings}</p>
                    </div>
                    <button className="calendar-btn" onClick={() => handleDeleteEvent(event.id)}>
                      Borrar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CalendarioPage;