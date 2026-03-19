import express from "express";
import ChatSession from "../models/ChatSession.js";
import ChatMessage from "../models/ChatMessage.js";

const router = express.Router();

/* ---------------- DATE FILTER HELPERS ---------------- */

function buildDateMatch({ range, startDate, endDate, field = "createdAt" }) {
  const match = {};

  if (range === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    match[field] = { $gte: start, $lte: end };
    return match;
  }

  if (range === "7d") {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);

    match[field] = { $gte: start, $lte: end };
    return match;
  }

  if (range === "30d") {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    match[field] = { $gte: start, $lte: end };
    return match;
  }

  if (startDate || endDate) {
    match[field] = {};

    if (startDate) {
      match[field].$gte = new Date(`${startDate}T00:00:00.000Z`);
    }

    if (endDate) {
      match[field].$lte = new Date(`${endDate}T23:59:59.999Z`);
    }

    return match;
  }

  return match; // all time
}

function buildMeta({ range, startDate, endDate }) {
  if (range === "today") {
    return { dateRangeLabel: "Today", groupedBy: "Hours" };
  }

  if (range === "7d") {
    return { dateRangeLabel: "Last 7 Days", groupedBy: "Days" };
  }

  if (range === "30d") {
    return { dateRangeLabel: "Last 30 Days", groupedBy: "Days" };
  }

  if (startDate && endDate) {
    return {
      dateRangeLabel: `${startDate} → ${endDate}`,
      groupedBy: "Days",
    };
  }

  return { dateRangeLabel: "All Time", groupedBy: "Days" };
}

/* ---------------- ROUTE ---------------- */

router.get("/chat-metrics", async (req, res) => {
  try {
    const { range = "all", startDate, endDate } = req.query;

    const sessionMatch = buildDateMatch({
      range,
      startDate,
      endDate,
      field: "createdAt",
    });

    const messageMatch = buildDateMatch({
      range,
      startDate,
      endDate,
      field: "createdAt",
    });

    /* ---------- COUNTS ---------- */

    const totalSessions = await ChatSession.countDocuments(sessionMatch);
    const totalMessages = await ChatMessage.countDocuments(messageMatch);

    const avgMessages =
      totalSessions > 0
        ? Number((totalMessages / totalSessions).toFixed(1))
        : 0;

    /* ---------- USERS ---------- */

    const sessions = await ChatSession.find(
      sessionMatch,
      {
        sessionId: 1,
        visitor: 1,
        metrics: 1,
      }
    ).lean();

    const uniqueUserKeys = new Set();

    for (const session of sessions) {
      const email = session?.visitor?.email?.trim()?.toLowerCase();
      const phone = session?.visitor?.phone?.trim();
      const sessionId = session?.sessionId?.trim();

      if (email) uniqueUserKeys.add(`email:${email}`);
      else if (phone) uniqueUserKeys.add(`phone:${phone}`);
      else if (sessionId) uniqueUserKeys.add(`session:${sessionId}`);
    }

    const users = uniqueUserKeys.size;

    /* ---------- ENGAGEMENT ---------- */

    const engagedSessions = sessions.filter(
      (s) => (s?.metrics?.messageCount || 0) >= 2
    ).length;

    const engagedRate =
      totalSessions > 0
        ? Number(((engagedSessions / totalSessions) * 100).toFixed(1))
        : 0;

    /* ---------- PLACEHOLDERS ---------- */

    const containment = 0; // still not implemented
    const intents = []; // needs intent storage later

    /* ---------- META ---------- */

    const metaInfo = buildMeta({ range, startDate, endDate });

    /* ---------- RESPONSE ---------- */

    res.json({
      metrics: {
        totalSessions,
        totalMessages,
        avgMessages,
        engagedRate,
        containment,
        users,
      },
      intents,
      meta: {
        dateRangeLabel: metaInfo.dateRangeLabel,
        groupedBy: metaInfo.groupedBy,
        sourceFilterLabel: "All Sources",
        lastSyncedLabel: `Synced ${new Date().toLocaleString()}`,
      },
    });
  } catch (error) {
    console.error("Error fetching chat metrics:", error);
    res.status(500).json({
      error: "Failed to load chat metrics",
    });
  }
});

export default router;