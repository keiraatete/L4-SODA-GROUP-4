# Chat App

A simple real-time chat application built with Express, Socket.IO, and a static frontend.

## Features

- Real-time messaging with Socket.IO
- User list updates when people join or leave
- Message delivery status updates
- Message delete support for the sender
- Typing indicator
- Static frontend served by the backend

## Project Structure

- `backend/` - Express server, Socket.IO configuration, and chat logic
- `frontend/` - Static client files
- `package.json` - Project scripts and dependencies

## Requirements

- Node.js 18+ (or compatible)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. Open the app in your browser:

- `http://localhost:3000`

## Notes

- The frontend is served from `frontend/index.html`.
- The server listens on port `3000` by default.
- Chat history is stored in memory and resets when the server restarts.

## Scripts

- `npm start` - Start the Express + Socket.IO server
- `npm test` - Placeholder test script
