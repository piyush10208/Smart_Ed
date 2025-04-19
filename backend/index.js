import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import quizRoutes from "./routes/quiz.route.js";
import chatbotRoutes from "./routes/chatbot.route.js";
import { initializeSocket } from "./lib/socket.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Updated CORS configuration to allow both production and development origins
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "https://fullstack-ed-backend.vercel.app",
  "http://localhost:5173"
];

app.use(cors({ 
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS: ", origin);
      callback(null, true); // Temporarily allow all origins for debugging
    }
  },
  credentials: true
}));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/chatbot", chatbotRoutes);

// Test route to verify server is running
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running!" });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

const { server } = initializeSocket(app);

server.listen(PORT, () => {
  console.log("Server is running on PORT:" + PORT);
  connectDB();
});
