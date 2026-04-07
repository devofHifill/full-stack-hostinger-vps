import { useEffect, useState } from "react";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import CallDetailsModal from "./CallDetailsModal";
import DateFilter from "./DateFilter";
import { useAuth } from "../context/AuthContext";
import { useApiClient } from "../hooks/useApiClient";
import { buildDateFilterParams } from "../utils/dateFilterParams";
// import "./CallLogsDashboard.css";
import "./styles/CallLogsDashboard.css";
=======
import CallDetailsModal from "./CallDetailsModal";
import DateFilter from "./DateFilter";
import { buildDateFilterParams } from "../utils/dateFilterParams";
import "./CallLogsDashboard.css";
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de

export default function CallLogsDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCallId, setSelectedCallId] = useState(null);
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

<<<<<<< HEAD
  // const { token, logout } = useAuth();
  const { requestJson } = useApiClient();
  const { logout } = useAuth();

  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

=======
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
  useEffect(() => {
    let ignore = false;

    async function fetchCalls() {
      try {
        setLoading(true);
        setError("");
        setFilterError("");

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
        /////////////////////////////////////////////////////////////////////
        // const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
        // const params = buildDateFilterParams(
        //   dateFilter,
        //   customStartDate,
        //   customEndDate
        // );

        // params.set("page", String(page));
        // params.set("limit", "20");

        // const endpoint = `/api/calls?${params.toString()}`;
        // const url = API ? `${API}${endpoint}` : endpoint;

        // const res = await fetch(url, {
        //   method: "GET",
        //   headers: {
        //     "Content-Type": "application/json",
        //     Authorization: `Bearer ${token}`,
        //   },
        // });

        // if (!res.ok) {
        //   throw new Error(`Request failed with status ${res.status}`);
        // }

        // const data = await res.json();

=======

        const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
        const params = buildDateFilterParams(
          dateFilter,
          customStartDate,
          customEndDate
        );

        params.set("page", String(page));
        params.set("limit", "20");

<<<<<<< HEAD
        const data = await requestJson(`/calls?${params.toString()}`);

        ////////////////////////////////////
=======
        const endpoint = `/api/calls?${params.toString()}`;
        const url = API ? `${API}${endpoint}` : endpoint;

        const res = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de

        const mapped = (data.items || []).map((call) => ({
          id: call.callId,
          assistant:
            call.assistantName ||
            call.assistant ||
<<<<<<< HEAD
            (call.direction === "outbound"
              ? "Imani (Outbound)"
              : "Imani (Inbound)"),
=======
            (call.direction === "outbound" ? "Imani (Outbound)" : "Imani (Inbound)"),
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
          assistantPhone: call.assistantPhone || "-",
          customerPhone: call.customer?.phone || "-",
          type: call.direction === "outbound" ? "Outbound" : "Inbound",
          reason: call.endedReason || "-",
          success:
            call.normalizedOutcome === "completed"
              ? "Success"
              : call.normalizedOutcome === "failed"
<<<<<<< HEAD
                ? "Fail"
                : call.normalizedOutcome === "no-answer"
                  ? "No Answer"
                  : "-",
=======
              ? "Fail"
              : call.normalizedOutcome === "no-answer"
              ? "No Answer"
              : "-",
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
          start: call.startedAt
            ? new Date(call.startedAt).toLocaleString()
            : "N/A",
          duration:
            call.durationSeconds != null ? `${call.durationSeconds}s` : "-",
        }));

        if (!ignore) {
          setRows(mapped);
          setPagination(data.pagination || null);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Error fetching calls:", err);
          setError(err.message || "Failed to load call logs");
          setRows([]);
          setPagination(null);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchCalls();

    return () => {
      ignore = true;
    };
  }, [page, dateFilter, customStartDate, customEndDate]);

  useEffect(() => {
    setPage(1);
  }, [dateFilter, customStartDate, customEndDate]);

  return (
    <>
      <div className="header">
        <div className="call-logs-header-row">
          <div>
            <h1>Call Logs</h1>
          </div>

          <div className="call-logs-filter-bar">
            <DateFilter
              value={dateFilter}
              onChange={setDateFilter}
              customStartDate={customStartDate}
              customEndDate={customEndDate}
              onCustomStartDateChange={setCustomStartDate}
              onCustomEndDateChange={setCustomEndDate}
            />

<<<<<<< HEAD
            <button className="dashboard-logout-btn" onClick={handleLogout}>
              Logout
            </button>

=======
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
            {filterError ? (
              <div className="call-logs-inline-error">{filterError}</div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <div className="call-logs-error-box">
            <p>{error}</p>
          </div>
        ) : (
          <>
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
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan="9">No call logs found for the selected range.</td>
                  </tr>
                ) : (
                  rows.map((row) => (
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
<<<<<<< HEAD
                        <span
                          className={`badge ${row.type === "Inbound" ? "inbound" : "outbound"
                            }`}
                        >
=======
                        <span className={`badge ${row.type === "Inbound" ? "inbound" : "outbound"}`}>
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
                          ☎ {row.type}
                        </span>
                      </td>

                      <td>
                        <span className={`badge ${getReasonClass(row.reason)}`}>
                          {row.reason}
                        </span>
                      </td>

                      <td>
                        <span
<<<<<<< HEAD
                          className={`badge ${row.success === "Success"
                            ? "success"
                            : row.success === "Fail"
                              ? "fail"
                              : row.success === "No Answer"
                                ? "no-answer"
                                : ""
                            }`}
=======
                          className={`badge ${
                            row.success === "Success"
                              ? "success"
                              : row.success === "Fail"
                              ? "fail"
                              : row.success === "No Answer"
                              ? "no-answer"
                              : ""
                          }`}
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
                        >
                          {row.success}
                        </span>
                      </td>

                      <td>{row.start}</td>
                      <td>{row.duration}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

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

      {selectedCallId && (
        <CallDetailsModal
          callId={selectedCallId}
          onClose={() => setSelectedCallId(null)}
        />
      )}
    </>
  );
}

<<<<<<< HEAD
=======
/* Helper for badge colors */
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
function getReasonClass(reason) {
  if (!reason) return "";

  const r = reason.toLowerCase();

  if (r.includes("voicemail")) return "voicemail";
  if (r.includes("failed")) return "failed";
  if (r.includes("ended")) return "ended";
  if (r.includes("silence")) return "voicemail";

  return "";
}