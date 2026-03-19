import express from "express";
import mongoose from "mongoose";

const router = express.Router();

const CALL_LOG_COLLECTION = "calls"; // change only if your collection name differs

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function getDirection(doc) {
  return doc.direction || "unknown";
}

function getEndedReason(doc) {
  return doc.endedReason || "unknown";
}

function getOutcome(doc) {
  return doc.normalizedOutcome || "unknown";
}

function getDurationSeconds(doc) {
  if (doc.durationSeconds != null) return toNumber(doc.durationSeconds);

  if (doc.startedAt && doc.endedAt) {
    const start = new Date(doc.startedAt).getTime();
    const end = new Date(doc.endedAt).getTime();

    if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
      return (end - start) / 1000;
    }
  }

  return 0;
}

function getOutcomeClass(outcome) {
  const successful = new Set([
    "booked",
    "qualified",
    "completed",
    "transferred",
    "connected",
  ]);

  const unsuccessful = new Set([
    "no-answer",
    "voicemail",
    "busy",
    "failed",
    "dropped",
    "unreachable",
    "spam",
  ]);

  if (successful.has(outcome)) return true;
  if (unsuccessful.has(outcome)) return false;
  return "unknown";
}

function buildStartedAtMatch({ range, startDate, endDate }) {
  const filter = {};

  if (range === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    filter.startedAt = { $gte: start, $lte: end };
    return filter;
  }

  if (range === "7d") {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);

    filter.startedAt = { $gte: start, $lte: end };
    return filter;
  }

  if (range === "30d") {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    filter.startedAt = { $gte: start, $lte: end };
    return filter;
  }

  if (startDate || endDate) {
    filter.startedAt = {};

    if (startDate) {
      filter.startedAt.$gte = new Date(`${startDate}T00:00:00.000Z`);
    }

    if (endDate) {
      filter.startedAt.$lte = new Date(`${endDate}T23:59:59.999Z`);
    }

    return filter;
  }

  return filter;
}

function buildDateRangeLabel({ range, startDate, endDate }) {
  if (range === "today") return "Today";
  if (range === "7d") return "Last 7 Days";
  if (range === "30d") return "Last 30 Days";

  if (startDate && endDate) return `${startDate} - ${endDate}`;
  if (startDate) return `${startDate} onward`;
  if (endDate) return `Until ${endDate}`;

  return "All Time";
}

function buildGroupedByLabel(range) {
  if (range === "today") return "Hours";
  return "Days";
}

router.get("/call-metrics", async (req, res) => {
  try {
    const db = mongoose.connection.db;

    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }

    const collection = db.collection(CALL_LOG_COLLECTION);

    const {
      range = "all",
      startDate,
      endDate,
      direction,
    } = req.query;

    const match = {};

    if (direction && direction !== "all") {
      match.direction = direction;
    }

    const startedAtMatch = buildStartedAtMatch({
      range,
      startDate,
      endDate,
    });

    Object.assign(match, startedAtMatch);

    const docs = await collection.find(match).sort({ startedAt: -1 }).toArray();

    const totalCalls = docs.length;
    const totalSpent = docs.reduce((sum, doc) => sum + toNumber(doc.cost), 0);
    const totalDurationSeconds = docs.reduce(
      (sum, doc) => sum + getDurationSeconds(doc),
      0
    );

    const totalCallMinutes = totalDurationSeconds / 60;
    const avgCostPerCall = totalCalls ? totalSpent / totalCalls : 0;
    const avgDurationSeconds = totalCalls ? totalDurationSeconds / totalCalls : 0;

    let successTrue = 0;
    let successFalse = 0;
    let successUnknown = 0;

    const endedReasonMap = new Map();
    const directionMap = new Map();
    const outcomeMap = new Map();
    const statusMap = new Map();

    for (const doc of docs) {
      const endedReason = getEndedReason(doc);
      const dir = getDirection(doc);
      const outcome = getOutcome(doc);
      const outcomeClass = getOutcomeClass(outcome);
      const status = doc.status || "unknown";

      endedReasonMap.set(endedReason, (endedReasonMap.get(endedReason) || 0) + 1);
      directionMap.set(dir, (directionMap.get(dir) || 0) + 1);
      outcomeMap.set(outcome, (outcomeMap.get(outcome) || 0) + 1);
      statusMap.set(status, (statusMap.get(status) || 0) + 1);

      if (outcomeClass === true) successTrue += 1;
      else if (outcomeClass === false) successFalse += 1;
      else successUnknown += 1;
    }

    const successRate = totalCalls ? (successTrue / totalCalls) * 100 : 0;

    const directionRows = [...directionMap.entries()]
      .map(([directionName, calls], index) => {
        const directionDocs = docs.filter(
          (doc) => getDirection(doc) === directionName
        );

        const directionDuration = directionDocs.reduce(
          (sum, doc) => sum + getDurationSeconds(doc),
          0
        );

        const directionSpend = directionDocs.reduce(
          (sum, doc) => sum + toNumber(doc.cost),
          0
        );

        const directionSuccessCount = directionDocs.filter(
          (doc) => getOutcomeClass(getOutcome(doc)) === true
        ).length;

        const label =
          directionName && directionName !== "unknown"
            ? directionName.charAt(0).toUpperCase() + directionName.slice(1)
            : "Unknown";

        return {
          assistant: label,
          calls,
          minutes: Number((directionDuration / 60).toFixed(2)),
          avgDurationSeconds: calls ? Math.round(directionDuration / calls) : 0,
          spend: Number(directionSpend.toFixed(2)),
          avgCostPerCall: calls ? Number((directionSpend / calls).toFixed(2)) : 0,
          successRate: calls
            ? Number(((directionSuccessCount / calls) * 100).toFixed(1))
            : 0,
          tone: ["purple", "blue", "green", "amber"][index % 4],
        };
      })
      .sort((a, b) => b.calls - a.calls);

    const endedReasons = [...endedReasonMap.entries()]
      .map(([reason, calls], index) => ({
        reason,
        calls,
        tone: ["blue", "amber", "red", "purple"][index % 4],
      }))
      .sort((a, b) => b.calls - a.calls);

    const outcomeBreakdown = [...outcomeMap.entries()]
      .map(([outcome, calls]) => ({ outcome, calls }))
      .sort((a, b) => b.calls - a.calls);

    const statusBreakdown = [...statusMap.entries()]
      .map(([status, calls]) => ({ status, calls }))
      .sort((a, b) => b.calls - a.calls);

    return res.json({
      metrics: {
        totalCallMinutes: Number(totalCallMinutes.toFixed(2)),
        totalCalls,
        totalSpent: Number(totalSpent.toFixed(2)),
        avgCostPerCall: Number(avgCostPerCall.toFixed(2)),
        avgDurationSeconds: Math.round(avgDurationSeconds),
        successRate: Number(successRate.toFixed(1)),
      },
      assistantRows: directionRows,
      endedReasons,
      successBreakdown: {
        true: successTrue,
        false: successFalse,
        unknown: successUnknown,
      },
      outcomeBreakdown,
      statusBreakdown,
      meta: {
        dateRangeLabel: buildDateRangeLabel({ range, startDate, endDate }),
        groupedBy: buildGroupedByLabel(range),
        assistantFilterLabel:
          direction && direction !== "all" ? direction : "All Directions",
        lastSyncedLabel: `Synced ${new Date().toLocaleString()}`,
      },
    });
  } catch (error) {
    console.error("GET /api/call-metrics error:", error);
    return res.status(500).json({
      error: "Failed to generate call metrics",
      details: error.message,
    });
  }
});

export default router;




