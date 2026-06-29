import { createContext, useContext, useReducer, useEffect } from 'react';
import { reducer } from './reducer';
import { loadState, STORAGE_KEY } from './initialState';

const BudgetContext = createContext(null);

export function BudgetProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  useEffect(() => {
    const { pendingTemplate, modals, toast, ...persistable } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
  }, [state]);

  return (
    <BudgetContext.Provider value={{ state, dispatch }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  return useContext(BudgetContext);
}
