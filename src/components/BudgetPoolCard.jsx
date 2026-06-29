import { useBudget } from '../state/BudgetContext';
import { getMonthKey } from '../state/reducer';
import { getBudgetCycle, getCycleRangeString } from '../utils/budgetCycle';
import { fmtMoney, MONTH_NAMES } from '../utils/formatters';

export default function BudgetPoolCard() {
  const { state, dispatch } = useBudget();
  const { activeBudgetId, settings, budgets, selectedYear, selectedMonth } = state;
  const budget = budgets[activeBudgetId];
  const isPersonal = activeBudgetId === 'personal';
  const mKey = getMonthKey(selectedYear, selectedMonth);

  const base = budget.monthlyBases[mKey] || 0;
  const incomes = budget.transactions
    .filter(t => t.type === 'income' && getBudgetCycle(t.date, settings) === mKey)
    .reduce((s, t) => s + t.amount, 0);
  const totalPool = base + incomes;

  const spent = budget.transactions
    .filter(t => t.type === 'expense' && getBudgetCycle(t.date, settings) === mKey)
    .reduce((s, t) => s + t.amount, 0);

  const assigned = Object.values(budget.assignments[mKey] || {}).reduce((s, v) => s + v, 0);
  const left = totalPool - assigned;

  const rangeStr = getCycleRangeString(selectedYear, selectedMonth, settings);
  const cuts = settings.monthlyCutOffs || {};
  const activeOverride = cuts[mKey] !== undefined ? cuts[mKey] : '';

  const cardBg = isPersonal ? 'bg-emerald-700 shadow-emerald-950/20' : 'bg-indigo-700 shadow-indigo-950/20';
  const leftColor = isPersonal ? 'text-emerald-400' : 'text-indigo-400';

  return (
    <div className={`p-8 rounded-3xl shadow-2xl transition-all duration-500 text-white ${cardBg}`}>
      <div className="flex justify-between items-center mb-4">
        <span className="text-indigo-100 font-bold uppercase tracking-wider text-sm">
          {isPersonal ? settings.personalName : settings.jointName}
        </span>
        <span className="bg-black/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
          {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold opacity-70">$</span>
          <span className="text-5xl font-bold tracking-tight">{fmtMoney(totalPool)}</span>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Month Total Spent</div>
          <div className="text-2xl font-mono font-bold text-white">-${fmtMoney(spent)}</div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-black/20 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-col">
          <span className="opacity-60 font-bold uppercase tracking-wider text-[10px]">Billing Cycle Range</span>
          <span className="font-bold text-sm text-white mt-0.5">{rangeStr}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="opacity-60 font-bold uppercase tracking-wider text-[10px]">CC Cut-off Day:</span>
          <input
            type="number"
            min="0"
            max="31"
            value={activeOverride}
            onChange={e => dispatch({ type: 'SET_CYCLE_CUTOFF', value: e.target.value })}
            placeholder="Default"
            className="bg-slate-950/60 border border-white/10 rounded-lg px-2 py-1 w-16 text-center font-bold text-white focus:outline-none focus:border-white/30 text-xs"
          />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Manual Funds (Month)</label>
          <input
            type="number"
            value={base || ''}
            onChange={e => dispatch({ type: 'UPDATE_MANUAL_BASE', value: e.target.value })}
            placeholder="0"
            className="bg-black/20 text-white px-4 py-3 rounded-xl focus:outline-none w-full font-mono border border-white/5 text-lg"
          />
        </div>
        <div className="bg-black/20 p-4 rounded-xl flex flex-col justify-center border border-white/5">
          <span className="text-xs uppercase font-bold opacity-70 mb-1">Left to Assign</span>
          <span className={`font-mono font-bold text-2xl leading-none ${left < 0 ? 'text-red-400' : leftColor}`}>
            ${fmtMoney(left)}
          </span>
        </div>
      </div>
    </div>
  );
}
