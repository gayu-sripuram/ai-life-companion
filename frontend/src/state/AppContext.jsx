import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api";

const AppContext = createContext(null);
const emptyAuth = { email: "", password: "" };

export function AppProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [journalEntries, setJournalEntries] = useState([]);
  const [moodHistory, setMoodHistory] = useState([]);
  const [habits, setHabits] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  const handleApiError = (error, fallback) => {
    const detail = error?.response?.data?.detail;
    setMessage(detail || fallback);
  };

  const loadDashboardData = async () => {
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

  const authenticate = async (mode, authForm) => {
    setLoading(true);
    setMessage("");
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const response = await api.post(endpoint, authForm);
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setToken(response.data.access_token);
      setUser(response.data.user);
      return { success: true, nextForm: emptyAuth };
    } catch (error) {
      handleApiError(error, "Authentication failed");
      return { success: false, nextForm: authForm };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
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

  const addJournalEntry = async (journalText) => {
    if (!journalText.content.trim()) {
      return false;
    }

    setLoading(true);
    setMessage("");
    try {
      await api.post("/journal/", journalText);
      await loadDashboardData();
      setMessage("Journal entry saved.");
      return true;
    } catch (error) {
      handleApiError(error, "Could not save journal entry");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateJournalEntry = async (entryId, payload) => {
    if (!payload.content.trim()) {
      return false;
    }

    setLoading(true);
    setMessage("");
    try {
      await api.put(`/journal/${entryId}`, payload);
      await loadDashboardData();
      setMessage("Journal entry updated.");
      return true;
    } catch (error) {
      handleApiError(error, "Could not update journal entry");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteJournalEntry = async (entryId) => {
    setLoading(true);
    setMessage("");
    try {
      await api.delete(`/journal/${entryId}`);
      await loadDashboardData();
      setMessage("Journal entry deleted.");
      return true;
    } catch (error) {
      handleApiError(error, "Could not delete journal entry");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const saveMood = async (mood) => {
    setLoading(true);
    setMessage("");
    try {
      await api.post("/moods/", { mood });
      await loadDashboardData();
      setMessage("Mood saved for today.");
    } catch (error) {
      handleApiError(error, "Could not save mood");
    } finally {
      setLoading(false);
    }
  };

  const addHabit = async (habitTitle) => {
    if (!habitTitle.title.trim()) {
      return false;
    }

    setLoading(true);
    setMessage("");
    try {
      await api.post("/habits/", habitTitle);
      await loadDashboardData();
      setMessage("Habit created.");
      return true;
    } catch (error) {
      handleApiError(error, "Could not create habit");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateHabit = async (habitId, payload) => {
    if (!payload.title.trim()) {
      return false;
    }

    setLoading(true);
    setMessage("");
    try {
      await api.put(`/habits/${habitId}`, payload);
      await loadDashboardData();
      setMessage("Habit updated.");
      return true;
    } catch (error) {
      handleApiError(error, "Could not update habit");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteHabit = async (habitId) => {
    setLoading(true);
    setMessage("");
    try {
      await api.delete(`/habits/${habitId}`);
      await loadDashboardData();
      setMessage("Habit deleted.");
      return true;
    } catch (error) {
      handleApiError(error, "Could not delete habit");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleHabit = async (habitId, completed) => {
    setLoading(true);
    setMessage("");
    try {
      await api.post(`/habits/${habitId}/toggle`, { completed });
      await loadDashboardData();
    } catch (error) {
      handleApiError(error, "Could not update habit");
    } finally {
      setLoading(false);
    }
  };

  const fetchMoodInsight = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await api.get("/ai/mood-insights");
      setAnalysis(response.data);
      setMessage("Mood insight generated.");
      return true;
    } catch (error) {
      handleApiError(error, "Could not generate mood insight");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      token,
      user,
      journalEntries,
      moodHistory,
      habits,
      analysis,
      loading,
      message,
      authenticate,
      logout,
      addJournalEntry,
      updateJournalEntry,
      deleteJournalEntry,
      saveMood,
      fetchMoodInsight,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleHabit,
    }),
    [token, user, journalEntries, moodHistory, habits, analysis, loading, message]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }
  return context;
}
