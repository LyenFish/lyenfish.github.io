import { useState, useRef } from 'react';
import { useBudget } from '../state/BudgetContext';
import { getMonthKey } from '../state/reducer';
import { getBudgetCycle } from '../utils/budgetCycle';
import { fmtMoney } from '../utils/formatters';

export default function CategoryList() {
  const { state, dispatch } = useBudget();
  const { activeBudgetId, settings, budgets, selectedYear, selectedMonth, ledgerFilterCatId } = state;
  const budget = budgets[activeBudgetId];
  const isPersonal = activeBudgetId === 'personal';
  const mKey = getMonthKey(selectedYear, selectedMonth);

  // Local order lives here during a drag; null means "use global state"
  const [localOrder, setLocalOrder] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const lastOverId = useRef(null); // avoid redundant reorders on rapid mousemove

  const categories = localOrder || budget.categories;

  const mExpenses = budget.transactions.filter(
    t => t.type === 'expense' && getBudgetCycle(t.date, settings) === mKey
  );

  const catSpent = {};
  budget.categories.forEach(c => { catSpent[c.id] = 0; });
  mExpenses.forEach(t => {
    if (t.isSplit && t.splits) {
      t.splits.forEach(s => { if (catSpent[s.catId] !== undefined) catSpent[s.catId] += s.amount; });
    } else if (t.catId !== undefined && catSpent[t.catId] !== undefined) {
      catSpent[t.catId] += t.amount;
    }
  });

  function handleDragStart(e, id) {
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(id);
    setLocalOrder([...budget.categories]);
    lastOverId.current = id;
  }

  function handleDragOver(e, targetId) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!draggingId || draggingId === targetId || lastOverId.current === targetId) return;
    lastOverId.current = targetId;

    setLocalOrder(prev => {
      const cats = [...(prev || budget.categories)];
      const from = cats.findIndex(c => c.id === draggingId);
      const to = cats.findIndex(c => c.id === targetId);
      if (from === -1 || to === -1) return prev;
      const [moved] = cats.splice(from, 1);
      cats.splice(to, 0, moved);
      return cats;
    });
  }

  function handleDragEnd() {
    if (localOrder) {
      dispatch({ type: 'REORDER_CATEGORIES', categories: localOrder });
    }
    setDraggingId(null);
    setLocalOrder(null);
    lastOverId.current = null;
  }

  const accentBorder = isPersonal ? 'border-emerald-500' : 'border-indigo-500';
  const accentHoverText = isPersonal ? 'hover:text-emerald-400' : 'hover:text-indigo-400';

  return (
    <div className="space-y-4">
      {categories.map(c => {
        const assignedAmt = (budget.assignments[mKey] && budget.assignments[mKey][c.id]) || 0;
        const spentAmt = catSpent[c.id] || 0;
        const remainingAmt = assignedAmt - spentAmt;
        const percent = assignedAmt > 0 ? Math.min(100, (spentAmt / assignedAmt) * 100) : 0;
        const progressColor = percent >= 100 ? 'bg-red-500' : percent >= 85 ? 'bg-amber-500' : (isPersonal ? 'bg-emerald-500' : 'bg-indigo-500');
        const isFiltered = ledgerFilterCatId === c.id;
        const isDragging = draggingId === c.id;

        return (
          <div
            key={c.id}
            draggable
            onDragStart={e => handleDragStart(e, c.id)}
            onDragOver={e => handleDragOver(e, c.id)}
            onDragEnd={handleDragEnd}
            className={`bg-slate-900 border p-5 rounded-2xl shadow-sm transition-all duration-150 ${
              isFiltered ? `${accentBorder} bg-slate-900/80` : 'border-slate-800'
            } ${isDragging ? 'opacity-40 scale-[0.98] border-dashed border-indigo-600' : ''}`}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="drag-handle text-slate-600 hover:text-slate-300 text-lg select-none transition-colors" title="Drag to reorder">
                  ⠿
                </span>
                <button
                  onClick={() => dispatch({ type: 'FILTER_LEDGER', catId: c.id })}
                  className={`font-bold text-slate-100 ${accentHoverText} transition text-sm`}
                >
                  {c.name}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned:</span>
                <input
                  type="number"
                  step="0.01"
                  value={assignedAmt || ''}
                  onChange={e => dispatch({ type: 'UPDATE_ASSIGNED', catId: c.id, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-20 bg-slate-800 border border-slate-700 px-2 py-1 rounded text-right font-mono text-xs text-white"
                />
              </div>
            </div>
            <div className="flex justify-between items-baseline text-xs mb-2">
              <span className="text-slate-500 font-bold">
                Spent: <span className="text-slate-300 font-mono font-normal">${fmtMoney(spentAmt)}</span>
              </span>
              <span className={`font-bold ${remainingAmt < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                Left: <span className="font-mono font-normal">${fmtMoney(remainingAmt)}</span>
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className={`progress-bar ${progressColor} h-full`} style={{ width: `${percent}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
