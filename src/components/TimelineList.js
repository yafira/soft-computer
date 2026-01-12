"use client";

import { useEffect, useMemo, useState } from "react";

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

function emptyState() {
  const punched = Array.from({ length: 12 }, () =>
    Array.from({ length: 31 }, () => false)
  );
  const logs = Array.from({ length: 12 }, () =>
    Array.from({ length: 31 }, () => "")
  );
  return { punched, logs };
}

function loadState() {
  try {
    if (typeof window === "undefined") return emptyState();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    if (!parsed?.punched || !parsed?.logs) return emptyState();
    return parsed;
  } catch {
    return emptyState();
  }
}

function daysInMonth(monthIndex, year = 2026) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function buildEntries(state) {
  const entries = [];
  for (let m = 0; m < 12; m++) {
    const max = daysInMonth(m, 2026);
    for (let d = 0; d < max; d++) {
      const text = (state.logs?.[m]?.[d] || "").trim();
      if (!text) continue;
      entries.push({
        id: `2026-${String(m + 1).padStart(2, "0")}-${String(d + 1).padStart(
          2,
          "0"
        )}`,
        monthIndex: m,
        dayIndex: d,
        label: `${months[m]} ${d + 1}`,
        text,
        dateValue: new Date(2026, m, d + 1).getTime(),
      });
    }
  }
  entries.sort((a, b) => b.dateValue - a.dateValue);
  return entries;
}

export default function TimelineList() {
  // ✅ initialize from storage (no effect setState)
  const [state, setState] = useState(() => loadState());
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onUpdate = () => setState(loadState());

    window.addEventListener("softcomputer-update", onUpdate);
    window.addEventListener("storage", onUpdate);

    return () => {
      window.removeEventListener("softcomputer-update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const entries = useMemo(() => {
    const all = buildEntries(state);
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((e) => e.text.toLowerCase().includes(q));
  }, [state, query]);

  return (
    <div className="panel">
      <div className="h1" style={{ marginBottom: 6 }}>
        timeline
      </div>
      <p className="p">all punched memories, in reverse chronological order.</p>

      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginTop: 14,
        }}
      >
        <input
          className="input"
          placeholder="search memories…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ maxWidth: 420 }}
        />
        <div className="small" style={{ opacity: 0.85 }}>
          {entries.length} entr{entries.length === 1 ? "y" : "ies"}
        </div>
      </div>

      <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
        {entries.length === 0 ? (
          <div className="small" style={{ opacity: 0.9 }}>
            no memories yet. go punch the card ✿
          </div>
        ) : (
          entries.map((e) => (
            <a
              key={e.id}
              className="cardRow linkRow"
              href={`/punch?m=${e.monthIndex}&d=${e.dayIndex}`}
              title="open on punch card"
            >
              <div className="chip">{e.label}</div>
              <div className="logText">{e.text}</div>
            </a>
          ))
        )}
      </div>

      <p className="small" style={{ marginTop: 16 }}>
        storage: <span className="kbd">{STORAGE_KEY}</span>
      </p>
    </div>
  );
}
