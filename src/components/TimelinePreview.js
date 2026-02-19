"use client";

import { useEffect, useMemo, useState } from "react";

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
      (a, b) => (Number(b?.createdAt) || 0) - (Number(a?.createdAt) || 0),
    );

    setEntries(sorted);
    setLoaded(true);
  }

  useEffect(() => {
    let alive = true;

    (async () => {
      await load();
      if (!alive) return;
    })();

    return () => {
      alive = false;
    };
  }, []);

  // refresh after publish
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
