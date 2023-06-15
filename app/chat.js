'use client';

import 'styles/chat.css'
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

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
  const [editMode, setEditMode] = useState(false)
  const [edit, setEdit] = useState("")
  const [hoveredMessageId, setHoveredMessageId] = useState(null);


  const handleMouseEnter = (id) => {
    setHoveredMessageId(id);
  };

  const handleMouseLeave = () => {
    setHoveredMessageId(null);
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleEdit = (int, edit) => {
    const newMessages = [...messages];
    newMessages[int].content = edit;
    setMessages(newMessages);
  }

  const handleSend = async () => {

    setMessage("");

    setMessages(prevMessages => [...prevMessages, { id: uuidv4(), role: "user", content: message }])

    const newMessage = { id: uuidv4(), role: "user", content: message };

    const messageList = [...messages, newMessage].map(message => ({
      role: message.role,
      content: message.content
    }));

    const response = await runLLM(messageList)

    setMessages(prevMessages => [...prevMessages, { id: uuidv4(), role: "assistant", content: response }]);

  };

  const handleNewChat = () => {
    setMessages([]);
  };

  return (
    <div className="chat-container">
      <ul className="message-list">
        {messages.map((msg, index) =>
          <li key={msg.id} onMouseEnter={() => handleMouseEnter(msg.id)} onMouseLeave={handleMouseLeave}>
            <div className='message-wrapper'>
              <div className="message-role">
                <span className="role">{msg.role}</span>
              </div>
              <div className="message-content">
                {editMode ? (
                  <div>
                    <input
                      type='text'
                      value={message} onChange={e => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setEditMode(false)
                          handleEdit(index, message)
                          setMessage('')
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div onDoubleClick={() => setEditMode(true)}>
                    {msg.content.toLowerCase()}
                  </div>
                )
                }
              </div>
              <div className="action-wrapper">
                {hoveredMessageId === msg.id && (
                  <button className="message-actions" onClick={(e) => handleDropdownToggle(e, msg.id)}>
                    •••
                  </button>
                )}
              </div>
            </div>
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
