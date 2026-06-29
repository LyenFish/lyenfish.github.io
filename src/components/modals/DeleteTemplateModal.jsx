import { useBudget } from '../../state/BudgetContext';

export default function DeleteTemplateModal() {
  const { state, dispatch } = useBudget();
  const { open, id } = state.modals.deleteTemplate;

  if (!open) return null;

  function handleConfirm() {
    dispatch({ type: 'DELETE_TEMPLATE', id });
    dispatch({ type: 'CLOSE_MODAL', modal: 'deleteTemplate' });
    dispatch({ type: 'SHOW_TOAST', message: 'Template Deleted' });
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 modal-backdrop">
      <div className="bg-slate-900 w-full max-w-sm rounded-3xl border border-slate-800 shadow-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-950/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <TrashIcon />
        </div>
        <h3 className="text-xl font-bold mb-2">Delete Template?</h3>
        <p className="text-slate-400 text-sm mb-8">This action cannot be undone. Are you sure you want to remove this template?</p>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => dispatch({ type: 'CLOSE_MODAL', modal: 'deleteTemplate' })} className="bg-slate-800 text-slate-300 py-3 rounded-xl font-bold hover:bg-slate-700 transition">Cancel</button>
          <button onClick={handleConfirm} className="bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-500 transition">Delete</button>
        </div>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    </svg>
  );
}
