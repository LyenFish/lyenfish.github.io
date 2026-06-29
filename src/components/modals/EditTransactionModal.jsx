import { useState, useEffect } from 'react';
import { useBudget } from '../../state/BudgetContext';

export default function EditTransactionModal() {
  const { state, dispatch } = useBudget();
  const { open, id } = state.modals.editTransaction;

  const budget = state.budgets[state.activeBudgetId];
  const tx = open ? budget.transactions.find(t => Number(t.id) === Number(id)) : null;

  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [payee, setPayee] = useState('');
  const [concept, setConcept] = useState('');
  const [catId, setCatId] = useState('');
  const [splits, setSplits] = useState([]);

  useEffect(() => {
    if (!tx) return;
    setDate(tx.date || '');
    setAmount(String(tx.amount));
    setPayee(tx.payee || '');
    setConcept(tx.concept || '');
    setCatId(tx.catId ? String(tx.catId) : '');
    setSplits(tx.isSplit && tx.splits ? tx.splits.map(s => ({ ...s })) : []);
  }, [open, id]);

  if (!open || !tx) return null;

  const isExpense = tx.type === 'expense';
  const totalAmt = parseFloat(amount) || 0;
  const splitSum = splits.reduce((s, r) => s + (r.amount || 0), 0);
  const remainder = totalAmt - splitSum;
  const balanced = Math.abs(remainder) < 0.01;

  function handleSave() {
    const newAmt = parseFloat(amount);
    if (isNaN(newAmt) || newAmt <= 0) return dispatch({ type: 'SHOW_TOAST', message: 'Amount must be greater than zero' });
    if (!date) return dispatch({ type: 'SHOW_TOAST', message: 'Date is required' });
    if (tx.isSplit && splits.length > 0 && !balanced) {
      return dispatch({ type: 'SHOW_TOAST', message: `Total must match sum of splits ($${splitSum.toFixed(2)})` });
    }

    const changes = { date, amount: newAmt, payee, concept };
    if (tx.isSplit) {
      changes.splits = splits;
    } else if (isExpense && catId) {
      changes.catId = parseInt(catId);
    }

    dispatch({ type: 'EDIT_TRANSACTION', id, ...changes });
    dispatch({ type: 'CLOSE_MODAL', modal: 'editTransaction' });
    dispatch({ type: 'SHOW_TOAST', message: 'Transaction updated' });
  }

  function close() {
    dispatch({ type: 'CLOSE_MODAL', modal: 'editTransaction' });
  }

  const inputCls = 'w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white focus:outline-none focus:border-indigo-500';
  const labelCls = 'block text-xs font-bold text-slate-500 uppercase mb-1';

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 modal-backdrop">
      <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h3 className="text-lg font-bold">Edit Transaction</h3>
          <button onClick={close} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="overflow-y-auto p-6 space-y-4 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Amount ($)</label>
              <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className={`${inputCls} font-mono font-bold text-lg`} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Payee</label>
            <input type="text" value={payee} onChange={e => setPayee(e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Concept / Notes</label>
            <input type="text" value={concept} onChange={e => setConcept(e.target.value)} className={inputCls} />
          </div>

          {isExpense && !tx.isSplit && (
            <div>
              <label className={labelCls}>Category</label>
              <select value={catId} onChange={e => setCatId(e.target.value)} className={inputCls}>
                <option value="">Select Category</option>
                {budget.categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {tx.isSplit && splits.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Splits</span>
                <span className={`text-[10px] font-mono ${balanced ? 'text-emerald-400' : 'text-red-400'}`}>
                  Remainder: ${remainder.toFixed(2)}
                </span>
              </div>
              {splits.map((s, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-2">
                  <select
                    value={s.catId}
                    onChange={e => setSplits(prev => prev.map((r, i) => i === idx ? { ...r, catId: parseInt(e.target.value) } : r))}
                    className="bg-slate-800 border border-slate-700 p-2 rounded-lg text-xs text-white focus:outline-none"
                  >
                    <option value="">Select Category</option>
                    {budget.categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    value={s.amount}
                    onChange={e => setSplits(prev => prev.map((r, i) => i === idx ? { ...r, amount: parseFloat(e.target.value) || 0 } : r))}
                    className="bg-slate-800 border border-slate-700 p-2 rounded-lg text-xs font-mono text-right text-white"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 p-6 border-t border-slate-800">
          <button onClick={close} className="bg-slate-800 text-slate-300 py-3 rounded-xl font-bold hover:bg-slate-700 transition">Cancel</button>
          <button onClick={handleSave} className="bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-500 transition">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
