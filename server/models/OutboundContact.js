import mongoose from "mongoose";

const outboundContactSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      default: "",
    },
    lastName: {
      type: String,
      trim: true,
      default: "",
    },
    fullName: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["new", "queued", "calling", "called", "failed", "do_not_call"],
      default: "new",
    },

    source: {
      type: String,
      default: "upload",
    },

    uploadBatchId: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    callAttempts: {
      type: Number,
      default: 0,
    },

    lastCallAt: {
      type: Date,
      default: null,
    },

    emailValid: {
      type: Boolean,
      default: false,
    },

    phoneValid: {
      type: Boolean,
      default: false,
    },

    duplicateKey: {
      type: String,
      trim: true,
      default: "",
    },

    n8nLocked: {
      type: Boolean,
      default: false,
    },

    n8nLockedAt: {
      type: Date,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "outboundcontacts",
  }
);

outboundContactSchema.index({ phone: 1 });
outboundContactSchema.index({ email: 1 });
outboundContactSchema.index({ status: 1 });
outboundContactSchema.index({ createdAt: -1 });
outboundContactSchema.index({ uploadBatchId: 1 });
outboundContactSchema.index({ duplicateKey: 1 });

outboundContactSchema.pre("save", function () {
  const first = String(this.firstName || "").trim();
  const last = String(this.lastName || "").trim();
  const normalizedEmail = String(this.email || "").trim().toLowerCase();
  const normalizedPhone = String(this.phone || "").replace(/\D/g, "");

  this.fullName = `${first} ${last}`.trim();
  this.email = normalizedEmail;
  this.phone = normalizedPhone;
  this.emailValid = normalizedEmail
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    : false;
  this.phoneValid = normalizedPhone ? normalizedPhone.length >= 10 : false;
  this.duplicateKey = normalizedPhone || normalizedEmail || "";
});

const OutboundContact =
  mongoose.models.OutboundContact ||
  mongoose.model("OutboundContact", outboundContactSchema);

export default OutboundContact;