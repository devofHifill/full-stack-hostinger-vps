import express from "express";
import ChatLead from "../models/ChatLead.js";

const router = express.Router();

// GET /api/chat-leads?page=1&limit=10
router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);
    const skip = (page - 1) * limit;

    const totalItems = await ChatLead.countDocuments({});

    const leads = await ChatLead.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const items = leads.map((lead) => ({
      _id: lead._id,
      sessionId: lead.sessionId || "",
      name: lead.name || "",
      phone: lead.phone || "",
      email: lead.email || "",
      loanGoal: lead.loan_goal || "",
      refiObjective: lead.refi_objective || "",
      appointmentScheduled: Boolean(lead.appointmentScheduled),
      status: lead.status || "",
      createdAt: lead.createdAt || null,
    }));

    const totalPages = Math.ceil(totalItems / limit) || 1;

    res.json({
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching chat leads:", error);
    res.status(500).json({ error: "Failed to fetch chat leads" });
  }
});

export default router;