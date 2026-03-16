import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./components/layout/Dashboard";
import CallLogsPage from "./components/pages/CallLogsPage";
import ChatLogsPage from "./components/pages/ChatLogsPage";
import ChatLeadDashboard from "./components/ChatLeadDashboard";
import CallLeadDashboard from "./components/CallLeadDashboard";
import MetricsPage from "./components/pages/MetricsPage";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Dashboard />}>
          {/* <Route path="/" element={<Navigate to="/calls" replace />} /> */}

          <Route path="/" element={<MetricsPage />} />

          <Route path="/calls" element={<CallLogsPage />} />
          <Route path="/chat" element={<ChatLogsPage />} />

          <Route path="/call-leads" element={<CallLeadDashboard />} />          
          <Route path="/chat-leads" element={<ChatLeadDashboard />} />

          <Route path="/files" element={<div>File Upload Page</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}