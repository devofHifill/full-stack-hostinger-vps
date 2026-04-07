import mongoose from "mongoose";

<<<<<<< HEAD
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
=======
const workflowWindowSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true },   // "11:00"
    maxRecords: { type: Number, required: true, default: 10 },
    executionEveryMinutes: { type: Number, required: true, default: 5 },
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
  },
  { _id: false }
);

const workflowScheduleSchema = new mongoose.Schema(
  {
    workflowKey: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    timezone: { type: String, default: "America/New_York" },

<<<<<<< HEAD
    schedules: {
      type: [scheduleEntrySchema],
=======
    // 0=Sunday, 1=Monday ... 6=Saturday
    daysOfWeek: {
      type: [Number],
      default: [1, 2, 3, 4, 5],
    },

    windows: {
      type: [workflowWindowSchema],
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
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