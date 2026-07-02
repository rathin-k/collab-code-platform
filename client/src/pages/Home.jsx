import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
function Home() {
  const { user, logout } = useContext(AuthContext);
  console.log(user);
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
  
  const handleLogout = () => {
  logout();
  navigate("/login");
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

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Home;