import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const createRoom = () => {
    const id = Math.random().toString(36).substring(2, 10);
    navigate(`/room/${id}`);
  };

  const joinRoom = () => {
    if (!roomId.trim()) return;

    navigate(`/room/${roomId}`);
  };

  return (
    <div>
      <h1>Collaborative Coding Platform</h1>

      <button onClick={createRoom}>
        Create Room
      </button>

      <br />
      <br />

      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />

      <button onClick={joinRoom}>
        Join Room
      </button>
    </div>
  );
}

export default Home;