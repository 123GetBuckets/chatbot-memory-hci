'use client';

import 'styles/chat.css'
import { GoGrabber, GoKebabHorizontal, GoPerson, GoPlus, GoTriangleRight, GoCopy, GoEye} from "react-icons/go";
import { DotFillIcon } from '@primer/octicons-react';
import { useState, useEffect, useRef } from 'react';
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

  const textAreaRef = useRef(null);

  useEffect(() => {
    textAreaRef.current.style.height = '20px'; // Replace with your desired initial height
  }, [])

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

    // Return early if the message is empty
    if (message.trim() === "") {
      return;
    }

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
                      {msg.content.toLowerCase().split('\n').map((item, key) => {
                        return <span key={key}>{item}<br/></span>
                      })}
                    </div>
                  )}
                </div>
                <div className="action-wrapper">
                  {hoveredMessageId === msg.id && (
                    <button className="message-actions" onClick={(e) => handleDropdownToggle(e, msg.id)}>
                      <GoKebabHorizontal />
                    </button>
                  )}
                </div>
              </div>
            </li>
        )}
      </ul>
      <div className="input-container">
        <button onClick={handleNewChat} className='input-button'><GoPlus /></button>
        <textarea
          ref={textAreaRef}
          type="text"
          className='input-box'
          value={message}
          onChange={handleInputChange}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button onClick={handleSend} className='input-button'><GoTriangleRight /></button>
      </div>
    </div>
  );
}
