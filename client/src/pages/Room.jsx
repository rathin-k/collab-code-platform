import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import socket from "../socket/socket";
import "./Room.css";

function Room() {
  const { roomId } = useParams();

  const [code, setCode] = useState("// Start coding here");

  const [users, setUsers] = useState([]);

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.emit("join-room", roomId);

    console.log(`Joined room: ${roomId}`);
  }, [roomId]);

  useEffect(() => {
  socket.on("receive-code", (incomingCode) => {
    setCode(incomingCode);
  });

  return () => {
    socket.off("receive-code");
  };
  }, []);

  useEffect(() => {
  socket.on("user-list", (userList) => {
    console.log("User List:", userList);
    setUsers(userList);
  });

  return () => {
    socket.off("user-list");
  };
  }, []);
  
  useEffect(() => {
   socket.on("receive-message", (incomingMessage) => {
     setMessages((prev) => [...prev, incomingMessage]);
   });

    return () => {
     socket.off("receive-message");
    };
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("send-message", {
     roomId,
     message,
    });

   setMessage("");
  };
  console.log(messages);
  return (
    <div>
      <h1>Room Page</h1>
      <h2>Room ID: {roomId}</h2>
      <h3>Online Users: {users.length}</h3>

      <ul>
        {users.map((user) => (
          <li key={user.socketId}>
            🟢 {user.name}
          </li>
        ))}
      </ul>
      
      <Editor
        height="80vh"
        defaultLanguage="javascript"
        value={code}
        onChange={(value) => {
          const newCode = value || "";

          setCode(newCode);

          socket.emit("code-change", {
          roomId,
          code: newCode,
          });
        }}
      />
      
     <h2>Chat</h2>

      <div  className="chat-box">
       {messages.map((msg, index) => (
         <p key={index}>
           <strong>{msg.sender}:</strong> {msg.message}
         </p>
       ))}
      </div>

      <input
       type="text"
       placeholder="Type a message..."
       value={message}
       onChange={(e) => setMessage(e.target.value)}
      />

      <button onClick={sendMessage}>
        Send
      </button>
    </div>
  );
}

export default Room;