
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// CORS
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

// Log requests
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

// Mongo
const MONGO_URI = process.env.MONGO_URI;

async function connectMongo() {
  if (!MONGO_URI) {
    console.error("? MONGO_URI missing");
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  console.log("? MongoDB connected");
}

const PingSchema = new mongoose.Schema(
  { note: { type: String, default: "ping" } },
  { timestamps: true }
);
const Ping = mongoose.model("Ping", PingSchema);

// Routes
app.get("/", (req, res) => res.send("API running ??"));

app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from FDG" });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const created = await Ping.create({ note: "sebvm db test" });
    const latest = await Ping.findOne().sort({ createdAt: -1 });
    res.json({
      ok: true,
      createdId: created._id,
      latest: {
        id: latest?._id,
        note: latest?.note,
        createdAt: latest?.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Start after DB connect
connectMongo()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("? MongoDB connection failed:", err.message);
    process.exit(1);
  });