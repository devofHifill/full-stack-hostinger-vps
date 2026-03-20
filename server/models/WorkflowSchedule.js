import mongoose from "mongoose";

const workflowWindowSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true },   // "11:00"
    maxRecords: { type: Number, required: true, default: 10 },
    executionEveryMinutes: { type: Number, required: true, default: 5 },
  },
  { _id: false }
);

const workflowScheduleSchema = new mongoose.Schema(
  {
    workflowKey: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    timezone: { type: String, default: "America/New_York" },

    // 0=Sunday, 1=Monday ... 6=Saturday
    daysOfWeek: {
      type: [Number],
      default: [1, 2, 3, 4, 5],
    },

    windows: {
      type: [workflowWindowSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "workflow_schedules",
  }
);

const WorkflowSchedule =
  mongoose.models.WorkflowSchedule ||
  mongoose.model("WorkflowSchedule", workflowScheduleSchema);

export default WorkflowSchedule;