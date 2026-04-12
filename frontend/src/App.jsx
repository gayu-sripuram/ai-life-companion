import { useEffect, useState } from "react";
import api from "./api";

const moods = [
  { value: "happy", emoji: "😊", label: "Happy" },
  { value: "okay", emoji: "🙂", label: "Okay" },
  { value: "sad", emoji: "😔", label: "Sad" },
  { value: "worst", emoji: "😭", label: "Worst" },
];

const emptyAuth = { email: "", password: "" };

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(emptyAuth);
  const [journalText, setJournalText] = useState("");
  const [journalEntries, setJournalEntries] = useState([]);
  const [moodHistory, setMoodHistory] = useState([]);
  const [habits, setHabits] = useState([]);
  const [habitTitle, setHabitTitle] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      loadDashboard();
    }
  }, [token]);

  const loadDashboard = async () => {
    try {
      const [journalRes, moodRes, habitRes] = await Promise.all([
        api.get("/journal/"),
        api.get("/moods/"),
        api.get("/habits/"),
      ]);
      setJournalEntries(journalRes.data);
      setMoodHistory(moodRes.data);
      setHabits(habitRes.data);
    } catch (error) {
      handleApiError(error, "Could not load dashboard data");
    }
  };

  const handleApiError = (error, fallback) => {
    const detail = error?.response?.data?.detail;
    setMessage(detail || fallback);
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/signup";
      const response = await api.post(endpoint, authForm);
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setToken(response.data.access_token);
      setUser(response.data.user);
      setAuthForm(emptyAuth);
    } catch (error) {
      handleApiError(error, "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    setJournalEntries([]);
    setMoodHistory([]);
    setHabits([]);
    setAnalysis(null);
    setMessage("");
  };

  const addJournalEntry = async (event) => {
    event.preventDefault();
    if (!journalText.trim()) return;

    setLoading(true);
    setMessage("");
    try {
      await api.post("/journal/", { content: journalText });
      try {
        const analysisResponse = await api.post("/ai/analyze-journal", { text: journalText });
        setAnalysis(analysisResponse.data);
        setMessage("Journal entry saved and analyzed.");
      } catch (analysisError) {
        setAnalysis(null);
        const detail = analysisError?.response?.data?.detail;
        setMessage(detail ? `Journal saved. AI analysis skipped: ${detail}` : "Journal saved, but AI analysis failed.");
      }
      setJournalText("");
      await loadDashboard();
    } catch (error) {
      handleApiError(error, "Could not save journal entry");
    } finally {
      setLoading(false);
    }
  };

  const saveMood = async (mood) => {
    setLoading(true);
    setMessage("");
    try {
      await api.post("/moods/", { mood });
      await loadDashboard();
      setMessage("Mood saved for today.");
    } catch (error) {
      handleApiError(error, "Could not save mood");
    } finally {
      setLoading(false);
    }
  };

  const addHabit = async (event) => {
    event.preventDefault();
    if (!habitTitle.trim()) return;

    setLoading(true);
    setMessage("");
    try {
      await api.post("/habits/", { title: habitTitle });
      setHabitTitle("");
      await loadDashboard();
      setMessage("Habit created.");
    } catch (error) {
      handleApiError(error, "Could not create habit");
    } finally {
      setLoading(false);
    }
  };

  const toggleHabit = async (habitId, completed) => {
    setLoading(true);
    setMessage("");
    try {
      await api.post(`/habits/${habitId}/toggle`, { completed });
      await loadDashboard();
    } catch (error) {
      handleApiError(error, "Could not update habit");
    } finally {
      setLoading(false);
    }
  };

  if (!token || !user) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <p className="eyebrow">Phase 1 MVP</p>
          <h1>AI Life Companion</h1>
          <p className="intro">Track your journal, mood, and habits in one simple space.</p>

          <div className="auth-toggle">
            <button
              className={authMode === "login" ? "active" : ""}
              onClick={() => setAuthMode("login")}
              type="button"
            >
              Login
            </button>
            <button
              className={authMode === "signup" ? "active" : ""}
              onClick={() => setAuthMode("signup")}
              type="button"
            >
              Signup
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="panel">
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
                placeholder="Enter your password"
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

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1>{user.email}</h1>
        </div>
        <button onClick={handleLogout} className="secondary-button" type="button">
          Logout
        </button>
      </header>

      {message ? <p className="message banner">{message}</p> : null}

      <main className="dashboard-grid">
        <section className="panel">
          <h2>Journal</h2>
          <form onSubmit={addJournalEntry}>
            <textarea
              rows="6"
              value={journalText}
              onChange={(event) => setJournalText(event.target.value)}
              placeholder="Write about your day..."
            />
            <button className="primary-button" disabled={loading} type="submit">
              Save Entry + Analyze
            </button>
          </form>

          {analysis ? (
            <div className="analysis-box">
              <h3>AI Reflection</h3>
              <p><strong>Summary:</strong> {analysis.summary}</p>
              <p><strong>Sentiment:</strong> {analysis.sentiment}</p>
            </div>
          ) : null}

          <div className="list-block">
            {journalEntries.map((entry) => (
              <article key={entry.id} className="list-item">
                <p>{entry.content}</p>
                <span>{new Date(entry.created_at).toLocaleString()}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Mood Tracker</h2>
          <div className="mood-row">
            {moods.map((mood) => (
              <button key={mood.value} type="button" className="mood-button" onClick={() => saveMood(mood.value)}>
                <span>{mood.emoji}</span>
                {mood.label}
              </button>
            ))}
          </div>
          <div className="list-block">
            {moodHistory.map((entry) => (
              <div key={entry.id} className="list-item compact">
                <strong>{entry.mood}</strong>
                <span>{entry.entry_date}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Habit Tracker</h2>
          <form onSubmit={addHabit} className="habit-form">
            <input
              type="text"
              value={habitTitle}
              onChange={(event) => setHabitTitle(event.target.value)}
              placeholder="Add a new habit"
            />
            <button className="primary-button" type="submit" disabled={loading}>
              Add Habit
            </button>
          </form>

          <div className="list-block">
            {habits.map((habit) => (
              <label key={habit.id} className="list-item habit-item">
                <input
                  type="checkbox"
                  checked={habit.completed_today}
                  onChange={(event) => toggleHabit(habit.id, event.target.checked)}
                />
                <div>
                  <strong>{habit.title}</strong>
                  <span>{habit.streak} day streak</span>
                </div>
              </label>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
