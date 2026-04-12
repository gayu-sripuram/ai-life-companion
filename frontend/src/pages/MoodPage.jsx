import AppShell from "../components/AppShell";
import { useAppContext } from "../state/AppContext";

const moods = [
  { value: "happy", symbol: ":)", label: "Happy" },
  { value: "okay", symbol: ":|", label: "Okay" },
  { value: "sad", symbol: ":(", label: "Sad" },
  { value: "worst", symbol: ":'(", label: "Worst" },
];

function MoodPage() {
  const { moodHistory, analysis, loading, saveMood, fetchMoodInsight } = useAppContext();

  return (
    <AppShell title="Mood Tracker" subtitle="Save how today feels, then look for patterns over time." showBack>
      <main className="page-grid two-column">
        <section className="panel">
          <h2>How are you feeling today?</h2>
          <div className="mood-row">
            {moods.map((mood) => (
              <button
                key={mood.value}
                type="button"
                className="mood-button"
                onClick={() => saveMood(mood.value)}
                disabled={loading}
              >
                <span>{mood.symbol}</span>
                {mood.label}
              </button>
            ))}
          </div>
          <button className="primary-button insight-button" type="button" onClick={fetchMoodInsight} disabled={loading}>
            Get AI Mood Insight
          </button>
          <p className="support-text">AI now reads only your mood history. It does not use habits, and it skips private journal entries.</p>
          {analysis ? (
            <div className="analysis-box">
              <h3>Latest Mood Insight</h3>
              <p><strong>Summary:</strong> {analysis.summary}</p>
              <p><strong>Sentiment:</strong> {analysis.sentiment}</p>
            </div>
          ) : null}
        </section>

        <section className="panel">
          <h2>History</h2>
          <div className="list-block">
            {moodHistory.map((entry) => (
              <div key={entry.id} className="list-item compact">
                <strong>{entry.mood}</strong>
                <span>{entry.entry_date}</span>
              </div>
            ))}
            {moodHistory.length === 0 ? <p className="empty-state">No moods saved yet.</p> : null}
          </div>
        </section>
      </main>
    </AppShell>
  );
}

export default MoodPage;
