import { useState } from 'react';
import { useBudget } from '../state/BudgetContext';
import { MONTH_NAMES } from '../utils/formatters';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#ec4899','#06b6d4','#8b5cf6','#14b8a6','#f43f5e','#a855f7'];
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getCatColor(catId, categories) {
  const idx = categories.findIndex(c => c.id === catId);
  return idx >= 0 ? COLORS[idx % COLORS.length] : '#64748b';
}

export default function CalendarView() {
  const { state, dispatch } = useBudget();
  const { activeBudgetId, budgets, selectedYear, selectedMonth } = state;
  const budget = budgets[activeBudgetId];

  const [selectedDay, setSelectedDay] = useState(null);

  const firstDow = new Date(selectedYear, selectedMonth - 1, 1).getDay();
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === selectedYear && today.getMonth() + 1 === selectedMonth;

  function dateStr(day) {
    return `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // Group expenses by actual calendar date within this month
  const byDate = {};
  budget.transactions.forEach(t => {
    if (t.type !== 'expense' || !t.date) return;
    const [y, m] = t.date.split('-').map(Number);
    if (y !== selectedYear || m !== selectedMonth) return;
    if (!byDate[t.date]) byDate[t.date] = [];
    byDate[t.date].push(t);
  });

  // Leading padding cells + day cells
  const cells = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selectedTxs = selectedDay ? (byDate[dateStr(selectedDay)] || []) : [];
  const selectedTotal = selectedTxs.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-4">
      {/* Grid */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {/* Day-of-week header */}
        <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-800/30">
          {DOW.map(d => (
            <div key={d} className="py-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (!day) {
              return (
                <div
                  key={`pad-${idx}`}
                  className="min-h-[110px] border-r border-b border-slate-800/60 bg-slate-950/20"
                />
              );
            }

            const ds = dateStr(day);
            const txs = byDate[ds] || [];
            const total = txs.reduce((s, t) => s + t.amount, 0);
            const isToday = isCurrentMonth && today.getDate() === day;
            const isSelected = selectedDay === day;
            const MAX_SHOW = 3;

            return (
              <div
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`min-h-[110px] p-2 border-r border-b border-slate-800/60 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-indigo-950/30 border-indigo-800/50'
                    : 'hover:bg-slate-800/30'
                }`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span
                    className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday
                        ? 'bg-indigo-600 text-white'
                        : isSelected
                        ? 'text-indigo-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {day}
                  </span>
                  {total > 0 && (
                    <span className="text-[10px] font-mono font-bold text-red-400 leading-none">
                      ${total % 1 === 0 ? total : total.toFixed(0)}
                    </span>
                  )}
                </div>

                <div className="space-y-0.5">
                  {txs.slice(0, MAX_SHOW).map(t => {
                    const catId = t.isSplit && t.splits?.length ? t.splits[0].catId : t.catId;
                    const color = getCatColor(catId, budget.categories);
                    return (
                      <div
                        key={t.id}
                        className="text-[10px] leading-tight px-1.5 py-0.5 rounded-sm truncate text-slate-300"
                        style={{ backgroundColor: color + '28', borderLeft: `2px solid ${color}` }}
                        title={`${t.payee || 'Expense'} — $${t.amount.toFixed(2)}`}
                      >
                        {t.payee || 'Expense'}
                      </div>
                    );
                  })}
                  {txs.length > MAX_SHOW && (
                    <div className="text-[10px] text-slate-500 pl-1.5">
                      +{txs.length - MAX_SHOW} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day detail panel */}
      {selectedDay && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 bg-slate-800/40 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-200">
              {selectedDay} {MONTH_NAMES[selectedMonth - 1].charAt(0) + MONTH_NAMES[selectedMonth - 1].slice(1).toLowerCase()}{' '}
              {selectedYear}
            </h3>
            <div className="flex items-center gap-3">
              {selectedTxs.length > 0 && (
                <span className="text-sm font-mono font-bold text-red-400">
                  −${selectedTotal.toFixed(2)}
                </span>
              )}
              <button
                onClick={() => setSelectedDay(null)}
                className="text-slate-500 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
          </div>

          {selectedTxs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No expenses on this day.</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {selectedTxs.map(t => {
                const catId = t.isSplit && t.splits?.length ? t.splits[0].catId : t.catId;
                const color = getCatColor(catId, budget.categories);
                const catName = t.isSplit
                  ? t.splits.map(s => budget.categories.find(c => c.id === s.catId)?.name || '?').join(', ')
                  : (budget.categories.find(c => c.id === t.catId)?.name || 'Unassigned');

                return (
                  <div key={t.id} className="px-4 py-3 flex justify-between items-center gap-4 hover:bg-slate-800/30 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-slate-200 truncate">
                          {t.payee || 'No Payee'}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          <span style={{ color }}>{catName}</span>
                          {t.concept && <span className="text-slate-600"> · {t.concept}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-sm text-red-400">
                        −${t.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => dispatch({ type: 'OPEN_MODAL', modal: 'editTransaction', data: { id: t.id } })}
                        className="text-slate-500 hover:text-indigo-400 p-1 transition"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => dispatch({ type: 'OPEN_MODAL', modal: 'deleteExpense', data: { id: t.id } })}
                        className="text-slate-500 hover:text-red-400 p-1 transition"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
