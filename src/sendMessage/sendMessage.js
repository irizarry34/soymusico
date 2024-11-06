import React, { useState } from 'react';
import axios from 'axios';

const SendMessage = ({ recipientId }) => {
  const [messageBody, setMessageBody] = useState('');

  const sendMessage = (e) => {
    e.preventDefault();

    axios.post(`http://localhost:8000/api/messages/`, {
      recipient: recipientId,
      body: messageBody
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(response => {
      console.log('Message sent:', response.data);
      setMessageBody('');
    })
    .catch(error => {
      console.error('Error sending message:', error);
    });
  };

  return (
    <div>
      <form onSubmit={sendMessage}>
        <textarea 
          value={messageBody}
          onChange={(e) => setMessageBody(e.target.value)}
          placeholder="Write your message here..."
        />
        <button type="submit">Send Message</button>
      </form>
    </div>
  );
}

export default SendMessage;
