import { useParams } from "react-router-dom";

function Room() {
  const { roomId } = useParams();

  return (
    <div>
      <h1>Room Page</h1>
      <h2>Room ID: {roomId}</h2>
    </div>
  );
}

export default Room;