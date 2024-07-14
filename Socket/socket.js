import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://social-hub-frontend.vercel.app"],
    credentials: true,
  },
});

const socketUserIdMapo = {};

export const socketUserId = (userId) => {
  return socketUserIdMapo[userId];
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId !== undefined) {
    socketUserIdMapo[userId] = socket.id;
  }

  socket.on("disconnect", () => {
    console.log("User disconnected socketId :", socket.id);
    delete socketUserIdMapo[userId];
  });
});

export { app, io, server };
