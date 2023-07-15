'use client';

import DropdownMenu from './components/DropdownMenu';
import RoleDropdownMenu from './components/RoleDropdownMenu';
import { runLLM } from './utils/api'; // Import API functions

import 'styles/chat.css';
import React, { useState, useEffect, useRef } from 'react';

import { v4 as uuidv4 } from 'uuid';

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from "framer-motion";
import remarkGfm from 'remark-gfm';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { UndoIcon, KebabHorizontalIcon, TriangleRightIcon, PlusIcon, CheckboxIcon, SquareIcon, StackIcon } from '@primer/octicons-react';

export default function Chat() {
  const [inputId, setInputId] = useState(null);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([{id: uuidv4(), messages: []}]);
  const [editMessageId, setEditMessageId] = useState(null);
  const [edit, setEdit] = useState("")
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [dropdownMessageId, setDropdownMessageId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [roleDropdownId, setRoleDropdownId] = useState(null);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selected, setSelected] = useState([]);
  const textAreaRef = useRef(null);
  const editTextAreaRef = useRef(null);

  useEffect(() => {
    console.log(chats);
  }, [chats]);

  useEffect(() => {
    console.log(selected);
  }, [selected]);

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

  const handleEdit = (chatId, messageId, edit) => {
    setChats(prevChats => {
        const newChats = [...prevChats];
        const chatIndex = newChats.findIndex(chat => chat.id === chatId);
        const messageIndex = newChats[chatIndex].messages.findIndex(msg => msg.id === messageId);
        
        const newMessages = [...newChats[chatIndex].messages]; // Create a new copy of the messages array
        newMessages[messageIndex].content = edit; // Edit the message
        newChats[chatIndex] = {...newChats[chatIndex], messages: newMessages}; // Create a new chat object for the updated chat
        
        return newChats; // Return the new chats array
    });
    
    setEditMessageId(null);
    setEdit("");
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

  const handleSelect = (message) => {
    if (!selected.some(e => e.id === message.id)) {
      selected.push({ id: message.id, content: message.content, role: message.role, visible: message.visible })
      console.log(selected)
    }
    else {
      const unSelect = selected.filter(select => select.id !== message.id)
      setSelected(unSelect)
    }
  }

  const handleNewMessage = (chatId) => {
    let emptyMessage;
  
    const chatIndex = chats.findIndex(chat => chat.id === chatId);
    const messages = chats[chatIndex].messages;
  
    if (messages.length === 0 || (messages[messages.length - 1].role === "assistant")) {
      emptyMessage = { id: uuidv4(), role: "user", content: "", visible: true };
    } else {
      emptyMessage = { id: uuidv4(), role: "assistant", content: "", visible: true };
    }
  
    // Create a new copy of the chats array
    const newChats = [...chats];
  
    // Update the specific chat's messages
    newChats[chatIndex].messages = [...messages, emptyMessage];
  
    setChats(newChats);
  };

  const handleChatReset = (chatId) => {
    const chatIndex = chats.findIndex(chat => chat.id === chatId);
  
    setChats(prevChats => {
      const newChats = [...prevChats];
      newChats[chatIndex].messages = [];
  
      return newChats;
    });
  
    setEditMessageId(null);
    setEdit("");
    setHoveredMessageId(null);
    setDropdownMessageId(null);
    setDropdownOpen(false);
    setIsTyping(false);
  };

  const handleAddChat = () => {
    const newChat = {id: uuidv4(), messages: []};
    setChats(prevChats => {
        const newChats = [...prevChats, newChat];
        return newChats; // Creates a new array that includes all the old chats and the new one
    });
  };

  const handleResetChats = () => { setChats([{id: uuidv4(), messages: []}]); };

  const handleOnDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    setChats(prevChats => {
        const newChats = [...prevChats]; // Create a new copy of the chats array

        if (source.droppableId === destination.droppableId) {
            const chatIndex = newChats.findIndex(chat => chat.id === source.droppableId);
            const items = Array.from(newChats[chatIndex].messages);
            const [reorderedItem] = items.splice(source.index, 1);
            items.splice(destination.index, 0, reorderedItem);

            newChats[chatIndex] = {...newChats[chatIndex], messages: items}; // Create a new chat object for the updated chat
        } else {
            const sourceChatIndex = newChats.findIndex(chat => chat.id === source.droppableId);
            const destinationChatIndex = newChats.findIndex(chat => chat.id === destination.droppableId);
            const sourceItems = Array.from(newChats[sourceChatIndex].messages);
            const destinationItems = Array.from(newChats[destinationChatIndex].messages);
            const [movedItem] = sourceItems.splice(source.index, 1);
            destinationItems.splice(destination.index, 0, movedItem);

            newChats[sourceChatIndex] = {...newChats[sourceChatIndex], messages: sourceItems}; // Create a new chat object for the source chat
            newChats[destinationChatIndex] = {...newChats[destinationChatIndex], messages: destinationItems}; // Create a new chat object for the destination chat
        }

        return newChats; // Return the new chats array
    });
  };



  const handleSend = async (chatId) => {
    const systemMessage = {
      role: "system",
      content: "You are a helpful assistant.",
    };
  
    const prompt = message.trim();
    const userMessage = { id: uuidv4(), role: "user", content: String(prompt), visible: true };
  
    const chatIndex = chats.findIndex(chat => chat.id === chatId);
    let messages = chats[chatIndex].messages;
  
    const visibleMessages = messages.filter(msg => msg.visible && (msg.content !== ""));
  
    if (prompt === "" && visibleMessages.length === 0) {
      return;
    } else {
      setChats(prevChats => {
          // Notice we're now creating a new chat object as well, not just a new array for chats
          const chatIndex = prevChats.findIndex(chat => chat.id === chatId);
          const oldChat = prevChats[chatIndex];
          let newChat = {...oldChat, messages: [...oldChat.messages]}; // copy the chat to a new object

          if (prompt !== "") {
              newChat.messages.push(userMessage);
          }

          setMessage("");

          const messageList = [systemMessage, ...newChat.messages
          .filter(msg => msg.visible)
          .map(msg => ({
              role: msg.role === "summary" ? "user" : msg.role,
              content: msg.content
          }))];

          setIsTyping(true);

          runLLM(messageList).then(response => {
              setIsTyping(false);
              const assistantMessage = { id: uuidv4(), role: "assistant", content: String(response), visible: true };
              newChat.messages.push(assistantMessage);
          });

          const newChats = prevChats.map(chat => chat.id === chatId ? newChat : chat); // replace the old chat with the new one in the array

          return newChats;
      });
    }
  };

  const handleSummarize = async (chatId) => {
    const summaryMessage = {
      role: "user",
      content: "Given the following messages so far, create a summary of our conversation.",
    };

    const chatIndex = chats.findIndex(chat => chat.id === chatId);

    const messageList = [...selected
      .filter(msg => msg.visible)
      .map(msg => ({
          role: msg.role === "summary" ? "user" : msg.role,
          content: msg.content
      })), summaryMessage];

    runLLM(messageList).then(response => { 
      const summary = { id: uuidv4(), role: "summary", content: String(response), visible: true };
      const newChats = [...chats];

      // Mark selected messages as not visible
      newChats[chatIndex].messages = newChats[chatIndex].messages.map(msg =>
        selected.find(s => s.id === msg.id) ? {...msg, visible: false} : msg
      );

      newChats[chatIndex].messages.push(summary);
      setChats(newChats);

      setSelected([]);
    });

  };

  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <SyntaxHighlighter wrapLines={true} style={coy} language={match[1]} PreTag="div" children={String(children).replace(/\n$/, '')} {...props} />
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      )
    }
  }

  const titleVariants = {
    hidden: { opacity: 0, y: -50, x: -65 },
    visible: { opacity: 0.1, y: -200, x: -65, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -300, transition: { duration: 0.2 } }
  }

  return (
    <div className="chat-container">
      <AnimatePresence>
        {!chats.some(chat => chat.messages.length > 0) &&
          <motion.div
            className="title"
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            ChatHCI
          </motion.div>
        }
      </AnimatePresence>
      <DragDropContext onDragEnd={handleOnDragEnd}>
      <ul className="chat-list">
        {chats.map((chat, chatIndex) =>
          <li className="flex-container" key={chat.id}>
            <motion.div layoutId='message-list' className="message-list">
              
                <Droppable droppableId={String(chatIndex)}>
                  {(provided) => (
                    <ul className="message-list" {...provided.droppableProps} ref={provided.innerRef}>
                      {chat.messages.map((msg, index) =>
                        <Draggable key={msg.id} draggableId={msg.id} index={index} >
                          {(provided) => (
                            <AnimatePresence>
                              <motion.li
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                ref={provided.innerRef}
                                onMouseEnter={() => handleMouseEnter(msg.id)}
                                onMouseLeave={handleMouseLeave}
                                initial={{ opacity: 0, y: 10 }} // animate from
                                animate={{ opacity: 1, y: 0 }} // animate to
                                exit={{ opacity: 0, x: -10 }} // animate out
                                transition={{ duration: 0.5, ease: "easeInOut" }} // animation duration
                              >
                                  <div className={msg.visible ? 'message-wrapper' : 'message-wrapper message-hidden'}>
                                    <div className="message-role">
                                      <span className="role" onClick={(e) => {
                                        e.stopPropagation();
                                        handleRoleDropdownToggle(msg.id)
                                      }}>
                                        {msg.role}
                                      </span>
                                      <AnimatePresence>
                                        {roleDropdownId === msg.id && roleDropdownOpen && (
                                          <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                            transition={{ duration: 0.1 }}
                                          >
                                            <RoleDropdownMenu
                                              className='role-dropdown-menu'
                                              message={msg}
                                              onClose={handleRoleDropdownToggle}
                                            />
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
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
                                                handleEdit(chat.id, msg.id, edit);
                                              }
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        <div className='message-text' onClick={e => {
                                          setEdit(msg.content.toLowerCase());
                                          setEditMessageId(msg.id);
                                        }}>
                                          <div className="markdown-container">
                                            {
                                              msg.content.trim() !== '' ?
                                                <ReactMarkdown components={components} children={msg.content.toLowerCase().split('\n').map(line => line + '  ').join('\n')} remarkPlugins={remarkGfm} /> :
                                                <p className='placeholder-markdown' >type a message...</p>
                                            }
                                          </div>
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

                                      <button
                                        className="message-actions"
                                        onClick={(e) => {
                                          handleSelect(msg)
                                        }}>
                                        {selected.some(e => e.id === msg.id) ? <CheckboxIcon size={16} /> : <SquareIcon size={24} />}
                                      </button>
                                      
                                      <AnimatePresence>
                                        {dropdownMessageId === msg.id && dropdownOpen && (
                                          <motion.div
                                            initial={{ opacity: 0, scale: 0.95, x: -10 }}
                                            animate={{ opacity: 1, scale: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, x: -10 }}
                                            transition={{ duration: 0.1 }}
                                          >
                                            <DropdownMenu
                                              className='dropdown-menu'
                                              message={msg}
                                              onClose={handleDropdownToggle}
                                              chats={chats}
                                              setChats={setChats}
                                              setDropdownMessageId={setDropdownMessageId}
                                              setDropdownOpen={setDropdownOpen}
                                              setEditMessageId={setEditMessageId}
                                              setEdit={() => setEdit(chat.id, msg.id, edit)}
                                            />
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  </div>
                              </motion.li>
                            </AnimatePresence>
                          )}
                        </Draggable>
                      )}
                      {provided.placeholder}
                      {isTyping && (
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      )}
                    </ul>
                  )}
                </Droppable>
            </motion.div>
            <motion.div layoutId="input-container" layout transition={{ duration: 0.5 }} className="input-container">
              <div className="input-container" style={{ marginTop: 'auto' }}>
                <button 
                  title='Summarize' 
                  onClick={() => handleSummarize(chat.id)} className='input-button'
                  style={{
                    opacity: selected.length > 0 ? 1 : 0.5,
                    pointerEvents: selected.length > 0 ? "auto" : "none",
                  }}
                >
                    <StackIcon size={16} />
                </button>
                <button title='New Chat' onClick={() => handleChatReset(chat.id)} className='input-button'><UndoIcon size={16} /></button>
                <button title='Add Message' onClick={() => handleNewMessage(chat.id)} className='input-button'><PlusIcon size={24} /></button>
                <textarea
                  onClick={() => setInputId(chat.id)}
                  ref={textAreaRef}
                  type="text"
                  className='input-box'
                  value={inputId === chat.id ? message : ''}
                  onChange={handleInputChange}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(chat.id);
                    }
                  }}
                />
                <button title='Send' onClick={() => handleSend(chat.id)} className='input-button'><TriangleRightIcon size={24} /></button>
              </div>
            </motion.div>
          </li>
        )}
      </ul>
      </DragDropContext>
    <button 
    className='input-button'
    style={{
        position: 'fixed',
        bottom: '20px',
        right: '70px',
        zIndex: 1,
    }} 
    onClick={handleResetChats}
    title="Reset Chats"
    >
        <UndoIcon size={24} />
    </button>
    <button 
    className='input-button'
    style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1,
    }} 
    onClick={handleAddChat}
    title="Add Chat"
    >
        <PlusIcon size={24} />
    </button>
    </div>
  );
}
