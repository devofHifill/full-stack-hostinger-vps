import mongoose from "mongoose";

const loanOfficerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    nmls: {
      type: String,
      required: true,
      trim: true,
    },
    appointmentUrl: {
      type: String,
      required: true,
      trim: true,
    },
    profileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "loanofficers",
  }
);

const LoanOfficer =
  mongoose.models.LoanOfficer ||
  mongoose.model("LoanOfficer", loanOfficerSchema);

export default LoanOfficer;