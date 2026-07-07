function Chat({
  messages,
  message,
  setMessage,
  sendMessage,
}) {
  return (
    <div className="chat-panel">
      <h3>Chat</h3>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.sender}:</strong> {msg.message}
          </p>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;