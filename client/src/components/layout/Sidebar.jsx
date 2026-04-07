<<<<<<< HEAD
import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";
import logo from "../../assets/logo.png";

function IconCalls() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.35 1.78.68 2.62a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6.09 6.09l1.46-1.29a2 2 0 0 1 2.11-.45c.84.33 1.72.56 2.62.68A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
    </svg>
  );
}

function IconClipboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <rect x="8" y="3" width="8" height="4" rx="1.5" />
      <path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M20 16.5v2.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.5" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconChevron({ open }) {
  return (
    <svg
      className={`chevron-icon ${open ? "open" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

const navGroups = [
  {
    id: "monitoring",
    title: "Monitoring",
    items: [
      { to: "/calls", label: "Call Logs", icon: <IconCalls /> },
      { to: "/chat", label: "Chat Logs", icon: <IconChat /> },
    ],
  },
  {
    id: "leads",
    title: "Leads",
    items: [
      { to: "/call-leads", label: "Call Leads", icon: <IconClipboard /> },
      { to: "/chat-leads", label: "Chat Leads", icon: <IconClipboard /> },
    ],
  },
  {
    id: "management",
    title: "Management",
    items: [
      { to: "/files", label: "File Upload", icon: <IconUpload /> },
      { to: "/schedular", label: "Workflow Scheduler", icon: <IconClock /> },
      { to: "/officers", label: "Loan Officers", icon: <IconUsers /> },
    ],
  },
];

export default function Sidebar({ open, closeSidebar }) {
  const location = useLocation();

  const defaultOpenGroups = useMemo(() => {
    const matchedGroup = navGroups.find((group) =>
      group.items.some((item) => location.pathname.startsWith(item.to))
    );

    return {
      monitoring: matchedGroup?.id === "monitoring",
      leads: matchedGroup?.id === "leads",
      management: matchedGroup?.id === "management",
    };
  }, [location.pathname]);

  const [openGroups, setOpenGroups] = useState({
    monitoring: true,
    leads: true,
    management: true,
    ...defaultOpenGroups,
  });

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  return (
    <aside className={`app-sidebar ${open ? "open" : ""}`}>
      <div className="app-sidebar-top">
        <div className="brand-block">
          <div className="brand-logo image-logo">
            <img src={logo} alt="SEBVM Logo" />
          </div>

          {/* <div className="brand-copy">
            <strong>SEBVM</strong>
            <span>Voice Monitoring</span>
          </div> */}
        </div>

        <button
          className="sidebar-close-btn"
          onClick={closeSidebar}
          aria-label="Close sidebar"
          type="button"
        >
          ✕
        </button>
      </div>

      <div className="org-card premium-card">
        <span className="org-label">Organization</span>
        <strong>it@sebmtg.com's Org</strong>
        <small>Operational dashboard workspace</small>
      </div>

      <div className="sidebar-search premium-card">
        <span className="search-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </span>
        <input type="text" placeholder="Search modules" />
      </div>

      <nav className="sidebar-nav">
        {navGroups.map((group) => {
          const isOpen = openGroups[group.id];

          return (
            <div className="sidebar-group premium-card" key={group.id}>
              <button
                type="button"
                className="sidebar-group-header"
                onClick={() => toggleGroup(group.id)}
                aria-expanded={isOpen}
              >
                <span className="sidebar-group-title">{group.title}</span>
                <IconChevron open={isOpen} />
              </button>

              <div className={`sidebar-group-body ${isOpen ? "expanded" : "collapsed"}`}>
                <div className="sidebar-group-links">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={closeSidebar}
                      className={({ isActive }) =>
                        `sidebar-nav-item ${isActive ? "active" : ""}`
                      }
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer-card premium-card">
        <p>SEB Mortgage</p>
        <small>
          Premium dashboard for calls, chats, lead operations, scheduling, and
          internal workflow control.
        </small>
      </div>
    </aside>
  );
=======
import { NavLink } from "react-router-dom";

export default function Sidebar({ open, closeSidebar }) {

  return (

    <aside className={`sidebar ${open ? "open" : ""}`}>

      <div className="sidebar-header">

        <h2 className="logo">SEBVM</h2>

        <button
          className="sidebar-close"
          onClick={closeSidebar}
        >
          ✕
        </button>

      </div>

      <div className="org">it@sebmtg.com's Org</div>

      <div className="search">
        <input placeholder="Search" />
      </div>

      <nav>

        <NavLink
          to="/calls"
          onClick={closeSidebar}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          Call Logs
        </NavLink>

        <NavLink
          to="/chat"
          onClick={closeSidebar}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          Chat Logs
        </NavLink>



        <NavLink
          to="/call-leads"
          onClick={closeSidebar}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          Call Lead
        </NavLink>

        <NavLink
          to="/chat-leads"
          onClick={closeSidebar}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          Chat Lead
        </NavLink>

        <NavLink
          to="/files"
          onClick={closeSidebar}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          File Upload
        </NavLink>

        <NavLink
          to="/schedular"
          onClick={closeSidebar}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          WorkFlow schedular
        </NavLink>

                <NavLink
          to="/officers"
          onClick={closeSidebar}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          Loan Officers 
        </NavLink>

      </nav>

    </aside>

  );

>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
}