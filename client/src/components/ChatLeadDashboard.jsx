import { useEffect, useState } from "react";
import "./ChatLeadDashboard.css";

function formatDate(dateString) {
  if (!dateString) return "—";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString();
}

function ChatLeadDashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        setError("");

        const apiBase = "http://76.13.242.148:4000";
        const url = `${apiBase}/api/chat-leads`;

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`Failed to fetch chat leads: ${res.status}`);
        }

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          throw new Error(`Expected JSON but received ${contentType}`);
        }

        const data = await res.json();
        setLeads(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Chat lead fetch error:", err);
        setError("Unable to load chat leads.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  return (
    <section className="chat-lead-page">
      <div className="chat-lead-header">
        <div>
          <h1>Chat Leads</h1>
          <p>Qualified leads captured from chat sessions.</p>
        </div>
      </div>

      <div className="chat-lead-card">
        {loading ? (
          <div className="chat-lead-state">Loading chat leads...</div>
        ) : error ? (
          <div className="chat-lead-state chat-lead-error">{error}</div>
        ) : leads.length === 0 ? (
          <div className="chat-lead-state">No chat leads found.</div>
        ) : (
          <div className="chat-lead-table-wrap">
            <table className="chat-lead-table">
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

export default ChatLeadDashboard;