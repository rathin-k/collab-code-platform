import { useEffect, useRef } from "react";
import "../styles/Chat.css";
function Chat({
  messages,
  message,
  setMessage,
  sendMessage,
}) {
  const messagesEndRef = useRef(null);

  // Get current logged-in user
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser
    ? JSON.parse(storedUser)
    : null;

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="chat-panel">
      <h3>Chat</h3>

      <div className="chat-box">
        {messages.length === 0 ? (
          <div className="empty-chat">
            No messages yet.
            <br />
            Start the conversation!
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage =
              msg.sender === currentUser?.name;

            return (
              <div
                key={index}
                className={`message-row ${
                  isOwnMessage ? "own-message" : "other-message"
                }`}
              >
                <div className="message-bubble">
                  <div className="message-sender">
                    {msg.sender}
                  </div>

                  <div className="message-text">
                    {msg.message}
                  </div>

                  {msg.timestamp && (
                    <div className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />

        <button onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;