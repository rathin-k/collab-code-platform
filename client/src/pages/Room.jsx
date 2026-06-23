import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import socket from "../socket/socket";

function Room() {
  const { roomId } = useParams();

  const [code, setCode] = useState("// Start coding here");

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

  return (
    <div>
      <h1>Room Page</h1>
      <h2>Room ID: {roomId}</h2>

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