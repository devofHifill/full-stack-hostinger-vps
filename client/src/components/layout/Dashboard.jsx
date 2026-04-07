import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import "./Dashboard.css";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="dashboard-layout">
      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-label="Close sidebar overlay"
          type="button"
        />
      )}

      <Sidebar open={sidebarOpen} closeSidebar={closeSidebar} />

      <div className="dashboard-main-shell">
        <Header toggleSidebar={toggleSidebar} />

        <section className="dashboard-content">
          <Outlet />
        </section>

        <Footer />
      </div>
    </div>
  );
}