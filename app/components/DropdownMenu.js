import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TrashIcon, DuplicateIcon, CheckIcon, CopyIcon, PencilIcon, EyeClosedIcon, EyeIcon } from '@primer/octicons-react';

const DropdownMenu = ({ message, onClose, chats, setChats, setDropdownMessageId, setDropdownOpen, setEditMessageId, setEdit }) => {

  const [copyClicked, setCopyClicked] = useState(false);

  const findChat = () => {
    return chats.find(chat => chat.messages.some(msg => msg.id === message.id));
  }

  const deleteMessage = () => {
    const chatToUpdate = findChat();
    const newMessages = chatToUpdate.messages.filter(msg => msg.id !== message.id);
    const updatedChat = { ...chatToUpdate, messages: newMessages };
    const newChats = chats.map(chat => chat.id === chatToUpdate.id ? updatedChat : chat);
    setChats(newChats);
    setDropdownMessageId(null);
    setDropdownOpen(false);
    onClose();
  };

  const duplicateMessage = () => {
    const chatToUpdate = findChat();
    let duplicatedMessage = { id: uuidv4(), role: message.role, content: message.content, visible: message.visible };
    const index = chatToUpdate.messages.indexOf(message);
    const updateList = [
      ...chatToUpdate.messages.slice(0, index + 1),
      duplicatedMessage,
      ...chatToUpdate.messages.slice(index + 1)
    ]
    const updatedChat = { ...chatToUpdate, messages: updateList };
    const newChats = chats.map(chat => chat.id === chatToUpdate.id ? updatedChat : chat);
    setChats(newChats);
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
    const chatToUpdate = findChat();
    setEditMessageId(message.id);
    setEdit(chatToUpdate.id, message.id, message.content.toLowerCase());
    onClose();
  };

  const editVisibility = () => {
    const chatToUpdate = findChat();
    const newMessages = chatToUpdate.messages.map(msg => msg.id === message.id ? { ...msg, visible: !msg.visible } : msg);
    const updatedChat = { ...chatToUpdate, messages: newMessages };
    const newChats = chats.map(chat => chat.id === chatToUpdate.id ? updatedChat : chat);
    setChats(newChats);
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

export default DropdownMenu;
