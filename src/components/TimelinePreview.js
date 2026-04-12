"use client";

import { useEffect, useMemo, useState } from "react";

// sept 2025 → may 2026, newest first
const MONTH_ORDER = [
  { label: "may", year: 2026 },
  { label: "apr", year: 2026 },
  { label: "mar", year: 2026 },
  { label: "feb", year: 2026 },
  { label: "jan", year: 2026 },
  { label: "dec", year: 2025 },
  { label: "nov", year: 2025 },
  { label: "oct", year: 2025 },
  { label: "sep", year: 2025 },
];

function parseLabelScore(label) {
  const parts = String(label || "")
    .toLowerCase()
    .trim()
    .split(/\s+/);
  const mName = parts[0];
  const d = parseInt(parts[1]) || 0;
  const idx = MONTH_ORDER.findIndex((m) => m.label === mName);
  const monthScore = idx < 0 ? -1 : MONTH_ORDER.length - 1 - idx;
  return monthScore * 31 + d;
}

function previewText(raw, maxChars = 120) {
  const t = (raw || "")
    .trim()
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/`(.+?)`/g, "$1");
  if (!t) return "";
  const firstLine = t.split("\n").find((line) => line.trim().length > 0) || "";
  const line = firstLine.trim();
  const sentenceMatch = line.match(/^(.+?[.!?])(\s|$)/);
  const sentence = sentenceMatch ? sentenceMatch[1].trim() : "";
  const out = sentence || line;
  return out.slice(0, maxChars).trim();
}

async function fetchLiveLogs() {
  try {
    const res = await fetch("/api/logs", { cache: "no-store" });
    if (!res.ok) return { entries: [] };
    const data = await res.json();
    return { entries: Array.isArray(data?.entries) ? data.entries : [] };
  } catch {
    return { entries: [] };
  }
}

export default function TimelinePreview() {
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    const snap = await fetchLiveLogs();
    const list = Array.isArray(snap.entries) ? snap.entries : [];
    const sorted = [...list].sort(
      (a, b) => parseLabelScore(b.label) - parseLabelScore(a.label),
    );
    setEntries(sorted);
    setLoaded(true);
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      await load();
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const onPub = () => load();
    window.addEventListener("softcomputer-logs-published", onPub);
    return () =>
      window.removeEventListener("softcomputer-logs-published", onPub);
  }, []);

  const recent = useMemo(() => {
    return (entries || []).slice(0, 8);
  }, [entries]);

  return (
    <div className="panel">
      <div className="panelTitleRow">
        <div className="h2">recent log</div>
      </div>
      <div className="miniList">
        {!loaded ? (
          <div className="emptyState">loading…</div>
        ) : recent.length === 0 ? (
          <div className="emptyState">no entries yet.</div>
        ) : (
          recent.map((e) => (
            <a
              key={e.id}
              className="miniRow"
              href={`/log?focus=${encodeURIComponent(e.id)}`}
              title="open in log"
            >
              <div className="miniLeft">
                <div className="chip">{e.label}</div>
              </div>
              <div className="miniRight">
                <div className="miniText">{previewText(e.text)}</div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
