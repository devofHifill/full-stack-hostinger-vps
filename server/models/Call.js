import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    callId: {
      type: String,
      required: true,
      unique: true,
    },

    callSid: String,

    assistantId: String,
    phoneNumberId: String,

    direction: {
      type: String,
      enum: ["inbound", "outbound"],
    },

    status: String,
    endedReason: String,

    normalizedOutcome: {
      type: String,
      enum: ["completed", "no-answer", "failed", "unknown"],
    },

    durationSeconds: Number,
    cost: Number,

    customer: {
      name: String,
      phone: String,
      email: String,
    },

    transcript: String,
    summary: String,

    recordingUrl: String,

    startedAt: Date,
    endedAt: Date,
  },
  { timestamps: true }
);

callSchema.index({ startedAt: -1 });

export default mongoose.model("Call", callSchema);