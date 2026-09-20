import "../styles/Header.css";

function RoomHeader({ roomId, handleLeaveRoom }) {
  return (
    <header className="room-header">

      <div className="room-title">
        <h1>👨‍💻 Collaborative Coding Platform</h1>
        <p>Room ID: {roomId}</p>
      </div>

      <div className="header-right">
        <span className="connection-status">
          🟢 Connected
        </span>

        <button
          className="leave-btn"
          onClick={handleLeaveRoom}
        >
          🚪 Leave Room
        </button>
      </div>

    </header>
  );
}

export default RoomHeader;