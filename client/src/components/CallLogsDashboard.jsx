import { useEffect, useState } from "react";
import "./CallLogsDashboard.css";
import ChatLogsDashboard from "./ChatLogsDashboard";
import CallDetailsModal from "./CallDetailsModal";

export default function CallLogsDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("calls");
  const [selectedCallId, setSelectedCallId] = useState(null);

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
        setLoading(false);
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
          <div
            className={`nav-item ${view === "calls" ? "active" : ""}`}
            onClick={() => setView("calls")}
          >
            Call Logs
          </div>

          <div
            className={`nav-item ${view === "chat" ? "active" : ""}`}
            onClick={() => setView("chat")}
          >
            Chat Logs
          </div>

          <div className="nav-item">File Upload</div>
          <div className="nav-item">Structured Outputs</div>
        </nav>
      </aside>

      {/* Main */}
      <main className="main">

        {/* CALL LOGS */}
        {view === "calls" && (
          <>
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
                    {rows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedCallId(row.id)}
                        style={{ cursor: "pointer" }}
                      >
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
                            className={`badge reason ${getReasonClass(row.reason)}`}
                          >
                            {row.reason}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`badge ${row.success === "Fail" ? "fail" : ""}`}
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
          </>
        )}

        {/* CHAT LOGS */}
        {view === "chat" && (
          <ChatLogsDashboard />
        )}

        {/* MODAL */}
        {selectedCallId && (
          <CallDetailsModal
            callId={selectedCallId}
            onClose={() => setSelectedCallId(null)}
          />
        )}

      </main>
    </div>
  );
}

function getReasonClass(reason) {
  if (!reason) return "";

  const r = reason.toLowerCase();

  if (r.includes("voicemail")) return "voicemail";
  if (r.includes("failed")) return "failed";
  if (r.includes("ended")) return "ended";
  if (r.includes("silence")) return "voicemail";

  return "";
}