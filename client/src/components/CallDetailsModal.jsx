import { useEffect, useState } from "react";

export default function CallDetailsModal({ callId, onClose }) {
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCall() {
      try {
        const res = await fetch(`http://76.13.242.148:4000/api/calls/${callId}`);

        if (!res.ok) {
          throw new Error("API request failed");
        }

        const data = await res.json();
        setCall(data);
      } catch (err) {
        console.error("Failed to fetch call details", err);
      } finally {
        setLoading(false);
      }
    }

    if (callId) fetchCall();
  }, [callId]);

  if (!callId) return null;

  return (
    <div className="modalOverlay">

      <div className="modalBox">

        <div className="modalHeader">
          <h2>Call Details</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="modalSection">
              <h3>Customer</h3>
              <p>Name: {call?.customer?.name || "-"}</p>
              <p>Phone: {call?.customer?.phone || "-"}</p>
              <p>Email: {call?.customer?.email || "-"}</p>
            </div>

            <div className="modalSection">
              <h3>Call Info</h3>
              <p>Status: {call?.status || "-"}</p>
              <p>Duration: {call?.durationSeconds || "-"}s</p>
              <p>Cost: ${call?.cost || 0}</p>
            </div>

            {call?.recordingUrl && (
              <div className="modalSection">
                <h3>Recording</h3>
                <audio controls src={call.recordingUrl}></audio>
              </div>
            )}

            <div className="modalSection">
              <h3>Summary</h3>
              <p>{call?.summary || "-"}</p>
            </div>

            <div className="modalSection">
              <h3>Transcript</h3>
              <pre className="transcriptBox">
                {call?.transcript || "-"}
              </pre>
            </div>
          </>
        )}

      </div>

    </div>
  );
}