import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/Home.css";

function Home() {
  const { user, logout } = useContext(AuthContext);

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
    <div className="home-page">

      <div className="home-card">

        {/* Header */}
        <div className="home-header">
          <h1>Collaborative Coding</h1>
          <p>Code together. Build together.</p>
        </div>

        {/* Welcome */}
        <div className="welcome-section">
          <h2>
            Welcome{user?.name ? `, ${user.name}` : ""}!
          </h2>

          <p>
            Create a room or join an existing room to start
            collaborating with your team.
          </p>
        </div>

        {/* Create Room */}
        <div className="room-section">
          <h3>Create a Room</h3>

          <p>
            Start a new collaborative coding session.
          </p>

          <button
            className="create-room-button"
            onClick={createRoom}
          >
            + Create Room
          </button>
        </div>

        <div className="divider">
          <span>OR</span>
        </div>

        {/* Join Room */}
        <div className="room-section">
          <h3>Join a Room</h3>

          <p>
            Enter the Room ID shared by your teammate.
          </p>

          <div className="join-container">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />

            <button
              className="join-room-button"
              onClick={joinRoom}
            >
              Join Room
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

    </div>
  );
}

export default Home;