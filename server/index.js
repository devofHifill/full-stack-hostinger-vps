import express from "express"
import cors from "cors"

const app = express()
const PORT = 4000

app.use(express.json())

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000"
      // add production url
    ]

    if (!origin || allowed.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  }
}))

// Logging middleware (before routes)
app.use((req, res, next) => {
  console.log(req.method, req.url)
  next()
})

// Health check route
app.get("/", (req, res) => {
  res.send("API running 🚀")
})

// API route
app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from FDG" })
})

app.listen(PORT, () =>
  console.log(`Server is running at http://localhost:${PORT}`)
)
