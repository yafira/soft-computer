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
    Array.from({ length: 31 }, () => false),
  );
  const logs = Array.from({ length: 12 }, () =>
    Array.from({ length: 31 }, () => ""),
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
          "0",
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

export default function TimelinePreview() {
  const [state, setState] = useState(() => emptyState());

  useEffect(() => {
    let alive = true;

    queueMicrotask(() => {
      if (!alive) return;
      setState(loadState());
    });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const onUpdate = () => setState(loadState());
    window.addEventListener("softcomputer-update", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("softcomputer-update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const recent = useMemo(() => buildEntries(state).slice(0, 5), [state]);

  return (
    <div className="panel" suppressHydrationWarning>
      <div className="panelTitleRow">
        <div className="h2">recent log</div>
      </div>

      <div className="miniList">
        {recent.length === 0 ? (
          <div className="emptyState">
            no entries yet. punch the card above ✿
          </div>
        ) : (
          recent.map((e) => (
            <a
              key={e.id}
              className="miniRow"
              href={`/log?focus=${encodeURIComponent(e.id)}`}
              title="open in notebook"
            >
              <div className="chip">{e.label}</div>
              <div className="miniText">{e.text}</div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
