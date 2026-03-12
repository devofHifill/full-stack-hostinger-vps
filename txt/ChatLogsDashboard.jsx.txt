import { useEffect, useState, useRef } from "react";
import "./ChatLogsDashboard.css";

export default function ChatLogsDashboard() {

  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeSession, setActiveSession] = useState(null);

  const API = "http://76.13.242.148:4000";

  const messagesEndRef = useRef(null);

  /* ----------------------------
     Auto Scroll
  -----------------------------*/

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  /* ----------------------------
     Load Sessions
  -----------------------------*/

  useEffect(() => {
    fetch(`${API}/api/chat/sessions`)
      .then(res => res.json())
      .then(data => setSessions(data))
      .catch(err => console.error(err));
  }, []);


  /* ----------------------------
     Load Messages
  -----------------------------*/

  async function loadMessages(sessionId) {

    setActiveSession(sessionId);

    const res = await fetch(`${API}/api/chat/${sessionId}`);
    const data = await res.json();

    setMessages(data);
  }


  function formatTime(ts) {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function cleanMessage(msg) {
    if (!msg) return "";

    let cleaned = msg;

    // remove leading = (n8n expression artifact)
    cleaned = cleaned.replace(/^=/, "");

    // remove accidental leading whitespace
    cleaned = cleaned.replace(/^\s+/, "");

    // normalize line breaks
    cleaned = cleaned.replace(/\n/g, "<br>");

    return cleaned.trim();
  }
  return (

    <>
      <div className="header">
        <div>
          <h1>Chat Logs</h1>
          <p>View and manage chat logs for your account.</p>
        </div>
      </div>

      <div className="demo-banner">
        Demo Page: This dashboard is connected to live backend data.
        Final features and metrics may change.
      </div>

      <div className="filters">
        <button className="filter-btn">
          ☰ All Chat <span>####</span>
        </button>
      </div>
      <div className="chatLayout">

        {/* LEFT PANEL */}

        <div className="chatSessions">


          {sessions.map((s) => (

            <div
              key={s.sessionId}
              onClick={() => loadMessages(s.sessionId)}
              className={`sessionItem ${activeSession === s.sessionId ? "active" : ""}`}
            >

              <div className="sessionName">
                {s.visitor?.name || "Anonymous"}
              </div>

              <div className="sessionPhone">
                {s.visitor?.phone || "-"}
              </div>

            </div>

          ))}

        </div>


        {/* RIGHT PANEL */}

        <div className="chatWindow">

          {!activeSession && (
            <div className="emptyChat">
              Select a conversation
            </div>
          )}

          {messages.map((m, i) => {

            const isUser = m.role === "user";

            return (

              <div
                key={m._id || i}
                className={`chatRow ${isUser ? "user" : "bot"}`}
              >

                <div className="chatBubble">

                  <div className="chatMeta">
                    <span className="chatRole">
                      {isUser ? "User" : "Bot"}
                    </span>

                    <span className="chatTime">
                      {formatTime(m.createdAt)}
                    </span>
                  </div>

                  <div
                    className="chatText"
                    dangerouslySetInnerHTML={{
                      __html: cleanMessage(m.message)
                    }}
                  />

                </div>

              </div>

            )

          })}

          <div ref={messagesEndRef}></div>

        </div>

      </div>
    </>
  );
}