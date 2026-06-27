const authRoutes = require("./routes/authRoutes");
require("dotenv").config();
const connectDB = require("./config/db");
connectDB();
const rooms = {};
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

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

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("join-room", (roomId) => {

   socket.join(roomId);

   if (!rooms[roomId]) {
    rooms[roomId] = [];
   }

   if (!rooms[roomId].includes(socket.id)) {
    rooms[roomId].push(socket.id);
   }

   io.to(roomId).emit("user-list", rooms[roomId]);

   console.log(`${socket.id} joined room ${roomId}`);
  });

  socket.on("code-change", (data) => {
    socket.to(data.roomId).emit("receive-code", data.code);
  });

  socket.on("disconnect", () => {

    console.log("User Disconnected:", socket.id);

    for (const roomId in rooms) {

      rooms[roomId] = rooms[roomId].filter(
        (id) => id !== socket.id
      );

      io.to(roomId).emit(
       "user-list",
       rooms[roomId]
      );

    }
  });

  socket.on("send-message", (data) => {
   socket.to(data.roomId).emit("receive-message", data.message);
  });

});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});