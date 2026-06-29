import { useState, useEffect, useRef } from 'react';
import { useBudget } from '../state/BudgetContext';

function SplitRow({ idx, split, categories, onChange, onRemove }) {
  return (
    <div className="flex gap-2 items-center">
      <select
        value={split.catId}
        onChange={e => onChange(idx, 'catId', e.target.value)}
        className="bg-slate-800 border border-slate-700 p-2 rounded-lg text-xs flex-1 text-white"
      >
        <option value="">Select Category</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <input
        type="number"
        step="0.01"
        value={split.amount || ''}
        onChange={e => onChange(idx, 'amount', e.target.value)}
        placeholder="Amount"
        className="bg-slate-800 border border-slate-700 p-2 rounded-lg text-xs w-24 text-white font-mono"
      />
      <button onClick={() => onRemove(idx)} className="text-red-400 hover:text-red-300 text-xs px-2">✕</button>
    </div>
  );
}

export default function TransactionLogger() {
  const { state, dispatch } = useBudget();
  const { activeBudgetId, budgets, pendingTemplate } = state;
  const budget = budgets[activeBudgetId];

  const today = new Date().toISOString().split('T')[0];
  const [txType, setTxType] = useState('expense');
  const [date, setDate] = useState(today);
  const [amount, setAmount] = useState('');
  const [payee, setPayee] = useState('');
  const [concept, setConcept] = useState('');
  const [catId, setCatId] = useState('');
  const [isSplit, setIsSplit] = useState(false);
  const [splits, setSplits] = useState([{ catId: '', amount: '' }]);
  const [payeeOptions, setPayeeOptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const payeeRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setIsSplit(false);
    setSplits([{ catId: '', amount: '' }]);
  }, [activeBudgetId]);

  useEffect(() => {
    if (!pendingTemplate) return;
    setPayee(pendingTemplate.payee || '');
    setAmount(pendingTemplate.amount ? String(pendingTemplate.amount) : '');
    setCatId(String(pendingTemplate.catId || ''));
    setIsSplit(false);
    setSplits([{ catId: '', amount: '' }]);
    dispatch({ type: 'CLEAR_PENDING_TEMPLATE' });
  }, [pendingTemplate, dispatch]);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && e.target !== payeeRef.current) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  function getPayees() {
    return [...new Set(budget.transactions.map(t => t.payee).filter(Boolean))];
  }

  function handlePayeeFocus() {
    const all = getPayees();
    setPayeeOptions(all);
    if (all.length > 0) setShowDropdown(true);
  }

  function handlePayeeInput(val) {
    setPayee(val);
    if (!val) { setShowDropdown(false); return; }
    const filtered = getPayees().filter(p => p.toLowerCase().includes(val.toLowerCase()));
    setPayeeOptions(filtered);
    setShowDropdown(filtered.length > 0);
  }

  function selectPayee(p) {
    setPayee(p);
    setShowDropdown(false);
  }

  function updateSplit(idx, field, val) {
    setSplits(prev => prev.map((row, i) => {
      if (i !== idx) return row;
      return { ...row, [field]: field === 'catId' ? val : val };
    }));
  }

  function removeSplit(idx) {
    setSplits(prev => {
      const next = prev.filter((_, i) => i !== idx);
      return next.length === 0 ? [{ catId: '', amount: '' }] : next;
    });
  }

  const totalAmt = parseFloat(amount) || 0;
  const splitSum = splits.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const remainder = totalAmt - splitSum;

  function handleSubmit() {
    const amt = parseFloat(amount);
    if (!amt || isNaN(amt)) return dispatch({ type: 'SHOW_TOAST', message: 'Amount is required' });

    const tx = { type: txType, date, amount: amt, payee, concept };

    if (txType === 'expense') {
      if (isSplit) {
        if (Math.abs(splitSum - amt) > 0.01) {
          return dispatch({ type: 'SHOW_TOAST', message: `Splits ($${splitSum.toFixed(2)}) must equal total ($${amt.toFixed(2)})` });
        }
        tx.isSplit = true;
        tx.splits = splits.filter(s => s.catId && s.amount).map(s => ({
          catId: parseInt(s.catId),
          amount: parseFloat(s.amount),
        }));
      } else {
        if (!catId) return dispatch({ type: 'SHOW_TOAST', message: 'Category required' });
        tx.catId = parseInt(catId);
      }
    }

    dispatch({ type: 'ADD_TRANSACTION', tx });
    setAmount('');
    setPayee('');
    setConcept('');
    setSplits([{ catId: '', amount: '' }]);
    dispatch({ type: 'SHOW_TOAST', message: 'Logged' });
  }

  const isExpense = txType === 'expense';

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm relative">
      <div className="flex border-b border-slate-800 mb-6">
        <button
          onClick={() => setTxType('expense')}
          className={`flex-1 py-3 font-bold text-sm uppercase tracking-widest ${isExpense ? 'tab-active' : 'text-slate-500'}`}
        >
          Expense
        </button>
        <button
          onClick={() => setTxType('income')}
          className={`flex-1 py-3 font-bold text-sm uppercase tracking-widest ${!isExpense ? 'tab-active' : 'text-slate-500'}`}
        >
          Income
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="bg-slate-800 border border-slate-700 p-3 rounded-xl w-full text-sm text-slate-100"
          />
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            className="bg-slate-800 border border-slate-700 p-3 rounded-xl w-full text-base font-bold text-slate-100"
          />
        </div>

        <div className="relative">
          <input
            ref={payeeRef}
            type="text"
            value={payee}
            onFocus={handlePayeeFocus}
            onChange={e => handlePayeeInput(e.target.value)}
            placeholder="Payee"
            autoComplete="off"
            className="bg-slate-800 border border-slate-700 p-3 rounded-xl w-full text-sm text-slate-100"
          />
          {showDropdown && payeeOptions.length > 0 && (
            <div ref={dropdownRef} className="autocomplete-items bg-slate-900 border border-slate-700 rounded-xl mt-1 shadow-2xl">
              {payeeOptions.map(p => (
                <div
                  key={p}
                  onClick={() => selectPayee(p)}
                  className="p-3 hover:bg-slate-800 cursor-pointer text-sm text-slate-300"
                >
                  {p}
                </div>
              ))}
            </div>
          )}
        </div>

        <input
          type="text"
          value={concept}
          onChange={e => setConcept(e.target.value)}
          placeholder="Concept / Notes"
          className="bg-slate-800 border border-slate-700 p-3 rounded-xl w-full text-sm text-slate-100"
        />

        {isExpense && (
          <>
            {!isSplit ? (
              <select
                value={catId}
                onChange={e => setCatId(e.target.value)}
                className="bg-slate-800 border border-slate-700 p-3 rounded-xl w-full text-sm text-slate-100"
              >
                <option value="">Select Category</option>
                {budget.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  {splits.map((row, idx) => (
                    <SplitRow key={idx} idx={idx} split={row} categories={budget.categories} onChange={updateSplit} onRemove={removeSplit} />
                  ))}
                </div>
                <button onClick={() => setSplits(p => [...p, { catId: '', amount: '' }])} className="text-xs font-bold text-indigo-400 hover:text-indigo-300">
                  + Add Split Row
                </button>
              </div>
            )}

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSplit}
                  onChange={e => { setIsSplit(e.target.checked); setSplits([{ catId: '', amount: '' }]); }}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-600"
                />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Split Expense</span>
              </label>
              {isSplit && totalAmt > 0 && (
                <span className={`text-[10px] font-mono ${Math.abs(remainder) < 0.01 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  Remainder: ${remainder.toFixed(2)}
                </span>
              )}
            </div>
          </>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black transition text-xl shadow-xl uppercase tracking-tighter hover:bg-indigo-500"
        >
          Log Transaction
        </button>
      </div>
    </div>
  );
}
