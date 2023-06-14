'use client';

<<<<<<< HEAD
const Chatbot = () => {
  const [Umsg, setUmsg] = useState("");
  const [Convo, setConvo] = useState([]);
=======
import './chat.css'
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
>>>>>>> bash

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

<<<<<<< HEAD
    setConvo([...Convo, { msg: Umsg, sender: "User" }]);
    setConvo(prevConvo => [...prevConvo, { msg: "Connect API", sender: "GPT" }]);
    setUmsg("");
  };

  return (
    <div className="Chat">
      <h1>Title</h1>
      <div>
        {Convo.map((conv, index) => (
          <li key={index} className={conv.sender}>
            {conv.msg}
          </li>
        ))}
      </div>
      <form onSubmit={Prompt}>
        <input
          type="text"
          onChange={(ev) => setUmsg(ev.target.value)}
          value={Umsg}
        />
        <button type="submit">Send</button>
      </form>
=======
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
>>>>>>> bash
    </div>
  );
}