"use client";

import { useCallback, useState } from "react";

const STORAGE_KEY = "softcomputer_process_2026";

// IMPORTANT:
// - this must match your Vercel env var name: ADMIN_LOG_TOKEN
// - and MUST be exposed to the browser with NEXT_PUBLIC_
const CLIENT_ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_LOG_TOKEN || "";

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

      const id = `2026-${String(m + 1).padStart(2, "0")}-${String(d + 1).padStart(2, "0")}`;

      entries.push({
        id,
        monthIndex: m,
        dayIndex: d,
        label: `${months[m]} ${d + 1}`,
        title: previewText(text),
        text,
        createdAt: new Date(2026, m, d + 1).getTime(),
      });
    }
  }

  entries.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return entries;
}

export default function PublishLogsButton() {
  const [status, setStatus] = useState("");

  const onPublish = useCallback(async () => {
    try {
      setStatus("publishing...");

      const state = loadState();
      const entries = buildEntries(state);

      const res = await fetch("/api/logs/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": CLIENT_ADMIN_TOKEN,
        },
        body: JSON.stringify({ entries }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t.slice(0, 200));
      }

      setStatus("published ✿");
      window.dispatchEvent(new Event("softcomputer-logs-published"));
    } catch (e) {
      setStatus(`failed: ${String(e?.message || e)}`);
    }
  }, []);

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <button className="btn" onClick={onPublish} type="button">
        publish snapshot
      </button>
      {status ? <span className="small subtle">{status}</span> : null}
    </div>
  );
}
