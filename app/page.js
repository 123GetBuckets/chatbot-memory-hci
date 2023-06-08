import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    setMessages([...messages, input]);
    setInput('');
  }

  const startNewChat = () => {
    setMessages([]);
  }

  return (
    <div>
      {/* chat messages will go here */}
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
      <button onClick={startNewChat}>New Chat</button>
    </div>
  )
}