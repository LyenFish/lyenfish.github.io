import { useState } from 'react';
import { useBudget } from '../state/BudgetContext';

export default function AddCategoryForm() {
  const { dispatch } = useBudget();
  const [name, setName] = useState('');

  function handleAdd() {
    if (!name.trim()) return;
    dispatch({ type: 'ADD_CATEGORY', name });
    setName('');
  }

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="New Category..."
          className="flex-1 bg-slate-800 border border-slate-700 p-4 rounded-xl focus:outline-none text-slate-200"
        />
        <button
          onClick={handleAdd}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-500 transition"
        >
          Add
        </button>
      </div>
    </div>
  );
}
