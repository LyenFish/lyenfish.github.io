import { useState, useEffect } from 'react';
import { useBudget } from '../../state/BudgetContext';

export default function SettingsModal() {
  const { state, dispatch } = useBudget();
  const { modals, settings } = state;

  const [jointName, setJointName] = useState('');
  const [personalName, setPersonalName] = useState('');
  const [defaultCutOff, setDefaultCutOff] = useState('');

  useEffect(() => {
    if (modals.settings) {
      setJointName(settings.jointName);
      setPersonalName(settings.personalName);
      setDefaultCutOff(String(settings.defaultCutOff || 0));
    }
  }, [modals.settings]);

  if (!modals.settings) return null;

  function handleSave() {
    dispatch({
      type: 'SAVE_SETTINGS',
      settings: {
        jointName: jointName || 'El Nuestro',
        personalName: personalName || 'El Mío',
        defaultCutOff: parseInt(defaultCutOff) || 0,
      },
    });
    dispatch({ type: 'CLOSE_MODAL', modal: 'settings' });
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 modal-backdrop">
      <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">Settings</h2>
          <button onClick={() => dispatch({ type: 'CLOSE_MODAL', modal: 'settings' })} className="text-slate-500 hover:text-white">✕</button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Primary Budget Name</label>
              <input
                type="text"
                value={jointName}
                onChange={e => setJointName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Secondary Budget Name</label>
              <input
                type="text"
                value={personalName}
                onChange={e => setPersonalName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Default CC Cut-off Day</label>
            <input
              type="number"
              value={defaultCutOff}
              onChange={e => setDefaultCutOff(e.target.value)}
              min="0"
              max="31"
              placeholder="0 = Standard Calendar Month"
              className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white"
            />
            <span className="text-[10px] text-slate-500 block mt-1">
              Setting this to 15 means transactions dated 16 or later fall into next month's virtual budget. Use 0 for strict calendar month.
            </span>
          </div>

          <button onClick={handleSave} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-500 transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
