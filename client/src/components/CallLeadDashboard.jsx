import { useEffect, useState } from "react";
import "./CallLeadDashboard.css";

function formatDate(dateString) {
  if (!dateString) return "—";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString();
}

function escapeCsvValue(value) {
  if (value === null || value === undefined) return '""';
  const stringValue = String(value).replace(/"/g, '""');
  return `"${stringValue}"`;
}

function downloadCsv(filename, rows) {
  if (!rows.length) return;

  const headers = [
    "Name",
    "Phone",
    "Email",
    "Loan Goal",
    "Refi Objective",
    "Appointment Scheduled",
    "Status",
    "Created At",
  ];

  const csvLines = [
    headers.join(","),
    ...rows.map((lead) =>
      [
        escapeCsvValue(lead.name || ""),
        escapeCsvValue(lead.phone || ""),
        escapeCsvValue(lead.email || ""),
        escapeCsvValue(lead.loanGoal || ""),
        escapeCsvValue(lead.refiObjective || ""),
        escapeCsvValue(lead.appointmentScheduled ? "Yes" : "No"),
        escapeCsvValue(lead.status || ""),
        escapeCsvValue(formatDate(lead.createdAt)),
      ].join(",")
    ),
  ];

  const csvContent = "\uFEFF" + csvLines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
}

function CallLeadDashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        setError("");

        const apiBase = "http://76.13.242.148:4000";
        const res = await fetch(`${apiBase}/api/call-leads`);

        if (!res.ok) {
          throw new Error(`Failed to fetch call leads: ${res.status}`);
        }

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          throw new Error(`Expected JSON but received ${contentType}`);
        }

        const data = await res.json();
        setLeads(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Call lead fetch error:", err);
        setError("Unable to load call leads.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const handleExportCsv = () => {
    downloadCsv("call-leads.csv", leads);
  };

  return (
    <section className="call-lead-page">
      <div className="call-lead-header">
        <div>
          <h1>Call Leads</h1>
          <p>Qualified leads captured from call sessions.</p>
        </div>

        <button
          className="lead-export-btn"
          onClick={handleExportCsv}
          disabled={!leads.length}
        >
          Export CSV
        </button>
      </div>

      <div className="call-lead-card">
        {loading ? (
          <div className="call-lead-state">Loading call leads...</div>
        ) : error ? (
          <div className="call-lead-state call-lead-error">{error}</div>
        ) : leads.length === 0 ? (
          <div className="call-lead-state">No call leads found.</div>
        ) : (
          <div className="call-lead-table-wrap">
            <table className="call-lead-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Loan Goal</th>
                  <th>Refi Objective</th>
                  <th>Appointment</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id}>
                    <td>{lead.name || "—"}</td>
                    <td>{lead.phone || "—"}</td>
                    <td>{lead.email || "—"}</td>
                    <td>{lead.loanGoal || "—"}</td>
                    <td>{lead.refiObjective || "—"}</td>
                    <td>{lead.appointmentScheduled ? "Yes" : "No"}</td>
                    <td>{lead.status || "—"}</td>
                    <td>{formatDate(lead.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default CallLeadDashboard;