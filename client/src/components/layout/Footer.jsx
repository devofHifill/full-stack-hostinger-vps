import "./Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="app-footer-left">
        <strong>SEB Voice Monitor</strong>
        <span>Professional dashboard for SEB Mortgage operations.</span>
      </div>

      <div className="app-footer-right">
        <span>© {year} SEB Mortgage</span>
      </div>
    </footer>
  );
}