import { useBudget } from '../../state/BudgetContext';
import { getMonthKey } from '../../state/reducer';
import { getBudgetCycle } from '../../utils/budgetCycle';
import { MONTH_NAMES } from '../../utils/formatters';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#ec4899','#06b6d4','#8b5cf6','#14b8a6','#f43f5e','#a855f7'];

export default function ReportsModal() {
  const { state, dispatch } = useBudget();
  const { modals, activeBudgetId, budgets, settings, selectedYear, selectedMonth } = state;

  if (!modals.reports) return null;

  const budget = budgets[activeBudgetId];
  const mKey = getMonthKey(selectedYear, selectedMonth);
  const budgetName = activeBudgetId === 'personal' ? settings.personalName : settings.jointName;

  const mExpenses = budget.transactions.filter(
    t => t.type === 'expense' && getBudgetCycle(t.date, settings) === mKey
  );

  const totalSpent = mExpenses.reduce((s, t) => s + t.amount, 0);
  const avg = mExpenses.length > 0 ? totalSpent / mExpenses.length : 0;

  const catSpent = {};
  budget.categories.forEach(c => { catSpent[c.id] = { name: c.name, amount: 0 }; });
  mExpenses.forEach(t => {
    if (t.isSplit && t.splits) {
      t.splits.forEach(s => { if (catSpent[s.catId]) catSpent[s.catId].amount += s.amount; });
    } else if (t.catId && catSpent[t.catId]) {
      catSpent[t.catId].amount += t.amount;
    }
  });

  const activeCategories = Object.values(catSpent)
    .filter(c => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  let gradientParts = [];
  let cum = 0;
  const withPct = activeCategories.map((cat, idx) => {
    const pct = totalSpent > 0 ? (cat.amount / totalSpent) * 100 : 0;
    const color = COLORS[idx % COLORS.length];
    const next = cum + pct;
    gradientParts.push(`${color} ${cum.toFixed(1)}% ${next.toFixed(1)}%`);
    cum = next;
    return { ...cat, pct, color };
  });

  const pieStyle = activeCategories.length > 0
    ? `conic-gradient(${gradientParts.join(', ')})`
    : 'conic-gradient(#1e293b 0% 100%)';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 modal-backdrop">
      <div className="bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Monthly Report</h2>
            <p className="text-xs text-indigo-400 font-bold tracking-widest uppercase">
              {MONTH_NAMES[selectedMonth - 1]} {selectedYear} — {budgetName}
            </p>
          </div>
          <button onClick={() => dispatch({ type: 'CLOSE_MODAL', modal: 'reports' })} className="text-slate-500 hover:text-white">✕</button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Expenses" value={mExpenses.length} valueClass="text-indigo-400" />
            <StatCard label="Expended" value={`$${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} valueClass="text-red-400" />
            <StatCard label="Average" value={`$${avg.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} valueClass="text-emerald-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-4">
            <div className="flex flex-col items-center justify-center">
              <div
                className="w-48 h-48 rounded-full border border-slate-800 shadow-xl flex items-center justify-center relative"
                style={{ background: pieStyle }}
              >
                <div className="w-28 h-28 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800/50">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">Share</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category Breakdown</h3>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {withPct.length === 0 ? (
                  <div className="text-xs text-slate-500 text-center py-8">No expenses found for this period.</div>
                ) : withPct.map((cat, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-slate-300 font-medium truncate max-w-[150px]">{cat.name}</span>
                    </div>
                    <div className="text-right font-mono text-slate-400">
                      <span>${cat.amount.toFixed(2)}</span>
                      <span className="text-slate-500 text-[10px] ml-1">({cat.pct.toFixed(0)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, valueClass }) {
  return (
    <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl text-center">
      <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">{label}</span>
      <span className={`text-2xl md:text-3xl font-black font-mono ${valueClass}`}>{value}</span>
    </div>
  );
}
