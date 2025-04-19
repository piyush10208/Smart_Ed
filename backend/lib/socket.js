import { Server } from "socket.io";
import http from "http";

// used to store online users
const userSocketMap = {}; // {userId: socketId}

let io;

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

export function initializeSocket(app) {
  const server = http.createServer(app);
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173"],
      credentials: true,
      methods: ["GET", "POST"]
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 10000,
    transports: ['websocket', 'polling']
  });

  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) {
      // Remove existing socket for this user if any
      if (userSocketMap[userId]) {
        const oldSocket = io.sockets.sockets.get(userSocketMap[userId]);
        if (oldSocket) {
          oldSocket.disconnect();
        }
      }
      userSocketMap[userId] = socket.id;
    }

    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log("A user disconnected", socket.id);
      if (userId) {
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
      }
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  return { io, server };
}

export { io };
