
import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './inbox.css';
import { refreshAccessToken } from '../utils/auth';

// Declara las variables de intervalo fuera del componente
let fetchMessagesInterval;
let checkForNewMessagesInterval;

// Declara el límite de caracteres
const MESSAGE_LIMIT = 500;

function Inbox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null); // Django UUID
  const [djangoRecipientId, setDjangoRecipientId] = useState(null); // Django UUID for selected user
  const [messageText, setMessageText] = useState('');
  const [selectedMessages, setSelectedMessages] = useState([]); // Mensajes seleccionados para eliminar
  const [remainingChars, setRemainingChars] = useState(MESSAGE_LIMIT);
  const [newMessageAlert, setNewMessageAlert] = useState(false); // Alerta de nuevos mensajes
  const navigate = useNavigate();
  const [newMessageSender, setNewMessageSender] = useState(null);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  const fetchCurrentUserId = async () => {
    await refreshAccessToken(navigate);
    const djangoToken = localStorage.getItem('django_token');
    const email = localStorage.getItem('user_email');

    if (!email) {
      console.error("Email no encontrado en el almacenamiento local.");
      return;
    }

    try {
      const response = await fetch(`http://18.223.110.15:8000/api/get-user-uuid/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${djangoToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.toLowerCase() })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUserId(data.uuid); // Almacena el UUID de Django del usuario actual
      } else {
        console.error("Error obteniendo el ID del usuario:", await response.json());
      }
    } catch (error) {
      console.error("Error en la solicitud del ID del usuario:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('django_token');
    localStorage.removeItem('django_refresh_token');
    localStorage.removeItem('supabase_token');
    localStorage.removeItem('supabase_refresh_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_password');
    navigate('/login');
  };

  const fetchRecipientId = async (selectedUserEmail) => {
    const djangoToken = localStorage.getItem('django_token');

    try {
      const response = await fetch(`http://18.223.110.15:8000/api/get-user-uuid/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${djangoToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: selectedUserEmail.toLowerCase() })
      });

      if (response.ok) {
        const data = await response.json();
        setDjangoRecipientId(data.uuid); // Almacena el UUID de Django del usuario seleccionado
      } else {
        console.error("Error al obtener el UUID del destinatario en Django:", await response.json());
      }
    } catch (error) {
      console.error("Error en la solicitud del UUID del destinatario:", error);
    }
  };

  // Función para marcar mensajes como leídos
  const markMessagesAsRead = async () => {
    const djangoToken = localStorage.getItem('django_token');
  
    try {
      // Asegúrate de que currentUserId es el destinatario (recipient_id) y selectedUser.id es el remitente (sender_id)
      await fetch(`http://18.223.110.15:8000/api/mark-messages-as-read/?recipient_id=${currentUserId}&sender_id=${selectedUser?.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${djangoToken}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error("Error al marcar los mensajes como leídos:", error);
    }
  };

  // Solo marca mensajes como leídos si el usuario actual es el destinatario
  useEffect(() => {
    if (selectedUser && currentUserId === djangoRecipientId && newMessageSender?.id !== currentUserId) {
      markMessagesAsRead();
    }
  }, [selectedUser, djangoRecipientId, currentUserId, newMessageSender]);

  const checkForNewMessages = async () => {
    if (!currentUserId) return;
  
    const djangoToken = localStorage.getItem('django_token');
    try {
      const response = await fetch(`http://18.223.110.15:8000/api/check-new-messages/?recipient_id=${currentUserId}`, {
        headers: {
          'Authorization': `Bearer ${djangoToken}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (response.ok) {
        const data = await response.json();
        
        // Verifica si el remitente del mensaje es distinto del usuario actual
        if (data.has_new_messages && data.sender?.id !== currentUserId) {
          setNewMessageAlert(true);
          setNewMessageSender(data.sender);
          setHasUnreadMessages(true); // Actualiza a true si hay mensajes sin leer
        } else {
          setNewMessageAlert(false);
          setHasUnreadMessages(false); // No hay mensajes sin leer
        }
      } else {
        console.error("Error al verificar nuevos mensajes:", await response.json());
      }
    } catch (error) {
      console.error("Error en la verificación de nuevos mensajes:", error);
    }
  };

  const fetchMessages = async () => {
    if (!currentUserId || !djangoRecipientId) return;

    await refreshAccessToken(navigate);
    const djangoToken = localStorage.getItem('django_token');
    try {
      const response = await fetch(`http://18.223.110.15:8000/api/user-messages/?sender_id=${currentUserId}&recipient_id=${djangoRecipientId}`, {
        headers: {
          'Authorization': `Bearer ${djangoToken}`,
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
        // Marca los mensajes como leídos si el usuario actual es el destinatario
        if (currentUserId === djangoRecipientId) {
          markMessagesAsRead();
        }
      } else {
        console.error("Error al obtener los mensajes:", await response.json());
      }
    } catch (error) {
      console.error("Error en la solicitud de mensajes:", error);
    }
  };

  const handleDeleteMessages = async () => {
    const djangoToken = localStorage.getItem('django_token');
    try {
      for (let messageId of selectedMessages) {
        await fetch(`http://18.223.110.15:8000/api/delete-message/${messageId}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${djangoToken}`,
            'Content-Type': 'application/json',
          },
        });
      }
      setConversation((prevConversation) =>
        prevConversation.filter((message) => !selectedMessages.includes(message.id))
      );
      setSelectedMessages([]); // Reinicia la selección
      alert("Mensajes eliminados correctamente.");
    } catch (error) {
      console.error("Error en la eliminación de mensajes:", error);
      alert("No se pudo eliminar los mensajes. Por favor, intenta nuevamente.");
    }
  };

  const toggleMessageSelection = (messageId, isSent) => {
    if (!isSent) {
      alert("No puedes seleccionar mensajes de otros usuarios.");
      return;
    }
    setSelectedMessages((prevSelected) =>
      prevSelected.includes(messageId)
        ? prevSelected.filter((id) => id !== messageId)
        : [...prevSelected, messageId]
    );
  };

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
    await refreshAccessToken(navigate);
    const djangoToken = localStorage.getItem('django_token');

    if (!djangoRecipientId || !messageText.trim()) return;

    try {
      const response = await fetch(`http://18.223.110.15:8000/api/send-message/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${djangoToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient_id: djangoRecipientId,
          body: messageText
        })
      });

      if (response.ok) {
        setMessageText('');
        fetchMessages();
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

  const handleViewConversation = async () => {
    if (newMessageSender) {
      // Primero marca los mensajes como leídos para que no aparezca la alerta nuevamente
      await markMessagesAsRead();
  
      // Luego, establece el usuario seleccionado y carga los mensajes
      setSelectedUser(newMessageSender);
      setNewMessageAlert(false);
  
      await fetchRecipientId(newMessageSender.email);
      await fetchMessages();
    }
  };

  useEffect(() => {
    fetchCurrentUserId();
  }, []);
  
  useEffect(() => {
    if (currentUserId && selectedUser) {
      fetchRecipientId(selectedUser.email);
    }
  }, [selectedUser, currentUserId]);
  
  useEffect(() => {
    if (currentUserId && djangoRecipientId) {
      fetchMessages();
      fetchMessagesInterval = setInterval(fetchMessages, 5000);
      return () => clearInterval(fetchMessagesInterval);
    }
  }, [currentUserId, djangoRecipientId]);
  
  useEffect(() => {
    checkForNewMessagesInterval = setInterval(checkForNewMessages, 5000); // Verifica cada 5 segundos
    return () => clearInterval(checkForNewMessagesInterval);
  }, [currentUserId]);
  
  // Retrasa checkForNewMessages al verificar mensajes nuevos
  useEffect(() => {
    const delayCheckMessages = setTimeout(() => {
      const interval = setInterval(checkForNewMessages, 5000); // Intervalo de verificación cada 5 segundos
      return () => clearInterval(interval);
    }, 500); // Retraso de 500ms para permitir que fetchMessages termine
  
    return () => clearTimeout(delayCheckMessages);
  }, [currentUserId]);

  const formatDate = (date) => date.toLocaleDateString();

  return (
    <div className="inbox-container">
      <div className="navbar inbox-navbar">
        <div className="logo">
          <img src="/Subject.png" alt="Logo" />
        </div>
        <nav>
          <ul>
            <li><a href="/">Inicio</a></li>
            <li><a href="/search">Búsqueda</a></li>
            <li><a href="/calendario">Calendario</a></li> {/* Enlace al calendario */}
            <li><a href="/gallery">Galería</a></li>
            <li><a href="/profile">Mi Perfil</a></li>
            <li>
            <button className="custom-button" onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </li>
          </ul>
        </nav>
        {/* Notificación de mensaje en el navbar */}
        {newMessageAlert && newMessageSender && (
          <div className="navbar-notification">
            <span>¡Tienes un nuevo mensaje de {newMessageSender.first_name} {newMessageSender.last_name}!</span>
            <button className="view-conversation-btn" onClick={handleViewConversation}>
              Ver Conversación
            </button>
            <span className="navbar-notification-close" onClick={() => setNewMessageAlert(false)}>×</span>
          </div>
        )}
      </div>
      
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
                  <div className="message-content">
                    <p className="message-text">{message.text}</p>
                    <div className="message-info">
                      <p className="message-timestamp">{message.timestamp.toLocaleTimeString()}</p>
                      {message.isSent && <span className="me-label">Me</span>}
                    </div>
                  </div>
                  {message.isSent && (
                    <input
                      type="checkbox"
                      onChange={() => toggleMessageSelection(message.id, message.isSent)}
                      checked={selectedMessages.includes(message.id)}
                      className="message-checkbox"
                    />
                  )}
                </div>
                </Fragment>
              ))}
            </div>
            {selectedMessages.length > 0 && (
              <button onClick={handleDeleteMessages} className="delete-button">
                Eliminar mensajes seleccionados
              </button>
            )}
            <div className="send-message">
              <textarea
                placeholder="Escribe un mensaje..."
                value={messageText}
                onChange={(e) => {
                  const text = e.target.value;
                  if (text.length <= MESSAGE_LIMIT) {
                    setMessageText(text);
                    setRemainingChars(MESSAGE_LIMIT - text.length);
                  }
                }}
              />
              {/* Contador de caracteres */}
              <p className={`character-count ${remainingChars < 0 ? 'danger' : remainingChars <= 50 ? 'warning' : 'normal'}`}>
                {remainingChars} caracteres restantes
              </p>
              <button onClick={handleSendMessage} disabled={messageText.length === 0 || messageText.length > MESSAGE_LIMIT}>
                Enviar
              </button>
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