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
  const [editMessageId, setEditMessageId] = useState(null);
  const [edit, setEdit] = useState("")
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [dropdownMessageId, setDropdownMessageId] = useState(null)

  const textAreaRef = useRef(null);

  useEffect(() => {
    textAreaRef.current.style.height = '20px'; // Replace with your desired initial height
  }, [])

  const DropdownMenu = ({ messageId, onClose }) => {
    const deleteMessage = () => {
      onClose();
    }

    const duplicateMessage = () => {
      onClose();
    }

    const copyText = () => {
      onClose();
    }

    const editMessage = () => {
      onClose();
    }

    const editVisibility = () => {
      onClose();
    }

    return (
      <div className="dropdown-menu">
        <button onClick={deleteMessage}>delete</button>
        <button onClick={deleteMessage}>visibility</button>
        <button onClick={deleteMessage}>duplicate</button>
        <button onClick={deleteMessage}>copy</button>
        <button onClick={deleteMessage}>edit</button>
      </div>
    )
  }

  const handleMouseEnter = (id) => {
    setHoveredMessageId(id);
  };

  const handleMouseLeave = () => {
    setHoveredMessageId(null);
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    e.target.style.height = '20px';
    e.target.style.height = `${e.target.scrollHeight - 10}px`;
  };

  const handleEditChange = (e) => {
    setEdit(e.target.value)
    e.target.style.height = '20px';
    e.target.style.height = `${e.target.scrollHeight - 10}px`;
  }

  const handleEdit = (id, edit) => {
    const newMessages = [...messages];
    newMessages[id].content = edit;
    setMessages(newMessages);
    setEditMessageId(null);
    setEdit('')
  };

  const handleDropdownToggle = (id) => {
    setDropdownMessageId(id)
  }

  const handleNewChat = () => {
    setMessages([]);
  };

  const handleSend = async () => {

    // Return early if the message is empty
    if (message.trim() === "") {

      if (messages.length === 0) {
        return;
      }

      const messageList = messages.map(message => ({
        role: message.role,
        content: message.content
      }));

      const response = await runLLM(messageList);

      setMessages(prevMessages => [...prevMessages, { id: uuidv4(), role: "assistant", content: response }]);

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
                  {editMessageId === msg.id ? (
                    <div>
                      <textarea
                        ref={textAreaRef}
                        className='edit-box'
                        type='text'
                        value={edit}
                        onChange={e => {handleEditChange(e)}}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleEdit(index, edit)
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className='message-text' onClick={e => {
                      handleEditChange
                      setEdit(msg.content.toLowerCase())
                      setEditMessageId(msg.id)
                    }}>
                      {msg.content.toLowerCase().split('\n').map((item, key) => {
                        return <span key={key}>{item}<br/></span>
                      })}
                    </div>
                  )}
                </div>
                <div className="action-wrapper">
                  {hoveredMessageId === msg.id && (
                    <button className="message-actions" onClick={(e) => {
                      handleDropdownToggle(msg.id)
                      }}>
                      <GoKebabHorizontal />
                    </button>
                  )}
                  {dropdownMessageId === msg.id && <DropdownMenu messageId={msg.id} onClose={() => setDropdownMessageId(null)} />}
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
