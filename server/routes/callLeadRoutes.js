import express from "express";
import CallLead from "../models/CallLead.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);
    const skip = (page - 1) * limit;

    const { range = "all", startDate, endDate } = req.query;

    const match = {};

    if (range === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      match.createdAt = { $gte: start, $lte: end };
    } else if (range === "7d") {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);

      match.createdAt = { $gte: start, $lte: end };
    } else if (range === "30d") {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);

      match.createdAt = { $gte: start, $lte: end };
    } else if (startDate || endDate) {
      match.createdAt = {};

      if (startDate) {
        match.createdAt.$gte = new Date(`${startDate}T00:00:00.000Z`);
      }

      if (endDate) {
        match.createdAt.$lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    const totalItems = await CallLead.countDocuments(match);

    const leads = await CallLead.find(match)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const items = leads.map((lead) => ({
      _id: lead._id,
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
    console.error("Error fetching call leads:", error);
    res.status(500).json({ error: "Failed to fetch call leads" });
  }
});

export default router;