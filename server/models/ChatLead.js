import mongoose from "mongoose";

const ChatLeadSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },

    name: String,

    phone: {
      type: String,
      index: true,
    },

    email: {
      type: String,
      index: true,
    },

    loan_goal: String,
    refi_objective: String,
    buying_priority: String,

    appointmentScheduled: {
      type: Boolean,
      default: false,
    },

    appointmentTime: Date,

    status: {
      type: String,
      enum: ["new", "qualified", "contacted", "closed"],
      default: "new",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ChatLead", ChatLeadSchema);