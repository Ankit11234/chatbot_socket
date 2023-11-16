import { useEffect, useState } from "react";
import "./App.css";
import io from 'socket.io-client';
import axios from "axios";
import { BASE_URL } from "./util";

const socket = io('http://localhost:8000');

function App() {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  socket.on('data',(data)=>{
    setChats([...chats,{message:data.message,role:"AI"}]);
    setIsTyping(false);
  })

  const chat = (e, message) => {
    e.preventDefault();
    if (!message) return;
    socket.emit('send',message);
    setIsTyping(true);
    // scrollTo(0, 1e10);
    let msgs = chats;
    msgs.push({ role: "user", message: message });
    setChats(msgs);
    setMessage("");
    
  };
  
  useEffect(()=>{
    const getData=async()=>{
      // const res = await axios.get('/chats');
      const res = await axios.get(`${BASE_URL}chats`);
      const data = res.data;
      setChats(data.message);
    }
    getData();
  },[])

  return (
    <main>
      <h1> Chat BOT</h1>

      <section>
        {chats && chats.length
          ? chats.map((chat, index) => (
              <p key={index} className={chat.role === "user" ? "user_msg" : ""}>
                <span>
                  <b>{chat.role.toUpperCase()}</b>
                </span>
                <span>:</span>
                <span>{chat.message}</span>
              </p>
            ))
          : ""}
      </section>

      <div className={isTyping ? "" : "hide"}>
        <p>
          <i>{isTyping ? "Typing" : ""}</i>
        </p>
      </div>

      <form action="" onSubmit={(e) => chat(e, message)}>
        <input
          type="text"
          name="message"
          value={message}
          placeholder="Type a message here and hit Enter..."
          onChange={(e) => setMessage(e.target.value)}
        />
      </form>
    </main>
  );
}

export default App;
