'use client';

import './style/chat.css'
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Configuration, OpenAIApi } from "openai";

const orgKey = process.env.OPENAI_ORG_KEY;
const apiKey = process.env.OPENAI_API_KEY;

const configuration = new Configuration({
    apiKey: "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",
});
const openai = new OpenAIApi(configuration);

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

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messageList,
    });

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