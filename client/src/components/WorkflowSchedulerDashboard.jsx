import { useEffect, useMemo, useState } from "react";
import "./styles/WorkflowSchedulerDashboard.css";
import { useApiClient } from "../hooks/useApiClient";


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
    workflowKey: WORKFLOW_KEY,
    name: "Outbound Calling Control",
    enabled: false,
    timezone: "America/New_York",
    schedules: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const { requestJson } = useApiClient();

  async function loadSchedule() {
    try {
      setLoading(true);
      setFetchError("");

      const data = await requestJson(
        `/workflow-schedules/${WORKFLOW_KEY}`,
        {
          method: "GET",
        }
      );

      setScheduleDoc({
        workflowKey: data.workflowKey || WORKFLOW_KEY,
        name: data.name || "Outbound Calling Control",
        enabled: Boolean(data.enabled),
        timezone: data.timezone || "America/New_York",
        schedules: Array.isArray(data.schedules)
          ? sortSchedulesByTime(data.schedules)
          : [],
      });
    } catch (error) {
      setFetchError(error.message || "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }

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
  }

  async function saveSchedule() {
    try {
      setSaving(true);
      setSaveError("");
      setSaveSuccess("");

      const payload = {
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
        workflowKey: data.workflowKey || WORKFLOW_KEY,
        name: data.name || "Outbound Calling Control",
        enabled: Boolean(data.enabled),
        timezone: data.timezone || "America/New_York",
        schedules: Array.isArray(data.schedules)
          ? sortSchedulesByTime(data.schedules)
          : [],
      });

      setSaveSuccess("Schedule saved successfully.");
    } catch (error) {
      setSaveError(error.message || "Failed to save schedule");
    } finally {
      setSaving(false);
    }
  }

  const scheduleCountLabel = useMemo(() => {
    const count = scheduleDoc.schedules.length;
    if (count === 0) return "No schedulers added";
    if (count === 1) return "1 scheduler configured";
    return `${count} schedulers configured`;
  }, [scheduleDoc.schedules.length]);

  if (loading) {
    return (
      <div className="workflow-page">
        <div className="workflow-card">
          <div className="workflow-loading">Loading scheduler settings...</div>
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
            Add multiple schedule blocks, assign days, and define start and end
            times. Overlapping schedules are blocked by backend validation.
          </p>
        </div>

        <div className="workflow-header-actions">
          <button
            className="workflow-btn workflow-btn-secondary"
            type="button"
            onClick={loadSchedule}
            disabled={loading || saving}
          >
            Refresh
          </button>

          <button
            className="workflow-btn workflow-btn-primary"
            type="button"
            onClick={saveSchedule}
            disabled={saving || loading}          >
            {saving ? "Saving..." : "Save Scheduler"}
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

      <div className="workflow-grid workflow-grid-single">
        <div className="workflow-card">
          <div className="workflow-card-header">
            <h2>General Settings</h2>
          </div>

          <div className="workflow-form-grid">
            <div className="workflow-field workflow-field-full">
              <label>Scheduler Name</label>
              <input
                type="text"
                value={scheduleDoc.name}
                onChange={(e) => updateRootField("name", e.target.value)}
                placeholder="Outbound Calling Control"
              />
            </div>

            <div className="workflow-field">
              <label>Workflow Key</label>
              <input type="text" value={scheduleDoc.workflowKey} disabled />
            </div>

            <div className="workflow-field">
              <label>Timezone</label>
              <select
                value={scheduleDoc.timezone}
                onChange={(e) => updateRootField("timezone", e.target.value)}
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
                  className={`workflow-toggle ${scheduleDoc.enabled ? "is-on" : "is-off"}`}
                  onClick={() => updateRootField("enabled", !scheduleDoc.enabled)}
                >
                  <span className="workflow-toggle-knob" />
                </button>
                <span className="workflow-toggle-label">
                  {scheduleDoc.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="workflow-card">
        <div className="workflow-card-header workflow-card-header-space">
          <div>
            <h2>Schedulers</h2>
            <p className="workflow-card-subtext">
              {scheduleCountLabel}. Each block can have its own days and time range.
            </p>
          </div>

          <button
            className="workflow-btn workflow-btn-secondary"
            type="button"
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
                  </div>

                  <button
                    type="button"
                    className="workflow-delete-btn"
                    onClick={() => removeSchedule(item.id)}
                  >
                    Remove
                  </button>
                </div>

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

                  <div className="workflow-field">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={item.startTime}
                      onChange={(e) =>
                        updateSchedule(item.id, "startTime", e.target.value)
                      }
                    />
                  </div>

                  <div className="workflow-field">
                    <label>End Time</label>
                    <input
                      type="time"
                      value={item.endTime}
                      onChange={(e) =>
                        updateSchedule(item.id, "endTime", e.target.value)
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