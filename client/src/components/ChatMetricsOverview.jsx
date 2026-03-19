import React, { useEffect, useState } from "react";
import "./ChatMetricsOverview.css";
import DateFilter from "./DateFilter";
import { buildDateFilterParams } from "../utils/dateFilterParams";

function StatCard({ title, value, subtext }) {
  return (
    <div className="chat-stat-card">
      <div className="chat-stat-label">{title}</div>
      <div className="chat-stat-value">{value}</div>
      <div className="chat-stat-sub">{subtext}</div>
    </div>
  );
}

export default function ChatMetricsOverview() {
  const [chatMetrics, setChatMetrics] = useState({
    totalSessions: 0,
    totalMessages: 0,
    avgMessages: 0,
    engagedRate: 0,
    containment: 0,
    users: 0,
  });

  const [meta, setMeta] = useState({
    dateRangeLabel: "All Time",
    groupedBy: "Days",
    sourceFilterLabel: "All Sources",
    lastSyncedLabel: "Not synced yet",
  });

  const [intents, setIntents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchChatMetrics() {
      try {
        setLoading(true);
        setError("");
        setFilterError("");

        if (dateFilter === "custom") {
          if (!customStartDate || !customEndDate) {
            if (!ignore) setLoading(false);
            return;
          }

          if (customStartDate > customEndDate) {
            if (!ignore) {
              setFilterError("Start date cannot be after end date.");
              setLoading(false);
            }
            return;
          }
        }

        const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
        const params = buildDateFilterParams(
          dateFilter,
          customStartDate,
          customEndDate
        );

        const endpoint = `/api/chat-metrics${
          params.toString() ? `?${params.toString()}` : ""
        }`;
        const url = apiBase ? `${apiBase}${endpoint}` : endpoint;

        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!ignore) {
          setChatMetrics({
            totalSessions: data.metrics?.totalSessions ?? 0,
            totalMessages: data.metrics?.totalMessages ?? 0,
            avgMessages: data.metrics?.avgMessages ?? 0,
            engagedRate: data.metrics?.engagedRate ?? 0,
            containment: data.metrics?.containment ?? 0,
            users: data.metrics?.users ?? 0,
          });

          setIntents(Array.isArray(data.intents) ? data.intents : []);

          setMeta({
            dateRangeLabel: data.meta?.dateRangeLabel || "All Time",
            groupedBy: data.meta?.groupedBy || "Days",
            sourceFilterLabel: data.meta?.sourceFilterLabel || "All Sources",
            lastSyncedLabel: data.meta?.lastSyncedLabel || "Not synced yet",
          });
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load chat metrics:", err);
          setError("Unable to load chat metrics.");
          setChatMetrics({
            totalSessions: 0,
            totalMessages: 0,
            avgMessages: 0,
            engagedRate: 0,
            containment: 0,
            users: 0,
          });
          setIntents([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchChatMetrics();

    return () => {
      ignore = true;
    };
  }, [refreshTick, dateFilter, customStartDate, customEndDate]);

  if (loading) {
    return (
      <div className="chat-metrics-page">
        <div className="chat-panel">
          <p>Loading chat metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-metrics-page">
        <div className="chat-panel">
          <p>{error}</p>
          <button
            className="chat-refresh-btn"
            onClick={() => setRefreshTick((v) => v + 1)}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-metrics-page">
      <div className="metrics-topbar">
        <div>
          <h2>Chat Metrics Overview</h2>
          <p>Live data from MongoDB</p>
        </div>

        <div className="metrics-topbar-controls">
          <DateFilter
            value={dateFilter}
            onChange={setDateFilter}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
            onCustomStartDateChange={setCustomStartDate}
            onCustomEndDateChange={setCustomEndDate}
          />

          {filterError ? (
            <div className="metrics-inline-error">{filterError}</div>
          ) : null}

          <div className="metrics-filter-chip">
            {meta.dateRangeLabel || "All Time"}
          </div>
          <div className="metrics-filter-chip">
            grouped by <strong>{meta.groupedBy || "Days"}</strong>
          </div>
          <div className="metrics-filter-chip">
            {meta.sourceFilterLabel || "All Sources"}
          </div>

          <button
            className="chat-refresh-btn"
            onClick={() => setRefreshTick((v) => v + 1)}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="metrics-sync-row">
        {meta.lastSyncedLabel || "Not synced yet"}
      </div>

      <div className="chat-stats-grid">
        <StatCard
          title="Total Sessions"
          value={chatMetrics.totalSessions}
          subtext="Chat sessions recorded"
        />
        <StatCard
          title="Total Messages"
          value={chatMetrics.totalMessages}
          subtext="Messages stored in database"
        />
        <StatCard
          title="Avg Messages"
          value={chatMetrics.avgMessages}
          subtext="Average per session"
        />
        <StatCard
          title="Engaged Rate"
          value={`${chatMetrics.engagedRate}%`}
          subtext="Sessions considered engaged"
        />
        <StatCard
          title="Containment"
          value={`${chatMetrics.containment}%`}
          subtext="Not implemented yet"
        />
        <StatCard
          title="Unique Users"
          value={chatMetrics.users}
          subtext="Distinct visitors"
        />
      </div>

      <div className="chat-panel">
        <div className="chat-panel-header">
          <h3>Intent Breakdown</h3>
        </div>

        <div className="chat-table-wrap">
          <table className="chat-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Intent</th>
                <th># Sessions</th>
              </tr>
            </thead>
            <tbody>
              {intents.length > 0 ? (
                intents.map((item, index) => (
                  <tr key={`${item.intent}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{item.intent}</td>
                    <td>{item.count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No intent data available yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}