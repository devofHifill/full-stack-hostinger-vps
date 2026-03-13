import { useEffect, useState } from "react";
import CallDetailsModal from "./CallDetailsModal";
import "./CallLogsDashboard.css";

export default function CallLogsDashboard() {

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCallId, setSelectedCallId] = useState(null);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const API = "http://76.13.242.148:4000";

  useEffect(() => {

    async function fetchCalls() {

      try {

        setLoading(true);

        const res = await fetch(`${API}/api/calls?page=${page}&limit=20`);
        const data = await res.json();

        const mapped = (data.items || []).map((call) => ({

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
        setPagination(data.pagination || null);

      } catch (err) {

        console.error("Error fetching calls:", err);

      } finally {

        setLoading(false);

      }

    }

    fetchCalls();

  }, [page]);

  return (

    <>

      <div className="header">
        <h1>Call Logs</h1>
      </div>

      <div className="table-wrapper">

        {loading ? (

          <p>Loading...</p>

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
                      <span className={`badge ${getReasonClass(row.reason)}`}>
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

      {/* CALL DETAILS MODAL */}

      {selectedCallId && (

        <CallDetailsModal
          callId={selectedCallId}
          onClose={() => setSelectedCallId(null)}
        />

      )}

    </>

  );

}


/* Helper for badge colors */

function getReasonClass(reason) {

  if (!reason) return "";

  const r = reason.toLowerCase();

  if (r.includes("voicemail")) return "voicemail";

  if (r.includes("failed")) return "failed";

  if (r.includes("ended")) return "ended";

  if (r.includes("silence")) return "voicemail";

  return "";
}