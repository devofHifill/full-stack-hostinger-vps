import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./components/layout/Dashboard";
import CallLogsPage from "./components/pages/CallLogsPage";
import ChatLogsPage from "./components/pages/ChatLogsPage";

export default function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route element={<Dashboard />}>

          <Route path="/" element={<Navigate to="/calls" />} />

          <Route path="/calls" element={<CallLogsPage />} />
          <Route path="/chat" element={<ChatLogsPage />} />

          <Route path="/call-leads" element={<div>Call Leads Page</div>} />
          <Route path="/chat-leads" element={<div>Chat Leads Page</div>} />
          <Route path="/files" element={<div>File Upload Page</div>} />

        </Route>

      </Routes>

    </BrowserRouter>

  )

}