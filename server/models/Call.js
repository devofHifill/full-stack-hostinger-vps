import mongoose from "mongoose";

const CallSchema = new mongoose.Schema(
  {
    // Who / Where
    loanOfficerId: { type: String, index: true, default: null },
    assistant: { type: String, index: true, default: "vapi" },

    // Call identifiers
    externalCallId: { type: String, index: true, unique: true, sparse: true },
    phoneFrom: { type: String, index: true, default: null },
    phoneTo: { type: String, default: null },

    // Timing / outcome
    startedAt: { type: Date, index: true, default: null },
    endedAt: { type: Date, default: null },
    durationSec: { type: Number, index: true, default: 0 },
    outcome: { type: String, index: true, default: "unknown" }, // booked / no_answer / hangup / etc.

    // Content
    transcript: { type: String, default: "" },
    summary: { type: String, default: "" },
    recordingUrl: { type: String, default: "" },

    // Raw payload for replay/debug
    raw: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Call", CallSchema);