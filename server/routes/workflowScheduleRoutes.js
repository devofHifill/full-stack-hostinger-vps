import express from "express";
import WorkflowSchedule from "../models/WorkflowSchedule.js";
import WorkflowExecutionLog from "../models/WorkflowExecutionLog.js";

const router = express.Router();

/* ----------------------------- helper functions ---------------------------- */

function parseTimeToMinutes(timeStr = "00:00") {
  const [hh = "0", mm = "0"] = String(timeStr).split(":");
  return Number(hh) * 60 + Number(mm);
}

function isValidTimeString(timeStr) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(timeStr));
}

function isValidTimezone(timezone) {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

function getTimePartsInTimezone(date, timezone) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = dtf.formatToParts(date);
  const map = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      map[part.type] = part.value;
    }
  }

  return map;
}

function weekdayShortToNumber(weekdayShort) {
  const map = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[weekdayShort] ?? null;
}

function getLocalDateString(date, timezone) {
  const parts = getTimePartsInTimezone(date, timezone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function getLocalMinutesNow(date, timezone) {
  const parts = getTimePartsInTimezone(date, timezone);
  return Number(parts.hour) * 60 + Number(parts.minute);
}

function getLocalMinuteOfHour(date, timezone) {
  const parts = getTimePartsInTimezone(date, timezone);
  return Number(parts.minute);
}

function getLocalWeekday(date, timezone) {
  const parts = getTimePartsInTimezone(date, timezone);
  return weekdayShortToNumber(parts.weekday);
}

function getLocalNowDisplay(date, timezone) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).format(date);
}

function isWindowActive(currentMinutes, startTime, endTime) {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  return currentMinutes >= start && currentMinutes < end;
}

function shouldRunThisMinute(currentMinute, executionEveryMinutes = 5) {
  if (!executionEveryMinutes || executionEveryMinutes <= 0) return false;
  return currentMinute % executionEveryMinutes === 0;
}

function normalizeDaysOfWeek(daysOfWeek) {
  if (!Array.isArray(daysOfWeek)) return [1, 2, 3, 4, 5];

  const unique = [...new Set(daysOfWeek.map(Number))].filter(
    (d) => Number.isInteger(d) && d >= 0 && d <= 6
  );

  return unique.sort((a, b) => a - b);
}

function validateAndNormalizeWindows(windows) {
  if (!Array.isArray(windows)) {
    return {
      ok: false,
      error: "windows must be an array",
    };
  }

  const normalized = [];
  const seenIds = new Set();

  for (let i = 0; i < windows.length; i += 1) {
    const raw = windows[i] || {};
    const id = String(raw.id || "").trim();
    const startTime = String(raw.startTime || "").trim();
    const endTime = String(raw.endTime || "").trim();
    const maxRecords = Number(raw.maxRecords);
    const executionEveryMinutes = Number(raw.executionEveryMinutes);

    if (!id) {
      return {
        ok: false,
        error: `Window ${i + 1}: id is required`,
      };
    }

    if (seenIds.has(id)) {
      return {
        ok: false,
        error: `Window ${i + 1}: duplicate id "${id}"`,
      };
    }
    seenIds.add(id);

    if (!isValidTimeString(startTime)) {
      return {
        ok: false,
        error: `Window ${i + 1}: invalid startTime "${startTime}"`,
      };
    }

    if (!isValidTimeString(endTime)) {
      return {
        ok: false,
        error: `Window ${i + 1}: invalid endTime "${endTime}"`,
      };
    }

    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);

    if (startMinutes >= endMinutes) {
      return {
        ok: false,
        error: `Window ${i + 1}: startTime must be earlier than endTime`,
      };
    }

    if (!Number.isInteger(maxRecords) || maxRecords < 1) {
      return {
        ok: false,
        error: `Window ${i + 1}: maxRecords must be an integer >= 1`,
      };
    }

    if (
      !Number.isInteger(executionEveryMinutes) ||
      executionEveryMinutes < 1 ||
      executionEveryMinutes > 1440
    ) {
      return {
        ok: false,
        error: `Window ${i + 1}: executionEveryMinutes must be an integer between 1 and 1440`,
      };
    }

    normalized.push({
      id,
      startTime,
      endTime,
      maxRecords,
      executionEveryMinutes,
      startMinutes,
      endMinutes,
    });
  }

  normalized.sort((a, b) => a.startMinutes - b.startMinutes);

  for (let i = 1; i < normalized.length; i += 1) {
    const prev = normalized[i - 1];
    const curr = normalized[i];

    if (curr.startMinutes < prev.endMinutes) {
      return {
        ok: false,
        error: `Windows overlap: "${prev.id}" (${prev.startTime}-${prev.endTime}) overlaps with "${curr.id}" (${curr.startTime}-${curr.endTime})`,
      };
    }
  }

  return {
    ok: true,
    windows: normalized.map(
      ({ id, startTime, endTime, maxRecords, executionEveryMinutes }) => ({
        id,
        startTime,
        endTime,
        maxRecords,
        executionEveryMinutes,
      })
    ),
  };
}

/* ---------------------------------- routes --------------------------------- */

/**
 * GET /api/workflow-schedules/:workflowKey
 */
router.get("/:workflowKey", async (req, res) => {
  try {
    const { workflowKey } = req.params;

    let schedule = await WorkflowSchedule.findOne({ workflowKey });

    if (!schedule) {
      schedule = await WorkflowSchedule.create({
        workflowKey,
        name: "Outbound Calling Control",
        enabled: false,
        timezone: "America/New_York",
        daysOfWeek: [1, 2, 3, 4, 5],
        windows: [],
      });
    }

    res.json(schedule);
  } catch (error) {
    console.error("GET workflow schedule error:", error);
    res.status(500).json({ error: "Failed to fetch workflow schedule" });
  }
});

/**
 * PUT /api/workflow-schedules/:workflowKey
 */
router.put("/:workflowKey", async (req, res) => {
  try {
    const { workflowKey } = req.params;
    const {
      name,
      enabled,
      timezone,
      daysOfWeek,
      windows,
    } = req.body;

    const safeTimezone = String(timezone || "America/New_York").trim();

    if (!isValidTimezone(safeTimezone)) {
      return res.status(400).json({
        error: `Invalid timezone "${safeTimezone}"`,
      });
    }

    const normalizedDays = normalizeDaysOfWeek(daysOfWeek);

    if (!normalizedDays.length) {
      return res.status(400).json({
        error: "daysOfWeek must contain at least one valid day (0-6)",
      });
    }

    const windowCheck = validateAndNormalizeWindows(windows || []);

    if (!windowCheck.ok) {
      return res.status(400).json({
        error: windowCheck.error,
      });
    }

    const safeName = String(name || "Outbound Calling Control").trim();

    const schedule = await WorkflowSchedule.findOneAndUpdate(
      { workflowKey },
      {
        workflowKey,
        name: safeName || "Outbound Calling Control",
        enabled: typeof enabled === "boolean" ? enabled : false,
        timezone: safeTimezone,
        daysOfWeek: normalizedDays,
        windows: windowCheck.windows,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.json(schedule);
  } catch (error) {
    console.error("PUT workflow schedule error:", error);
    res.status(500).json({ error: "Failed to save workflow schedule" });
  }
});

/**
 * GET /api/workflow-schedules/:workflowKey/eligibility
 */
router.get("/:workflowKey/eligibility", async (req, res) => {
  try {
    const { workflowKey } = req.params;

    const schedule = await WorkflowSchedule.findOne({ workflowKey });

    if (!schedule) {
      return res.status(404).json({
        allowed: false,
        workflowKey,
        reason: "Workflow schedule not found",
        activeWindow: null,
        remainingRecords: 0,
        alreadyProcessed: 0,
      });
    }

    if (!schedule.enabled) {
      return res.json({
        allowed: false,
        workflowKey,
        reason: "Workflow is disabled",
        activeWindow: null,
        remainingRecords: 0,
        alreadyProcessed: 0,
        timezone: schedule.timezone,
      });
    }

    const now = new Date();
    const timezone = schedule.timezone || "America/New_York";
    const localDate = getLocalDateString(now, timezone);
    const localWeekday = getLocalWeekday(now, timezone);
    const localMinutesNow = getLocalMinutesNow(now, timezone);
    const localMinuteOfHour = getLocalMinuteOfHour(now, timezone);
    const timezoneNow = getLocalNowDisplay(now, timezone);

    if (
      Array.isArray(schedule.daysOfWeek) &&
      schedule.daysOfWeek.length > 0 &&
      !schedule.daysOfWeek.includes(localWeekday)
    ) {
      return res.json({
        allowed: false,
        workflowKey,
        reason: "Today is not an active day",
        activeWindow: null,
        remainingRecords: 0,
        alreadyProcessed: 0,
        timezone,
        localDate,
        timezoneNow,
      });
    }

    const activeWindow =
      (schedule.windows || []).find((win) =>
        isWindowActive(localMinutesNow, win.startTime, win.endTime)
      ) || null;

    if (!activeWindow) {
      return res.json({
        allowed: false,
        workflowKey,
        reason: "Current time is outside all active windows",
        activeWindow: null,
        remainingRecords: 0,
        alreadyProcessed: 0,
        timezone,
        localDate,
        timezoneNow,
      });
    }

    const every = Number(activeWindow.executionEveryMinutes || 5);

    if (!shouldRunThisMinute(localMinuteOfHour, every)) {
      return res.json({
        allowed: false,
        workflowKey,
        reason: `Not scheduled to run on this minute. Executes every ${every} minute(s).`,
        activeWindow,
        remainingRecords: 0,
        alreadyProcessed: 0,
        timezone,
        localDate,
        timezoneNow,
      });
    }

    const logAgg = await WorkflowExecutionLog.aggregate([
      {
        $match: {
          workflowKey,
          windowId: activeWindow.id,
          date: localDate,
          status: { $in: ["started", "completed"] },
        },
      },
      {
        $group: {
          _id: null,
          totalProcessed: { $sum: "$recordsProcessed" },
          totalAttempted: { $sum: "$recordsAttempted" },
        },
      },
    ]);

    const alreadyProcessed = logAgg[0]?.totalProcessed || 0;
    const maxRecords = Number(activeWindow.maxRecords || 0);
    const remainingRecords = Math.max(0, maxRecords - alreadyProcessed);

    if (remainingRecords <= 0) {
      return res.json({
        allowed: false,
        workflowKey,
        reason: "Window quota already exhausted",
        activeWindow,
        remainingRecords: 0,
        alreadyProcessed,
        maxRecords,
        timezone,
        localDate,
        timezoneNow,
      });
    }

    return res.json({
      allowed: true,
      workflowKey,
      reason: "Eligible to run",
      activeWindow,
      remainingRecords,
      alreadyProcessed,
      maxRecords,
      timezone,
      localDate,
      timezoneNow,
    });
  } catch (error) {
    console.error("GET workflow eligibility error:", error);
    res.status(500).json({ error: "Failed to check workflow eligibility" });
  }
});

export default router;