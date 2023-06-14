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
    const newMessage = { id: uuidv4(), role: "user", content: message };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    const messageList = [...messages, newMessage];

    const completion = await runLLM(messageList)

    console.log(completion)
    
    const response = completion.data.choices[0].message;

    setMessages(prevMessages => [...prevMessages, {id: uuidv4(), role: "assistant", content: response.content}]);

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