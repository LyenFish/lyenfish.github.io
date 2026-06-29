import { INITIAL_STATE } from './initialState';

export function getMonthKey(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function activeBudget(state) {
  return state.budgets[state.activeBudgetId];
}

function updateBudget(state, changes) {
  return {
    ...state,
    budgets: {
      ...state.budgets,
      [state.activeBudgetId]: { ...activeBudget(state), ...changes },
    },
  };
}

function openModal(state, modal, data) {
  const value = data !== undefined ? { open: true, ...data } : true;
  return { ...state, modals: { ...state.modals, [modal]: value } };
}

function closeModal(state, modal) {
  const current = state.modals[modal];
  const value = typeof current === 'boolean' ? false : { ...current, open: false };
  return { ...state, modals: { ...state.modals, [modal]: value } };
}

export function reducer(state, action) {
  const budget = activeBudget(state);
  const mKey = getMonthKey(state.selectedYear, state.selectedMonth);

  switch (action.type) {
    case 'SWITCH_BUDGET':
      return { ...state, activeBudgetId: action.id, ledgerFilterCatId: null };

    case 'SET_MONTH':
      return { ...state, selectedMonth: action.month };

    case 'CHANGE_YEAR':
      return { ...state, selectedYear: state.selectedYear + action.offset };

    case 'UPDATE_MANUAL_BASE':
      return updateBudget(state, {
        monthlyBases: { ...budget.monthlyBases, [mKey]: parseFloat(action.value) || 0 },
      });

    case 'ADD_CATEGORY': {
      const name = action.name.trim();
      if (!name) return state;
      if (budget.categories.find(c => c.name.toLowerCase() === name.toLowerCase())) return state;
      const id = Date.now() + Math.floor(Math.random() * 1000);
      return updateBudget(state, { categories: [{ id, name }, ...budget.categories] });
    }

    case 'UPDATE_ASSIGNED': {
      const month = budget.assignments[mKey] || {};
      return updateBudget(state, {
        assignments: { ...budget.assignments, [mKey]: { ...month, [action.catId]: parseFloat(action.amount) || 0 } },
      });
    }

    case 'TRANSFER_FUNDS': {
      const { fromCatId, toCatId, amount } = action;
      const month = { ...(budget.assignments[mKey] || {}) };
      month[fromCatId] = (month[fromCatId] || 0) - amount;
      month[toCatId] = (month[toCatId] || 0) + amount;
      return updateBudget(state, { assignments: { ...budget.assignments, [mKey]: month } });
    }

    case 'FILTER_LEDGER':
      return { ...state, ledgerFilterCatId: action.catId };

    case 'CLEAR_LEDGER_FILTER':
      return { ...state, ledgerFilterCatId: null };

    case 'SAVE_TEMPLATE':
      return updateBudget(state, {
        templates: [...budget.templates, { id: Date.now(), ...action.template }],
      });

    case 'DELETE_TEMPLATE':
      return updateBudget(state, {
        templates: budget.templates.filter(t => Number(t.id) !== Number(action.id)),
      });

    case 'APPLY_TEMPLATE':
      return { ...state, pendingTemplate: action.template };

    case 'CLEAR_PENDING_TEMPLATE':
      return { ...state, pendingTemplate: null };

    case 'ADD_TRANSACTION':
      return updateBudget(state, {
        transactions: [{ id: Date.now(), ...action.tx }, ...budget.transactions],
      });

    case 'DELETE_TRANSACTION':
      return updateBudget(state, {
        transactions: budget.transactions.filter(t => Number(t.id) !== Number(action.id)),
      });

    case 'EDIT_TRANSACTION':
      return updateBudget(state, {
        transactions: budget.transactions.map(t => {
          if (Number(t.id) !== Number(action.id)) return t;
          const { id: _id, ...fields } = action;
          return { ...t, ...fields };
        }),
      });

    case 'SAVE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };

    case 'SET_CYCLE_CUTOFF': {
      const cuts = { ...(state.settings.monthlyCutOffs || {}) };
      const val = parseInt(action.value);
      if (isNaN(val) || val <= 0) {
        delete cuts[mKey];
      } else {
        cuts[mKey] = Math.min(30, Math.max(1, val));
      }
      return { ...state, settings: { ...state.settings, monthlyCutOffs: cuts } };
    }

    case 'REORDER_CATEGORIES':
      return updateBudget(state, { categories: action.categories });

    case 'IMPORT_TRANSACTIONS':
      return updateBudget(state, {
        categories: [...budget.categories, ...action.newCategories],
        transactions: [...budget.transactions, ...action.transactions],
      });

    case 'CLEAR_DATA':
      return { ...INITIAL_STATE };

    case 'OPEN_MODAL':
      return openModal(state, action.modal, action.data);

    case 'CLOSE_MODAL':
      return closeModal(state, action.modal);

    case 'SHOW_TOAST':
      return { ...state, toast: action.message };

    case 'HIDE_TOAST':
      return { ...state, toast: null };

    default:
      return state;
  }
}
