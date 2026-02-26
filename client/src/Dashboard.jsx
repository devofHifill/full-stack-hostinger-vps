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
  const base = import.meta.env.VITE_API_URL;

  const [stats, setStats] = useState(null);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!base) {
      setError("VITE_API_URL is not defined");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const [statsRes, callsRes] = await Promise.all([
          fetch(`${base}/api/calls/stats`),
          fetch(`${base}/api/calls`)
        ]);

        if (!statsRes.ok) throw new Error("Failed to fetch stats");
        if (!callsRes.ok) throw new Error("Failed to fetch calls");

        const statsData = await statsRes.json();
        const callsData = await callsRes.json();

        setStats(statsData);
        setCalls(callsData);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [base]);

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1>SEBVM – Call Monitoring Dashboard</h1>
        <div className="demo-banner">
          Demo page: This dashboard reflects live backend data. Final metrics,
          layout and advanced analytics may evolve.
        </div>
      </header>

      {loading && <p>Loading live data...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {!loading && !error && (
        <>
          {/* KPI SECTION */}
          <div className="kpi-grid">
            <KpiCard
              title="Total Calls"
              value={stats?.totalCalls ?? 0}
            />
            <KpiCard
              title="Connected Calls"
              value={stats?.connectedCalls ?? 0}
            />
            <KpiCard
              title="Missed Calls"
              value={stats?.missedCalls ?? 0}
            />
            <KpiCard
              title="Avg Duration (sec)"
              value={stats?.avgDuration ?? 0}
            />
          </div>

          {/* CALLS TABLE */}
          <div className="panel">
            <h2>Recent Calls</h2>

            <table className="calls-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Caller</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {calls.length === 0 ? (
                  <tr>
                    <td colSpan="4">No call records found</td>
                  </tr>
                ) : (
                  calls.map((call) => (
                    <tr key={call._id}>
                      <td>
                        {call.createdAt
                          ? new Date(call.createdAt).toLocaleString()
                          : "-"}
                      </td>
                      <td>{call.caller || "-"}</td>
                      <td>{call.duration ? `${call.duration}s` : "0s"}</td>
                      <td>{call.status || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}