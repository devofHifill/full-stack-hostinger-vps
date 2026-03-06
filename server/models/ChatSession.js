import mongoose from "mongoose";

const ChatSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    source: {
      type: String,
      default: "website",
    },

    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },

    visitor: {
      name: String,
      phone: {
        type: String,
        index: true,
      },
      email: String,
    },

    leadData: {
      loan_goal: String,
      refi_objective: String,
      buying_priority: String,
    },

    metrics: {
      messageCount: {
        type: Number,
        default: 0,
      },
      userMessages: {
        type: Number,
        default: 0,
      },
      botMessages: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ChatSession", ChatSessionSchema);