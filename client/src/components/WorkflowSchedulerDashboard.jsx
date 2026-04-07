<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import "./styles/WorkflowSchedulerDashboard.css";
import { useApiClient } from "../hooks/useApiClient";

=======
import React, { useEffect, useMemo, useState } from "react";
import "./WorkflowSchedulerDashboard.css";

const API_BASE = import.meta.env.VITE_API_URL || "";
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de

const WORKFLOW_KEY = "outbound_calling_main";

const DAY_OPTIONS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

const TIMEZONE_OPTIONS = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Asia/Kolkata",
  "UTC",
];

<<<<<<< HEAD
function createScheduleRow(index = 1) {
  return {
    id: `sch_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 7)}`,
    scheduleName: "",
    daysOfWeek: [],
    startTime: "09:00",
    endTime: "17:00",
  };
}

function sortSchedulesByTime(schedules = []) {
  return [...schedules].sort((a, b) =>
    String(a.startTime || "").localeCompare(String(b.startTime || ""))
  );
}

function getDaysLabel(daysOfWeek = []) {
  if (!Array.isArray(daysOfWeek) || !daysOfWeek.length) return "No days selected";

  return DAY_OPTIONS.filter((day) => daysOfWeek.includes(day.value))
    .map((day) => day.label)
    .join(", ");
}

export default function WorkflowSchedulerDashboard() {
  const [scheduleDoc, setScheduleDoc] = useState({
=======
function createWindowRow(index = 1) {
  return {
    id: `win_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 7)}`,
    startTime: "09:00",
    endTime: "11:00",
    maxRecords: 20,
    executionEveryMinutes: 5,
  };
}

function sortWindowsByTime(windows = []) {
  return [...windows].sort((a, b) => {
    const aVal = String(a.startTime || "");
    const bVal = String(b.startTime || "");
    return aVal.localeCompare(bVal);
  });
}

export default function WorkflowSchedulerDashboard() {
  const [schedule, setSchedule] = useState({
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
    workflowKey: WORKFLOW_KEY,
    name: "Outbound Calling Control",
    enabled: false,
    timezone: "America/New_York",
<<<<<<< HEAD
    schedules: [],
=======
    daysOfWeek: [1, 2, 3, 4, 5],
    windows: [],
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
<<<<<<< HEAD
  const { requestJson } = useApiClient();
=======
  const [eligibility, setEligibility] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de

  async function loadSchedule() {
    try {
      setLoading(true);
      setFetchError("");

<<<<<<< HEAD
      const data = await requestJson(
        `/workflow-schedules/${WORKFLOW_KEY}`,
        {
          method: "GET",
        }
      );

      setScheduleDoc({
=======
      const res = await fetch(
        `${API_BASE}/api/workflow-schedules/${WORKFLOW_KEY}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load schedule");
      }

      setSchedule({
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
        workflowKey: data.workflowKey || WORKFLOW_KEY,
        name: data.name || "Outbound Calling Control",
        enabled: Boolean(data.enabled),
        timezone: data.timezone || "America/New_York",
<<<<<<< HEAD
        schedules: Array.isArray(data.schedules)
          ? sortSchedulesByTime(data.schedules)
          : [],
=======
        daysOfWeek: Array.isArray(data.daysOfWeek) ? data.daysOfWeek : [1, 2, 3, 4, 5],
        windows: Array.isArray(data.windows) ? sortWindowsByTime(data.windows) : [],
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
      });
    } catch (error) {
      setFetchError(error.message || "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }

<<<<<<< HEAD
  useEffect(() => {
    loadSchedule();
  }, []);

  function updateRootField(field, value) {
    setScheduleDoc((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSaveError("");
    setSaveSuccess("");
  }

  function addSchedule() {
    setScheduleDoc((prev) => ({
      ...prev,
      schedules: sortSchedulesByTime([
        ...prev.schedules,
        createScheduleRow(prev.schedules.length + 1),
      ]),
    }));
    setSaveError("");
    setSaveSuccess("");
  }

  function removeSchedule(id) {
    setScheduleDoc((prev) => ({
      ...prev,
      schedules: prev.schedules.filter((item) => item.id !== id),
    }));
    setSaveError("");
    setSaveSuccess("");
  }

  function updateSchedule(id, field, value) {
    setScheduleDoc((prev) => ({
      ...prev,
      schedules: sortSchedulesByTime(
        prev.schedules.map((item) =>
          item.id === id
            ? {
              ...item,
              [field]: value,
            }
            : item
        )
      ),
    }));
    setSaveError("");
    setSaveSuccess("");
  }

  function toggleScheduleDay(id, dayValue) {
    setScheduleDoc((prev) => ({
      ...prev,
      schedules: prev.schedules.map((item) => {
        if (item.id !== id) return item;

        const exists = item.daysOfWeek.includes(dayValue);
        const nextDays = exists
          ? item.daysOfWeek.filter((d) => d !== dayValue)
          : [...item.daysOfWeek, dayValue].sort((a, b) => a - b);

        return {
          ...item,
          daysOfWeek: nextDays,
        };
      }),
    }));
    setSaveError("");
    setSaveSuccess("");
=======
  async function loadEligibility() {
    try {
      setCheckingEligibility(true);

      const res = await fetch(
        `${API_BASE}/api/workflow-schedules/${WORKFLOW_KEY}/eligibility`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to check eligibility");
      }

      setEligibility(data);
    } catch (error) {
      setEligibility({
        allowed: false,
        reason: error.message || "Failed to check eligibility",
      });
    } finally {
      setCheckingEligibility(false);
    }
  }

  useEffect(() => {
    loadSchedule();
    loadEligibility();
  }, []);

  function updateField(field, value) {
    setSchedule((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSaveSuccess("");
    setSaveError("");
  }

  function toggleDay(dayValue) {
    setSchedule((prev) => {
      const exists = prev.daysOfWeek.includes(dayValue);
      const nextDays = exists
        ? prev.daysOfWeek.filter((d) => d !== dayValue)
        : [...prev.daysOfWeek, dayValue].sort((a, b) => a - b);

      return {
        ...prev,
        daysOfWeek: nextDays,
      };
    });
    setSaveSuccess("");
    setSaveError("");
  }

  function addWindow() {
    setSchedule((prev) => ({
      ...prev,
      windows: sortWindowsByTime([...prev.windows, createWindowRow(prev.windows.length + 1)]),
    }));
    setSaveSuccess("");
    setSaveError("");
  }

  function removeWindow(id) {
    setSchedule((prev) => ({
      ...prev,
      windows: prev.windows.filter((win) => win.id !== id),
    }));
    setSaveSuccess("");
    setSaveError("");
  }

  function updateWindow(id, field, value) {
    setSchedule((prev) => ({
      ...prev,
      windows: sortWindowsByTime(
        prev.windows.map((win) =>
          win.id === id
            ? {
                ...win,
                [field]:
                  field === "maxRecords" || field === "executionEveryMinutes"
                    ? value === ""
                      ? ""
                      : Number(value)
                    : value,
              }
            : win
        )
      ),
    }));
    setSaveSuccess("");
    setSaveError("");
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
  }

  async function saveSchedule() {
    try {
      setSaving(true);
      setSaveError("");
      setSaveSuccess("");

      const payload = {
<<<<<<< HEAD
        name: scheduleDoc.name,
        enabled: scheduleDoc.enabled,
        timezone: scheduleDoc.timezone,
        schedules: scheduleDoc.schedules.map((item) => ({
          id: item.id,
          scheduleName: item.scheduleName.trim(),
          daysOfWeek: item.daysOfWeek,
          startTime: item.startTime,
          endTime: item.endTime,
        })),
      };

      const data = await requestJson(
        `/workflow-schedules/${WORKFLOW_KEY}`,
        {
          method: "PUT",
          body: payload,
        }
      );

      setScheduleDoc({
=======
        name: schedule.name,
        enabled: schedule.enabled,
        timezone: schedule.timezone,
        daysOfWeek: schedule.daysOfWeek,
        windows: schedule.windows.map((win) => ({
          id: win.id,
          startTime: win.startTime,
          endTime: win.endTime,
          maxRecords: Number(win.maxRecords),
          executionEveryMinutes: Number(win.executionEveryMinutes),
        })),
      };

      const res = await fetch(
        `${API_BASE}/api/workflow-schedules/${WORKFLOW_KEY}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to save schedule");
      }

      setSchedule({
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
        workflowKey: data.workflowKey || WORKFLOW_KEY,
        name: data.name || "Outbound Calling Control",
        enabled: Boolean(data.enabled),
        timezone: data.timezone || "America/New_York",
<<<<<<< HEAD
        schedules: Array.isArray(data.schedules)
          ? sortSchedulesByTime(data.schedules)
          : [],
      });

      setSaveSuccess("Schedule saved successfully.");
=======
        daysOfWeek: Array.isArray(data.daysOfWeek) ? data.daysOfWeek : [1, 2, 3, 4, 5],
        windows: Array.isArray(data.windows) ? sortWindowsByTime(data.windows) : [],
      });

      setSaveSuccess("Schedule saved successfully.");
      loadEligibility();
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
    } catch (error) {
      setSaveError(error.message || "Failed to save schedule");
    } finally {
      setSaving(false);
    }
  }

<<<<<<< HEAD
  const scheduleCountLabel = useMemo(() => {
    const count = scheduleDoc.schedules.length;
    if (count === 0) return "No schedulers added";
    if (count === 1) return "1 scheduler configured";
    return `${count} schedulers configured`;
  }, [scheduleDoc.schedules.length]);
=======
  const selectedDaysLabel = useMemo(() => {
    if (!schedule.daysOfWeek.length) return "No days selected";
    return DAY_OPTIONS.filter((d) => schedule.daysOfWeek.includes(d.value))
      .map((d) => d.label)
      .join(", ");
  }, [schedule.daysOfWeek]);
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de

  if (loading) {
    return (
      <div className="workflow-page">
        <div className="workflow-card">
<<<<<<< HEAD
          <div className="workflow-loading">Loading scheduler settings...</div>
=======
          <div className="workflow-loading">Loading workflow scheduler...</div>
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
        </div>
      </div>
    );
  }

  return (
    <div className="workflow-page">
      <div className="workflow-header">
        <div>
          <h1 className="workflow-title">Workflow Scheduler</h1>
          <p className="workflow-subtitle">
<<<<<<< HEAD
            Add multiple schedule blocks, assign days, and define start and end
            times. Overlapping schedules are blocked by backend validation.
=======
            Control when n8n is allowed to run and how many records it can process per window.
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
          </p>
        </div>

        <div className="workflow-header-actions">
          <button
            className="workflow-btn workflow-btn-secondary"
            type="button"
<<<<<<< HEAD
            onClick={loadSchedule}
            disabled={loading || saving}
          >
            Refresh
=======
            onClick={loadEligibility}
            disabled={checkingEligibility}
          >
            {checkingEligibility ? "Checking..." : "Refresh Status"}
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
          </button>

          <button
            className="workflow-btn workflow-btn-primary"
            type="button"
            onClick={saveSchedule}
<<<<<<< HEAD
            disabled={saving || loading}          >
            {saving ? "Saving..." : "Save Scheduler"}
=======
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Schedule"}
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
          </button>
        </div>
      </div>

      {fetchError ? (
        <div className="workflow-alert workflow-alert-error">{fetchError}</div>
      ) : null}

      {saveError ? (
        <div className="workflow-alert workflow-alert-error">{saveError}</div>
      ) : null}

      {saveSuccess ? (
        <div className="workflow-alert workflow-alert-success">{saveSuccess}</div>
      ) : null}

<<<<<<< HEAD
      <div className="workflow-grid workflow-grid-single">
        <div className="workflow-card">
          <div className="workflow-card-header">
            <h2>General Settings</h2>
=======
      <div className="workflow-grid">
        <div className="workflow-card">
          <div className="workflow-card-header">
            <h2>Workflow Settings</h2>
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
          </div>

          <div className="workflow-form-grid">
            <div className="workflow-field workflow-field-full">
<<<<<<< HEAD
              <label>Scheduler Name</label>
              <input
                type="text"
                value={scheduleDoc.name}
                onChange={(e) => updateRootField("name", e.target.value)}
=======
              <label>Workflow Name</label>
              <input
                type="text"
                value={schedule.name}
                onChange={(e) => updateField("name", e.target.value)}
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
                placeholder="Outbound Calling Control"
              />
            </div>

            <div className="workflow-field">
              <label>Workflow Key</label>
<<<<<<< HEAD
              <input type="text" value={scheduleDoc.workflowKey} disabled />
=======
              <input type="text" value={schedule.workflowKey} disabled />
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
            </div>

            <div className="workflow-field">
              <label>Timezone</label>
              <select
<<<<<<< HEAD
                value={scheduleDoc.timezone}
                onChange={(e) => updateRootField("timezone", e.target.value)}
=======
                value={schedule.timezone}
                onChange={(e) => updateField("timezone", e.target.value)}
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div className="workflow-field workflow-field-full">
              <label>Status</label>
              <div className="workflow-toggle-row">
                <button
                  type="button"
<<<<<<< HEAD
                  className={`workflow-toggle ${scheduleDoc.enabled ? "is-on" : "is-off"}`}
                  onClick={() => updateRootField("enabled", !scheduleDoc.enabled)}
=======
                  className={`workflow-toggle ${schedule.enabled ? "is-on" : "is-off"}`}
                  onClick={() => updateField("enabled", !schedule.enabled)}
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
                >
                  <span className="workflow-toggle-knob" />
                </button>
                <span className="workflow-toggle-label">
<<<<<<< HEAD
                  {scheduleDoc.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
=======
                  {schedule.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>

            <div className="workflow-field workflow-field-full">
              <label>Active Days</label>
              <div className="workflow-day-list">
                {DAY_OPTIONS.map((day) => {
                  const active = schedule.daysOfWeek.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      className={`workflow-day-chip ${active ? "active" : ""}`}
                      onClick={() => toggleDay(day.value)}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
              <div className="workflow-help-text">{selectedDaysLabel}</div>
            </div>
          </div>
        </div>

        <div className="workflow-card">
          <div className="workflow-card-header">
            <h2>Live Eligibility</h2>
          </div>

          <div className="workflow-status-panel">
            <div className={`workflow-status-badge ${eligibility?.allowed ? "ok" : "no"}`}>
              {eligibility?.allowed ? "Allowed to Run" : "Not Allowed"}
            </div>

            <div className="workflow-status-list">
              <div className="workflow-status-item">
                <span>Reason</span>
                <strong>{eligibility?.reason || "—"}</strong>
              </div>

              <div className="workflow-status-item">
                <span>Timezone</span>
                <strong>{eligibility?.timezone || schedule.timezone || "—"}</strong>
              </div>

              <div className="workflow-status-item">
                <span>Local Date</span>
                <strong>{eligibility?.localDate || "—"}</strong>
              </div>

              <div className="workflow-status-item">
                <span>Current Local Time</span>
                <strong>{eligibility?.timezoneNow || "—"}</strong>
              </div>

              <div className="workflow-status-item">
                <span>Already Processed</span>
                <strong>{eligibility?.alreadyProcessed ?? "—"}</strong>
              </div>

              <div className="workflow-status-item">
                <span>Remaining Records</span>
                <strong>{eligibility?.remainingRecords ?? "—"}</strong>
              </div>

              <div className="workflow-status-item">
                <span>Window Max</span>
                <strong>{eligibility?.maxRecords ?? "—"}</strong>
              </div>
            </div>

            {eligibility?.activeWindow ? (
              <div className="workflow-active-window">
                <div className="workflow-active-window-title">Active Window</div>
                <div className="workflow-active-window-grid">
                  <div>
                    <span>ID</span>
                    <strong>{eligibility.activeWindow.id}</strong>
                  </div>
                  <div>
                    <span>Start</span>
                    <strong>{eligibility.activeWindow.startTime}</strong>
                  </div>
                  <div>
                    <span>End</span>
                    <strong>{eligibility.activeWindow.endTime}</strong>
                  </div>
                  <div>
                    <span>Max Records</span>
                    <strong>{eligibility.activeWindow.maxRecords}</strong>
                  </div>
                  <div>
                    <span>Every</span>
                    <strong>{eligibility.activeWindow.executionEveryMinutes} min</strong>
                  </div>
                </div>
              </div>
            ) : null}
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
          </div>
        </div>
      </div>

      <div className="workflow-card">
        <div className="workflow-card-header workflow-card-header-space">
          <div>
<<<<<<< HEAD
            <h2>Schedulers</h2>
            <p className="workflow-card-subtext">
              {scheduleCountLabel}. Each block can have its own days and time range.
=======
            <h2>Execution Windows</h2>
            <p className="workflow-card-subtext">
              Each window defines when the workflow can run and the total quota for that time range.
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
            </p>
          </div>

          <button
            className="workflow-btn workflow-btn-secondary"
            type="button"
<<<<<<< HEAD
            onClick={addSchedule}
          >
            Add Scheduler
          </button>
        </div>

        {!scheduleDoc.schedules.length ? (
          <div className="workflow-empty">
            No schedulers added yet. Click <strong>Add Scheduler</strong> to create one.
          </div>
        ) : (
          <div className="workflow-window-list">
            {scheduleDoc.schedules.map((item, index) => (
              <div key={item.id} className="workflow-window-card">
                <div className="workflow-window-top">
                  <div>
                    <div className="workflow-window-title">
                      Scheduler {index + 1}
                    </div>
                    <div className="workflow-window-id">{item.id}</div>
=======
            onClick={addWindow}
          >
            Add Window
          </button>
        </div>

        {!schedule.windows.length ? (
          <div className="workflow-empty">
            No windows added yet. Create at least one time window before enabling the workflow.
          </div>
        ) : (
          <div className="workflow-window-list">
            {schedule.windows.map((win, index) => (
              <div key={win.id} className="workflow-window-card">
                <div className="workflow-window-top">
                  <div>
                    <div className="workflow-window-title">Window {index + 1}</div>
                    <div className="workflow-window-id">{win.id}</div>
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
                  </div>

                  <button
                    type="button"
                    className="workflow-delete-btn"
<<<<<<< HEAD
                    onClick={() => removeSchedule(item.id)}
=======
                    onClick={() => removeWindow(win.id)}
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
                  >
                    Remove
                  </button>
                </div>

<<<<<<< HEAD
                <div className="workflow-form-grid">
                  <div className="workflow-field workflow-field-full">
                    <label>Schedule Name</label>
                    <input
                      type="text"
                      value={item.scheduleName}
                      onChange={(e) =>
                        updateSchedule(item.id, "scheduleName", e.target.value)
                      }
                      placeholder="Morning Shift"
                    />
                  </div>

                  <div className="workflow-field workflow-field-full">
                    <label>Days to be Applied</label>
                    <div className="workflow-day-list">
                      {DAY_OPTIONS.map((day) => {
                        const active = item.daysOfWeek.includes(day.value);

                        return (
                          <button
                            key={`${item.id}_${day.value}`}
                            type="button"
                            className={`workflow-day-chip ${active ? "active" : ""}`}
                            onClick={() => toggleScheduleDay(item.id, day.value)}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="workflow-help-text">
                      {getDaysLabel(item.daysOfWeek)}
                    </div>
                  </div>

=======
                <div className="workflow-window-grid">
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
                  <div className="workflow-field">
                    <label>Start Time</label>
                    <input
                      type="time"
<<<<<<< HEAD
                      value={item.startTime}
                      onChange={(e) =>
                        updateSchedule(item.id, "startTime", e.target.value)
                      }
=======
                      value={win.startTime}
                      onChange={(e) => updateWindow(win.id, "startTime", e.target.value)}
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
                    />
                  </div>

                  <div className="workflow-field">
                    <label>End Time</label>
                    <input
                      type="time"
<<<<<<< HEAD
                      value={item.endTime}
                      onChange={(e) =>
                        updateSchedule(item.id, "endTime", e.target.value)
=======
                      value={win.endTime}
                      onChange={(e) => updateWindow(win.id, "endTime", e.target.value)}
                    />
                  </div>

                  <div className="workflow-field">
                    <label>Max Records</label>
                    <input
                      type="number"
                      min="1"
                      value={win.maxRecords}
                      onChange={(e) => updateWindow(win.id, "maxRecords", e.target.value)}
                    />
                  </div>

                  <div className="workflow-field">
                    <label>Run Every (Minutes)</label>
                    <input
                      type="number"
                      min="1"
                      value={win.executionEveryMinutes}
                      onChange={(e) =>
                        updateWindow(win.id, "executionEveryMinutes", e.target.value)
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}