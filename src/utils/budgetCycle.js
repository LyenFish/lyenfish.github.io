const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function getBudgetCycle(dateStr, settings) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  const calKey = `${year}-${String(month).padStart(2, '0')}`;

  const cuts = settings.monthlyCutOffs || {};
  const cutOff = cuts[calKey] !== undefined ? cuts[calKey] : (settings.defaultCutOff || 0);

  if (cutOff <= 0 || cutOff >= 31) return calKey;

  if (day > cutOff) {
    let ny = year, nm = month + 1;
    if (nm > 12) { nm = 1; ny++; }
    return `${ny}-${String(nm).padStart(2, '0')}`;
  }
  return calKey;
}

export function getCycleRangeString(year, month, settings) {
  let py = year, pm = month - 1;
  if (pm < 1) { pm = 12; py--; }

  const prevKey = `${py}-${String(pm).padStart(2, '0')}`;
  const currKey = `${year}-${String(month).padStart(2, '0')}`;
  const cuts = settings.monthlyCutOffs || {};

  const prevCut = cuts[prevKey] !== undefined ? cuts[prevKey] : (settings.defaultCutOff || 0);
  const currCut = cuts[currKey] !== undefined ? cuts[currKey] : (settings.defaultCutOff || 0);

  if (prevCut <= 0 || prevCut >= 31) {
    const lastDay = new Date(year, month, 0).getDate();
    return `1 ${SHORT_MONTHS[month - 1]} to ${lastDay} ${SHORT_MONTHS[month - 1]}`;
  }
  return `${prevCut + 1} ${SHORT_MONTHS[pm - 1]} to ${currCut} ${SHORT_MONTHS[month - 1]}`;
}
