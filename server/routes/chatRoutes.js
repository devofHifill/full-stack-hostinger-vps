import express from "express";

import ChatSession from "../models/ChatSession.js";
import ChatMessage from "../models/ChatMessage.js";
import ChatLead from "../models/ChatLead.js";

const router = express.Router();



/*
START CHAT SESSION
*/
router.post("/session/start", async (req, res) => {

  try {

    const { sessionId, name, phone, email } = req.body;

    let session = await ChatSession.findOne({ sessionId });

    if (!session) {

      session = await ChatSession.create({
        sessionId,
        visitor: {
          name,
          phone,
          email
        }
      });

    }

    res.json({
      success: true,
      session
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Failed to start session"
    });

  }

});



/*
SAVE MESSAGE
*/
router.post("/message", async (req, res) => {

  try {

    const { sessionId, role, message } = req.body;

    const msg = await ChatMessage.create({
      sessionId,
      role,
      message
    });

    await ChatSession.updateOne(
      { sessionId },
      {
        $inc: { "metrics.messageCount": 1 }
      }
    );

    res.json({
      success: true,
      msg
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Failed to save message"
    });

  }

});



/*
GET ALL CHAT SESSIONS
*/
router.get("/sessions", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);
    const skip = (page - 1) * limit;

    const { range = "all", startDate, endDate } = req.query;

    /* ---------------- DATE FILTER ---------------- */

    const match = {};

    if (range === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      match.createdAt = { $gte: start, $lte: end };
    }

    else if (range === "7d") {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);

      match.createdAt = { $gte: start, $lte: end };
    }

    else if (range === "30d") {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);

      match.createdAt = { $gte: start, $lte: end };
    }

    else if (startDate || endDate) {
      match.createdAt = {};

      if (startDate) {
        match.createdAt.$gte = new Date(`${startDate}T00:00:00.000Z`);
      }

      if (endDate) {
        match.createdAt.$lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    /* ---------------- QUERY ---------------- */

    const totalItems = await ChatSession.countDocuments(match);

    const sessions = await ChatSession.find(match)
      .sort({ updatedAt: -1 }) // keep latest active chats on top
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(totalItems / limit) || 1;

    res.json({
      items: sessions,
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
    console.error(err);

    res.status(500).json({
      error: "Failed to fetch sessions",
    });
  }
});

/*
GET CHAT HISTORY
*/
router.get("/:sessionId", async (req, res) => {

  try {

    const messages = await ChatMessage
      .find({ sessionId: req.params.sessionId })
      .sort({ timestamp: 1 });

    res.json(messages);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Failed to fetch messages"
    });

  }

});



/*
CREATE / UPDATE LEAD
*/
router.post("/lead", async (req, res) => {

  try {

    const {
      sessionId,
      name,
      phone,
      email,
      loan_goal,
      refi_objective,
      buying_priority,
      appointmentTime
    } = req.body;

    let lead = await ChatLead.findOne({ sessionId });

    if (!lead) {

      lead = await ChatLead.create({
        sessionId,
        name,
        phone,
        email,
        loan_goal,
        refi_objective,
        buying_priority,
        appointmentTime,
        status: "qualified"
      });

    } else {

      lead = await ChatLead.findOneAndUpdate(
        { sessionId },
        {
          name,
          phone,
          email,
          loan_goal,
          refi_objective,
          buying_priority,
          appointmentTime
        },
        { new: true }
      );

    }

    res.json({
      success: true,
      lead
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Failed to store lead"
    });

  }

});


export default router;