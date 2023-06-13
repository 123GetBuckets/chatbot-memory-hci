'use client';

import './chat.css'
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSend = () => {
    setMessages(prevMessages => [...prevMessages, {id: uuidv4(), role: "user", text: message}]);
    setMessage("");
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  return (
    <div className="chat-container">
      <ul className="message-list">
        {messages.map(msg => 
            <li key={msg.id}>
                <span className="role">{msg.role}</span> {msg.text}
            </li>
        )}
      </ul>
      <div className="input-container">
        <button onClick={handleNewChat}>+</button>
        <input type="text" value={message} onChange={handleInputChange} />
        <button onClick={handleSend}>&gt;</button>
      </div>
    </div>
  );
}