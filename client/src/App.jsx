import { useEffect } from "react";
import { io } from "socket.io-client";

function App() {
  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Collaborative Coding Platform</h1>
    </div>
  );
}

export default App;