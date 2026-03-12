import { NavLink } from "react-router-dom";

export default function Sidebar() {

  return (

    <aside className="sidebar">

      <div className="logo">SEBVM</div>

      <div className="org">
        it@sebmtg.com's Org
      </div>

      <div className="search">
        <input placeholder="Search" />
      </div>

      <nav>

        <NavLink
          to="/calls"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          Call Logs
        </NavLink>

        <NavLink
          to="/chat"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          Chat Logs
        </NavLink>

        <NavLink
          to="/call-leads"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          Call Lead
        </NavLink>

        <NavLink
          to="/chat-leads"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          Chat Lead
        </NavLink>

        <NavLink
          to="/files"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          File Upload
        </NavLink>

      </nav>

    </aside>

  );

}