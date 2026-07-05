const Room = require("./models/Room");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();
const connectDB = require("./config/db");
connectDB();
const rooms = {};
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);

app.use("/api/auth", authRoutes);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;

    next();

  } catch (error) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("join-room", async (roomId) => {
   
   const room = await Room.findOneAndUpdate(
     { roomId },
     {
       $setOnInsert: { roomId },
     },
     {
       upsert: true,
       returnDocument: "after",
     }
    );

   socket.emit("load-code", room.code);
   
   socket.emit("load-chat", room.chat);

   socket.join(roomId);

   if (!rooms[roomId]) {
    rooms[roomId] = [];
   }

   const alreadyJoined = rooms[roomId].some(
  (user) => user.socketId === socket.id
);

if (!alreadyJoined) {
  rooms[roomId].push({
    socketId: socket.id,
    name: socket.user.name,
  });
}
  console.log("Sending user list:", rooms[roomId]);
   io.to(roomId).emit("user-list", rooms[roomId]);

   console.log(`${socket.id} joined room ${roomId}`);
  });

  socket.on("code-change", async (data) => {

    await Room.findOneAndUpdate(
      { roomId: data.roomId },
      { code: data.code }
    );

    socket.to(data.roomId).emit("receive-code", data.code);

  });

  socket.on("disconnect", () => {

    console.log("User Disconnected:", socket.id);

    for (const roomId in rooms) {

      rooms[roomId] = rooms[roomId].filter(
        (user) => user.socketId !== socket.id
      );

      io.to(roomId).emit(
       "user-list",
       rooms[roomId]
      );

    }
  });

  socket.on("send-message", async (data) => {

  const chatMessage = {
    sender: socket.user.name,
    message: data.message,
    timestamp: new Date(),
  };

  await Room.findOneAndUpdate(
    { roomId: data.roomId },
    {
      $push: {
        chat: chatMessage,
      },
    }
  );

  io.to(data.roomId).emit("receive-message", chatMessage);

});

});



server.listen(5000, () => {
  console.log("Server running on port 5000");
});