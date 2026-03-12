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
        <input placeholder="Search"/>
      </div>

      <nav>

        <NavLink
          to="/calls"
          onClick={closeSidebar}
          className={({isActive}) => `nav-item ${isActive ? "active" : ""}`}
        >
          Call Logs
        </NavLink>

        <NavLink
          to="/chat"
          onClick={closeSidebar}
          className={({isActive}) => `nav-item ${isActive ? "active" : ""}`}
        >
          Chat Logs
        </NavLink>

        <NavLink
          to="/call-leads"
          onClick={closeSidebar}
          className={({isActive}) => `nav-item ${isActive ? "active" : ""}`}
        >
          Call Lead
        </NavLink>

        <NavLink
          to="/chat-leads"
          onClick={closeSidebar}
          className={({isActive}) => `nav-item ${isActive ? "active" : ""}`}
        >
          Chat Lead
        </NavLink>

        <NavLink
          to="/files"
          onClick={closeSidebar}
          className={({isActive}) => `nav-item ${isActive ? "active" : ""}`}
        >
          File Upload
        </NavLink>

      </nav>

    </aside>

  );

}