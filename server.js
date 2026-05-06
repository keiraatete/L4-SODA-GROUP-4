const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "../frontend")));
app.get("/script.js", (req, res) => {
  res.sendFile(path.join(__dirname, "script.js"));
});

let users = {}; // socket.id -> username
let messages = [];

function createMessage({ user, text, replyTo }) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    user,
    text,
    replyTo: replyTo || null,
    time: new Date().toLocaleTimeString(),
    status: "Sent",
  };
}

io.on("connection", (socket) => {
  socket.on("join", (username) => {
    users[socket.id] = username;
    socket.emit("chat history", messages);
    io.emit("user list", Object.values(users));
  });

  socket.on("chat message", (payload) => {
    const messagePayload = typeof payload === "string"
      ? { text: payload }
      : payload || {};

    const message = createMessage({
      user: users[socket.id] || "Unknown",
      text: messagePayload.text || "",
      replyTo: messagePayload.replyTo,
    });

    messages.push(message);
    io.emit("chat message", message);
    socket.emit("message status", { id: message.id, status: "Delivered" });
  });

  socket.on("delete message", (messageId) => {
    const message = messages.find((item) => item.id === messageId);
    if (message && message.user === users[socket.id]) {
      messages = messages.filter((item) => item.id !== messageId);
      io.emit("message deleted", messageId);
    }
  });

  socket.on("typing", () => {
    socket.broadcast.emit("typing", users[socket.id]);
  });

  socket.on("stop typing", () => {
    socket.broadcast.emit("stop typing", users[socket.id]);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("user list", Object.values(users));
  });
});

server.listen(3000, () => console.log("Running on 3000"));