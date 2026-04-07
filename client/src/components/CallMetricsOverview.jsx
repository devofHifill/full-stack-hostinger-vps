import React, { useEffect, useMemo, useState } from "react";
<<<<<<< HEAD
import "./styles/CallMetricsOverview.css";
import DateFilter from "./DateFilter";
import { buildDateFilterParams } from "../utils/dateFilterParams";
import { useApiClient } from "../hooks/useApiClient";
=======
import "./CallMetricsOverview.css";
import DateFilter from "./DateFilter";
import { buildDateFilterParams } from "../utils/dateFilterParams";
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function formatDuration(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds || 0)));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatMinutes(value) {
  return Number(value || 0).toFixed(2);
}

function StatCard({ title, value, subtext, tone = "default" }) {
  return (
    <div className={`metrics-stat-card metrics-tone-${tone}`}>
      <div className="metrics-stat-label">{title}</div>
      <div className="metrics-stat-value">{value}</div>
      {subtext ? <div className="metrics-stat-subtext">{subtext}</div> : null}
    </div>
  );
}

function SummaryListCard({ title, items, footer }) {
  return (
    <section className="metrics-panel">
      <div className="metrics-panel-header">
        <h3>{title}</h3>
      </div>

      <div className="metrics-summary-list">
        {items.length === 0 ? (
          <div className="metrics-note-box">
            No data available for the selected range.
          </div>
        ) : (
          items.map((item, index) => (
            <div className="metrics-summary-row" key={`${item.label}-${index}`}>
              <div className="metrics-summary-left">
                <span className={`metrics-dot ${item.dotClass || ""}`} />
                <span className="metrics-summary-label">{item.label}</span>
              </div>

              <div className="metrics-summary-right">
                <strong>{item.value}</strong>
                {item.meta ? <span>{item.meta}</span> : null}
              </div>
            </div>
          ))
        )}
      </div>

      {footer ? <div className="metrics-panel-footer">{footer}</div> : null}
    </section>
  );
}

const emptyPayload = {
  metrics: {
    totalCallMinutes: 0,
    totalCalls: 0,
    totalSpent: 0,
    avgCostPerCall: 0,
    avgDurationSeconds: 0,
    successRate: 0,
  },
  assistantRows: [],
  endedReasons: [],
  successBreakdown: {
    true: 0,
    false: 0,
    unknown: 0,
  },
  meta: {
    dateRangeLabel: "All Time",
    groupedBy: "Days",
    assistantFilterLabel: "All Assistants",
    lastSyncedLabel: "Not synced yet",
  },
};

export default function CallMetricsOverview() {
  const [payload, setPayload] = useState(emptyPayload);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

<<<<<<< HEAD
  const { requestJson } = useApiClient();
  // const { logout } = useAuth();

=======
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
  useEffect(() => {
    let ignore = false;

    async function loadMetrics() {
      try {
        setLoading(true);
        setError("");
        setFilterError("");

        if (dateFilter === "custom") {
          if (!customStartDate || !customEndDate) {
            if (!ignore) {
              setLoading(false);
            }
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

<<<<<<< HEAD
=======
        const baseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
        const params = buildDateFilterParams(
          dateFilter,
          customStartDate,
          customEndDate
        );

<<<<<<< HEAD
        const query = params.toString()
          ? `/call-metrics?${params.toString()}`
          : "/call-metrics";

        const data = await requestJson(query);
=======
        const endpoint = `/api/call-metrics${
          params.toString() ? `?${params.toString()}` : ""
        }`;
        const url = baseUrl ? `${baseUrl}${endpoint}` : endpoint;

        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de

        if (!ignore) {
          setPayload({
            metrics: data.metrics || emptyPayload.metrics,
            assistantRows: data.assistantRows || [],
            endedReasons: data.endedReasons || [],
            successBreakdown:
              data.successBreakdown || emptyPayload.successBreakdown,
            meta: data.meta || emptyPayload.meta,
          });
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load call metrics:", err);
          setError(err.message || "Failed to load metrics");
          setPayload(emptyPayload);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadMetrics();

    return () => {
      ignore = true;
    };
  }, [refreshTick, dateFilter, customStartDate, customEndDate]);

  const { metrics, assistantRows, endedReasons, successBreakdown, meta } =
    payload;
  const totalCalls = Number(metrics.totalCalls || 0);

  const topEndedReasons = useMemo(() => {
    return [...endedReasons]
      .sort((a, b) => Number(b.calls || 0) - Number(a.calls || 0))
      .slice(0, 4)
      .map((item) => ({
        label: item.reason || "Unknown",
        value: item.calls || 0,
        meta: totalCalls
          ? `${((Number(item.calls || 0) / totalCalls) * 100).toFixed(1)}%`
          : "0.0%",
        dotClass: `metrics-dot-${item.tone || "default"}`,
      }));
  }, [endedReasons, totalCalls]);

  const assistantSummaryItems = useMemo(() => {
    return assistantRows.map((row) => ({
      label: row.assistant || "Unknown",
      value: `${Number(row.calls || 0)} calls`,
      meta: `${formatDuration(row.avgDurationSeconds)} avg • ${formatPercent(
        row.successRate
      )} success`,
      dotClass: `metrics-dot-${row.tone || "default"}`,
    }));
  }, [assistantRows]);

  const qualityFlags = useMemo(() => {
    const flags = [];

    const silence =
      endedReasons.find((x) => x.reason === "silence-timed-out")?.calls || 0;
    const voicemail =
      endedReasons.find((x) => x.reason === "voicemail")?.calls || 0;
    const outbound = assistantRows.find((x) =>
      String(x.assistant || "").toLowerCase().includes("outbound")
    );
    const unknownSuccess = Number(successBreakdown.unknown || 0);

    if (silence / Math.max(totalCalls, 1) > 0.15) {
      flags.push({
        label: "Silence timeout rate is high",
        value: totalCalls ? `${((silence / totalCalls) * 100).toFixed(1)}%` : "0.0%",
        meta: "Review silence recovery prompts",
        dotClass: "metrics-dot-amber",
      });
    }

    if (outbound && Number(outbound.successRate || 0) < 15) {
      flags.push({
        label: "Outbound success is below target",
        value: formatPercent(outbound.successRate),
        meta: "Investigate call opener and targeting",
        dotClass: "metrics-dot-red",
      });
    }

    if (voicemail / Math.max(totalCalls, 1) > 0.12) {
      flags.push({
        label: "Voicemail share is elevated",
        value: totalCalls
          ? `${((voicemail / totalCalls) * 100).toFixed(1)}%`
          : "0.0%",
        meta: "Consider retry-window strategy",
        dotClass: "metrics-dot-blue",
      });
    }

    if (unknownSuccess > 0) {
      flags.push({
        label: "Unknown success status present",
        value: String(unknownSuccess),
        meta: "Normalize evaluation values server-side",
        dotClass: "metrics-dot-purple",
      });
    }

    return flags.length
      ? flags
      : [
<<<<<<< HEAD
        {
          label: "No major quality flags detected",
          value: "Healthy",
          meta: "Current evaluation looks stable",
          dotClass: "metrics-dot-green",
        },
      ];
=======
          {
            label: "No major quality flags detected",
            value: "Healthy",
            meta: "Current evaluation looks stable",
            dotClass: "metrics-dot-green",
          },
        ];
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
  }, [assistantRows, endedReasons, successBreakdown, totalCalls]);

  const knownEvaluations =
    Number(successBreakdown.true || 0) + Number(successBreakdown.false || 0);

  const evaluationCoverage = totalCalls
    ? ((knownEvaluations / totalCalls) * 100).toFixed(1)
    : "0.0";

  if (loading) {
    return (
      <div className="metrics-page">
        <div className="metrics-panel">
          <div className="metrics-panel-header">
            <h3>Loading call analytics...</h3>
          </div>
          <div className="metrics-note-box">
            Fetching real call metrics from the database.
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="metrics-page">
        <div className="metrics-panel">
          <div className="metrics-panel-header">
            <h3>Unable to load call analytics</h3>
          </div>
          <div className="metrics-note-box">{error}</div>
          <button
            className="metrics-btn metrics-btn-secondary"
            onClick={() => setRefreshTick((v) => v + 1)}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="metrics-page">
      <div className="metrics-topbar">
        <div>
          <h1>Metrics</h1>
          <p>Operational overview for AI calling performance.</p>
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

          {/* <div className="metrics-filter-chip">
            {meta.dateRangeLabel || "All Time"}
          </div>
          <div className="metrics-filter-chip">
            grouped by <strong>{meta.groupedBy || "Days"}</strong>
          </div>
          <div className="metrics-filter-chip">
            {meta.assistantFilterLabel || "All Assistants"}
          </div> */}

          <button
            className="metrics-btn metrics-btn-secondary"
            onClick={() => setRefreshTick((v) => v + 1)}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="metrics-sync-row">
        {meta.lastSyncedLabel || "Not synced yet"}
      </div>

      <div className="metrics-stat-grid">
        <StatCard
          title="Total Call Minutes"
          value={formatMinutes(metrics.totalCallMinutes)}
          subtext="Combined conversation time"
          tone="green"
        />
        <StatCard
          title="Number of Calls"
          value={String(metrics.totalCalls || 0)}
          subtext="Inbound + outbound calls"
          tone="amber"
        />
        <StatCard
          title="Total Spent"
          value={formatCurrency(metrics.totalSpent)}
          subtext="Aggregate platform cost"
          tone="purple"
        />
        <StatCard
          title="Average Cost per Call"
          value={formatCurrency(metrics.avgCostPerCall)}
          subtext="Spend efficiency indicator"
          tone="blue"
        />
        <StatCard
          title="Average Call Duration"
          value={formatDuration(metrics.avgDurationSeconds)}
          subtext="Mean duration per call"
          tone="default"
        />
        <StatCard
          title="Success Rate"
          value={formatPercent(metrics.successRate)}
          subtext="Calls marked successful"
          tone="green"
        />
      </div>

      <div className="metrics-summary-grid">
        <SummaryListCard
          title="Call Outcome Summary"
          items={topEndedReasons}
          footer="Top termination reasons in the selected period"
        />

        <SummaryListCard
          title="Assistant Summary"
          items={assistantSummaryItems}
          footer="Compare average duration and success rate by assistant"
        />

        <SummaryListCard
          title="Quality Flags"
          items={qualityFlags}
          footer="Operational issues worth reviewing before deeper analysis"
        />
      </div>

      <div className="metrics-analysis-grid">
        <section className="metrics-panel">
          <div className="metrics-panel-header">
            <h3>Call Reason Breakdown</h3>
            <span className="metrics-panel-meta">Ranked by call volume</span>
          </div>

          <div className="metrics-table-wrap">
            <table className="metrics-table metrics-table-compact">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Ended Reason</th>
                  <th># of Calls</th>
                </tr>
              </thead>
              <tbody>
                {endedReasons.length === 0 ? (
                  <tr>
                    <td colSpan="3">No data available for the selected range.</td>
                  </tr>
                ) : (
                  [...endedReasons]
                    .sort((a, b) => Number(b.calls || 0) - Number(a.calls || 0))
                    .map((item, index) => (
                      <tr key={`${item.reason || "unknown"}-${index}`}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="metrics-assistant-cell">
                            <span
<<<<<<< HEAD
                              className={`metrics-dot metrics-dot-${item.tone || "default"
                                }`}
=======
                              className={`metrics-dot metrics-dot-${
                                item.tone || "default"
                              }`}
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
                            />
                            <span>{item.reason || "Unknown"}</span>
                          </div>
                        </td>
                        <td>{item.calls || 0}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="metrics-panel">
          <div className="metrics-panel-header">
            <h3>Success Evaluation</h3>
            <span className="metrics-panel-meta">Summary-first overview</span>
          </div>

          <div className="metrics-eval-stack">
            <div className="metrics-eval-card metrics-eval-card-success">
              <span className="metrics-dot metrics-dot-green" />
              <div>
                <div className="metrics-eval-label">Successful</div>
                <div className="metrics-eval-value">
                  {successBreakdown.true || 0}
                </div>
              </div>
            </div>

            <div className="metrics-eval-card metrics-eval-card-danger">
              <span className="metrics-dot metrics-dot-red" />
              <div>
                <div className="metrics-eval-label">Unsuccessful</div>
                <div className="metrics-eval-value">
                  {successBreakdown.false || 0}
                </div>
              </div>
            </div>

            <div className="metrics-eval-card metrics-eval-card-info">
              <span className="metrics-dot metrics-dot-blue" />
              <div>
                <div className="metrics-eval-label">Unknown</div>
                <div className="metrics-eval-value">
                  {successBreakdown.unknown || 0}
                </div>
              </div>
            </div>
          </div>

          <div className="metrics-mini-stat-grid">
            <div className="metrics-mini-stat">
              <span>Success Rate</span>
              <strong>{formatPercent(metrics.successRate)}</strong>
            </div>
            <div className="metrics-mini-stat">
              <span>Known Evaluation Coverage</span>
              <strong>{evaluationCoverage}%</strong>
            </div>
          </div>

          <div className="metrics-note-box">
            Unknown evaluation values should be normalized in backend processing so
            reporting remains consistent across assistants and call flows.
          </div>
        </section>
      </div>

      <div className="metrics-assistant-fullrow">
        <section className="metrics-panel">
          <div className="metrics-panel-header">
            <h3>Assistant Performance</h3>
            <span className="metrics-panel-meta">
              Detailed operational breakdown
            </span>
          </div>

          <div className="metrics-table-wrap">
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>Assistant</th>
                  <th>Calls</th>
                  <th>Minutes</th>
                  <th>Avg Duration</th>
                  <th>Spend</th>
                  <th>Avg Cost/Call</th>
                  <th>Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {assistantRows.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      No assistant data available for the selected range.
                    </td>
                  </tr>
                ) : (
                  assistantRows.map((row, index) => (
                    <tr key={`${row.assistant || "assistant"}-${index}`}>
                      <td>
                        <div className="metrics-assistant-cell">
                          <span
<<<<<<< HEAD
                            className={`metrics-dot metrics-dot-${row.tone || "default"
                              }`}
=======
                            className={`metrics-dot metrics-dot-${
                              row.tone || "default"
                            }`}
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
                          />
                          <span>{row.assistant || "Unknown"}</span>
                        </div>
                      </td>
                      <td>{row.calls || 0}</td>
                      <td>{formatMinutes(row.minutes)}</td>
                      <td>{formatDuration(row.avgDurationSeconds)}</td>
                      <td>{formatCurrency(row.spend)}</td>
                      <td>{formatCurrency(row.avgCostPerCall)}</td>
                      <td>
                        <span
<<<<<<< HEAD
                          className={`metrics-pill ${Number(row.successRate || 0) >= 20
                            ? "metrics-pill-success"
                            : Number(row.successRate || 0) >= 12
                              ? "metrics-pill-warning"
                              : "metrics-pill-danger"
                            }`}
=======
                          className={`metrics-pill ${
                            Number(row.successRate || 0) >= 20
                              ? "metrics-pill-success"
                              : Number(row.successRate || 0) >= 12
                              ? "metrics-pill-warning"
                              : "metrics-pill-danger"
                          }`}
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
                        >
                          {formatPercent(row.successRate)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}