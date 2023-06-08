import { useState } from "react";

const Chatbot = () => {
  const [Umsg, setUmsg] = useState("");
  const [Convo, setConvo] = useState([]);

  const Prompt = (e) => {
    e.preventDefault();

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
    </div>
  );
};
export default Chatbot;
