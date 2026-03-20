import mongoose from "mongoose";

const workflowExecutionLogSchema = new mongoose.Schema(
  {
    workflowKey: { type: String, required: true, index: true },
    windowId: { type: String, required: true, index: true },

    // local date in workflow timezone, like "2026-03-20"
    date: { type: String, required: true, index: true },

    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },

    recordsAttempted: { type: Number, default: 0 },
    recordsProcessed: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["started", "completed", "failed", "skipped"],
      default: "started",
    },

    notes: { type: String, default: "" },
  },
  {
    timestamps: true,
    collection: "workflow_execution_logs",
  }
);

const WorkflowExecutionLog =
  mongoose.models.WorkflowExecutionLog ||
  mongoose.model("WorkflowExecutionLog", workflowExecutionLogSchema);

export default WorkflowExecutionLog;