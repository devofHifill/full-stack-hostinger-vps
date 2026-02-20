import express from "express"
import cors from "cors"

const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json())

// --- CORS (env-based) ---
const corsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, server-to-server)
    if (!origin) return callback(null, true)

    if (corsOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`))
  }
}))
// --- end CORS ---

// Logging middleware
app.use((req, res, next) => {
  console.log(req.method, req.url)
  next()
})

app.get("/", (req, res) => res.send("API running 🚀"))

app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from FDG" })
})

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`))