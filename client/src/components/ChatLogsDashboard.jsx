import { useEffect, useState } from "react";

export default function ChatLogsDashboard() {

  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeSession, setActiveSession] = useState(null);

  const API = "http://76.13.242.148:4000";

  useEffect(() => {
    fetch(`${API}/api/chat/sessions`)
      .then(res => res.json())
      .then(data => setSessions(data))
      .catch(err => console.error(err));
  }, []);

  async function loadMessages(sessionId) {

    setActiveSession(sessionId);

    const res = await fetch(`${API}/api/chat/${sessionId}`);
    const data = await res.json();

    setMessages(data);
  }

  return (
    <div style={{display:"flex", height:"80vh"}}>

      {/* LEFT PANEL */}

      <div style={{
        width:"30%",
        borderRight:"1px solid #ddd",
        overflowY:"auto"
      }}>

        <h3 style={{padding:"10px"}}>Conversations</h3>

        {sessions.map((s) => (

          <div
            key={s.sessionId}
            onClick={() => loadMessages(s.sessionId)}
            style={{
              padding:"10px",
              borderBottom:"1px solid #eee",
              cursor:"pointer"
            }}
          >

            <strong>{s.visitor?.name || "Anonymous"}</strong>
            <div>{s.visitor?.phone}</div>

          </div>

        ))}

      </div>


      {/* RIGHT PANEL */}

      <div style={{width:"70%", padding:"20px", overflowY:"auto"}}>

        {!activeSession && <p>Select a conversation</p>}

        {messages.map((m,i)=>(
          <div key={i}
            style={{
              textAlign: m.role === "user" ? "right":"left",
              marginBottom:"12px"
            }}
          >
            <div style={{
              display:"inline-block",
              padding:"10px",
              borderRadius:"10px",
              background: m.role==="user" ? "#DCF8C6":"#F1F0F0"
            }}>
              {m.message}
            </div>
          </div>
        ))}

      </div>

    </div>
  );
}