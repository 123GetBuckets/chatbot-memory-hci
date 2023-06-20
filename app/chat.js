'use client';

import 'styles/chat.css';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { UndoIcon, KebabHorizontalIcon, TriangleRightIcon, PlusIcon, TrashIcon, DuplicateIcon, PencilIcon, CopyIcon, EyeIcon, EyeClosedIcon, CheckIcon } from '@primer/octicons-react';
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
  const [dropdownMessageId, setDropdownMessageId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copyClicked, setCopyClicked] = useState(false);
  const [roleDropdownId, setRoleDropdownId] = useState(null);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const textAreaRef = useRef(null);
  const editTextAreaRef = useRef(null);

  useEffect(() => {
    textAreaRef.current.style.height = '20px'; // Replace with your desired initial height
  }, [])

  useEffect(() => {
    if (editMessageId && editTextAreaRef.current) {
      const textarea = editTextAreaRef.current;
      textarea.focus();
      
      // Resize textarea to fit content
      textarea.style.height = '20px';
      textarea.style.height = `${textarea.scrollHeight - 10}px`;
    }
  }, [editMessageId, edit]);

  const DropdownMenu = ({ message, onClose }) => {

    const deleteMessage = () => {

      const newMessages = messages.filter(msg => msg.id !== message.id);
      setMessages(newMessages);

      setDropdownMessageId(null);
      setDropdownOpen(false);

      onClose();
    };

    const duplicateMessage = () => {

      let duplicatedMessage = { id: uuidv4(), role: message.role, content: message.content, visible: message.visible };

      setMessages(prevMessages => [...prevMessages, duplicatedMessage]);

      onClose();
    };

    const copyText = () => {
      navigator.clipboard.writeText(message.content);

      // Set copyClicked state to true when the button is clicked
      setCopyClicked(true);

      // Change it back to false after 2 seconds
      setTimeout(() => {
        setCopyClicked(false);
      }, 500);

    };

    const editMessage = () => {
      setEditMessageId(message.id);
      setEdit(message.content.toLowerCase());
      onClose();
    };

    const editVisibility = () => {
      const visible = message.visible;

      if (visible) {
        message.visible = false;
      } else {
        message.visible = true;
      }

      onClose();
    };

    return (
      <div className="dropdown-menu">
        <button title="Delete" onClick={deleteMessage}><TrashIcon size={16} /></button>
        <button title="Duplicate" onClick={duplicateMessage}><DuplicateIcon size={16} /></button>
        <button title="Copy" onClick={copyText}>
          {copyClicked ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
        </button>
        <button title="Edit" onClick={editMessage}><PencilIcon size={16} /></button>
        <button title={message.visible ? "Hide" : "Show"} onClick={editVisibility}>
          {message.visible ? <EyeClosedIcon size={16} /> : <EyeIcon size={16} />}
        </button>
      </div>
    )
  };

  const RoleDropdownMenu = ({ message, onClose }) => {

    const setAssistantRole = () => {
      message.role = "assistant";
      onClose();
    };

    const setUserRole = () => {
      message.role = "user";
      onClose();
    };

    return (
      <div className="role-dropdown-menu">
        <button onClick={setAssistantRole}>assistant</button>
        <button onClick={setUserRole}>user</button>
      </div>
    );
  };

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
    setEdit(e.target.value);
    e.target.style.height = '20px';
    e.target.style.height = `${e.target.scrollHeight - 10}px`;
  };

  const handleEdit = (index, edit) => {
    const newMessages = [...messages];
    newMessages[index].content = edit;
    setMessages(newMessages);
    setEditMessageId(null);
    setEdit('');
  };

  const handleDropdownToggle = (id) => {
    if (dropdownOpen) {
      setDropdownMessageId(null);
      setDropdownOpen(false);
      if (dropdownMessageId != id) {
        setDropdownMessageId(id);
        setDropdownOpen(true);
      };
    } else {
      setDropdownMessageId(id);
      setDropdownOpen(true);
    };
  };

  const handleRoleDropdownToggle = (id) => {
    if (roleDropdownOpen) {
      setRoleDropdownId(null);
      setRoleDropdownOpen(false);
      if (roleDropdownId != id) {
        setRoleDropdownId(id);
        setRoleDropdownOpen(true);
      };
    } else {
      setRoleDropdownId(id);
      setRoleDropdownOpen(true);
    };
  };

  const handleNewMessage = () => {

    let emptyMessage;

    if (messages.length === 0 || (messages[messages.length - 1].role === "assistant")) {
      emptyMessage = { id: uuidv4(), role: "user", content: "", visible: true };
    } else {
      emptyMessage = { id: uuidv4(), role: "assistant", content: "", visible: true };
    };

    setMessages(prevMessages => [...prevMessages, emptyMessage]);
  }

  const handleNewChat = () => {
    setMessages([]);
    setEditMessageId(null);
    setEdit("")
    setHoveredMessageId(null);
    setDropdownMessageId(null);
    setDropdownOpen(false);
  };

  
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(messages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setMessages(items);
  };

  const handleSend = async () => {

    const systemMessage = {
      role: "system",
      content: "You are HCI, a conversational assistant. Respond as concisely as possible. Use some emojis.",
    }

    const inputMessage = message;
    setMessage("");

    // Return early if the message is empty
    if (inputMessage.trim() === "") {

      if (messages.length === 0) {
        return;
      }

      const messageList = messages
        .filter((msg => msg.visible))
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      const response = await runLLM([systemMessage, ...messageList]);

      setMessages(prevMessages => [...prevMessages, { id: uuidv4(), role: "assistant", content: response, visible: true }]);

      return;
    }

    setMessages(prevMessages => [...prevMessages, { id: uuidv4(), role: "user", content: inputMessage, visible: true }])

    const newMessage = { id: uuidv4(), role: "user", content: inputMessage, visible: true };

    const newMessages = [...messages, newMessage]

    const messageList = newMessages
      .filter(msg => msg.visible)
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));

    const response = await runLLM([systemMessage, ...messageList]);

    setMessages(prevMessages => [...prevMessages, { id: uuidv4(), role: "assistant", content: response, visible: true }]);

  };

  return (
    <div className="chat-container">
      {messages.length === 0 &&
        <div className="title">ChatHCI</div>
      }
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="messages">
          {(provided) => (
            <ul className="message-list" {...provided.droppableProps} ref={provided.innerRef}>
              {messages.map((msg, index) =>
                <Draggable key={msg.id} draggableId={msg.id} index={index}>
                  {(provided) => (
                    <li {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef} onMouseEnter={() => handleMouseEnter(msg.id)} onMouseLeave={handleMouseLeave}>
                      <div className={msg.visible ? 'message-wrapper' : 'message-wrapper message-hidden'}>
                        <div className="message-role">
                            <span className="role" onClick={(e) => {
                              e.stopPropagation();
                              handleRoleDropdownToggle(msg.id)
                            }}>
                              {msg.role}
                            </span>
                          {roleDropdownId === msg.id && <RoleDropdownMenu className='role-dropdown-menu' message={msg} onClose={() => setRoleDropdownId(null)} />}
                        </div>
                        <div className="message-content">
                          {editMessageId === msg.id ? (
                            <div>
                              <textarea
                                ref={editTextAreaRef}
                                className='edit-box'
                                type='text'
                                defaultValue={edit}
                                onChange={e => { handleEditChange(e) }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleEdit(index, edit);
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className='message-text' onClick={e => {
                              setEdit(msg.content.toLowerCase());
                              setEditMessageId(msg.id);
                            }}>
                              {msg.content.toLowerCase().split('\n').map((item, key) => {
                                return <span key={key}>{item}<br /></span>
                              })}
                            </div>
                          )}
                        </div>
                        <div className="action-wrapper">
                          {((dropdownMessageId === msg.id) || hoveredMessageId === msg.id) && (
                            <button className="message-actions" onClick={(e) => {
                              handleDropdownToggle(msg.id)
                            }}>
                              <KebabHorizontalIcon />
                            </button>
                          )}
                          {dropdownMessageId === msg.id && <DropdownMenu className='dropdown-menu' message={msg} onClose={() => setDropdownMessageId(null)} />}
                        </div>
                      </div>
                    </li>
                  )}
                </Draggable>
              )}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
      <div className="input-container">
        <button title='New Chat' onClick={handleNewChat} className='input-button'><UndoIcon size={16} /></button>
        <button title='Add Message' onClick={handleNewMessage} className='input-button'><PlusIcon size={24} /></button>
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
        <button title='Send' onClick={handleSend} className='input-button'><TriangleRightIcon size={24} /></button>
      </div>
    </div>
  );
}
