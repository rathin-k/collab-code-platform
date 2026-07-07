import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import socket from "../socket/socket";
import RoomHeader from "../components/RoomHeader";
import OnlineUsers from "../components/OnlineUsers";
import Chat from "../components/Chat";
import CodeEditor from "../components/Editor";
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
    socket.on("load-code", (savedCode) => {
      setCode(savedCode);
    });

    return () => {
     socket.off("load-code");
    };
  }, []);

  useEffect(() => {
    socket.on("load-chat", (chatHistory) => {
      setMessages(chatHistory);
   });

    return () => {
     socket.off("load-chat");
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
      <RoomHeader roomId={roomId} />
      <OnlineUsers users={users} />
      
      <CodeEditor
       code={code}
       setCode={setCode}
       roomId={roomId}
       socket={socket}
      />
      
     <Chat
       messages={messages}
       message={message}
       setMessage={setMessage}
       sendMessage={sendMessage}
      />
    </div>
  );
}

export default Room;