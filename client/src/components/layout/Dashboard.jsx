import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../CallLogsDashboard.css"

export default function Dashboard() {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="layout">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      <Sidebar open={sidebarOpen} closeSidebar={closeSidebar} />

      <main className="main">
        <Header toggleSidebar={toggleSidebar}/>
        <Outlet/>
      </main>

    </div>
  );
}