import "./CallLogsDashboard.css";

const rows = [
  {
    id: "019c91e0...",
    assistant: "Imani (Outbound)",
    assistantPhone: "+1 (276) 398 6644",
    customerPhone: "+1 (757) 632 3237",
    type: "Outbound",
    reason: "Voicemail",
    success: "Fail",
    start: "25 Feb 2026, 04:29",
    duration: "21s",
  },
  {
    id: "019c91dd...",
    assistant: "Imani (Outbound)",
    assistantPhone: "+1 (276) 398 6644",
    customerPhone: "+1 (757) 630 6922",
    type: "Outbound",
    reason: "Twilio Connection Failed",
    success: "-",
    start: "N/A",
    duration: "-",
  },
  {
    id: "019c91da...",
    assistant: "Imani (Outbound)",
    assistantPhone: "+1 (276) 398 6644",
    customerPhone: "+1 (757) 630 4547",
    type: "Outbound",
    reason: "Customer Ended Call",
    success: "Fail",
    start: "25 Feb 2026, 04:22",
    duration: "9s",
  },
];

export default function CallLogsDashboard() {
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
          Demo Page: This dashboard is a UI prototype. Final features and metrics may change.
        </div>

        <div className="filters">
          <button className="filter-btn">
            ☰ All Calls <span>200</span>
          </button>
        </div>

        <div className="table-wrapper">
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
                    <span className={`badge reason ${getReasonClass(row.reason)}`}>
                      {row.reason}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${row.success === "Fail" ? "fail" : ""}`}>
                      {row.success}
                    </span>
                  </td>
                  <td>{row.start}</td>
                  <td>{row.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function getReasonClass(reason) {
  if (reason.includes("Voicemail")) return "voicemail";
  if (reason.includes("Failed")) return "failed";
  if (reason.includes("Ended")) return "ended";
  return "";
}