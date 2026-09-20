const Room = require("./models/Room");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();

const connectDB = require("./config/db");
connectDB();

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


// Socket authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.userId)
      .select("-password");

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;

    next();

  } catch (error) {
    next(new Error("Authentication error"));
  }
});


// Socket connection
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("join-room", async (roomId) => {
    try {
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

      // Join Socket.IO room
      socket.join(roomId);

      // Remember which room this socket belongs to
      socket.data.roomId = roomId;

      // Send saved code
      socket.emit("load-code", room.code);

      // Send saved chat
      socket.emit("load-chat", room.chat);

      // Get all sockets currently inside this room
      const sockets = await io.in(roomId).fetchSockets();

      const userList = sockets.map((connectedSocket) => ({
        socketId: connectedSocket.id,
        name: connectedSocket.user.name,
      }));

      console.log("Sending user list:", userList);

      // Send updated list to everyone
      io.to(roomId).emit("user-list", userList);

      console.log(`${socket.id} joined room ${roomId}`);

    } catch (error) {
      console.error("Join room error:", error);
    }
  });

  socket.on("code-change", async (data) => {
    try {
      await Room.findOneAndUpdate(
        { roomId: data.roomId },
        { code: data.code }
      );

      socket
        .to(data.roomId)
        .emit("receive-code", data.code);

    } catch (error) {
      console.error("Code update error:", error);
    }
  });

  socket.on("send-message", async (data) => {
    try {
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

      io.to(data.roomId).emit(
        "receive-message",
        chatMessage
      );

    } catch (error) {
      console.error("Send message error:", error);
    }
  });

  socket.on("leave-room", async (roomId) => {
  try {
    // Make sure this socket is actually in this room
    if (socket.data.roomId !== roomId) {
      return;
    }

    // Leave the Socket.IO room
    socket.leave(roomId);

    // Clear stored room information
    socket.data.roomId = null;

    // Get remaining users
    const sockets = await io.in(roomId).fetchSockets();

    const userList = sockets.map((connectedSocket) => ({
      socketId: connectedSocket.id,
      name: connectedSocket.user.name,
    }));

    console.log(
      "Updated user list after leaving:",
      userList
    );

    // Tell remaining users about the updated list
    io.to(roomId).emit("user-list", userList);

  } catch (error) {
    console.error("Leave room error:", error);
  }
});

  socket.on("disconnect", async () => {
    console.log("User Disconnected:", socket.id);

    const roomId = socket.data.roomId;

    if (!roomId) {
      return;
    }

    try {
      // Get remaining users in the room
      const sockets = await io.in(roomId).fetchSockets();

      const userList = sockets.map((connectedSocket) => ({
        socketId: connectedSocket.id,
        name: connectedSocket.user.name,
      }));

      console.log(
        "Updated user list after disconnect:",
        userList
      );

      io.to(roomId).emit(
        "user-list",
        userList
      );

    } catch (error) {
      console.error("Disconnect error:", error);
    }
  });
});

// Start server
server.listen(5000, () => {
  console.log("Server running on port 5000");
});