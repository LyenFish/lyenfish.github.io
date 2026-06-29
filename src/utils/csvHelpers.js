import { getBudgetCycle } from './budgetCycle';

export function exportToCSV(budget, settings, budgetId) {
  let csv = "ID,Type,Date,Amount,Payee,Concept,Category,IsSplit,Splits,Cycle\n";

  budget.transactions.forEach(t => {
    const catName = t.isSplit
      ? 'SPLIT'
      : (budget.categories.find(c => Number(c.id) === Number(t.catId))?.name || 'Income');

    const splitsStr = t.isSplit && t.splits
      ? t.splits.map(s => {
          const n = budget.categories.find(c => Number(c.id) === Number(s.catId))?.name || 'Unknown';
          return `${n}:${s.amount}`;
        }).join('|')
      : '';

    const esc = v => String(v || '').replace(/"/g, '""');
    const cycle = getBudgetCycle(t.date, settings);

    csv += `"${t.id}","${t.type}","${t.date}","${t.amount}","${esc(t.payee)}","${esc(t.concept)}","${esc(catName)}","${t.isSplit ? 'true' : 'false'}","${esc(splitsStr)}","${cycle}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${budgetId}_budget_export.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function parseCSVLine(line) {
  const fields = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { field += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(field.trim());
      field = '';
    } else {
      field += ch;
    }
  }
  fields.push(field.trim());
  return fields;
}

export function parseImportCSV(text, existingCategories) {
  const catMap = new Map(existingCategories.map(c => [c.name.toLowerCase(), c.id]));
  const newCategories = [];

  function resolveCategory(name) {
    if (!name) name = 'Stuff I Forgot';
    const key = name.toLowerCase();
    if (catMap.has(key)) return catMap.get(key);
    const id = Date.now() + Math.floor(Math.random() * 100000);
    catMap.set(key, id);
    newCategories.push({ id, name });
    return id;
  }

  const lines = text.split(/\r?\n/);
  const transactions = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const f = parseCSVLine(line);
    if (f.length < 5) continue;

    const id = parseInt(f[0]) || (Date.now() + i + Math.floor(Math.random() * 100000));
    const type = f[1] || 'expense';
    const date = f[2] || new Date().toISOString().split('T')[0];
    const amount = parseFloat(f[3]) || 0;
    const payee = f[4] || '';
    const concept = f[5] || '';
    const catNameStr = f[6] || '';
    const isSplit = f[7] === 'true';
    const splitsStr = f[8] || '';

    const tx = { id, type, date, amount, payee, concept };

    if (type === 'expense') {
      if (isSplit && splitsStr) {
        tx.isSplit = true;
        tx.splits = splitsStr.split('|').map(part => {
          const [catName, amt] = part.split(':');
          return { catId: resolveCategory(catName), amount: parseFloat(amt) || 0 };
        });
      } else {
        tx.catId = resolveCategory(catNameStr);
      }
    }

    transactions.push(tx);
  }

  return { transactions, newCategories };
}
