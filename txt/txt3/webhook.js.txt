import express from "express";
import Call from "../models/Call.js";

const router = express.Router();

// Utility: Normalize outcome
function mapOutcome(reason) {
  if (!reason) return "unknown";

  const r = reason.toLowerCase();

  if (r.includes("completed")) return "completed";
  if (r.includes("voicemail")) return "no-answer";
  if (r.includes("silence")) return "no-answer";
  if (r.includes("busy")) return "failed";

  return "failed";
}

// POST /api/webhook/vapi
router.post("/vapi", async (req, res) => {
  try {
    const data = req.body;

    if (!data?.id) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const direction = data.type?.includes("outbound")
      ? "outbound"
      : "inbound";

    const durationSeconds =
      data.startedAt && data.endedAt
        ? (new Date(data.endedAt) - new Date(data.startedAt)) / 1000
        : 0;

    const callDoc = {
      callId: data.id,
      callSid: data.transport?.callSid,
      assistantId: data.assistantId,
      phoneNumberId: data.phoneNumberId,

      direction,
      status: data.status,
      endedReason: data.endedReason,
      normalizedOutcome: mapOutcome(data.endedReason),

      durationSeconds,
      cost: data.cost || 0,

      customer: {
        name: data.customer?.name,
        phone: data.customer?.number,
        email: data.customer?.email,
      },

      transcript: data.transcript,
      summary: data.summary,
      recordingUrl: data.recordingUrl,

      startedAt: data.startedAt,
      endedAt: data.endedAt,
    };

    // Prevent duplicates
    await Call.updateOne(
      { callId: data.id },
      callDoc,
      { upsert: true }
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;