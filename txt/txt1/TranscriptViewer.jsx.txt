import "./TranscriptViewer.css";

export default function TranscriptViewer({ transcript }) {

  if (!transcript) {
    return <p className="transcript-empty">No transcript available</p>;
  }

  // Split transcript by speaker keywords
  const messages = transcript
    .split(/(AI:|Assistant:|User:)/g)
    .filter(Boolean);

  const parsedMessages = [];

  for (let i = 0; i < messages.length; i += 2) {
    const roleRaw = messages[i];
    const text = messages[i + 1]?.trim();

    if (!text) continue;

    let role = "assistant";

    if (/user/i.test(roleRaw)) role = "user";
    if (/ai|assistant/i.test(roleRaw)) role = "assistant";

    parsedMessages.push({ role, text });
  }

  return (
    <div className="transcript-container">
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
    </div>
  );
}