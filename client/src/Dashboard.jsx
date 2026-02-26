import { useEffect, useState } from "react";
import "./Dashboard.css";

function KpiCard({ title, value }) {
  return (
    <div className="kpi">
      <div className="kpi__title">{title}</div>
      <div className="kpi__value">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const base = import.meta.env.VITE_API_URL;

    if (!base) {
      setError("VITE_API_URL not defined");
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);

        const statsRes = await fetch(`${base}/api/calls/stats`);
        if (!statsRes.ok) throw new Error("Failed to fetch stats");
        const statsData = await statsRes.json();

        const callsRes = await fetch(`${base}/api/calls`);
        if (!callsRes.ok) throw new Error("Failed to fetch calls");
        const callsData = await callsRes.json();

        setStats(statsData);
        setCalls(callsData);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="dashboard">
      <h1>SEBVM Dashboard</h1>

      <div className="demo-banner">
        Demo Page: This dashboard is connected to live backend data.
        Final metrics and layout may change.
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <>
          {/* KPI Section */}
          <div className="kpi-grid">
            <KpiCard
              title="Total Calls"
              value={stats?.totalCalls || 0}
            />
            <KpiCard
              title="Completed"
              value={stats?.completed || 0}
            />
            <KpiCard
              title="No Answer"
              value={stats?.noAnswer || 0}
            />
            <KpiCard
              title="Failed"
              value={stats?.failed || 0}
            />
            <KpiCard
              title="Avg Duration (sec)"
              value={Math.round(stats?.avgDuration || 0)}
            />
            <KpiCard
              title="Total Cost"
              value={`$${(stats?.totalCost || 0).toFixed(2)}`}
            />
          </div>

          {/* Calls Table */}
          <div className="calls-section">
            <h2>Recent Calls</h2>

            {calls.length === 0 ? (
              <p>No calls found.</p>
            ) : (
              <table className="calls-table">
                <thead>
                  <tr>
                    <th>Call ID</th>
                    <th>Customer</th>
                    <th>Direction</th>
                    <th>Outcome</th>
                    <th>Duration</th>
                    <th>Cost</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {calls.map((call) => (
                    <tr key={call._id}>
                      <td>{call.callId}</td>
                      <td>{call.customer?.name || "-"}</td>
                      <td>{call.direction}</td>
                      <td>{call.normalizedOutcome}</td>
                      <td>{call.durationSeconds}s</td>
                      <td>${call.cost}</td>
                      <td>
                        {call.startedAt
                          ? new Date(call.startedAt).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}