import OnlineUsers from "./OnlineUsers";
import Chat from "./Chat";

import "../styles/BottomSection.css";

function BottomSection({
  users,
  messages,
  message,
  setMessage,
  sendMessage,
}) {
  return (
    <aside className="sidebar">

      <div className="users-wrapper">
        <OnlineUsers users={users} />
      </div>

      <div className="chat-wrapper">
        <Chat
          messages={messages}
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
      </div>

    </aside>
  );
}

export default BottomSection;