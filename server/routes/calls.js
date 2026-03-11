import express from "express";
import Call from "../models/Call.js";

const router = express.Router();

// GET all calls (latest first)
router.get("/", async (req, res) => {
  try {
    const calls = await Call.find()
      .sort({ startedAt: -1 })
      .limit(100);

    res.json(calls);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch calls" });
  }
});

// GET stats
router.get("/stats", async (req, res) => {
  try {
    const stats = await Call.aggregate([
      {
        $group: {
          _id: null,
          totalCalls: { $sum: 1 },
          totalCost: { $sum: "$cost" },
          avgDuration: { $avg: "$durationSeconds" },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$normalizedOutcome", "completed"] }, 1, 0],
            },
          },
          noAnswer: {
            $sum: {
              $cond: [{ $eq: ["$normalizedOutcome", "no-answer"] }, 1, 0],
            },
          },
          failed: {
            $sum: {
              $cond: [{ $eq: ["$normalizedOutcome", "failed"] }, 1, 0],
            },
          },
        },
      },
    ]);

    res.json(stats[0] || {});
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});



/*
GET single call details
/api/calls/:callId
*/
router.get("/:callId", async (req, res) => {
  try {
    const call = await Call.findOne({ callId: req.params.callId });

    if (!call) {
      return res.status(404).json({ error: "Call not found" });
    }

    res.json(call);
  } catch (err) {
    console.error("Error fetching call:", err);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;