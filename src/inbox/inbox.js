import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './inbox.css';

function Inbox() {
  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  // Función para obtener el UUID del usuario desde Django
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
        console.log("UUID del usuario actual establecido:", data.uuid);
      } else {
        console.error("Error obteniendo el ID del usuario:", await response.json());
      }
    } catch (error) {
      console.error("Error en la solicitud del ID del usuario:", error);
    }
  };

  // Función para obtener los mensajes del usuario desde Django
  const fetchMessages = async () => {
    if (!currentUserId) {
      console.log("El ID del usuario actual no está establecido aún.");
      return;
    }

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
        console.log("Todos los mensajes obtenidos:", data);
        setMessages(data);
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

  return (
    <div className="inbox-container">
      {/* Navbar */}
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

      <h2>Inbox</h2>
      {messages.length > 0 ? (
        messages.map((message) => (
          <div className="message-card" key={message.id}>
            <p className="message-sender">
              <strong>De:</strong> {message.sender.first_name} {message.sender.last_name}
            </p>
            <p className="message-body"><strong>Mensaje:</strong> {message.body}</p>
            <p className="message-timestamp">Fecha: {new Date(message.timestamp).toLocaleString()}</p>
          </div>
        ))
      ) : (
        <p className="no-messages">No tienes mensajes.</p>
      )}
    </div>
  );
}

export default Inbox;