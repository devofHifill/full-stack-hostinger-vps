import React, { useState } from "react";

import CallMetricsOverview from "../CallMetricsOverview";
import ChatMetricsOverview from "../ChatMetricsOverview";
import "../MetricsSwitcher.css";

export default function MetricsPage() {

  const [activeTab, setActiveTab] = useState("call");

  return (
    <div className="metrics-root">

      <div className="metrics-switcher">

        <button
          className={`metrics-switch-btn ${activeTab === "call" ? "active" : ""}`}
          onClick={() => setActiveTab("call")}
        >
          Call Metrics
        </button>

        <button
          className={`metrics-switch-btn ${activeTab === "chat" ? "active" : ""}`}
          onClick={() => setActiveTab("chat")}
        >
          Chat Metrics
        </button>

      </div>

      <div className="metrics-content">
        {activeTab === "call" && <CallMetricsOverview />}
        {activeTab === "chat" && <ChatMetricsOverview />}
      </div>

    </div>
  );
}