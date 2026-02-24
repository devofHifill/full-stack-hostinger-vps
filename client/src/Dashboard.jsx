import { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";

const TABS = [
  "Overview",
  "Sessions",
  "Messages",
  "Users",
  "Dialogs and Intents",
  "Voice of the customer",
  "Insights",
  "Custom Dashboards",
];

function KpiCard({ title, value, changePct, prevLabel }) {
  const isUp = changePct > 0;
  const changeClass =
    isUp
      ? "kpi__change--up"
      : changePct < 0
      ? "kpi__change--down"
      : "kpi__change--flat";

  const arrow = isUp ? "?" : changePct < 0 ? "?" : "?";
  const abs = Math.abs(changePct);

  return (
    <div className="kpi">
      <div className="kpi__title">{title}</div>
      <div className="kpi__value">{value}</div>
      <div className="kpi__meta">
        <span className={`kpi__change ${changeClass}`}>
          {arrow} {abs}%
        </span>
        <span className="kpi__prev">{prevLabel}</span>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, right }) {
  return (
    <div className="panel">
      <div className="panel__head">
        <div>
          <div className="panel__title">{title}</div>
          {subtitle && (
            <div className="panel__subtitle">{subtitle}</div>
          )}
        </div>
        {right && <div className="panel__right">{right}</div>}
      </div>

      <div className="panel__body">
        <div className="chartPlaceholder">
          <div className="chartPlaceholder__grid" />
          <div className="chartPlaceholder__note">
            Chart placeholder (connect real data later)
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [dateRange, setDateRange] = useState("Last 30 days");
  const [bot, setBot] = useState("All");
  const [dbStatus, setDbStatus] = useState({
    state: "idle",
    message: "",
  });

useEffect(() => {
  const controller = new AbortController();

  const checkConnection = async () => {
    try {
      // 1?? Resolve API base
      const envBase = import.meta.env.VITE_API_URL;

      // If VITE_API_URL exists ? use it
      // Otherwise fallback to same-origin (Vite proxy)
      const base = envBase ? envBase.replace(/\/$/, "") : "";

      const url = base
        ? `${base}/api/db-test`
        : "/api/db-test";

      console.log("Checking DB connection at:", url);

      setDbStatus({
        state: "loading",
        message: "Checking API + Mongo...",
      });

      // 2?? Fetch request
      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
      });

      console.log("HTTP Status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // 3?? Validate JSON
      const data = await response.json();
      console.log("API Response:", data);

      if (!data || typeof data !== "object") {
        throw new Error("Invalid JSON response");
      }

      if (data.ok) {
        setDbStatus({
          state: "ok",
          message: `Connected (createdId: ${data.createdId || "N/A"})`,
        });
      } else {
        throw new Error("API responded but ok=false");
      }

    } catch (error) {
      if (error.name === "AbortError") return;

      console.error("DB Test Error:", error);

      setDbStatus({
        state: "error",
        message: error.message || "Connection failed",
      });
    }
  };

  checkConnection();

  // Cleanup to prevent memory leaks
  return () => controller.abort();
}, []);
  const metrics = useMemo(
    () => [
      { title: "Total sessions", value: "76", changePct: -3, prevLabel: "78 prev. 30d" },
      { title: "Engaged session rate", value: "59%", changePct: 36, prevLabel: "44% prev. 30d" },
      { title: "Average sessions per user", value: "3.6", changePct: -35, prevLabel: "5.6 prev. 30d" },
      { title: "Total users", value: "21", changePct: 50, prevLabel: "14 prev. 30d" },
      { title: "User retention rate", value: "29%", changePct: -50, prevLabel: "57% prev. 30d" },
      { title: "Session containment rate", value: "91%", changePct: -9, prevLabel: "100% prev. 30d" },
    ],
    []
  );

  return (
    <div className="dash">
      {/* Header */}
      <header className="dashTop">
        <div className="dashTop__left">
          <div className="crumb">
            <span className="crumb__dot" />
            <span className="crumb__text">
              Answers / Analytics
            </span>
          </div>
        </div>

        <div className="dashTop__right">
          <button className="btn btn--ghost">Pricing</button>
          <button className="btn btn--primary">Add funds</button>

          <div className="balance">
            <div className="balance__label">Balance</div>
            <div className="balance__value">€0.00</div>
          </div>
        </div>
      </header>

      {/* Demo Banner */}
      <div className="demo-banner">
        <strong>Demo page:</strong> This dashboard is a UI
        prototype for SEBVM chatbot matrices. Final metrics,
        layout, and features may change.
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            opacity: 0.9,
          }}
        >
          <strong>Connection:</strong>{" "}
          {dbStatus.state === "loading" && "Checking API + Mongo..."}
          {dbStatus.state === "ok" && dbStatus.message}
          {dbStatus.state === "error" && `Error: ${dbStatus.message}`}
        </div>
      </div>

      {/* Tabs */}
      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`tab ${
              activeTab === t ? "tab--active" : ""
            }`}
            onClick={() => setActiveTab(t)}
            type="button"
          >
            {t}
          </button>
        ))}
      </nav>

      {/* Filters */}
      <section className="toolbar">
        <div className="filters">
          <div className="filter">
            <div className="filter__label">
              Date range
            </div>
            <select
              className="filter__control"
              value={dateRange}
              onChange={(e) =>
                setDateRange(e.target.value)
              }
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Custom</option>
            </select>
          </div>

          <div className="filter">
            <div className="filter__label">
              Chatbot name
            </div>
            <select
              className="filter__control"
              value={bot}
              onChange={(e) =>
                setBot(e.target.value)
              }
            >
              <option>All</option>
              <option>Imani (SEB)</option>
              <option>FDG SMS Assistant</option>
              <option>Demo Bot</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="dashMain">
        <h2 className="sectionTitle">Summary</h2>
        <p className="sectionHint">
          Key performance indicators on how your chatbots
          are performing.
        </p>

        <div className="kpiGrid">
          {metrics.map((m) => (
            <KpiCard key={m.title} {...m} />
          ))}
        </div>

        <h2
          className="sectionTitle"
          style={{ marginTop: 18 }}
        >
          Sessions overview
        </h2>

        <p className="sectionHint">
          Number of sessions over time and how they ended.
        </p>

        <div className="panelGrid">
          <Panel
            title="Sessions over time"
            subtitle="Trend of all sessions vs engaged sessions"
            right={<span className="pill">Demo</span>}
          />

          <Panel
            title="Number of sessions by how they ended"
            subtitle="Contained / escalated / dropped"
            right={<span className="pill">Demo</span>}
          />
        </div>
      </main>
    </div>
  );
}