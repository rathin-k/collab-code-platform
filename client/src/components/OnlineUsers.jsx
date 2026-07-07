function OnlineUsers({ users }) {
  return (
    <div className="users-panel">
      <h3>Online Users: {users.length}</h3>

      <ul>
        {users.map((user) => (
          <li key={user.socketId}>
            🟢 {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default OnlineUsers;