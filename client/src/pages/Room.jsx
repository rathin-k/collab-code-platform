import { useEffect } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket/socket";

function Room() {
  const { roomId } = useParams();

  useEffect(() => {
    socket.emit("join-room", roomId);

    console.log(`Joined room: ${roomId}`);
  }, [roomId]);

  return (
    <div>
      <h1>Room Page</h1>
      <h2>Room ID: {roomId}</h2>
    </div>
  );
}

export default Room;