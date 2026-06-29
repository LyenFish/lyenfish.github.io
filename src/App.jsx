import { useState } from 'react';
import { BudgetProvider } from './state/BudgetContext';
import Header from './components/Header';
import BudgetPoolCard from './components/BudgetPoolCard';
import AddCategoryForm from './components/AddCategoryForm';
import TransferPanel from './components/TransferPanel';
import CategoryList from './components/CategoryList';
import TemplatesPanel from './components/TemplatesPanel';
import TransactionLogger from './components/TransactionLogger';
import Ledger from './components/Ledger';
import CalendarView from './components/CalendarView';
import Toast from './components/Toast';
import DeleteTemplateModal from './components/modals/DeleteTemplateModal';
import DeleteExpenseModal from './components/modals/DeleteExpenseModal';
import EditTransactionModal from './components/modals/EditTransactionModal';
import ReportsModal from './components/modals/ReportsModal';
import ResetModal from './components/modals/ResetModal';
import SettingsModal from './components/modals/SettingsModal';

export default function App() {
  return (
    <BudgetProvider>
      <AppLayout />
    </BudgetProvider>
  );
}

function AppLayout() {
  const [view, setView] = useState('budget');

  return (
    <div className="bg-slate-950 min-h-screen font-sans text-slate-200">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <Header />

        <div className="flex gap-1 mb-8 bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit">
          <ViewTab label="Budget" icon={<GridIcon />} active={view === 'budget'} onClick={() => setView('budget')} />
          <ViewTab label="Calendar" icon={<CalIcon />} active={view === 'calendar'} onClick={() => setView('calendar')} />
        </div>

        {view === 'budget' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <CategoryList />
              <AddCategoryForm />
              <TransferPanel />
            </div>
            <div className="lg:col-span-5 space-y-6">
              <TemplatesPanel />
              <TransactionLogger />
              <Ledger />
              <BudgetPoolCard />
            </div>
          </div>
        ) : (
          <CalendarView />
        )}
      </div>

      <DeleteTemplateModal />
      <DeleteExpenseModal />
      <EditTransactionModal />
      <ReportsModal />
      <ResetModal />
      <SettingsModal />
      <Toast />
    </div>
  );
}

function ViewTab({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
        active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function GridIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}

function CalIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
