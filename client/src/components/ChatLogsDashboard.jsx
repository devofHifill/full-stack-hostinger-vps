import { useEffect, useState, useRef } from "react";
import DateFilter from "./DateFilter";
import { buildDateFilterParams } from "../utils/dateFilterParams";
import "./ChatLogsDashboard.css";

export default function ChatLogsDashboard() {
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeSession, setActiveSession] = useState(null);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");

  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages(sessionId) {
    try {
      setLoadingMessages(true);
      setActiveSession(sessionId);

      const endpoint = `/api/chat/${sessionId}`;
      const url = API ? `${API}${endpoint}` : endpoint;

      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load messages:", err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function fetchSessions() {
      try {
        setLoadingSessions(true);
        setError("");
        setFilterError("");

        if (dateFilter === "custom") {
          if (!customStartDate || !customEndDate) {
            if (!ignore) setLoadingSessions(false);
            return;
          }

          if (customStartDate > customEndDate) {
            if (!ignore) {
              setFilterError("Start date cannot be after end date.");
              setLoadingSessions(false);
            }
            return;
          }
        }

        const params = buildDateFilterParams(
          dateFilter,
          customStartDate,
          customEndDate
        );

        params.set("page", String(page));
        params.set("limit", "10");

        const endpoint = `/api/chat/sessions?${params.toString()}`;
        const url = API ? `${API}${endpoint}` : endpoint;

        const res = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();
        const sessionItems = Array.isArray(data.items) ? data.items : [];

        if (!ignore) {
          setSessions(sessionItems);
          setPagination(data.pagination || null);

          if (sessionItems.length === 0) {
            setActiveSession(null);
            setMessages([]);
            return;
          }

          const activeStillExists = sessionItems.some(
            (s) => s.sessionId === activeSession
          );

          if (!activeSession || !activeStillExists) {
            loadMessages(sessionItems[0].sessionId);
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load chat sessions:", err);
          setError(err.message || "Failed to load chat sessions");
          setSessions([]);
          setPagination(null);
          setActiveSession(null);
          setMessages([]);
        }
      } finally {
        if (!ignore) setLoadingSessions(false);
      }
    }

    fetchSessions();

    return () => {
      ignore = true;
    };
  }, [page, dateFilter, customStartDate, customEndDate]);

  useEffect(() => {
    setPage(1);
  }, [dateFilter, customStartDate, customEndDate]);

  function formatTime(ts) {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function cleanMessage(msg) {
    if (!msg) return "";

    let cleaned = msg;

    cleaned = cleaned.replace(/^=/, "");
    cleaned = cleaned.replace(/^\s+/, "");
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

      <div className="filters chat-logs-filters">
        <DateFilter
          value={dateFilter}
          onChange={setDateFilter}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onCustomStartDateChange={setCustomStartDate}
          onCustomEndDateChange={setCustomEndDate}
        />

        {filterError ? (
          <div className="chat-logs-inline-error">{filterError}</div>
        ) : null}
      </div>

      {error ? <div className="chat-logs-error-box">{error}</div> : null}

      <div className="chatLayout">
        <div className="chatSessions">
          {loadingSessions ? (
            <div className="emptyChat">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="emptyChat">No conversations found for this range.</div>
          ) : (
            sessions.map((s) => (
              <div
                key={s.sessionId}
                onClick={() => loadMessages(s.sessionId)}
                className={`sessionItem ${
                  activeSession === s.sessionId ? "active" : ""
                }`}
              >
                <div className="sessionName">
                  {s.visitor?.name || "Anonymous"}
                </div>

                <div className="sessionPhone">{s.visitor?.phone || "-"}</div>
              </div>
            ))
          )}

          {pagination && sessions.length > 0 && (
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
        </div>

        <div className="chatWindow">
          {loadingMessages ? (
            <div className="emptyChat">Loading conversation...</div>
          ) : !activeSession ? (
            <div className="emptyChat">No conversation selected</div>
          ) : messages.length === 0 ? (
            <div className="emptyChat">No messages found in this conversation.</div>
          ) : (
            messages.map((m, i) => {
              const isUser = m.role === "user";

              return (
                <div
                  key={m._id || i}
                  className={`chatRow ${isUser ? "user" : "bot"}`}
                >
                  <div className="chatBubble">
                    <div className="chatMeta">
                      <span className="chatRole">{isUser ? "User" : "Bot"}</span>

                      <span className="chatTime">{formatTime(m.createdAt)}</span>
                    </div>

                    <div
                      className="chatText"
                      dangerouslySetInnerHTML={{
                        __html: cleanMessage(m.message),
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef}></div>
        </div>
      </div>
    </>
  );
}