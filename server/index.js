import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import webhookRoutes from "./routes/webhook.js";
app.use("/api/webhook", webhookRoutes);

const app = express();
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

// Request logging
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

// Health route
app.get("/", (req, res) => {
  res.send("API running now3333");
});

// Test route
app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from FDG" });
});

// Start server AFTER DB connection
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