import { useState } from 'react';
import { useBudget } from '../state/BudgetContext';

export default function TemplatesPanel() {
  const { state, dispatch } = useBudget();
  const budget = state.budgets[state.activeBudgetId];

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [payee, setPayee] = useState('');
  const [catId, setCatId] = useState('');

  function handleSave() {
    if (!name.trim() || !payee.trim() || !catId) {
      return dispatch({ type: 'SHOW_TOAST', message: 'Required: Label, Payee, Category' });
    }
    dispatch({
      type: 'SAVE_TEMPLATE',
      template: { name: name.trim(), amount: parseFloat(amount) || null, payee: payee.trim(), catId: parseInt(catId) },
    });
    setName(''); setAmount(''); setPayee(''); setCatId('');
    setShowForm(false);
  }

  function handleApply(t) {
    dispatch({ type: 'APPLY_TEMPLATE', template: t });
  }

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex justify-between items-center">
        Templates
        <button
          onClick={() => setShowForm(v => !v)}
          className="bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 px-3 py-1 rounded-md text-xs font-bold transition"
        >
          {showForm ? 'Cancel' : '+ New'}
        </button>
      </h2>

      {showForm && (
        <div className="mb-6 p-5 bg-slate-800/50 rounded-2xl border border-slate-700 space-y-4">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Label..." className="w-full bg-slate-900 p-3 rounded-xl text-sm border border-slate-700" />
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" className="w-full bg-slate-900 p-3 rounded-xl text-sm border border-slate-700" />
          <input type="text" value={payee} onChange={e => setPayee(e.target.value)} placeholder="Payee" className="w-full bg-slate-900 p-3 rounded-xl text-sm border border-slate-700" />
          <select value={catId} onChange={e => setCatId(e.target.value)} className="w-full bg-slate-900 p-3 rounded-xl text-sm border border-slate-700">
            <option value="">Select Category</option>
            {budget.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={handleSave} className="w-full bg-indigo-600 py-3 rounded-xl text-sm font-bold shadow-lg">
            Save Template
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {budget.templates.map(t => (
          <div
            key={t.id}
            onClick={() => handleApply(t)}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-2 cursor-pointer transition"
          >
            <span>{t.name}</span>
            {t.amount && <span className="text-[10px] text-indigo-400 font-mono">${t.amount}</span>}
            <button
              onClick={e => { e.stopPropagation(); dispatch({ type: 'OPEN_MODAL', modal: 'deleteTemplate', data: { id: t.id } }); }}
              className="text-slate-500 hover:text-red-400 font-bold ml-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
