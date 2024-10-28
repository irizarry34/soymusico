import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import './inbox.css';

function Inbox() {
  const [conversation, setConversation] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  const fetchCurrentUserId = async () => {
    const token = localStorage.getItem('django_token');
    const email = localStorage.getItem('user_email');

    if (!email) {
      console.error("Email no encontrado en el almacenamiento local.");
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/get-user-uuid/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.toLowerCase() })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUserId(data.uuid);
        console.log("UUID de Django obtenido y establecido:", data.uuid); // Depuración del UUID obtenido
      } else {
        console.error("Error obteniendo el ID del usuario:", await response.json());
      }
    } catch (error) {
      console.error("Error en la solicitud del ID del usuario:", error);
    }
  };

  const fetchMessages = async () => {
    if (!currentUserId) return;

    const token = localStorage.getItem('django_token');
    try {
      const response = await fetch('http://localhost:8000/api/user-messages/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Ordena los mensajes por fecha y hora
        const sortedMessages = data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Formatea los mensajes con información de remitente y destinatario
        const formattedMessages = sortedMessages.map((message) => {
          console.log("Mensaje procesado:", message); // Depuración del mensaje entero
          console.log("currentUserId:", currentUserId); // Depuración del currentUserId
          console.log("message.sender.id:", message.sender.id); // Depuración del sender.id del mensaje
          const isSent = String(message.sender.id) === String(currentUserId);
          console.log("isSent (¿enviado por usuario autenticado?):", isSent); // Depuración del resultado de la comparación

          return {
            id: message.id,
            text: message.body,
            timestamp: new Date(message.timestamp),
            isSent: isSent,
            senderName: isSent ? "Tú" : `${message.sender.first_name} ${message.sender.last_name}`,
          };
        });

        setConversation(formattedMessages);
        console.log("Mensajes obtenidos:", formattedMessages); // Depuración de la lista completa de mensajes formateados
      } else {
        console.error("Error al obtener los mensajes:", await response.json());
      }
    } catch (error) {
      console.error("Error en la solicitud de mensajes:", error);
    }
  };

  useEffect(() => {
    fetchCurrentUserId();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchMessages();
      const intervalId = setInterval(fetchMessages, 5000);
      return () => clearInterval(intervalId);
    }
  }, [currentUserId]);

  const formatDate = (date) => date.toLocaleDateString();

  return (
    <div className="inbox-container">
      <div className="navbar">
        <div className="logo">
          <img src="Subject.png" alt="Logo" />
        </div>
        <nav>
          <ul>
            <li><a href="/">Inicio</a></li>
            <li><a href="/search">Búsqueda</a></li>
            <li><a href="/calendario">Calendario</a></li>
            <li><a href="/contact">Contacto</a></li>
            <li><a href="/gallery">Galería</a></li>
            <li><a href="/profile">Perfil</a></li>
            <li><button className="logout-btn" onClick={() => navigate('/login')}>Cerrar Sesión</button></li>
          </ul>
        </nav>
      </div>

      <h2>Conversación</h2>
      <div className="message-list">
        {conversation.map((message, index, arr) => (
          <Fragment key={message.id}>
            {/* Mostrar la fecha separadora solo cuando cambia */}
            {index === 0 || formatDate(message.timestamp) !== formatDate(arr[index - 1].timestamp) ? (
              <div className="date-separator">
                {formatDate(message.timestamp)}
              </div>
            ) : null}
            <div
              className={`message ${message.isSent ? 'sent' : 'received'}`}
            >
              <p className="message-text">{message.text}</p>
              <p className="message-timestamp">{message.timestamp.toLocaleTimeString()}</p>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default Inbox;