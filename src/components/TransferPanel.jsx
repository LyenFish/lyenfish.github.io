import { useState } from 'react';
import { useBudget } from '../state/BudgetContext';

export default function TransferPanel() {
  const { state, dispatch } = useBudget();
  const budget = state.budgets[state.activeBudgetId];
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState('');

  function handleTransfer() {
    const from = parseInt(fromId);
    const to = parseInt(toId);
    const amt = parseFloat(amount) || 0;
    if (!from || !to) return dispatch({ type: 'SHOW_TOAST', message: 'Select both source & target categories' });
    if (from === to) return dispatch({ type: 'SHOW_TOAST', message: 'Categories must be different' });
    if (amt <= 0) return dispatch({ type: 'SHOW_TOAST', message: 'Transfer amount must be greater than zero' });
    dispatch({ type: 'TRANSFER_FUNDS', fromCatId: from, toCatId: to, amount: amt });
    dispatch({ type: 'SHOW_TOAST', message: `Transferred $${amt.toFixed(2)} successfully!` });
    setAmount('');
  }

  const options = budget.categories.map(c => (
    <option key={c.id} value={c.id}>{c.name}</option>
  ));

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Transfer Budget Funds</h2>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">From Category</label>
          <select
            value={fromId}
            onChange={e => setFromId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-xs text-white focus:outline-none"
          >
            <option value="">Select Category</option>
            {options}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">To Category</label>
          <select
            value={toId}
            onChange={e => setToId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-xs text-white focus:outline-none"
          >
            <option value="">Select Category</option>
            {options}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Amount ($)"
          className="flex-1 bg-slate-800 border border-slate-700 p-3 rounded-xl text-xs font-mono text-white focus:outline-none"
        />
        <button
          onClick={handleTransfer}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 rounded-xl text-xs font-bold transition"
        >
          Transfer
        </button>
      </div>
    </div>
  );
}
