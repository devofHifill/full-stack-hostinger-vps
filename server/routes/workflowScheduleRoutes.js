import express from "express";
import WorkflowSchedule from "../models/WorkflowSchedule.js";

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
    second: "2-digit",
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

function normalizeDays(days) {
  if (!Array.isArray(days)) return [];

  return [...new Set(days.map(Number))].filter(
    (day) => Number.isInteger(day) && day >= 0 && day <= 6
  );
}

function validateAndNormalizeSchedules(schedules) {
  if (!Array.isArray(schedules)) {
    return { ok: false, error: "schedules must be an array" };
  }

  const normalized = [];
  const seenIds = new Set();

  for (let i = 0; i < schedules.length; i += 1) {
    const raw = schedules[i] || {};

    const id = String(raw.id || "").trim();
    const scheduleName = String(raw.scheduleName || "").trim();
    const startTime = String(raw.startTime || "").trim();
    const endTime = String(raw.endTime || "").trim();
    const daysOfWeek = normalizeDays(raw.daysOfWeek);

    if (!id) {
      return {
        ok: false,
        error: `Schedule ${i + 1}: id is required`,
      };
    }

    if (seenIds.has(id)) {
      return {
        ok: false,
        error: `Schedule ${i + 1}: duplicate id "${id}"`,
      };
    }
    seenIds.add(id);

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
      };
    }

    if (!isValidTimeString(endTime)) {
      return {
        ok: false,
        error: `Schedule ${i + 1}: invalid endTime "${endTime}"`,
      };
    }

    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);

    if (startMinutes >= endMinutes) {
      return {
        ok: false,
        error: `Schedule ${i + 1}: startTime must be earlier than endTime`,
      };
    }

    normalized.push({
      id,
      scheduleName,
      daysOfWeek,
      startTime,
      endTime,
      startMinutes,
      endMinutes,
    });
  }

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
    }
  }

  return {
    ok: true,
    schedules: normalized.map(
      ({ id, scheduleName, daysOfWeek, startTime, endTime }) => ({
        id,
        scheduleName,
        daysOfWeek,
        startTime,
        endTime,
      })
    ),
  };
}

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
        schedules: [],
      });
    }

    return res.json(schedule);
  } catch (error) {
    console.error("GET workflow schedule error:", error);
    return res.status(500).json({ error: "Failed to fetch workflow schedule" });
  }
});

/**
 * PUT /api/workflow-schedules/:workflowKey
 */
router.put("/:workflowKey", async (req, res) => {
  try {
    const { workflowKey } = req.params;
    const { name, enabled, timezone, schedules } = req.body;

    const safeTimezone = String(timezone || "America/New_York").trim();

    if (!isValidTimezone(safeTimezone)) {
      return res.status(400).json({
        error: `Invalid timezone "${safeTimezone}"`,
      });
    }

    const scheduleCheck = validateAndNormalizeSchedules(schedules || []);

    if (!scheduleCheck.ok) {
      return res.status(400).json({
        error: scheduleCheck.error,
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
        schedules: scheduleCheck.schedules,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.json(schedule);
  } catch (error) {
    console.error("PUT workflow schedule error:", error);
    return res.status(500).json({ error: "Failed to save workflow schedule" });
  }
});

/**
 * GET /api/workflow-schedules/:workflowKey/eligibility
 * Simple schedule-only eligibility
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
        activeSchedule: null,
      });
    }

    if (!schedule.enabled) {
      return res.json({
        allowed: false,
        workflowKey,
        reason: "Workflow is disabled",
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
      });
    }

    return res.json({
      allowed: true,
      workflowKey,
      reason: "Eligible to run",
      timezone,
      localDate,
      timezoneNow,
      activeSchedule,
    });
  } catch (error) {
    console.error("GET workflow eligibility error:", error);
    return res.status(500).json({ error: "Failed to check workflow eligibility" });
  }
});

export default router;