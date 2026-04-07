import { useEffect, useState } from "react";
import DateFilter from "./DateFilter";
import { buildDateFilterParams } from "../utils/dateFilterParams";
<<<<<<< HEAD
import "./styles/ChatLeadDashboard.css";
import { useApiClient } from "../hooks/useApiClient";
=======
import "./ChatLeadDashboard.css";
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de

/* ---------------- HELPERS ---------------- */

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

/* ---------------- COMPONENT ---------------- */

export default function ChatLeadDashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
<<<<<<< HEAD
  const { requestJson } = useApiClient();

=======
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    let ignore = false;

    async function fetchLeads() {
      try {
        setLoading(true);
        setError("");
        setFilterError("");

        /* ----- Custom date validation ----- */
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

<<<<<<< HEAD
=======
        const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de

        const params = buildDateFilterParams(
          dateFilter,
          customStartDate,
          customEndDate
        );

        params.set("page", String(page));
        params.set("limit", "10");

<<<<<<< HEAD
        const data = await requestJson(`/chat-leads?${params.toString()}`);

=======
        const endpoint = `/api/chat-leads?${params.toString()}`;
        const url = apiBase ? `${apiBase}${endpoint}` : endpoint;

        const res = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch chat leads: ${res.status}`);
        }

        const data = await res.json();
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de

        if (!ignore) {
          setLeads(Array.isArray(data.items) ? data.items : []);
          setPagination(data.pagination || null);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Chat lead fetch error:", err);
          setError("Unable to load chat leads.");
          setLeads([]);
          setPagination(null);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchLeads();

    return () => {
      ignore = true;
    };
  }, [page, dateFilter, customStartDate, customEndDate]);

  /* Reset page on filter change */
  useEffect(() => {
    setPage(1);
  }, [dateFilter, customStartDate, customEndDate]);

  /* ---------------- ACTIONS ---------------- */

  const handleExportCsv = () => {
    downloadCsv("chat-leads.csv", leads);
  };

  /* ---------------- UI ---------------- */

  return (
    <section className="chat-lead-page">
      {/* HEADER */}
      <div className="chat-lead-header">
        <div>
          <h1>Chat Leads</h1>
          <p>Qualified leads captured from chat sessions.</p>
        </div>

        <button
          className="lead-export-btn"
          onClick={handleExportCsv}
          disabled={!leads.length}
        >
          Export CSV
        </button>
      </div>

      {/* FILTER */}
      <div className="chat-lead-filter-row">
        <DateFilter
          value={dateFilter}
          onChange={setDateFilter}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onCustomStartDateChange={setCustomStartDate}
          onCustomEndDateChange={setCustomEndDate}
        />

        {filterError && (
          <div className="chat-lead-inline-error">{filterError}</div>
        )}
      </div>

      {/* CONTENT */}
      <div className="chat-lead-card">
        {loading ? (
          <div className="chat-lead-state">Loading chat leads...</div>
        ) : error ? (
          <div className="chat-lead-state chat-lead-error">{error}</div>
        ) : leads.length === 0 ? (
          <div className="chat-lead-state">
            No chat leads found for this range.
          </div>
        ) : (
          <>
            {/* TABLE */}
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

            {/* PAGINATION */}
            {pagination && (
              <div className="table-pagination">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrevPage}
                >
                  Previous
                </button>

                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}