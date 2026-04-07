import mongoose from "mongoose";

const scheduleEntrySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    scheduleName: { type: String, required: true },
    daysOfWeek: {
      type: [Number], // 0–6
      required: true,
      default: [],
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const workflowScheduleSchema = new mongoose.Schema(
  {
    workflowKey: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    timezone: { type: String, default: "America/New_York" },

    schedules: {
      type: [scheduleEntrySchema],
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