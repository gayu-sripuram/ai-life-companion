import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../state/AppContext";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/journal", label: "Journal" },
  { to: "/mood", label: "Mood" },
  { to: "/habits", label: "Habits" },
];

function AppShell({ title, subtitle, children, showBack = false }) {
  const { user, logout, message } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <header className="topbar panel">
        <div>
          <p className="eyebrow">AI Life Companion</p>
          <h1>{title}</h1>
          {subtitle ? <p className="intro">{subtitle}</p> : null}
        </div>
        <div className="topbar-actions">
          {showBack ? (
            <button type="button" className="secondary-button" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          ) : null}
          <button onClick={logout} className="secondary-button" type="button">
            Logout
          </button>
        </div>
      </header>

      <nav className="nav-tabs">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={location.pathname === link.to ? "nav-tab active" : "nav-tab"}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="user-line">
        <span>Signed in as {user?.email}</span>
      </div>

      {message ? <p className="message banner">{message}</p> : null}

      {children}
    </div>
  );
}

export default AppShell;
