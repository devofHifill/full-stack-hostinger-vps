import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
<<<<<<< HEAD
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
=======
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
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
      )}

      <Sidebar open={sidebarOpen} closeSidebar={closeSidebar} />

<<<<<<< HEAD
      <div className="dashboard-main-shell">
        <Header toggleSidebar={toggleSidebar} />

        <section className="dashboard-content">
          <Outlet />
        </section>

        <Footer />
      </div>
=======
      <main className="main">
        <Header toggleSidebar={toggleSidebar}/>
        <Outlet/>
      </main>

>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
    </div>
  );
}