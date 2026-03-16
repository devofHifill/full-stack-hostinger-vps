import React from "react";
import "./ChatMetricsOverview.css";

function StatCard({ title, value, subtext }) {
  return (
    <div className="chat-stat-card">
      <div className="chat-stat-label">{title}</div>
      <div className="chat-stat-value">{value}</div>
      <div className="chat-stat-sub">{subtext}</div>
    </div>
  );
}

export default function ChatMetricsOverview({
  dateRangeLabel = "02/16/2026 - 03/16/2026",
  groupedBy = "Days",
  assistantFilterLabel = "All Assistants",
  onRefresh,
}) {
  const chatMetrics = {
    totalSessions: 1284,
    totalMessages: 5420,
    avgMessages: 4.2,
    engagedRate: 63.1,
    containment: 91.4,
    users: 421,
  };

  const intents = [
    { intent: "Refinance Inquiry", count: 302 },
    { intent: "Purchase Inquiry", count: 261 },
    { intent: "Loan Status", count: 184 },
    { intent: "General Questions", count: 132 },
    { intent: "Support", count: 98 },
  ];

  return (
    <div className="chat-metrics-page">
      <div className="chat-topbar">
        <div>
          <h1>Chat Metrics</h1>
          <p>Operational overview for AI chat performance.</p>
        </div>

        <div className="chat-topbar-controls">
          <div className="chat-filter-chip">{dateRangeLabel}</div>
          <div className="chat-filter-chip">
            grouped by <strong>{groupedBy}</strong>
          </div>
          <div className="chat-filter-chip">{assistantFilterLabel}</div>

          <button className="chat-btn chat-btn-secondary" onClick={onRefresh}>
            Refresh
          </button>
        </div>
      </div>

      <div className="chat-stat-grid">
        <StatCard
          title="Total Sessions"
          value={chatMetrics.totalSessions}
          subtext="Total conversations"
        />

        <StatCard
          title="Total Messages"
          value={chatMetrics.totalMessages}
          subtext="Messages exchanged"
        />

        <StatCard
          title="Avg Messages / Session"
          value={chatMetrics.avgMessages}
          subtext="Conversation depth"
        />

        <StatCard
          title="Engaged Session Rate"
          value={`${chatMetrics.engagedRate}%`}
          subtext="User engagement"
        />

        <StatCard
          title="Session Containment"
          value={`${chatMetrics.containment}%`}
          subtext="Resolved without human"
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
              {intents.map((item, index) => (
                <tr key={item.intent}>
                  <td>{index + 1}</td>
                  <td>{item.intent}</td>
                  <td>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}