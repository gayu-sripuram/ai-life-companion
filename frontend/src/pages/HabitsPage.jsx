import { useState } from "react";
import AppShell from "../components/AppShell";
import { useAppContext } from "../state/AppContext";

function HabitsPage() {
  const { habits, loading, addHabit, updateHabit, deleteHabit, toggleHabit } = useAppContext();
  const [habitForm, setHabitForm] = useState({ title: "", details: "" });
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({ title: "", details: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const created = await addHabit(habitForm);
    if (created) {
      setHabitForm({ title: "", details: "" });
    }
  };

  const startEditing = (habit) => {
    setEditingId(habit.id);
    setEditingForm({ title: habit.title, details: habit.details || "" });
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    const updated = await updateHabit(editingId, editingForm);
    if (updated) {
      setEditingId(null);
      setEditingForm({ title: "", details: "" });
    }
  };

  const handleDelete = async (habitId) => {
    if (!window.confirm("Delete this habit and its streak history?")) {
      return;
    }
    await deleteHabit(habitId);
  };

  return (
    <AppShell title="Habit Tracker" subtitle="Build a routine one small checkmark at a time." showBack>
      <main className="page-grid two-column">
        <section className="panel">
          <h2>Create a Habit</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={habitForm.title}
              onChange={(event) => setHabitForm({ ...habitForm, title: event.target.value })}
              placeholder="Add a new habit"
            />
            <textarea
              rows="4"
              value={habitForm.details}
              onChange={(event) => setHabitForm({ ...habitForm, details: event.target.value })}
              placeholder="Add optional details or motivation"
            />
            <button className="primary-button" type="submit" disabled={loading}>
              Add Habit
            </button>
          </form>
        </section>

        <section className="panel">
          <h2>Your Habits</h2>
          <div className="list-block">
            {habits.map((habit) =>
              editingId === habit.id ? (
                <form key={habit.id} className="list-item" onSubmit={handleUpdate}>
                  <input
                    type="text"
                    value={editingForm.title}
                    onChange={(event) => setEditingForm({ ...editingForm, title: event.target.value })}
                    placeholder="Habit name"
                  />
                  <textarea
                    rows="4"
                    value={editingForm.details}
                    onChange={(event) => setEditingForm({ ...editingForm, details: event.target.value })}
                    placeholder="Habit details"
                  />
                  <div className="action-row">
                    <button className="primary-button" type="submit" disabled={loading}>
                      Save Changes
                    </button>
                    <button className="secondary-button" type="button" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div key={habit.id} className="list-item">
                  <label className="habit-item">
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
                  {habit.details ? <p className="support-text">{habit.details}</p> : null}
                  <div className="action-row">
                    <button className="secondary-button" type="button" onClick={() => startEditing(habit)}>
                      Edit
                    </button>
                    <button className="danger-button" type="button" onClick={() => handleDelete(habit.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              )
            )}
            {habits.length === 0 ? <p className="empty-state">No habits created yet.</p> : null}
          </div>
        </section>
      </main>
    </AppShell>
  );
}

export default HabitsPage;
