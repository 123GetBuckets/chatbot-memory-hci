"use client";
import { useState } from "react";

const chatBot = () => {
  const [Umsg, setUmsg] = useState("");
  const [Convo, setConvo] = useState([]);

  const prompt = (txt) => {
    txt.preventDefault();

    setConvo([...Convo, { msg: Umsg, sender: "User" }]);
    setUmsg("");

    setConvo([...Convo, { msg: "Connect API", sender: "GPT" }]);
  };

  return (
    <div className="Chat">
      <h1>Title</h1>
      <div>
        {Convo.map((conv) => (
          <li className={conv.sender}>
            {conv.msg}
          </li>
        ))}
      </div>
      <form onSubmit={prompt}>
        <input
          type="text"
          value={Umsg}
          onChange={(txt) => setUmsg(txt.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};
export default chatBot;
