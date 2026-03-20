import React, { useEffect, useMemo, useState } from "react";
import "./WorkflowSchedulerDashboard.css";

const API_BASE = import.meta.env.VITE_API_URL || "";

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
    workflowKey: WORKFLOW_KEY,
    name: "Outbound Calling Control",
    enabled: false,
    timezone: "America/New_York",
    daysOfWeek: [1, 2, 3, 4, 5],
    windows: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [eligibility, setEligibility] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  async function loadSchedule() {
    try {
      setLoading(true);
      setFetchError("");

      const res = await fetch(
        `${API_BASE}/api/workflow-schedules/${WORKFLOW_KEY}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load schedule");
      }

      setSchedule({
        workflowKey: data.workflowKey || WORKFLOW_KEY,
        name: data.name || "Outbound Calling Control",
        enabled: Boolean(data.enabled),
        timezone: data.timezone || "America/New_York",
        daysOfWeek: Array.isArray(data.daysOfWeek) ? data.daysOfWeek : [1, 2, 3, 4, 5],
        windows: Array.isArray(data.windows) ? sortWindowsByTime(data.windows) : [],
      });
    } catch (error) {
      setFetchError(error.message || "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }

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
  }

  async function saveSchedule() {
    try {
      setSaving(true);
      setSaveError("");
      setSaveSuccess("");

      const payload = {
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
        workflowKey: data.workflowKey || WORKFLOW_KEY,
        name: data.name || "Outbound Calling Control",
        enabled: Boolean(data.enabled),
        timezone: data.timezone || "America/New_York",
        daysOfWeek: Array.isArray(data.daysOfWeek) ? data.daysOfWeek : [1, 2, 3, 4, 5],
        windows: Array.isArray(data.windows) ? sortWindowsByTime(data.windows) : [],
      });

      setSaveSuccess("Schedule saved successfully.");
      loadEligibility();
    } catch (error) {
      setSaveError(error.message || "Failed to save schedule");
    } finally {
      setSaving(false);
    }
  }

  const selectedDaysLabel = useMemo(() => {
    if (!schedule.daysOfWeek.length) return "No days selected";
    return DAY_OPTIONS.filter((d) => schedule.daysOfWeek.includes(d.value))
      .map((d) => d.label)
      .join(", ");
  }, [schedule.daysOfWeek]);

  if (loading) {
    return (
      <div className="workflow-page">
        <div className="workflow-card">
          <div className="workflow-loading">Loading workflow scheduler...</div>
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
            Control when n8n is allowed to run and how many records it can process per window.
          </p>
        </div>

        <div className="workflow-header-actions">
          <button
            className="workflow-btn workflow-btn-secondary"
            type="button"
            onClick={loadEligibility}
            disabled={checkingEligibility}
          >
            {checkingEligibility ? "Checking..." : "Refresh Status"}
          </button>

          <button
            className="workflow-btn workflow-btn-primary"
            type="button"
            onClick={saveSchedule}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Schedule"}
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

      <div className="workflow-grid">
        <div className="workflow-card">
          <div className="workflow-card-header">
            <h2>Workflow Settings</h2>
          </div>

          <div className="workflow-form-grid">
            <div className="workflow-field workflow-field-full">
              <label>Workflow Name</label>
              <input
                type="text"
                value={schedule.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Outbound Calling Control"
              />
            </div>

            <div className="workflow-field">
              <label>Workflow Key</label>
              <input type="text" value={schedule.workflowKey} disabled />
            </div>

            <div className="workflow-field">
              <label>Timezone</label>
              <select
                value={schedule.timezone}
                onChange={(e) => updateField("timezone", e.target.value)}
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
                  className={`workflow-toggle ${schedule.enabled ? "is-on" : "is-off"}`}
                  onClick={() => updateField("enabled", !schedule.enabled)}
                >
                  <span className="workflow-toggle-knob" />
                </button>
                <span className="workflow-toggle-label">
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
          </div>
        </div>
      </div>

      <div className="workflow-card">
        <div className="workflow-card-header workflow-card-header-space">
          <div>
            <h2>Execution Windows</h2>
            <p className="workflow-card-subtext">
              Each window defines when the workflow can run and the total quota for that time range.
            </p>
          </div>

          <button
            className="workflow-btn workflow-btn-secondary"
            type="button"
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
                  </div>

                  <button
                    type="button"
                    className="workflow-delete-btn"
                    onClick={() => removeWindow(win.id)}
                  >
                    Remove
                  </button>
                </div>

                <div className="workflow-window-grid">
                  <div className="workflow-field">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={win.startTime}
                      onChange={(e) => updateWindow(win.id, "startTime", e.target.value)}
                    />
                  </div>

                  <div className="workflow-field">
                    <label>End Time</label>
                    <input
                      type="time"
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