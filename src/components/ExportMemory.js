"use client";

const STORAGE_KEY = "softcomputer_process_2026";
const months = [
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

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function buildEntriesFromState(state) {
  const entries = [];

  const logs = state?.logs;
  if (!Array.isArray(logs)) return entries;

  for (let m = 0; m < 12; m++) {
    for (let d = 0; d < 31; d++) {
      const text = (logs?.[m]?.[d] || "").trim();
      if (!text) continue;

      // month index m (0-11), day index d (0-30)
      const dayNumber = d + 1;

      // optional real date string for 2026 (naive)
      const iso = `2026-${String(m + 1).padStart(2, "0")}-${String(
        dayNumber
      ).padStart(2, "0")}`;

      entries.push({
        monthIndex: m,
        dayIndex: d,
        month: months[m],
        day: dayNumber,
        date: iso,
        text,
      });
    }
  }

  return entries;
}

export default function ExportMemory() {
  const onExport = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const state = raw ? safeParse(raw) : null;

    // ensure shape exists even if older storage versions
    const normalized = {
      punched: state?.punched || [],
      logs: state?.logs || [],
    };

    const payload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      storageKey: STORAGE_KEY,

      // full data (arrays)
      raw: normalized,

      // human-friendly list of only logged days
      entries: buildEntriesFromState(normalized),
    };

    const pretty = JSON.stringify(payload, null, 2);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadText(`softcomputer-memory-${stamp}.json`, pretty);
  };

  return (
    <div
      style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}
    >
      <button className="btn" onClick={onExport}>
        export memory (.json)
      </button>
      <span className="small">
        includes full logs + a clean <span className="kbd">entries</span> list
      </span>
    </div>
  );
}
