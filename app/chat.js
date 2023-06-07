import { useState } from "react";

const Chatbot = () => {
  const [umsg, setUmsg] = useState("");
  const [convo, setConvo] = useState([]);

  const Prompt = (e) => {
    e.preventDefault();

    setConvo([...convo, { msg: umsg, sender: "User" }]);
    setConvo([...convo, { msg: "Connect API", sender: "GPT" }]);
    setUmsg("");
    console.log(convo);
  };

  return (
    <div className="Chat">
      <h1>Title</h1>
      <div>
        {convo.map((conv, index) => (
          <li key={index} className={conv.sender}>
            {conv.msg}
          </li>
        ))}
      </div>
      <form onSubmit={Prompt}>
        <input
          type="text"
          value={umsg}
          onChange={(e) => setUmsg(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};
export default Chatbot;
