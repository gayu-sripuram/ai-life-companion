import { useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useAppContext } from "../state/AppContext";

const categories = ["Food", "Travel", "Shopping", "Bills", "Health", "Entertainment", "Salary", "Other"];
const emptyExpense = { amount: "", category: "Food", type: "expense", description: "" };

function ExpensePage() {
  const { expenses, loading, addExpense, updateExpense, deleteExpense } = useAppContext();
  const [expenseForm, setExpenseForm] = useState(emptyExpense);
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState(emptyExpense);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const created = await addExpense({
      ...expenseForm,
      amount: Number(expenseForm.amount),
    });
    if (created) {
      setExpenseForm(emptyExpense);
    }
  };

  const startEditing = (expense) => {
    setEditingId(expense.id);
    setEditingForm({
      amount: expense.amount,
      category: expense.category,
      type: expense.type,
      description: expense.description || "",
    });
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    const updated = await updateExpense(editingId, {
      ...editingForm,
      amount: Number(editingForm.amount),
    });
    if (updated) {
      setEditingId(null);
      setEditingForm(emptyExpense);
    }
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm("Delete this transaction?")) {
      return;
    }
    await deleteExpense(expenseId);
  };

  return (
    <AppShell title="Expenses" subtitle="Track money in and out, then review patterns from one place." showBack>
      <main className="page-grid two-column">
        <section className="panel">
          <div className="section-head">
            <div>
              <h2>Add Transaction</h2>
              <p className="support-text">Capture income and expenses with a category and note.</p>
            </div>
            <Link to="/expenses/summary" className="secondary-button inline-link">
              View Summary
            </Link>
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="number"
              min="0"
              step="0.01"
              value={expenseForm.amount}
              onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })}
              placeholder="Amount"
            />
            <div className="form-split">
              <label>
                Category
                <select
                  value={expenseForm.category}
                  onChange={(event) => setExpenseForm({ ...expenseForm, category: event.target.value })}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Type
                <select
                  value={expenseForm.type}
                  onChange={(event) => setExpenseForm({ ...expenseForm, type: event.target.value })}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>
            </div>
            <textarea
              rows="4"
              value={expenseForm.description}
              onChange={(event) => setExpenseForm({ ...expenseForm, description: event.target.value })}
              placeholder="Description (optional)"
            />
            <button className="primary-button" type="submit" disabled={loading}>
              Save Transaction
            </button>
          </form>
        </section>

        <section className="panel">
          <h2>Recent Transactions</h2>
          <div className="list-block">
            {expenses.map((expense) =>
              editingId === expense.id ? (
                <form key={expense.id} className="list-item" onSubmit={handleUpdate}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingForm.amount}
                    onChange={(event) => setEditingForm({ ...editingForm, amount: event.target.value })}
                  />
                  <div className="form-split">
                    <label>
                      Category
                      <select
                        value={editingForm.category}
                        onChange={(event) => setEditingForm({ ...editingForm, category: event.target.value })}
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Type
                      <select
                        value={editingForm.type}
                        onChange={(event) => setEditingForm({ ...editingForm, type: event.target.value })}
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                    </label>
                  </div>
                  <textarea
                    rows="4"
                    value={editingForm.description}
                    onChange={(event) => setEditingForm({ ...editingForm, description: event.target.value })}
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
                <article key={expense.id} className="list-item">
                  <div className="item-header">
                    <strong>{expense.type === "income" ? "Income" : "Expense"} • {expense.category}</strong>
                    <span>{new Date(expense.created_at).toLocaleString()}</span>
                  </div>
                  <p className={expense.type === "income" ? "money-positive" : "money-negative"}>
                    {expense.type === "income" ? "+" : "-"} {expense.amount.toFixed(2)}
                  </p>
                  {expense.description ? <p>{expense.description}</p> : null}
                  <div className="action-row">
                    <button className="secondary-button" type="button" onClick={() => startEditing(expense)}>
                      Edit
                    </button>
                    <button className="danger-button" type="button" onClick={() => handleDelete(expense.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              )
            )}
            {expenses.length === 0 ? <p className="empty-state">No transactions yet.</p> : null}
          </div>
        </section>
      </main>
    </AppShell>
  );
}

export default ExpensePage;
