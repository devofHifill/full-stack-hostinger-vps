import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Dashboard from "./components/layout/Dashboard";
import LoginPage from "./components/pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

import CallLogsPage from "./components/pages/CallLogsPage";
import ChatLogsPage from "./components/pages/ChatLogsPage";
import ChatLeadDashboard from "./components/ChatLeadDashboard";
import CallLeadDashboard from "./components/CallLeadDashboard";
import MetricsPage from "./components/pages/MetricsPage";
import OutboundContactsDashboard from "./components/OutboundContactsDashboard";
import WorkflowSchedulerDashboard from "./components/WorkflowSchedulerDashboard";
import LoanOfficersDashboard from "./components/LoanOfficersDashboard";

import { useAuth } from "./context/AuthContext";

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Login Route */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
        }
      />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<MetricsPage />} />
        <Route path="/calls" element={<CallLogsPage />} />
        <Route path="/chat" element={<ChatLogsPage />} />
        <Route path="/call-leads" element={<CallLeadDashboard />} />
        <Route path="/chat-leads" element={<ChatLeadDashboard />} />
        <Route path="/files" element={<OutboundContactsDashboard />} />
        <Route path="/schedular" element={<WorkflowSchedulerDashboard />} />
        <Route path="/officers" element={<LoanOfficersDashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}