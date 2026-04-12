import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";

const cards = [
  {
    to: "/journal",
    badge: "J",
    title: "Journal",
    description: "Write entries, review past notes, and get an AI summary.",
  },
  {
    to: "/mood",
    badge: "M",
    title: "Mood Tracker",
    description: "Save one mood for today and look back on your recent history.",
  },
  {
    to: "/habits",
    badge: "H",
    title: "Habit Tracker",
    description: "Create habits, mark daily progress, and watch your streaks grow.",
  },
];

function DashboardPage() {
  return (
    <AppShell title="Dashboard" subtitle="Choose one area to focus on right now.">
      <main className="dashboard-home">
        <section className="card-grid">
          {cards.map((card) => (
            <Link key={card.to} to={card.to} className="feature-card">
              <div className="feature-badge">{card.badge}</div>
              <h2>{card.title}</h2>
              <p>{card.description}</p>
              <span className="feature-link">Open</span>
            </Link>
          ))}
        </section>
      </main>
    </AppShell>
  );
}

export default DashboardPage;
