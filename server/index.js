const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const setupRoomHandlers = require('./roomManager');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // allow all in dev, update in production
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  setupRoomHandlers(io, socket);
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
