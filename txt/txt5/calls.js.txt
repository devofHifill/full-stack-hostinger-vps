import express from "express";
import Call from "../models/Call.js";

const router = express.Router();

/*
GET all calls (paginated)
GET /api/calls?page=1&limit=20
*/
router.get("/", async (req, res) => {
  try {

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "20", 10), 1);
    const skip = (page - 1) * limit;

    const totalItems = await Call.countDocuments({});

    const rows = await Call.find({})
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(totalItems / limit) || 1;

    res.json({
      items: rows,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });

  } catch (err) {
    console.error("Error fetching calls:", err);
    res.status(500).json({ error: "Failed to fetch calls" });
  }
});


/*
GET stats
/api/calls/stats
*/
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
GET single call
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