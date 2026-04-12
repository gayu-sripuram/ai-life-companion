import { useState } from "react";
import AppShell from "../components/AppShell";
import { useAppContext } from "../state/AppContext";

function JournalPage() {
  const { journalEntries, loading, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useAppContext();
  const [journalForm, setJournalForm] = useState({ content: "", is_private: true });
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({ content: "", is_private: true });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const saved = await addJournalEntry(journalForm);
    if (saved) {
      setJournalForm({ content: "", is_private: true });
    }
  };

  const startEditing = (entry) => {
    setEditingId(entry.id);
    setEditingForm({ content: entry.content, is_private: entry.is_private });
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    const updated = await updateJournalEntry(editingId, editingForm);
    if (updated) {
      setEditingId(null);
      setEditingForm({ content: "", is_private: true });
    }
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm("Delete this journal entry? This cannot be undone.")) {
      return;
    }
    await deleteJournalEntry(entryId);
  };

  return (
    <AppShell title="Journal" subtitle="Write freely and choose whether each entry stays private from AI." showBack>
      <main className="page-grid single-column">
        <section className="panel">
          <h2>New Entry</h2>
          <form onSubmit={handleSubmit}>
            <textarea
              rows="8"
              value={journalForm.content}
              onChange={(event) => setJournalForm({ ...journalForm, content: event.target.value })}
              placeholder="Write about your day..."
            />
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={!journalForm.is_private}
                onChange={(event) =>
                  setJournalForm({ ...journalForm, is_private: !event.target.checked })
                }
              />
              <span>Allow AI insights for this entry</span>
            </label>
            <button className="primary-button" disabled={loading} type="submit">
              Save Entry
            </button>
          </form>
        </section>

        <section className="panel">
          <h2>Past Entries</h2>
          <div className="list-block">
            {journalEntries.map((entry) =>
              editingId === entry.id ? (
                <form key={entry.id} className="list-item" onSubmit={handleUpdate}>
                  <textarea
                    rows="6"
                    value={editingForm.content}
                    onChange={(event) => setEditingForm({ ...editingForm, content: event.target.value })}
                  />
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={!editingForm.is_private}
                      onChange={(event) =>
                        setEditingForm({ ...editingForm, is_private: !event.target.checked })
                      }
                    />
                    <span>Allow AI insights for this entry</span>
                  </label>
                  <div className="action-row">
                    <button className="primary-button" type="submit" disabled={loading}>
                      Save Changes
                    </button>
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <article key={entry.id} className="list-item">
                  <div className="item-header">
                    <strong>{entry.is_private ? "Private Entry" : "AI Allowed"}</strong>
                    <span>{new Date(entry.created_at).toLocaleString()}</span>
                  </div>
                  <p>{entry.content}</p>
                  <div className="action-row">
                    <button className="secondary-button" type="button" onClick={() => startEditing(entry)}>
                      Edit
                    </button>
                    <button className="danger-button" type="button" onClick={() => handleDelete(entry.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              )
            )}
            {journalEntries.length === 0 ? <p className="empty-state">No journal entries yet.</p> : null}
          </div>
        </section>
      </main>
    </AppShell>
  );
}

export default JournalPage;
