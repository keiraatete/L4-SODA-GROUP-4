const socket = io();
const username = prompt("Enter your name:");

socket.emit("join", username);

const chatBox = document.getElementById("chatBox");
const typingDiv = document.getElementById("typing");
const replyPreview = document.getElementById("replyPreview");
const onlineUsersDiv = document.getElementById("onlineUsers");

let typingTimeout;
let replyTo = null;
let messages = [];

function sendMessage() {
  const input = document.getElementById("input");
  const text = input.value.trim();
  if (!text) return;

  socket.emit("chat message", { text, replyTo });
  clearTimeout(typingTimeout);
  replyTo = null;
  replyPreview.hidden = true;
  input.value = "";
}

function setReply(message) {
  replyTo = message.id;
  replyPreview.innerHTML = `Replying to <strong>${message.user}</strong>: ${message.text} <button onclick="cancelReply()">Cancel</button>`;
  replyPreview.hidden = false;
}

function cancelReply() {
  replyTo = null;
  replyPreview.hidden = true;
}

socket.on("chat history", (msgs) => {
  messages = msgs;
  chatBox.innerHTML = "";
  msgs.forEach(addMessage);
});

socket.on("user list", (users) => {
  onlineUsersDiv.innerHTML = `<b>Online:</b> ${users.join(", ")}`;
});

socket.on("chat message", (msg) => {
  messages.push(msg);
  addMessage(msg);
  typingDiv.innerText = "";
});

socket.on("message deleted", (messageId) => {
  const messageElement = document.querySelector(`[data-id="${messageId}"]`);
  if (messageElement) {
    messageElement.remove();
  }
  messages = messages.filter((item) => item.id !== messageId);
});

socket.on("typing", (user) => {
  typingDiv.innerText = user + " is typing...";
});

socket.on("message status", ({ id, status }) => {
  const message = messages.find((item) => item.id === id);
  if (message) {
    message.status = status;
    const statusEl = document.querySelector(`[data-id="${id}"] .message-status`);
    if (statusEl) {
      statusEl.textContent = status;
    }
  }
});

socket.on("stop typing", (user) => {
  if (typingDiv.innerText === user + " is typing...") {
    typingDiv.innerText = "";
  }
});

function notifyTyping() {
  socket.emit("typing");
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => socket.emit("stop typing"), 1000);
}

function addMessage(msg) {
  const div = document.createElement("div");
  div.dataset.id = msg.id;
  div.className = "message " + (msg.user === username ? "outgoing" : "incoming");

  const replyHtml = msg.replyTo
    ? `<div class="reply-block">Reply to: ${renderReplyText(msg.replyTo)}</div>`
    : "";

  const deleteButton = msg.user === username
    ? `<button class="action-btn delete-btn" data-id="${msg.id}">Delete</button>`
    : "";

  div.innerHTML = `
    <div class="message-header">
      <b>${msg.user}</b>
      <span class="meta">${msg.time}</span>
    </div>
    <div class="message-status">${msg.status ? msg.status : ""}</div>
    ${replyHtml}
    <div class="message-text">${msg.text}</div>
    <div class="message-actions">
      <button class="action-btn reply-btn" data-id="${msg.id}">Reply</button>
      ${deleteButton}
    </div>
  `;

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;

  const replyBtn = div.querySelector(".reply-btn");
  replyBtn.addEventListener("click", () => {
    setReply(msg);
  });

  if (deleteButton) {
    const deleteBtn = div.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => {
      socket.emit("delete message", msg.id);
    });
  }
}

function renderReplyText(replyToId) {
  const original = messages.find((item) => item.id === replyToId);
  if (!original) {
    return "<em>deleted message</em>";
  }
  return `<strong>${original.user}</strong>: ${original.text}`;
}