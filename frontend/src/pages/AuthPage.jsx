import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../state/AppContext";

const emptyAuth = { email: "", password: "" };

function AuthPage() {
  const navigate = useNavigate();
  const { authenticate, loading, message } = useAppContext();
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(emptyAuth);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await authenticate(authMode, authForm);
    if (result.success) {
      setAuthForm(result.nextForm);
      navigate("/dashboard");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Phase 1 MVP</p>
        <h1>AI Life Companion</h1>
        <p className="intro">Track your journal, mood, and habits in a calmer, cleaner space.</p>

        <div className="auth-toggle">
          <button className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")} type="button">
            Login
          </button>
          <button className={authMode === "signup" ? "active" : ""} onClick={() => setAuthMode("signup")} type="button">
            Signup
          </button>
        </div>

        <form onSubmit={handleSubmit} className="panel">
          <label>
            Email
            <input
              type="email"
              value={authForm.email}
              onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
              placeholder="you@example.com"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={authForm.password}
              onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
              placeholder="Use 6 to 72 characters"
              required
            />
          </label>
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Please wait..." : authMode === "login" ? "Login" : "Create account"}
          </button>
        </form>

        {message ? <p className="message">{message}</p> : null}
      </div>
    </div>
  );
}

export default AuthPage;
