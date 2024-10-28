import React, { useState, useEffect } from 'react';

function Inbox() {
    const [messages, setMessages] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);

    // Función para obtener el UUID del usuario desde Django
    const fetchCurrentUserId = async () => {
        const token = localStorage.getItem('django_token'); // Usa el token de Django
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
                body: JSON.stringify({ email: email })
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

        const token = localStorage.getItem('django_token'); // Usa el token de Django
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
        }
    }, [currentUserId]);

    return (
        <div>
            <h2>Inbox</h2>
            {messages.length > 0 ? (
                messages.map((message) => (
                    <div key={message.id}>
                        <p>
                            <strong>De:</strong> {message.sender.first_name} {message.sender.last_name}
                        </p>
                        <p><strong>Mensaje:</strong> {message.body}</p>
                        <p><small>Fecha: {new Date(message.timestamp).toLocaleString()}</small></p>
                    </div>
                ))
            ) : (
                <p>No tienes mensajes.</p>
            )}
        </div>
    );
}

export default Inbox;