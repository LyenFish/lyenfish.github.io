import { useBudget } from '../../state/BudgetContext';
import { STORAGE_KEY } from '../../state/initialState';

export default function ResetModal() {
  const { state, dispatch } = useBudget();

  if (!state.modals.reset) return null;

  function handleConfirm() {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'CLEAR_DATA' });
    dispatch({ type: 'CLOSE_MODAL', modal: 'reset' });
  }

  return (
    <div className="fixed inset-0 z-[320] flex items-center justify-center p-4 modal-backdrop">
      <div className="bg-slate-900 w-full max-w-sm rounded-3xl border border-slate-800 shadow-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-950/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2">Reset All Data?</h3>
        <p className="text-slate-400 text-sm mb-8">
          This will completely erase all transactions, categories, and settings. This cannot be undone.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => dispatch({ type: 'CLOSE_MODAL', modal: 'reset' })} className="bg-slate-800 text-slate-300 py-3 rounded-xl font-bold hover:bg-slate-700 transition">Cancel</button>
          <button onClick={handleConfirm} className="bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-500 transition">Reset Everything</button>
        </div>
      </div>
    </div>
  );
}
