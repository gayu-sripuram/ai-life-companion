import { useEffect } from "react";
import AppShell from "../components/AppShell";
import { useAppContext } from "../state/AppContext";

function ExpenseSummaryPage() {
  const {
    expenseSummary,
    categoryBreakdown,
    financialInsights,
    lifeInsights,
    loading,
    loadExpenseSummary,
    fetchFinancialInsights,
    fetchLifeInsights,
  } = useAppContext();

  useEffect(() => {
    loadExpenseSummary();
  }, []);

  return (
    <AppShell title="Expense Summary" subtitle="Review this month's money picture and AI guidance." showBack>
      <main className="page-grid two-column">
        <section className="panel">
          <h2>Monthly Summary</h2>
          <div className="summary-stack">
            <div className="summary-card">
              <span>Total Income</span>
              <strong className="money-positive">{expenseSummary ? expenseSummary.total_income.toFixed(2) : "0.00"}</strong>
            </div>
            <div className="summary-card">
              <span>Total Expense</span>
              <strong className="money-negative">{expenseSummary ? expenseSummary.total_expense.toFixed(2) : "0.00"}</strong>
            </div>
            <div className="summary-card">
              <span>Balance</span>
              <strong>{expenseSummary ? expenseSummary.balance.toFixed(2) : "0.00"}</strong>
            </div>
          </div>
        </section>

        <section className="panel">
          <h2>Category Breakdown</h2>
          <div className="list-block">
            {categoryBreakdown.map((item) => (
              <div key={item.category} className="list-item compact">
                <strong>{item.category}</strong>
                <span>{item.total.toFixed(2)}</span>
              </div>
            ))}
            {categoryBreakdown.length === 0 ? <p className="empty-state">No expense breakdown yet.</p> : null}
          </div>
        </section>

        <section className="panel">
          <div className="section-head">
            <div>
              <h2>AI Financial Insights</h2>
              <p className="support-text">Based on the last 30 days of expense and income data.</p>
            </div>
            <button className="primary-button" type="button" onClick={fetchFinancialInsights} disabled={loading}>
              Generate
            </button>
          </div>
          {financialInsights ? (
            <div className="analysis-box">
              <p><strong>Insights:</strong> {financialInsights.insights}</p>
              <p><strong>Suggestions:</strong> {financialInsights.suggestions}</p>
            </div>
          ) : (
            <p className="empty-state">Generate insights when you have at least some recent expense data.</p>
          )}
        </section>

        <section className="panel">
          <div className="section-head">
            <div>
              <h2>AI Life Insights</h2>
              <p className="support-text">Combines mood, habits, and expenses to surface bigger patterns.</p>
            </div>
            <button className="primary-button" type="button" onClick={fetchLifeInsights} disabled={loading}>
              Generate
            </button>
          </div>
          {lifeInsights ? (
            <div className="analysis-box">
              <p>{lifeInsights.insights}</p>
            </div>
          ) : (
            <p className="empty-state">Generate cross-feature insights after you've logged some mood, habit, and expense data.</p>
          )}
        </section>
      </main>
    </AppShell>
  );
}

export default ExpenseSummaryPage;
