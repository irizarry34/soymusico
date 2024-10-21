import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calendarioPage.css';
import { supabase } from '../supabaseClient';

// Función para generar un array con todas las fechas entre la fecha inicial y la fecha final
const generateDateRange = (start, end) => {
  const dateArray = [];
  let currentDate = new Date(start);

  while (currentDate <= end) {
    dateArray.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1); // Incrementar el día
  }

  return dateArray;
};

function CalendarioPage() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]); // Eventos con estados (disponible, no disponible, tentativo)
  const [selectedDates, setSelectedDates] = useState([]); // Rango de fechas seleccionadas
  const [formData, setFormData] = useState({
    status: 'disponible',
    event_details: '',
    client_name: '',
    event_time: '', // Campo de hora del evento
    duration: '',
    earnings: ''
  });
  const [message, setMessage] = useState(null); // Estado para mostrar mensajes

  // Obtener los datos del usuario
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

  // Obtener eventos del usuario
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
        setEvents(data);
      }
    };

    if (user) {
      fetchEvents();
    }
  }, [user]);

  // Manejar la selección de un rango de fechas
  const handleDateSelect = (range) => {
    setSelectedDates(range);
    const event = events.find(
      (event) => new Date(event.date).toDateString() === range[0].toDateString()
    );
    if (event) {
      setFormData({
        status: event.status || 'disponible',
        event_details: event.event_details || '',
        client_name: event.client_name || '',
        event_time: event.event_time || '',
        duration: event.duration || '',
        earnings: event.earnings || ''
      });
    } else {
      // Restablecer el formulario si no hay datos para las fechas
      setFormData({
        status: 'disponible',
        event_details: '',
        client_name: '',
        event_time: '',
        duration: '',
        earnings: ''
      });
    }
  };

  // Guardar la disponibilidad y detalles del evento para todas las fechas seleccionadas
  const handleSave = async () => {
    const { status, event_details, client_name, event_time, duration, earnings } = formData;

    // Validar si event_time está vacío o no
    let formattedEventTime = event_time || null; // Si está vacío, lo dejamos como null

    // Generar todas las fechas dentro del rango seleccionado
    const datesToSave = generateDateRange(selectedDates[0], selectedDates[1]);

    const savePromises = datesToSave.map(async (date) => {
      const { error } = await supabase
        .from('availability')
        .upsert({
          user_id: user.id,
          date: date.toISOString().split('T')[0],
          status,
          event_details,
          client_name,
          event_time: formattedEventTime, // Asegurarse de que el campo no esté vacío
          duration,
          earnings
        });

      if (error) {
        setMessage({ type: 'error', text: 'Error al guardar los detalles.' });
        console.error('Error al guardar los detalles:', error);
      } else {
        setMessage({ type: 'success', text: 'Evento guardado con éxito.' });
        // Actualizar los eventos locales
        const updatedEvents = [...events];
        const eventIndex = updatedEvents.findIndex(
          (event) => new Date(event.date).toDateString() === date.toDateString()
        );

        const newEvent = {
          user_id: user.id,
          date: date.toISOString().split('T')[0],
          status,
          event_details,
          client_name,
          event_time: formattedEventTime,
          duration,
          earnings
        };

        if (eventIndex !== -1) {
          updatedEvents[eventIndex] = newEvent;
        } else {
          updatedEvents.push(newEvent);
        }

        setEvents(updatedEvents);
        setSelectedDates([]); // Cerrar el formulario después de guardar
      }
    });

    await Promise.all(savePromises);

    // Limpiar mensaje después de 3 segundos
    setTimeout(() => setMessage(null), 3000);
  };

  // Manejar el borrado de un evento
  const handleDelete = async (eventDate) => {
    const { error } = await supabase
      .from('availability')
      .delete()
      .eq('user_id', user.id)
      .eq('date', eventDate.toISOString().split('T')[0]);

    if (error) {
      setMessage({ type: 'error', text: 'Error al borrar el evento.' });
      console.error('Error al borrar el evento:', error);
    } else {
      setEvents(events.filter(event => new Date(event.date).toDateString() !== eventDate.toDateString()));
      setMessage({ type: 'success', text: 'Evento borrado con éxito.' });
    }

    // Limpiar mensaje después de 3 segundos
    setTimeout(() => setMessage(null), 3000);
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const event = events.find(
        (event) => new Date(event.date).toDateString() === date.toDateString()
      );
      if (event) {
        if (event.status === 'no disponible') {
          return 'no-disponible';
        }
        if (event.status === 'tentativo') {
          return 'tentativo';
        }
        return 'disponible';
      }
    }
  };

  return (
    <div className="calendario-page">
      <h1>Disponibilidad del Músico</h1>
      <div className="calendario-container">
        {/* Columna izquierda: Calendario */}
        <div className="calendar-section">
          <Calendar
            selectRange={true} // Habilitar la selección de un rango
            tileClassName={tileClassName} // Asignar clases de estilo según la disponibilidad
            onChange={handleDateSelect} // Manejar la selección de fechas
          />
        </div>

        {/* Columna derecha: Formulario y lista de eventos */}
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
                Hora del Evento:
                <input
                  type="time"
                  value={formData.event_time}
                  onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                />
              </label>

              <label>
                Duración (en horas):
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
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

              <button onClick={handleSave}>Guardar</button>
            </div>
          )}

          {/* Lista de eventos con opción de borrar */}
          {events.length > 0 && (
            <div className="event-list">
              <h2>Eventos Guardados</h2>
              <ul>
                {events.map((event, index) => (
                  <li key={index}>
                    <p>Fecha: {new Date(event.date).toDateString()}</p>
                    <p>Estado: {event.status}</p>
                    <p>Detalles: {event.event_details}</p>
                    <p>Cliente: {event.client_name}</p>
                    <p>Hora: {event.event_time || 'No especificada'}</p>
                    <p>Duración: {event.duration || 'No especificada'}</p>
                    <p>Ganancia: {event.earnings || 'No especificada'}</p>
                    <button onClick={() => handleDelete(new Date(event.date))}>Cancelar</button>
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
