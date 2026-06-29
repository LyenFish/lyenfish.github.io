export const MONTH_NAMES = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function formatLedgerDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const monthIdx = parseInt(parts[1]) - 1;
  const day = parseInt(parts[2]);
  if (monthIdx < 0 || monthIdx > 11) return dateStr;
  return `${day} ${SHORT_MONTHS[monthIdx]} ${parts[0]}`;
}

export function fmtMoney(amount) {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
}
