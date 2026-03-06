import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";

import ChatSession from "./models/ChatSession.js";
import ChatMessage from "./models/ChatMessage.js";
import ChatLead from "./models/ChatLead.js";

import callsRoutes from "./routes/calls.js";
import webhookRoutes from "./routes/webhook.js";
import chatRoutes from "./routes/chatRoutes.js";


const app = express();   // 👈 MUST be before app.use()
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// CORS configuration
const corsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (corsOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
  })
);

// Logging
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

// 👇 Register routes AFTER app exists
app.use("/api/webhook", webhookRoutes);
app.use("/api/calls", callsRoutes);
app.use("/api/chat", chatRoutes);



// Health route
app.get("/", (req, res) => {
  res.send("API running 🚀");
});

app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from FDG" });
});

// Start server AFTER DB connect
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Startup failed:", err.message);
    process.exit(1);
  });