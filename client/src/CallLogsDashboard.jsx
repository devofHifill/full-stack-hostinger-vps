import { useEffect, useState } from "react";
import "./CallLogsDashboard.css";

export default function CallLogsDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCalls() {
      try {
        const res = await fetch("http://76.13.242.148:4000/api/calls");

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        const mapped = data.map((call) => ({
          id: call.callId,
          assistant: "Imani (Outbound)",
          assistantPhone: "-",
          customerPhone: call.customer?.phone || "-",
          type: call.direction === "outbound" ? "Outbound" : "Inbound",
          reason: call.endedReason || "-",
          success:
            call.normalizedOutcome === "completed"
              ? "Success"
              : call.normalizedOutcome === "failed"
                ? "Fail"
                : call.normalizedOutcome === "no-answer"
                  ? "No Answer"
                  : "-",
          start: call.startedAt
            ? new Date(call.startedAt).toLocaleString()
            : "N/A",
          duration: call.durationSeconds
            ? `${call.durationSeconds}s`
            : "-",
        }));

        setRows(mapped);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);   // 🔥 THIS WAS MISSING
      }
    }

    fetchCalls();
  }, []);
  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">LOGO</div>

        <div className="org">it@sebmtg.com's Org</div>

        <div className="search">
          <input placeholder="Search" />
        </div>

        <nav>
          <div className="nav-item active">Call Logs</div>
          <div className="nav-item">Chat Logs</div>
          <div className="nav-item">Session Logs</div>
          <div className="nav-item">Structured Outputs</div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main">
        <div className="header">
          <div>
            <h1>Call Logs</h1>
            <p>View and manage call logs for your account.</p>
          </div>
        </div>

        <div className="demo-banner">
          Demo Page: This dashboard is connected to live backend data.
          Final features and metrics may change.
        </div>

        <div className="filters">
          <button className="filter-btn">
            ☰ All Calls <span>{rows.length}</span>
          </button>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>CALL ID</th>
                  <th>ASSISTANT / SQUAD</th>
                  <th>ASSISTANT PHONE</th>
                  <th>CUSTOMER PHONE</th>
                  <th>TYPE</th>
                  <th>ENDED REASON</th>
                  <th>SUCCESS</th>
                  <th>START TIME</th>
                  <th>DURATION</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td className="call-id">{row.id}</td>
                    <td>{row.assistant}</td>
                    <td>{row.assistantPhone}</td>
                    <td>{row.customerPhone}</td>
                    <td>
                      <span className="badge outbound">
                        ☎ {row.type}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge reason ${getReasonClass(
                          row.reason
                        )}`}
                      >
                        {row.reason}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${row.success === "Fail" ? "fail" : ""
                          }`}
                      >
                        {row.success}
                      </span>
                    </td>
                    <td>{row.start}</td>
                    <td>{row.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

function getReasonClass(reason) {
  if (!reason) return "";
  if (reason.includes("voicemail")) return "voicemail";
  if (reason.includes("Failed")) return "failed";
  if (reason.includes("Ended")) return "ended";
  if (reason.includes("silence")) return "voicemail";
  return "";
}