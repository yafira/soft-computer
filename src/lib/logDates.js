// shared date logic for log labels
// labels look like "oct 22" or "oct 22 2026"
// old labels have no year: sep–dec mean 2025, jan–aug mean 2026
// anything outside that window gets the year written into the label

export const MONTH_NAMES = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

// where the log begins
const START = { m: 8, y: 2025 };

function inferYear(m) {
  return m >= 8 ? 2025 : 2026;
}

// "oct 22 2026" → { m: 9, d: 22, y: 2026 }, or null if it can't be read
export function parseLabel(label) {
  const parts = String(label || "")
    .toLowerCase()
    .trim()
    .split(/\s+/);
  const m = MONTH_NAMES.indexOf(parts[0]);
  const d = parseInt(parts[1], 10);
  if (m < 0 || Number.isNaN(d)) return null;
  const yRaw = parseInt(parts[2], 10);
  const y = Number.isNaN(yRaw) ? inferYear(m) : yRaw;
  return { m, d, y };
}

// only adds the year when leaving it off would read as a different year
export function formatLabel(m, d, y) {
  const base = `${MONTH_NAMES[m]} ${d}`;
  return inferYear(m) === y ? base : `${base} ${y}`;
}

// adds the current year to a label typed without one, if needed
export function withYear(label, now = new Date()) {
  const p = parseLabel(label);
  if (!p) return String(label || "").trim();
  const hasYear = String(label).trim().split(/\s+/).length >= 3;
  if (hasYear) return formatLabel(p.m, p.d, p.y);
  // a month later than this one is probably last year (e.g. "dec 30" typed in jan)
  const y = p.m > now.getMonth() ? now.getFullYear() - 1 : now.getFullYear();
  return formatLabel(p.m, p.d, y);
}

// sortable number, bigger = newer
export function labelScore(label) {
  const p = parseLabel(label);
  if (!p) return -1;
  return (p.y * 12 + p.m) * 32 + p.d;
}

// every month from the start through today (or the newest entry), oldest first
export function monthRange(entries = [], now = new Date()) {
  let endKey = now.getFullYear() * 12 + now.getMonth();
  for (const e of entries) {
    const p = parseLabel(e?.label);
    if (p) endKey = Math.max(endKey, p.y * 12 + p.m);
  }
  const out = [];
  for (let k = START.y * 12 + START.m; k <= endKey; k++) {
    const y = Math.floor(k / 12);
    const m = k % 12;
    out.push({ label: MONTH_NAMES[m], m, year: y });
  }
  return out;
}
