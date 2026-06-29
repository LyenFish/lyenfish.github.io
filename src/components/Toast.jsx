import { useEffect } from 'react';
import { useBudget } from '../state/BudgetContext';

export default function Toast() {
  const { state, dispatch } = useBudget();
  const { toast } = state;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 2500);
    return () => clearTimeout(t);
  }, [toast, dispatch]);

  return (
    <div
      className={`fixed bottom-8 right-8 bg-indigo-600 text-white px-6 py-4 rounded-2xl shadow-2xl transition-all duration-300 z-[400] font-bold border border-white/10 ${
        toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
      }`}
    >
      {toast}
    </div>
  );
}
