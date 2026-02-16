"use client";

import { useCallback } from "react";

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

// SAME RULE YOU’VE BEEN USING (now becomes canonical)
function previewText(raw, maxChars = 120) {
  const t = (raw || "").trim();
  if (!t) return "";

  const firstLine = t.split("\n").find((line) => line.trim().length > 0) || "";
  const line = firstLine.trim();

  const sentenceMatch = line.match(/^(.+?[.!?])(\s|$)/);
  const sentence = sentenceMatch ? sentenceMatch[1].trim() : "";

  const out = sentence || line;
  return out.slice(0, maxChars).trim();
}

function buildEntries(state) {
  const entries = [];

  for (let m = 0; m < 12; m++) {
    const max = daysInMonth(m, 2026);

    for (let d = 0; d < max; d++) {
      const text = (state.logs?.[m]?.[d] || "").trim();
      if (!text) continue;

      const id = `2026-${String(m + 1).padStart(2, "0")}-${String(
        d + 1,
      ).padStart(2, "0")}`;

      entries.push({
        id,
        monthIndex: m,
        dayIndex: d,
        label: `${months[m]} ${d + 1}`,
        title: previewText(text), // ✅ NEW STABLE FIELD
        text,
        dateValue: new Date(2026, m, d + 1).getTime(),
      });
    }
  }

  entries.sort((a, b) => b.dateValue - a.dateValue);
  return entries;
}

function download(filename, text) {
  const blob = new Blob([text], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();

  a.remove();
  URL.revokeObjectURL(url);
}

export default function PublishLogsButton() {
  const onPublish = useCallback(() => {
    const state = loadState();

    const payload = {
      version: 3,
      exportedAt: new Date().toISOString(),
      entries: buildEntries(state),
    };

    download("process-memory.json", JSON.stringify(payload, null, 2));
  }, []);

  return (
    <button className="btn" onClick={onPublish}>
      publish snapshot
    </button>
  );
}
