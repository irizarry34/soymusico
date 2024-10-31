import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './inbox.css';

function Inbox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]); // Resultados de búsqueda de usuarios
  const [selectedUser, setSelectedUser] = useState(null); // Usuario seleccionado en la conversación
  const [conversation, setConversation] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [messageText, setMessageText] = useState(''); // Mensaje que se enviará
  const navigate = useNavigate();

  // Obtener el UUID del usuario autenticado desde Django
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
      } else {
        console.error("Error obteniendo el ID del usuario:", await response.json());
      }
    } catch (error) {
      console.error("Error en la solicitud del ID del usuario:", error);
    }
  };

  // Obtener mensajes entre el usuario autenticado y el usuario seleccionado
  const fetchMessages = async () => {
    if (!currentUserId || !selectedUser) return;

    const token = localStorage.getItem('django_token');
    try {
      const response = await fetch(`http://localhost:8000/api/user-messages/?sender_id=${currentUserId}&recipient_id=${selectedUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const sortedMessages = data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const formattedMessages = sortedMessages.map((message) => ({
          id: message.id,
          text: message.body,
          timestamp: new Date(message.timestamp),
          isSent: String(message.sender.id) === String(currentUserId),
          senderName: String(message.sender.id) === String(currentUserId) ? "Tú" : `${message.sender.first_name} ${message.sender.last_name}`,
        }));
        setConversation(formattedMessages);
      } else {
        console.error("Error al obtener los mensajes:", await response.json());
      }
    } catch (error) {
      console.error("Error en la solicitud de mensajes:", error);
    }
  };

  // Búsqueda de usuarios
  const handleSearch = async () => {
    if (!query) return;
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) console.error('Error al buscar usuarios:', error);
      else {
        const filteredResults = data.filter(user =>
          user.first_name.toLowerCase().includes(query.toLowerCase()) ||
          user.last_name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filteredResults);
      }
    } catch (error) {
      console.error('Error en la búsqueda:', error);
    }
  };

  const handleSendMessage = async () => {
    const token = localStorage.getItem('django_token'); // Token de autenticación de Django
  
    if (!token || !selectedUser || !messageText.trim()) return;
  
    // Obtiene el UUID del usuario seleccionado para usarlo como `recipient_id`
    let djangoRecipientId;
    try {
      const emailResponse = await fetch('http://localhost:8000/api/get-user-uuid/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: selectedUser.email.toLowerCase() })
      });
  
      if (emailResponse.ok) {
        const data = await emailResponse.json();
        djangoRecipientId = data.uuid; // UUID de Django
      } else {
        console.error("Error al obtener el UUID del usuario en Django.");
        return;
      }
    } catch (error) {
      console.error("Error al solicitar el UUID del usuario:", error);
      return;
    }
  
    // Enviar el mensaje con el UUID de Django como `recipient_id`
    try {
      const response = await fetch('http://localhost:8000/api/send-message/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient_id: djangoRecipientId,
          body: messageText
        })
      });
  
      if (response.ok) {
        setMessageText(''); // Limpia el área de entrada de texto después de enviar
        fetchMessages(selectedUser.id); // Actualiza la conversación
        alert("Mensaje enviado con éxito!");
      } else {
        const errorData = await response.json();
        console.error("Error al enviar el mensaje:", errorData);
        alert("Hubo un error al enviar el mensaje.");
      }
    } catch (error) {
      console.error("Error en la solicitud de envío de mensaje:", error);
      alert("No se pudo enviar el mensaje. Por favor, intenta nuevamente.");
    }
  };

  useEffect(() => {
    fetchCurrentUserId();
  }, []);

  useEffect(() => {
    if (currentUserId && selectedUser) fetchMessages();
  }, [currentUserId, selectedUser]);

  const formatDate = (date) => date.toLocaleDateString();

  return (
    <div className="inbox-container">
      {/* Navbar */}
      <div className="navbar">
        <div className="logo">
          <img src="/Subject.png" alt="Logo" />
        </div>
        <nav>
          <ul>
            <li><a href="/">Inicio</a></li>
            <li><a href="/search">Búsqueda</a></li>
            <li><a href="/profile">Mi Perfil</a></li>
            <li><a href="/calendar">Calendario</a></li>
            <li><a href="/contact">Contacto</a></li>
            <li><a href="/gallery">Galería</a></li>
            <li><a href="/alerts">Alertas</a></li>
            <li>
              <button className="logout-btn" onClick={() => supabase.auth.signOut().then(() => navigate('/login'))}>
                Cerrar Sesión
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Búsqueda de usuarios */}
      <div className="user-search">
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Buscar</button>
        <ul className="user-list">
          {results.map((user) => (
            <li
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={selectedUser?.id === user.id ? 'selected' : ''}
            >
              {user.first_name} {user.last_name}
            </li>
          ))}
        </ul>
      </div>

      {/* Conversación con el usuario seleccionado */}
      <div className="conversation-container">
        {selectedUser ? (
          <>
            <h2>Conversación con {selectedUser.first_name} {selectedUser.last_name}</h2>
            <div className="message-list">
              {conversation.map((message, index, arr) => (
                <Fragment key={message.id}>
                  {index === 0 || formatDate(message.timestamp) !== formatDate(arr[index - 1].timestamp) ? (
                    <div className="date-separator">{formatDate(message.timestamp)}</div>
                  ) : null}
                  <div className={`message ${message.isSent ? 'sent' : 'received'}`}>
                    <p className="message-text">{message.text}</p>
                    <p className="message-timestamp">{message.timestamp.toLocaleTimeString()}</p>
                  </div>
                </Fragment>
              ))}
            </div>
            {/* Campo para enviar mensaje */}
            <div className="send-message">
              <textarea
                placeholder="Escribe un mensaje..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <button onClick={handleSendMessage}>Enviar</button>
            </div>
          </>
        ) : (
          <p>Seleccione un usuario para ver la conversación.</p>
        )}
      </div>
    </div>
  );
}

export default Inbox;