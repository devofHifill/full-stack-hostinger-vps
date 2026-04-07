import express from "express";
import WorkflowSchedule from "../models/WorkflowSchedule.js";
<<<<<<< HEAD
=======
import WorkflowExecutionLog from "../models/WorkflowExecutionLog.js";
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de

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
<<<<<<< HEAD
    second: "2-digit",
=======
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
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
<<<<<<< HEAD

=======
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
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

<<<<<<< HEAD
=======
function getLocalMinuteOfHour(date, timezone) {
  const parts = getTimePartsInTimezone(date, timezone);
  return Number(parts.minute);
}

>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
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

<<<<<<< HEAD
function normalizeDays(days) {
  if (!Array.isArray(days)) return [];

  return [...new Set(days.map(Number))].filter(
    (day) => Number.isInteger(day) && day >= 0 && day <= 6
  );
}

function validateAndNormalizeSchedules(schedules) {
  if (!Array.isArray(schedules)) {
    return { ok: false, error: "schedules must be an array" };
=======
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
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
  }

  const normalized = [];
  const seenIds = new Set();

<<<<<<< HEAD
  for (let i = 0; i < schedules.length; i += 1) {
    const raw = schedules[i] || {};

    const id = String(raw.id || "").trim();
    const scheduleName = String(raw.scheduleName || "").trim();
    const startTime = String(raw.startTime || "").trim();
    const endTime = String(raw.endTime || "").trim();
    const daysOfWeek = normalizeDays(raw.daysOfWeek);
=======
  for (let i = 0; i < windows.length; i += 1) {
    const raw = windows[i] || {};
    const id = String(raw.id || "").trim();
    const startTime = String(raw.startTime || "").trim();
    const endTime = String(raw.endTime || "").trim();
    const maxRecords = Number(raw.maxRecords);
    const executionEveryMinutes = Number(raw.executionEveryMinutes);
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de

    if (!id) {
      return {
        ok: false,
<<<<<<< HEAD
        error: `Schedule ${i + 1}: id is required`,
=======
        error: `Window ${i + 1}: id is required`,
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
      };
    }

    if (seenIds.has(id)) {
      return {
        ok: false,
<<<<<<< HEAD
        error: `Schedule ${i + 1}: duplicate id "${id}"`,
=======
        error: `Window ${i + 1}: duplicate id "${id}"`,
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
      };
    }
    seenIds.add(id);

<<<<<<< HEAD
    if (!scheduleName) {
      return {
        ok: false,
        error: `Schedule ${i + 1}: scheduleName is required`,
      };
    }

    if (!daysOfWeek.length) {
      return {
        ok: false,
        error: `Schedule ${i + 1}: select at least one valid day`,
      };
    }

    if (!isValidTimeString(startTime)) {
      return {
        ok: false,
        error: `Schedule ${i + 1}: invalid startTime "${startTime}"`,
=======
    if (!isValidTimeString(startTime)) {
      return {
        ok: false,
        error: `Window ${i + 1}: invalid startTime "${startTime}"`,
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
      };
    }

    if (!isValidTimeString(endTime)) {
      return {
        ok: false,
<<<<<<< HEAD
        error: `Schedule ${i + 1}: invalid endTime "${endTime}"`,
=======
        error: `Window ${i + 1}: invalid endTime "${endTime}"`,
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
      };
    }

    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);

    if (startMinutes >= endMinutes) {
      return {
        ok: false,
<<<<<<< HEAD
        error: `Schedule ${i + 1}: startTime must be earlier than endTime`,
=======
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
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
      };
    }

    normalized.push({
      id,
<<<<<<< HEAD
      scheduleName,
      daysOfWeek,
      startTime,
      endTime,
=======
      startTime,
      endTime,
      maxRecords,
      executionEveryMinutes,
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
      startMinutes,
      endMinutes,
    });
  }

<<<<<<< HEAD
  normalized.sort((a, b) => {
    if (a.startMinutes !== b.startMinutes) {
      return a.startMinutes - b.startMinutes;
    }
    return a.scheduleName.localeCompare(b.scheduleName);
  });

  for (let i = 0; i < normalized.length; i += 1) {
    for (let j = i + 1; j < normalized.length; j += 1) {
      const a = normalized[i];
      const b = normalized[j];

      const sharedDays = a.daysOfWeek.filter((day) => b.daysOfWeek.includes(day));

      if (!sharedDays.length) continue;

      const overlaps = a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes;

      if (overlaps) {
        return {
          ok: false,
          error: `Schedules overlap on day(s) ${sharedDays.join(", ")}: "${a.scheduleName}" (${a.startTime}-${a.endTime}) overlaps with "${b.scheduleName}" (${b.startTime}-${b.endTime})`,
        };
      }
=======
  normalized.sort((a, b) => a.startMinutes - b.startMinutes);

  for (let i = 1; i < normalized.length; i += 1) {
    const prev = normalized[i - 1];
    const curr = normalized[i];

    if (curr.startMinutes < prev.endMinutes) {
      return {
        ok: false,
        error: `Windows overlap: "${prev.id}" (${prev.startTime}-${prev.endTime}) overlaps with "${curr.id}" (${curr.startTime}-${curr.endTime})`,
      };
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
    }
  }

  return {
    ok: true,
<<<<<<< HEAD
    schedules: normalized.map(
      ({ id, scheduleName, daysOfWeek, startTime, endTime }) => ({
        id,
        scheduleName,
        daysOfWeek,
        startTime,
        endTime,
=======
    windows: normalized.map(
      ({ id, startTime, endTime, maxRecords, executionEveryMinutes }) => ({
        id,
        startTime,
        endTime,
        maxRecords,
        executionEveryMinutes,
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
      })
    ),
  };
}

<<<<<<< HEAD
function findActiveSchedule(schedules, weekday, currentMinutes) {
  return (
    schedules.find((item) => {
      if (!Array.isArray(item.daysOfWeek) || !item.daysOfWeek.includes(weekday)) {
        return false;
      }

      const start = parseTimeToMinutes(item.startTime);
      const end = parseTimeToMinutes(item.endTime);

      return currentMinutes >= start && currentMinutes < end;
    }) || null
  );
}

=======
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
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
<<<<<<< HEAD
        schedules: [],
      });
    }

    return res.json(schedule);
  } catch (error) {
    console.error("GET workflow schedule error:", error);
    return res.status(500).json({ error: "Failed to fetch workflow schedule" });
=======
        daysOfWeek: [1, 2, 3, 4, 5],
        windows: [],
      });
    }

    res.json(schedule);
  } catch (error) {
    console.error("GET workflow schedule error:", error);
    res.status(500).json({ error: "Failed to fetch workflow schedule" });
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
  }
});

/**
 * PUT /api/workflow-schedules/:workflowKey
 */
router.put("/:workflowKey", async (req, res) => {
  try {
    const { workflowKey } = req.params;
<<<<<<< HEAD
    const { name, enabled, timezone, schedules } = req.body;
=======
    const {
      name,
      enabled,
      timezone,
      daysOfWeek,
      windows,
    } = req.body;
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de

    const safeTimezone = String(timezone || "America/New_York").trim();

    if (!isValidTimezone(safeTimezone)) {
      return res.status(400).json({
        error: `Invalid timezone "${safeTimezone}"`,
      });
    }

<<<<<<< HEAD
    const scheduleCheck = validateAndNormalizeSchedules(schedules || []);

    if (!scheduleCheck.ok) {
      return res.status(400).json({
        error: scheduleCheck.error,
=======
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
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
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
<<<<<<< HEAD
        schedules: scheduleCheck.schedules,
=======
        daysOfWeek: normalizedDays,
        windows: windowCheck.windows,
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

<<<<<<< HEAD
    return res.json(schedule);
  } catch (error) {
    console.error("PUT workflow schedule error:", error);
    return res.status(500).json({ error: "Failed to save workflow schedule" });
=======
    res.json(schedule);
  } catch (error) {
    console.error("PUT workflow schedule error:", error);
    res.status(500).json({ error: "Failed to save workflow schedule" });
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
  }
});

/**
 * GET /api/workflow-schedules/:workflowKey/eligibility
<<<<<<< HEAD
 * Simple schedule-only eligibility
=======
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
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
<<<<<<< HEAD
        activeSchedule: null,
=======
        activeWindow: null,
        remainingRecords: 0,
        alreadyProcessed: 0,
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
      });
    }

    if (!schedule.enabled) {
      return res.json({
        allowed: false,
        workflowKey,
        reason: "Workflow is disabled",
<<<<<<< HEAD
        timezone: schedule.timezone,
        activeSchedule: null,
      });
    }

    const timezone = schedule.timezone || "America/New_York";
    const now = new Date();

    const localDate = getLocalDateString(now, timezone);
    const localWeekday = getLocalWeekday(now, timezone);
    const localMinutesNow = getLocalMinutesNow(now, timezone);
    const timezoneNow = getLocalNowDisplay(now, timezone);

    const activeSchedule = findActiveSchedule(
      Array.isArray(schedule.schedules) ? schedule.schedules : [],
      localWeekday,
      localMinutesNow
    );

    if (!activeSchedule) {
      return res.json({
        allowed: false,
        workflowKey,
        reason: "Current time is outside all active schedules",
        timezone,
        localDate,
        timezoneNow,
        activeSchedule: null,
=======
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
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
      });
    }

    return res.json({
      allowed: true,
      workflowKey,
      reason: "Eligible to run",
<<<<<<< HEAD
      timezone,
      localDate,
      timezoneNow,
      activeSchedule,
    });
  } catch (error) {
    console.error("GET workflow eligibility error:", error);
    return res.status(500).json({ error: "Failed to check workflow eligibility" });
=======
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
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
  }
});

export default router;