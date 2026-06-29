export const STORAGE_KEY = 'zero_budget_v11_splits';

const DEFAULT_CATEGORY_NAMES = ["Las Niñas", "Groceries", "Dining Out", "Munchies", "CFE", "Stuff I Forgot"];

function makeDefaultBudget() {
  return {
    monthlyBases: {},
    categories: DEFAULT_CATEGORY_NAMES.map((name, i) => ({ id: Date.now() + i, name })),
    assignments: {},
    transactions: [],
    templates: [],
  };
}

export const INITIAL_STATE = {
  activeBudgetId: 'joint',
  ledgerFilterCatId: null,
  settings: {
    jointName: 'El Nuestro',
    personalName: 'El Mío',
    defaultCutOff: 0,
    monthlyCutOffs: {},
  },
  budgets: {
    joint: makeDefaultBudget(),
    personal: makeDefaultBudget(),
  },
  selectedYear: new Date().getFullYear(),
  selectedMonth: new Date().getMonth() + 1,
  pendingTemplate: null,
  modals: {
    deleteTemplate: { open: false, id: null },
    deleteExpense: { open: false, id: null },
    editTransaction: { open: false, id: null },
    reports: false,
    reset: false,
    settings: false,
  },
  toast: null,
};

export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return INITIAL_STATE;

    const parsed = JSON.parse(saved);

    if (!parsed.settings) parsed.settings = {};
    if (parsed.settings.defaultCutOff === undefined) parsed.settings.defaultCutOff = 0;
    if (!parsed.settings.monthlyCutOffs) parsed.settings.monthlyCutOffs = {};

    ['joint', 'personal'].forEach(bId => {
      if (!parsed.budgets[bId]) parsed.budgets[bId] = makeDefaultBudget();
      const b = parsed.budgets[bId];

      if (!b.categories || b.categories.length === 0) {
        b.categories = DEFAULT_CATEGORY_NAMES.map((name, i) => ({ id: Date.now() + i, name }));
      }
      if (!b.templates) b.templates = [];

      const usedTxIds = new Set();
      b.transactions.forEach((t, idx) => {
        if (!t.id || usedTxIds.has(t.id)) {
          t.id = Date.now() + idx + Math.floor(Math.random() * 100000);
        }
        usedTxIds.add(t.id);
      });

      const usedTempIds = new Set();
      b.templates.forEach((t, idx) => {
        if (!t.id || usedTempIds.has(t.id)) {
          t.id = Date.now() + idx + Math.floor(Math.random() * 100000);
        }
        usedTempIds.add(t.id);
      });
    });

    return {
      ...INITIAL_STATE,
      ...parsed,
      pendingTemplate: null,
      modals: INITIAL_STATE.modals,
      toast: null,
    };
  } catch {
    return INITIAL_STATE;
  }
}
