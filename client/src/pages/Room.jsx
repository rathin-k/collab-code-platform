import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import socket from "../socket/socket";

function Room() {
  const { roomId } = useParams();

  const [code, setCode] = useState("// Start coding here");

  const [users, setUsers] = useState([]);

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
    setUsers(userList);
  });

  return () => {
    socket.off("user-list");
  };
  }, []);

  return (
    <div>
      <h1>Room Page</h1>
      <h2>Room ID: {roomId}</h2>
      <h3>Online Users: {users.length}</h3>

      <ul>
        {users.map((user) => (
          <li key={user}>{user}</li>
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
    </div>
  );
}

export default Room;