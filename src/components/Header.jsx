import { useRef } from 'react';
import { useBudget } from '../state/BudgetContext';
import { MONTH_NAMES } from '../utils/formatters';
import { exportToCSV } from '../utils/csvHelpers';
import { parseImportCSV } from '../utils/csvHelpers';

export default function Header() {
  const { state, dispatch } = useBudget();
  const { settings, budgets, activeBudgetId, selectedYear, selectedMonth } = state;
  const isPersonal = activeBudgetId === 'personal';
  const fileInputRef = useRef(null);

  const activeMonthCls = isPersonal
    ? 'bg-emerald-600 border-emerald-400 text-white'
    : 'bg-indigo-600 border-indigo-400 text-white';

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const budget = budgets[activeBudgetId];
      const { transactions, newCategories } = parseImportCSV(evt.target.result, budget.categories);
      dispatch({ type: 'IMPORT_TRANSACTIONS', transactions, newCategories });
      dispatch({ type: 'SHOW_TOAST', message: `Imported ${transactions.length} transactions` });
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <header className="flex flex-col mb-8 gap-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-black text-slate-100 tracking-tight">Zero Budget</h1>
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => dispatch({ type: 'SWITCH_BUDGET', id: 'joint' })}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${!isPersonal ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              {settings.jointName}
            </button>
            <button
              onClick={() => dispatch({ type: 'SWITCH_BUDGET', id: 'personal' })}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${isPersonal ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
            >
              {settings.personalName}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => dispatch({ type: 'OPEN_MODAL', modal: 'reports' })}
            className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-400 hover:text-white transition flex items-center gap-2"
            title="View Reports"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <span className="text-xs font-bold hidden md:inline">Report</span>
          </button>

          <button
            onClick={() => dispatch({ type: 'OPEN_MODAL', modal: 'settings' })}
            className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-400 hover:text-white transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>

          <div className="w-px h-8 bg-slate-800 mx-1 self-center" />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition text-slate-300"
          >
            Import
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />

          <button
            onClick={() => exportToCSV(budgets[activeBudgetId], settings, activeBudgetId)}
            className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition text-slate-300"
          >
            Export
          </button>

          <button
            onClick={() => dispatch({ type: 'OPEN_MODAL', modal: 'reset' })}
            className="bg-red-950/30 text-red-400 border border-red-900/50 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-900/40 transition"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-4">
            <button onClick={() => dispatch({ type: 'CHANGE_YEAR', offset: -1 })} className="text-slate-500 hover:text-white p-2">◀</button>
            <span className="text-xl font-bold text-indigo-400 min-w-[60px] text-center">{selectedYear}</span>
            <button onClick={() => dispatch({ type: 'CHANGE_YEAR', offset: 1 })} className="text-slate-500 hover:text-white p-2">▶</button>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 flex-1">
            {MONTH_NAMES.map((name, i) => {
              const active = (i + 1) === selectedMonth;
              return (
                <button
                  key={name}
                  onClick={() => dispatch({ type: 'SET_MONTH', month: i + 1 })}
                  className={`py-2 rounded-xl text-xs font-bold border border-slate-800 transition ${active ? activeMonthCls : 'bg-slate-800/50 text-slate-400'}`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
