import mongoose from "mongoose";

const callLeadSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    email: String,
    loan_goal: String,
    refi_objective: String,
    appointmentScheduled: Boolean,
    status: String,
  },
  {
    timestamps: true,
    collection: "callleads",
  }
);

const CallLead =
  mongoose.models.CallLead || mongoose.model("CallLead", callLeadSchema);

export default CallLead;