import { useState } from "react";
import { Copy, Check } from "lucide-react";

import "../styles/Header.css";

function RoomHeader({ roomId, handleLeaveRoom }) {
  const [copied, setCopied] = useState(false);

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to copy Room ID:", error);
    }
  };
  
  return (
    <header className="room-header">

      <div className="room-title">
        <h1>CollabCode</h1>
        <div className="room-copy">
          <p>Room ID: {roomId}</p>
          <button
            className="copy-button"
            onClick={handleCopyRoomId}
            title="Copy Room ID"
            aria-label="Copy Room ID"
          >
            {copied ? (
              <Check size={16} />
            ) : (
              <Copy size={16} />
            )}
          </button>
        </div>
      </div>

      <div className="header-right">
        <span className="connection-status">
          🟢 Connected
        </span>

        <button
          className="leave-btn"
          onClick={handleLeaveRoom}
        >
          Leave Room
        </button>
      </div>

    </header>
  );
}

export default RoomHeader;