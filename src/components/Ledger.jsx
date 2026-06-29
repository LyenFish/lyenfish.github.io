import { useState } from 'react';
import { useBudget } from '../state/BudgetContext';
import { formatLedgerDate } from '../utils/formatters';

export default function Ledger() {
  const { state, dispatch } = useBudget();
  const { activeBudgetId, budgets, ledgerFilterCatId } = state;
  const budget = budgets[activeBudgetId];
  const [search, setSearch] = useState('');

  let txs = [...budget.transactions];

  if (ledgerFilterCatId) {
    txs = txs.filter(t => {
      if (t.isSplit && t.splits) return t.splits.some(s => s.catId === ledgerFilterCatId);
      return t.catId === ledgerFilterCatId;
    });
  }

  if (search) {
    const q = search.toLowerCase();
    txs = txs.filter(t => {
      const payeeMatch = (t.payee || '').toLowerCase().includes(q);
      const conceptMatch = (t.concept || '').toLowerCase().includes(q);
      const amtMatch = String(t.amount).includes(q);
      const catMatch = t.isSplit
        ? t.splits.some(s => (budget.categories.find(c => c.id === s.catId)?.name || '').toLowerCase().includes(q))
        : (budget.categories.find(c => c.id === t.catId)?.name || '').toLowerCase().includes(q);
      return payeeMatch || conceptMatch || amtMatch || catMatch;
    });
  }

  txs.sort((a, b) => {
    const diff = new Date(b.date) - new Date(a.date);
    return diff !== 0 ? diff : b.id - a.id;
  });

  const filterName = ledgerFilterCatId
    ? budget.categories.find(c => c.id === ledgerFilterCatId)?.name || ''
    : 'All';

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
      <div
        className="p-4 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center cursor-pointer"
        onClick={() => dispatch({ type: 'CLEAR_LEDGER_FILTER' })}
      >
        <h2 className="font-bold text-slate-300">
          History: <span className="text-indigo-400">{filterName}</span>
        </h2>
        <span className="text-[10px] text-slate-500 uppercase font-black px-2 py-1 bg-slate-900 rounded border border-slate-700">
          {txs.length}
        </span>
      </div>

      <div className="p-3 border-b border-slate-800">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search history..."
          className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {txs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No transactions logged.</div>
        ) : (
          txs.map(t => <LedgerItem key={t.id} tx={t} budget={budget} dispatch={dispatch} />)
        )}
      </div>
    </div>
  );
}

function LedgerItem({ tx, budget, dispatch }) {
  const isExpense = tx.type === 'expense';
  const amountClass = isExpense ? 'text-red-400' : 'text-emerald-400';
  const prefix = isExpense ? '-' : '+';

  let catLabel = null;
  if (isExpense) {
    if (tx.isSplit && tx.splits) {
      const parts = tx.splits.map(s => {
        const name = budget.categories.find(c => c.id === s.catId)?.name || 'Unknown';
        return `${name} ($${s.amount})`;
      }).join(', ');
      catLabel = (
        <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
          Split: {parts}
        </span>
      );
    } else {
      const name = budget.categories.find(c => c.id === tx.catId)?.name || 'Unassigned';
      catLabel = (
        <span className="bg-indigo-950/40 text-indigo-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
          {name}
        </span>
      );
    }
  } else {
    catLabel = (
      <span className="bg-emerald-950/40 text-emerald-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
        Income
      </span>
    );
  }

  return (
    <div className="p-4 border-b border-slate-800 hover:bg-slate-900/50 flex justify-between items-center gap-4 transition">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-mono text-slate-500">{formatLedgerDate(tx.date)}</span>
          {catLabel}
        </div>
        <div className="text-sm font-bold text-slate-200 truncate">{tx.payee || 'No Payee'}</div>
        <div className="text-xs text-slate-500 truncate">{tx.concept || ''}</div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`font-mono font-bold text-sm ${amountClass}`}>
          {prefix}${tx.amount.toFixed(2)}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => dispatch({ type: 'OPEN_MODAL', modal: 'editTransaction', data: { id: tx.id } })}
            className="text-slate-500 hover:text-indigo-400 p-1 transition"
            title="Edit Amount"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
            </svg>
          </button>
          <button
            onClick={() => dispatch({ type: 'OPEN_MODAL', modal: 'deleteExpense', data: { id: tx.id } })}
            className="text-slate-500 hover:text-red-400 p-1 transition"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
