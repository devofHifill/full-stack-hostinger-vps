<<<<<<< HEAD
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
=======
import "./TranscriptViewer.css";

export default function TranscriptViewer({ transcript }) {

  if (!transcript) {
    return <p className="transcript-empty">No transcript available</p>;
  }

  // Split transcript by speaker keywords
  const messages = transcript
    .split(/(AI:|Assistant:|User:)/g)
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
    .filter(Boolean);

  const parsedMessages = [];

<<<<<<< HEAD
  for (let i = 0; i < parts.length; i += 2) {
    const roleRaw = parts[i];
    const text = parts[i + 1]?.trim();
=======
  for (let i = 0; i < messages.length; i += 2) {
    const roleRaw = messages[i];
    const text = messages[i + 1]?.trim();
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de

    if (!text) continue;

    let role = "assistant";

    if (/user/i.test(roleRaw)) role = "user";
<<<<<<< HEAD
    else if (/ai|assistant/i.test(roleRaw)) role = "assistant";
=======
    if (/ai|assistant/i.test(roleRaw)) role = "assistant";
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de

    parsedMessages.push({ role, text });
  }

  return (
    <div className="transcript-container">
<<<<<<< HEAD
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
=======
      {parsedMessages.map((msg, i) => (
        <div key={i} className={`transcript-message ${msg.role}`}>
          <div className="transcript-bubble">
            <span className="transcript-role">
              {msg.role === "assistant" ? "Assistant" : "User"}
            </span>
            <p>{msg.text}</p>
          </div>
        </div>
      ))}
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
    </div>
  );
}