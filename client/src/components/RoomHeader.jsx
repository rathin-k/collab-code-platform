function RoomHeader({ roomId }) {
  return (
    <div className="room-header">
      <h1>Collaborative Coding Platform</h1>
      <p className="room-id">
        Room ID: <strong>{roomId}</strong>
      </p>
    </div>
  );
}

export default RoomHeader;