import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import socket from "../socket/socket";

import RoomHeader from "../components/RoomHeader";
import CodeEditor from "../components/Editor";
import BottomSection from "../components/BottomSection";

import "../styles/Room.css";

function Room() {
  const { roomId } = useParams();

  const [code, setCode] = useState("// Start coding here");
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    socket.auth = {
      token,
    };

    const handleReceiveCode = (incomingCode) => {
      setCode(incomingCode);
    };

    const handleLoadCode = (savedCode) => {
      setCode(savedCode);
    };

    const handleLoadChat = (chatHistory) => {
      setMessages(chatHistory);
    };

    const handleUserList = (userList) => {
      console.log("🔥 Received user list:", userList);
      setUsers(userList);
    };

    const handleReceiveMessage = (incomingMessage) => {
      setMessages((prev) => [...prev, incomingMessage]);
    };

    const joinRoom = () => {
      console.log("Joining room:", roomId);
      socket.emit("join-room", roomId);
    };

    socket.on("receive-code", handleReceiveCode);
    socket.on("load-code", handleLoadCode);
    socket.on("load-chat", handleLoadChat);
    socket.on("user-list", handleUserList);
    socket.on("receive-message", handleReceiveMessage);

    if (socket.connected) {
      joinRoom();
    } else {
      socket.once("connect", joinRoom);
      socket.connect();
    }

    return () => {
      socket.off("receive-code", handleReceiveCode);
      socket.off("load-code", handleLoadCode);
      socket.off("load-chat", handleLoadChat);
      socket.off("user-list", handleUserList);
      socket.off("receive-message", handleReceiveMessage);
      socket.off("connect", joinRoom);
    };
  }, [roomId]);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("send-message", {
      roomId,
      message,
    });

    setMessage("");
  };

  const handleLeaveRoom = () => {
    socket.emit("leave-room", roomId);

    setUsers([]);

    navigate("/");
  };

  return (
    <div className="room-page">

      <RoomHeader
        roomId={roomId}
        handleLeaveRoom={handleLeaveRoom}
      />

      <div className="room-content">

        <main className="editor-wrapper">
          <CodeEditor
            code={code}
            setCode={setCode}
            roomId={roomId}
            socket={socket}
          />
        </main>

        <BottomSection
          users={users}
          messages={messages}
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />

      </div>

    </div>
  );
}

export default Room;