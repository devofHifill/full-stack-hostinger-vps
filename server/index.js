import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";

import ChatSession from "./models/ChatSession.js";
import ChatMessage from "./models/ChatMessage.js";
import ChatLead from "./models/ChatLead.js";

import callsRoutes from "./routes/calls.js";
import webhookRoutes from "./routes/webhook.js";
import chatRoutes from "./routes/chatRoutes.js";
import chatLeadRoutes from "./routes/chatLeadRoutes.js";
import callLeadRoutes from "./routes/callLeadRoutes.js";
import callMetricsRoutes from "./routes/callMetricsRoutes.js";
import chatMetricsRoutes from "./routes/chatMetricsRoutes.js";
import outboundContactsRoutes from "./routes/outboundContacts.js";
import outboundContactUploadRoutes from "./routes/outboundContactUpload.js";
import workflowScheduleRoutes from "./routes/workflowScheduleRoutes.js";
import workflowExecutionRoutes from "./routes/workflowExecutionRoutes.js";
<<<<<<< HEAD
import loanOfficerRoutes from "./routes/loanOfficerRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
=======

>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de


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

// // 👇 Register routes AFTER app exists
// app.use("/api/webhook", webhookRoutes);
// app.use("/api/calls", callsRoutes);
// app.use("/api/chat", chatRoutes);
// app.use("/api/chat-leads", chatLeadRoutes);
// app.use("/api/call-leads", callLeadRoutes);
// app.use("/api", callMetricsRoutes);
// app.use("/api", chatMetricsRoutes);
// app.use("/api/outbound-contacts", outboundContactsRoutes);
// app.use("/api/outbound-contacts", outboundContactUploadRoutes);
// app.use("/api/workflow-schedules", workflowScheduleRoutes);
// app.use("/api/workflow-executions", workflowExecutionRoutes);
// app.use("/api/loan-officers", loanOfficerRoutes);
// app.use("/api/auth", authRoutes);


// 👇 Register routes AFTER app exists
app.use("/api/auth", authRoutes);

// public routes
app.use("/api/webhook", webhookRoutes);
<<<<<<< HEAD

// protected routes
app.use("/api/calls", authMiddleware, callsRoutes);
app.use("/api/chat", authMiddleware, chatRoutes);
app.use("/api/chat-leads", authMiddleware, chatLeadRoutes);
app.use("/api/call-leads", authMiddleware, callLeadRoutes);
app.use("/api", authMiddleware, callMetricsRoutes);
app.use("/api", authMiddleware, chatMetricsRoutes);
app.use("/api/outbound-contacts", authMiddleware, outboundContactsRoutes);
app.use("/api/outbound-contacts", authMiddleware, outboundContactUploadRoutes);
app.use("/api/workflow-schedules", authMiddleware, workflowScheduleRoutes);
app.use("/api/workflow-executions", authMiddleware, workflowExecutionRoutes);
app.use("/api/loan-officers", authMiddleware, loanOfficerRoutes);
=======
app.use("/api/calls", callsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/chat-leads", chatLeadRoutes);
app.use("/api/call-leads", callLeadRoutes);
app.use("/api", callMetricsRoutes);
app.use("/api", chatMetricsRoutes);
app.use("/api/outbound-contacts", outboundContactsRoutes);
app.use("/api/outbound-contacts", outboundContactUploadRoutes);
app.use("/api/workflow-schedules", workflowScheduleRoutes);
app.use("/api/workflow-executions", workflowExecutionRoutes);

>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de


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