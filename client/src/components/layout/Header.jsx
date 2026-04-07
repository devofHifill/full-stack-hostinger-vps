import "./Header.css";

export default function Header({ toggleSidebar }) {
  return (
    <header className="app-header">
      <div className="app-header-left">
        <button
          className="app-header-menu-btn"
          onClick={toggleSidebar}
          aria-label="Open sidebar"
          type="button"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className="app-header-copy">
          <h1>SEB Voice Monitor</h1>
          <p>Monitor call activity, chat engagement, leads, and workflow operations.</p>
        </div>
      </div>

      <div className="app-header-right">
        <div className="header-status-card">
          <span className="status-dot"></span>
          <div>
            <strong>System Active</strong>
            <small>Dashboard ready</small>
          </div>
        </div>
      </div>
    </header>
  );
}