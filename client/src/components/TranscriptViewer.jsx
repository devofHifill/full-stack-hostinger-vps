import "./styles/TranscriptViewer.css";

export default function TranscriptViewer({ transcript }) {
  if (!transcript || typeof transcript !== "string") {
    return <p className="transcript-empty">No transcript available</p>;
  }

  // Normalize transcript (remove leading "=" and trim)
  const cleanedTranscript = transcript.replace(/^=/, "").trim();

  // Split transcript by speaker labels
  const parts = cleanedTranscript
    .split(/(AI:|Assistant:|User:)/gi)
    .filter(Boolean);

  const parsedMessages = [];

  for (let i = 0; i < parts.length; i += 2) {
    const roleRaw = parts[i];
    const text = parts[i + 1]?.trim();

    if (!text) continue;

    let role = "assistant";

    if (/user/i.test(roleRaw)) role = "user";
    else if (/ai|assistant/i.test(roleRaw)) role = "assistant";

    parsedMessages.push({ role, text });
  }

  return (
    <div className="transcript-container">
      {parsedMessages.length === 0 ? (
        <p className="transcript-empty">No readable transcript format</p>
      ) : (
        parsedMessages.map((msg, i) => (
          <div key={i} className={`transcript-message ${msg.role}`}>
            <div className="transcript-bubble">
              <span className="transcript-role">
                {msg.role === "assistant" ? "Assistant" : "User"}
              </span>
              <p>{msg.text}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}