'use client';

import 'styles/chat.css'
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Configuration, OpenAIApi } from "openai";

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

async function runLLM(messages) {
  const res = await fetch(`/api/openai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: messages }),
  }).then(response => response.json());
  return res;
}

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSend = async () => {

    setMessages(prevMessages => [...prevMessages, { id: uuidv4(), role: "user", content: message }])

    const newMessage = { id: uuidv4(), role: "user", content: message };
    
    const messageList = [...messages, newMessage].map(message => ({
      role: message.role,
      content: message.content
    }));

    const response = await runLLM(messageList)

    setMessages(prevMessages => [...prevMessages, {id: uuidv4(), role: "assistant", content: response}]);

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
                <span className="role">{msg.role}</span> {msg.content}
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