import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TrashIcon, DuplicateIcon, CheckIcon, CopyIcon, PencilIcon, EyeClosedIcon, EyeIcon } from '@primer/octicons-react';

const DropdownMenu = ({ message, onClose, messages, setMessages, setDropdownMessageId, setDropdownOpen, setEditMessageId, setEdit }) => {

  const [copyClicked, setCopyClicked] = useState(false);

  const deleteMessage = () => {
    const newMessages = messages.filter(msg => msg.id !== message.id);
    setMessages(newMessages);
    setDropdownMessageId(null);
    setDropdownOpen(false);
    onClose();
  };

  const duplicateMessage = () => {
    let duplicatedMessage = { id: uuidv4(), role: message.role, content: message.content, visible: message.visible };
    const index = messages.indexOf(message);
    const updateList = [
      ...messages.slice(0, index + 1),
      duplicatedMessage,
      ...messages.slice(index + 1)
    ]
    setMessages(updateList);
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

export default DropdownMenu;
